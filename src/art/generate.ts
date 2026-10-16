import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import type { Card } from "../content/types";
import { ART, ROOT, artPath, ensureDir } from "../lib/paths";
import { BOX_DECKS } from "../pnp/box";

const API = "https://openrouter.ai/api/v1/images";
const MODEL = "google/gemini-3.1-flash-lite-image";
const ASPECT_RATIO = "5:4";
const REFERENCES = 3;
const PARALLEL = 4;
const TIMEOUT_MS = 180_000;

interface ImageResponse {
  data?: { b64_json: string }[];
  usage?: { cost?: number };
  error?: { message: string };
}

const COLLECTIONS: Card[][] = BOX_DECKS.map((deck) => deck.cards);

const ALL_CARDS = COLLECTIONS.flat().filter((card) => card.art);

function getCard(id: string): Card {
  const card = ALL_CARDS.find((c) => c.id === id);
  if (!card) throw new Error(`No art prompt for ${id}`);
  return card;
}

function references(card: Card): string[] {
  const siblings = COLLECTIONS.find((cards) => cards.includes(card)) ?? [];
  return siblings
    .filter((c) => c !== card && existsSync(artPath(c.id)))
    .slice(0, REFERENCES)
    .map((c) => `data:image/jpeg;base64,${readFileSync(artPath(c.id)).toString("base64")}`);
}

function prompt(card: Card, referenced: boolean): string {
  const style = referenced ? " Match the painting style, palette and level of detail of the reference images, which are other cards of the same set." : "";
  return `Art illustration in the old Magic: The Gathering style of ${card.art}, like a classic ${card.type} card.${style} No border, frame or text.`;
}

async function generate(card: Card, apiKey: string): Promise<{ image: Buffer; cost: number }> {
  const refs = references(card);
  const res = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Title": "Automana" },
    body: JSON.stringify({
      model: MODEL,
      prompt: prompt(card, refs.length > 0),
      aspect_ratio: ASPECT_RATIO,
      resolution: "1K",
      input_references: refs.map((url) => ({ type: "image_url", image_url: { url } })),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = (await res.json().catch(() => ({}))) as ImageResponse;
  const image = json.data?.[0]?.b64_json;
  if (!res.ok || !image) throw new Error(`HTTP ${res.status}: ${json.error?.message ?? "no image in the response"}`);
  return { image: Buffer.from(image, "base64"), cost: json.usage?.cost ?? 0 };
}

async function pool<T>(items: T[], size: number, task: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  const worker = async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) await task(item);
  };
  await Promise.all(Array.from({ length: size }, worker));
}

const apiKey = process.env.OPENROUTER_API_KEY;
const ids = process.argv.slice(2);
const cards = ids.length ? ids.map(getCard) : ALL_CARDS.filter((c) => !existsSync(artPath(c.id)));
if (!apiKey) {
  console.error("Usage: OPENROUTER_API_KEY=… npm run art -- [card ids]\nWithout ids, generates every card with no image yet.");
  process.exit(1);
}

ensureDir(ART);
let failed = 0;
let spent = 0;
await pool(cards, PARALLEL, async (card) => {
  const t0 = performance.now();
  try {
    const { image, cost } = await generate(card, apiKey);
    writeFileSync(artPath(card.id), image);
    spent += cost;
    console.log(`${relative(ROOT, artPath(card.id))} (${((performance.now() - t0) / 1000).toFixed(0)} s, $${cost.toFixed(3)})`);
  } catch (err) {
    failed++;
    console.error(`${card.id}: ${(err as Error).message}`);
  }
});
console.log(`${cards.length - failed} of ${cards.length} images generated, $${spent.toFixed(3)}`);
if (failed) process.exitCode = 1;
