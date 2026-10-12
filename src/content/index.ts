import { EMBERKIN } from "./grimoires/red";
import { WILDWOOD } from "./grimoires/green";
import { LANDS } from "./lands";
import { VORTHRAX_THREATS } from "./nemeses/vorthrax-threats";
import { EXPANSION_PREVIEWS } from "./previews";
import type { Card } from "./types";

export { EMBERKIN, WILDWOOD, LANDS, VORTHRAX_THREATS, EXPANSION_PREVIEWS };

export const ALL_CARDS: Card[] = [...EMBERKIN, ...WILDWOOD, ...LANDS, ...VORTHRAX_THREATS, ...EXPANSION_PREVIEWS];

const BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card {
  const card = BY_ID.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}

export function findCardByName(name: string, locale: "en" | "es"): Card {
  const card = ALL_CARDS.find((c) => c[locale].name === name);
  if (!card) throw new Error(`Unknown ${locale} card name: ${name}`);
  return card;
}
