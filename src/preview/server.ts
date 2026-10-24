import { readFileSync, watch } from "node:fs";
import { createServer, type ServerResponse } from "node:http";
import type { Locale } from "../content/types";
import { ART, SRC, artPath } from "../lib/paths";
import { LOCALES, pagePath, renderPage, type View } from "./pages";

const PORT = Number(process.env.PORT ?? 4400);
const BOOT = Date.now().toString(36);
const LIVE_RELOAD = `<script>
(function connect(delay) {
  const events = new EventSource("/events");
  events.onmessage = (e) => { if (e.data !== "${BOOT}") location.reload(); delay = 300; };
  events.onerror = () => { events.close(); setTimeout(connect, delay, Math.min(delay * 2, 5000)); };
})(300);
</script>`;
const PAGE_ROUTE = new RegExp(`^/(${LOCALES.join("|")})(?:/(pnp|rulebook))?$`);
const ART_ROUTE = /^\/art\/([a-z0-9_-]+)\.jpg$/;
const RELOAD_ON = /\.(css|jpg)$/;
const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" };

const clients = new Set<ServerResponse>();
let pending: ReturnType<typeof setTimeout> | undefined;

function send(res: ServerResponse, status: number, headers: Record<string, string>, body?: string | Buffer): void {
  res.writeHead(status, headers);
  res.end(body);
}

function page(res: ServerResponse, view: View, locale: Locale): void {
  try {
    send(res, 200, HTML_HEADERS, renderPage(view, locale).replace("</body>", `${LIVE_RELOAD}</body>`));
  } catch (err) {
    const stack = String((err as Error).stack ?? err).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    send(res, 500, HTML_HEADERS, `<pre>${stack}</pre>${LIVE_RELOAD}`);
  }
}

function art(res: ServerResponse, cardId: string): void {
  try {
    send(res, 200, { "Content-Type": "image/jpeg", "Cache-Control": "max-age=31536000, immutable" }, readFileSync(artPath(cardId)));
  } catch {
    send(res, 404, {});
  }
}

function events(res: ServerResponse): void {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store" });
  res.write(`data: ${BOOT}\n\n`);
  clients.add(res);
  res.on("close", () => clients.delete(res));
}

function reloadClients(_event: string, file: string | null): void {
  if (!file || !RELOAD_ON.test(file)) return;
  clearTimeout(pending);
  pending = setTimeout(() => clients.forEach((res) => res.write("data: reload\n\n")), 100);
}

const server = createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  const pageMatch = PAGE_ROUTE.exec(path);
  const artMatch = ART_ROUTE.exec(path);
  if (path === "/") send(res, 302, { Location: pagePath("cards", "en") });
  else if (path === "/events") events(res);
  else if (pageMatch) page(res, (pageMatch[2] ?? "cards") as View, pageMatch[1] as Locale);
  else if (artMatch) art(res, artMatch[1]);
  else send(res, 404, { "Content-Type": "text/plain" }, "Not found");
});

process.on("SIGTERM", () => {
  clients.forEach((res) => res.end());
  process.exit();
});

watch(SRC, { recursive: true }, reloadClients);
watch(ART, reloadClients);
server.listen(PORT, () => console.log(`Automana preview: http://localhost:${PORT}`));
