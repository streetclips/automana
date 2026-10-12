import { existsSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { ALL_CARDS, getCard } from "../content";
import type { Card } from "../content/types";
import { ART, ROOT, artPath, ensureDir } from "../lib/paths";

const API = "https://openrouter.ai/api/v1/images";
const MODEL = "inclusionai/ming-image-0.1-design";
const SIZE = "1088x960";
const PARALLEL = 4;
const TIMEOUT_MS = 180_000;

interface ImageResponse {
  data?: { b64_json: string }[];
  error?: { message: string };
}

function prompt(card: Card): string {
  return `Art illustration in the old Magic: The Gathering style of ${card.art}, like a classic ${card.type} card. No border, frame or text.`;
}

async function generate(card: Card, apiKey: string): Promise<Buffer> {
  const res = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Title": "Palmwalker" },
    body: JSON.stringify({ model: MODEL, prompt: prompt(card), size: SIZE, output_format: "jpeg" }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = (await res.json().catch(() => ({}))) as ImageResponse;
  const image = json.data?.[0]?.b64_json;
  if (!res.ok || !image) throw new Error(`HTTP ${res.status}: ${json.error?.message ?? "no image in the response"}`);
  return Buffer.from(image, "base64");
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
await pool(cards, PARALLEL, async (card) => {
  const t0 = performance.now();
  try {
    writeFileSync(artPath(card.id), await generate(card, apiKey));
    console.log(`${relative(ROOT, artPath(card.id))} (${((performance.now() - t0) / 1000).toFixed(0)} s)`);
  } catch (err) {
    failed++;
    console.error(`${card.id}: ${(err as Error).message}`);
  }
});
console.log(`${cards.length - failed} of ${cards.length} images generated`);
if (failed) process.exitCode = 1;
