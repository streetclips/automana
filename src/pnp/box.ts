import { getCardDef } from "../box/engine";
import { CHALLENGES } from "../box/nemesis/challenges";
import { NEMESES as BOX_NEMESES } from "../box/nemesis/threats";
import { getCard } from "../content";
import { BOX_REFERENCE } from "../content/box-reference";
import { CHALLENGE_CARDS, CHALLENGE_DECKS } from "../content/challenges";
import type { Card, CardText } from "../content/types";
import { renderCard, renderThreatBack } from "../render/card";
import { referenceFace } from "../render/faces";
import type { PrintCard } from "./deck";

const TEXT: Record<string, { en: string; es: string }> = {
  rebound: {
    en: "Return your highest-power creature to your hand. If you have none, discard a card at random.",
    es: "Devuelve a tu mano tu criatura de mayor fuerza. Si no tienes ninguna, descarta una carta al azar.",
  },
  "mind-theft": {
    en: "Discard a card at random. If you can't, you lose 2 life.",
    es: "Descarta una carta al azar. Si no puedes, pierdes 2 vidas.",
  },
  "mass-illusion": {
    en: "Tap all your creatures.",
    es: "Gira todas tus criaturas.",
  },
};

const WORDING: [RegExp, string][] = [
  [/ to the Table/g, " to the battlefield"],
  [/ a la Mesa/g, " al campo de batalla"],
  [/<b>Volar<\/b>/g, "<b>Vuela</b>"],
  [/<b>Arrollar<\/b>/g, "<b>Arrolla</b>"],
];

function boxText(card: Card, locale: "en" | "es"): CardText {
  const text = TEXT[card.id]?.[locale] ?? WORDING.reduce((t, [from, to]) => t.replace(from, to), card[locale].text);
  return { ...card[locale], text };
}

function boxThreats(engineIds: string[]): Card[] {
  const counts = new Map<string, number>();
  for (const id of engineIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const cards = [...counts].map(([id, qty]): Card => {
    const def = getCardDef(id);
    const card = getCard(id.replace(/^nm_/, "").replaceAll("_", "-"));
    const pt = def.power === undefined ? undefined : `${def.power}/${def.toughness}`;
    return { ...card, qty, pt, tier: def.threat?.tier ?? 1, en: boxText(card, "en"), es: boxText(card, "es") };
  });
  return cards.sort((a, b) => (a.tier ?? 1) - (b.tier ?? 1));
}

function challengeCards(engineIds: string[]): Card[] {
  const counts = new Map<string, number>();
  for (const id of engineIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts].map(([id, qty]): Card => {
    const def = getCardDef(id);
    const text = CHALLENGE_CARDS[id];
    if (!text) throw new Error(`No printed text for ${id}`);
    const pt = def.power === undefined ? undefined : `${def.power}/${def.toughness}`;
    return { id, color: "T", type: text.type, qty, pt, threat: true, art: "", en: text.en, es: text.es };
  });
}

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
    ...BOX_NEMESES.flatMap((nemesis) => numbered(nemesis.id, boxThreats(nemesis.threats), back)),
    ...CHALLENGES.flatMap((deck) => {
      const reference = CHALLENGE_DECKS[deck.id]?.reference;
      if (!reference) throw new Error(`No reference card for ${deck.id}`);
      const cards = challengeCards([...(deck.battlefield ?? []), ...deck.threats]);
      return [{ front: referenceFace("A", reference), back: referenceFace("B", reference) }, ...numbered(deck.id, cards, back)];
    }),
  ];
}
