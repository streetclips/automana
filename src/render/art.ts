import { existsSync, readFileSync } from "node:fs";
import { ALL_CARDS } from "../content";
import { artPath } from "../lib/paths";

export function hasArt(cardId: string): boolean {
  return existsSync(artPath(cardId));
}

export function artCss(): string {
  return ALL_CARDS.filter((c) => hasArt(c.id))
    .map((c) => `.art-${c.id} { background-image: url(data:image/jpeg;base64,${readFileSync(artPath(c.id)).toString("base64")}); }`)
    .join("\n");
}
