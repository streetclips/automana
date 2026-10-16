import { BOX_REFERENCE } from "./box-reference";
import { CHALLENGE_CARDS, CHALLENGE_DECKS } from "./challenges";
import { THREAT_CARDS, THREAT_DECKS } from "./threats";
import type { DeckName, PrintedCard } from "./types";

export { BOX_REFERENCE };

export const PRINTED_CARDS: Record<string, PrintedCard> = { ...THREAT_CARDS, ...CHALLENGE_CARDS };

export const DECK_NAMES: Record<string, DeckName> = { ...THREAT_DECKS, ...CHALLENGE_DECKS };

export function getPrintedCard(id: string): PrintedCard {
  const card = PRINTED_CARDS[id];
  if (!card) throw new Error(`No printed text for ${id}`);
  return card;
}
