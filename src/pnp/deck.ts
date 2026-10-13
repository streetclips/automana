import { GRIMOIRES, NEMESES } from "../content";
import type { Card } from "../content/types";
import { renderCard, renderThreatBack } from "../render/card";
import { nemesisFace, referenceFace, walkerFace } from "../render/faces";

export interface PrintCard {
  front: string;
  back: string;
}

function copies(cards: Card[], back: string): PrintCard[] {
  return cards.flatMap((c) => Array.from({ length: c.qty }, (_, copy) => ({ front: renderCard(c, copy), back })));
}

export function buildDeck(): PrintCard[] {
  const threatBack = renderThreatBack();
  return [
    { front: walkerFace("A"), back: walkerFace("B") },
    { front: referenceFace("A"), back: referenceFace("B") },
    ...GRIMOIRES.flatMap((g) => copies(g.cards, renderCard(g.land))),
    ...NEMESES.flatMap((n) => [{ front: nemesisFace(n, "A"), back: nemesisFace(n, "B") }, ...copies(n.threats, threatBack)]),
  ];
}
