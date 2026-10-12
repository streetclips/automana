import { EMBERKIN } from "./grimoires/red";
import { WILDWOOD } from "./grimoires/green";
import { DAWNWARD } from "./grimoires/white";
import { ARCANE_TIDE } from "./grimoires/blue";
import { GRIM_PACT } from "./grimoires/black";
import { KAEL } from "./kael";
import { LANDS } from "./lands";
import { VORTHRAX } from "./nemeses/vorthrax";
import { VASKARA } from "./nemeses/vaskara";
import { MORWEN } from "./nemeses/morwen";
import { MIRROR_ARCHMAGE } from "./nemeses/mirror-archmage";
import { REFERENCE } from "./reference";
import type { Card, HalfGrimoire, Nemesis } from "./types";

export { KAEL, LANDS, REFERENCE };

export const GRIMOIRES: HalfGrimoire[] = [DAWNWARD, ARCANE_TIDE, GRIM_PACT, EMBERKIN, WILDWOOD];

export const NEMESES: Nemesis[] = [VORTHRAX, VASKARA, MORWEN, MIRROR_ARCHMAGE];

export const ALL_CARDS: Card[] = [...GRIMOIRES.flatMap((g) => g.cards), ...LANDS, ...NEMESES.flatMap((n) => n.threats)];

const BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card {
  const card = BY_ID.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}
