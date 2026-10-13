import { existsSync, readFileSync } from "node:fs";
import { ALL_CARDS } from "../content";
import { artPath } from "../lib/paths";

export function hasArt(cardId: string): boolean {
  return existsSync(artPath(cardId));
}

function dataUrl(cardId: string): string {
  return `data:image/jpeg;base64,${readFileSync(artPath(cardId)).toString("base64")}`;
}

export function artCss(url: (cardId: string) => string = dataUrl): string {
  return ALL_CARDS.filter((c) => hasArt(c.id))
    .map((c) => `.art-${c.id} { background-image: url(${url(c.id)}); }`)
    .join("\n");
}
