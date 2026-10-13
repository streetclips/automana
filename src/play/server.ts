import { readFileSync } from "node:fs";
import { type IncomingMessage, type ServerResponse, createServer } from "node:http";
import type { Locale } from "../content/types";
import { setLocale } from "../i18n/locale";
import { artPath } from "../lib/paths";
import { type GameSpec, replay } from "./game";
import { LOCALES, renderGame, renderShell } from "./view";

const PORT = Number(process.env.PORT ?? 4401);
const ART_ROUTE = /^\/art\/([a-z0-9-]+)\.jpg$/;
const PAGE_ROUTE = new RegExp(`^/(${LOCALES.join("|")})$`);
const MAX_BODY = 1 << 20;
const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" };
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

function send(res: ServerResponse, status: number, headers: Record<string, string>, body?: string | Buffer): void {
  res.writeHead(status, headers);
  res.end(body);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      body += chunk;
      if (body.length > MAX_BODY) reject(new Error("Request too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function parseSpec(json: string): GameSpec {
  const spec = JSON.parse(json) as Partial<GameSpec>;
  if (typeof spec.pair !== "string" || typeof spec.nemesis !== "string" || typeof spec.heroic !== "boolean" || !Number.isInteger(spec.seed) || !Array.isArray(spec.decisions)) {
    throw new Error("Malformed game");
  }
  return spec as GameSpec;
}

function localeOf(value: string | null): Locale {
  return LOCALES.find((l) => l === value) ?? "es";
}

async function view(req: IncomingMessage, res: ServerResponse, animate: boolean, locale: Locale): Promise<void> {
  try {
    const spec = parseSpec(await readBody(req));
    setLocale(locale);
    const snap = replay(spec);
    send(res, 200, JSON_HEADERS, JSON.stringify({ ...renderGame(spec, snap, animate), ask: snap.ask, decisions: snap.decisions }));
  } catch (err) {
    send(res, 500, JSON_HEADERS, JSON.stringify({ error: String((err as Error).stack ?? err) }));
  }
}

function shell(res: ServerResponse, locale: Locale): void {
  try {
    setLocale(locale);
    send(res, 200, HTML_HEADERS, renderShell());
  } catch (err) {
    const stack = String((err as Error).stack ?? err).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    send(res, 500, HTML_HEADERS, `<pre>${stack}</pre>`);
  }
}

function art(res: ServerResponse, cardId: string): void {
  try {
    send(res, 200, { "Content-Type": "image/jpeg", "Cache-Control": "max-age=31536000, immutable" }, readFileSync(artPath(cardId)));
  } catch {
    send(res, 404, {});
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname;
  const artMatch = ART_ROUTE.exec(path);
  const pageMatch = PAGE_ROUTE.exec(path);
  if (path === "/") send(res, 302, { Location: "/es" });
  else if (pageMatch && req.method === "GET") shell(res, localeOf(pageMatch[1]));
  else if (path === "/api/view" && req.method === "POST") void view(req, res, url.searchParams.has("animate"), localeOf(url.searchParams.get("lang")));
  else if (artMatch) art(res, artMatch[1]);
  else send(res, 404, { "Content-Type": "text/plain" }, "Not found");
});

server.listen(PORT, () => console.log(`Palmwalker play: http://localhost:${PORT}`));
