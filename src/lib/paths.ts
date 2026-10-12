import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const SRC = join(ROOT, "src");
export const DIST = join(ROOT, "dist");
export const ART = join(ROOT, "art");

export function ensureDir(path: string): string {
  mkdirSync(path, { recursive: true });
  return path;
}

export function readCss(...relPaths: string[]): string {
  return relPaths.map((p) => readFileSync(join(SRC, p), "utf8")).join("\n");
}

export function artPath(cardId: string): string {
  return join(ART, `${cardId}.jpg`);
}
