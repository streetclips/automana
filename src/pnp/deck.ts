import { GRIMOIRES, NEMESES } from "../content";
import type { Card } from "../content/types";
import { renderCard, renderGrimoireBack, renderThreatBack } from "../render/card";
import { referenceFace } from "../render/faces";

export interface PrintCard {
  front: string;
  back: string;
}

function copies(cards: Card[], back: string): PrintCard[] {
  return cards.flatMap((c) => Array.from({ length: c.qty }, (_, copy) => ({ front: renderCard(c, copy), back })));
}

export function buildDeck(): PrintCard[] {
  const grimoireBack = renderGrimoireBack();
  const threatBack = renderThreatBack();
  return [
    { front: referenceFace("A"), back: referenceFace("B") },
    ...GRIMOIRES.flatMap((g) => copies(g.cards, grimoireBack)),
    ...NEMESES.flatMap((n) => copies(n.threats, threatBack)),
  ];
}
