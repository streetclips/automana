import { getCardDef } from "../box/engine";
import { ALL_NEMESES } from "../box/nemesis/all";
import { BOX_REFERENCE, getPrintedCard } from "../content";
import type { Card } from "../content/types";
import { renderCard, renderThreatBack } from "../render/card";
import { referenceFace } from "../render/faces";
import type { PrintCard } from "./imposition";

export function deckCards(engineIds: string[]): Card[] {
  const counts = new Map<string, number>();
  for (const id of engineIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts].map(([id, qty]): Card => {
    const def = getCardDef(id);
    const pt = def.power === undefined ? undefined : `${def.power}/${def.toughness}`;
    return { ...getPrintedCard(id), id, qty, pt };
  });
}

export const BOX_DECKS = ALL_NEMESES.map((deck) => ({ id: deck.id, cards: deckCards([...(deck.battlefield ?? []), ...deck.threats]) }));

function numbered(collection: string, cards: Card[], back: string): PrintCard[] {
  const total = cards.reduce((sum, c) => sum + c.qty, 0);
  let first = 1;
  return cards.flatMap((card) => {
    const number = { collection, first, total };
    first += card.qty;
    return Array.from({ length: card.qty }, (_, copy) => ({ front: renderCard(card, copy, number), back }));
  });
}

export function buildBoxDeck(): PrintCard[] {
  const back = renderThreatBack();
  return [
    { front: referenceFace("A", BOX_REFERENCE), back: referenceFace("B", BOX_REFERENCE) },
    ...BOX_DECKS.flatMap((deck) => numbered(deck.id, deck.cards, back)),
  ];
}
