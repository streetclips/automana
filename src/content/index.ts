import { EMBERKIN } from "./grimoires/red";
import { WILDWOOD } from "./grimoires/green";
import { DAWNWARD } from "./grimoires/white";
import { ARCANE_TIDE } from "./grimoires/blue";
import { GRIM_PACT } from "./grimoires/black";
import { VORTHRAX } from "./nemeses/vorthrax";
import { VASKARA } from "./nemeses/vaskara";
import { MORWEN } from "./nemeses/morwen";
import { MIRROR_ARCHMAGE } from "./nemeses/mirror-archmage";
import { REFERENCE } from "./reference";
import type { Card, HalfGrimoire, Nemesis } from "./types";

export { REFERENCE };

export const GRIMOIRES: HalfGrimoire[] = [DAWNWARD, ARCANE_TIDE, GRIM_PACT, EMBERKIN, WILDWOOD];

export const NEMESES: Nemesis[] = [VORTHRAX, VASKARA, MORWEN, MIRROR_ARCHMAGE];

export const ALL_CARDS: Card[] = [...GRIMOIRES.flatMap((g) => g.cards), ...NEMESES.flatMap((n) => n.threats)];

const BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));

export interface CollectorNumber {
  collection: string;
  first: number;
  total: number;
}

function numbered(collection: string, cards: Card[]): [string, CollectorNumber][] {
  const total = cards.reduce((sum, c) => sum + c.qty, 0);
  let first = 1;
  return cards.map((c) => {
    const entry: [string, CollectorNumber] = [c.id, { collection, first, total }];
    first += c.qty;
    return entry;
  });
}

const NUMBER_BY_ID = new Map([...GRIMOIRES.flatMap((g) => numbered(g.id, g.cards)), ...NEMESES.flatMap((n) => numbered(n.id, n.threats))]);

export function getCard(id: string): Card {
  const card = BY_ID.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}

export function collectorNumber(cardId: string): CollectorNumber | undefined {
  return NUMBER_BY_ID.get(cardId);
}
