import { existsSync, readFileSync } from "node:fs";
import { PRINTED_CARDS } from "../content";
import { artPath } from "../lib/paths";

export function hasArt(cardId: string): boolean {
  return existsSync(artPath(cardId));
}

function dataUrl(cardId: string): string {
  return `data:image/jpeg;base64,${readFileSync(artPath(cardId)).toString("base64")}`;
}

export function artCss(url: (cardId: string) => string = dataUrl): string {
  return Object.keys(PRINTED_CARDS)
    .filter(hasArt)
    .map((id) => `.art-${id} { background-image: url(${url(id)}); }`)
    .join("\n");
}
