import { getCardDef } from "../box/engine";
import { CHALLENGES } from "../box/nemesis/challenges";
import { NEMESES as BOX_NEMESES } from "../box/nemesis/threats";
import { getCard } from "../content";
import { BOX_REFERENCE } from "../content/box-reference";
import { CHALLENGE_CARDS } from "../content/challenges";
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
  "egg-laying": {
    en: "Reveal the Nemesis's top card. If it is a creature, it enters the battlefield. Otherwise put it into its graveyard.",
    es: "Revela la primera carta de la Némesis. Si es una criatura, entra en el campo de batalla. Si no, ponla en su cementerio.",
  },
  brood: {
    en: "Reveal the Nemesis's top 2 cards. The creatures enter the battlefield; put the rest into its graveyard.",
    es: "Revela las 2 primeras cartas de la Némesis. Las criaturas entran en el campo de batalla; pon las demás en su cementerio.",
  },
  "wandering-skeleton": {
    en: "When it dies, put it at the bottom of the Nemesis's library.",
    es: "Cuando muere, ponlo en el fondo de la biblioteca de la Némesis.",
  },
  "soul-drain": {
    en: "You lose 2 life and the Nemesis gains 2 life.",
    es: "Pierdes 2 vidas y la Némesis gana 2 vidas.",
  },
  exhume: {
    en: "Return the highest-power creature from its graveyard to the battlefield. If there is none, you lose 2 life.",
    es: "Devuelve al campo de batalla la criatura de mayor fuerza de su cementerio. Si no hay ninguna, pierdes 2 vidas.",
  },
  uprising: {
    en: "Return the 2 highest-power creatures from its graveyard to the battlefield. If there are none, you lose 2 life.",
    es: "Devuelve al campo de batalla las 2 criaturas de mayor fuerza de su cementerio. Si no hay ninguna, pierdes 2 vidas.",
  },
  "cinder-rebirth": {
    en: "Return the highest-power creature from its graveyard to the battlefield. If there is none, it deals 2 damage to you.",
    es: "Devuelve al campo de batalla la criatura de mayor fuerza de su cementerio. Si no hay ninguna, te hace 2 de daño.",
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
    return { ...card, qty, pt, tier: undefined, en: boxText(card, "en"), es: boxText(card, "es") };
  });
  return cards;
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
    ...CHALLENGES.flatMap((deck) => numbered(deck.id, challengeCards([...(deck.battlefield ?? []), ...deck.threats]), back)),
  ];
}
