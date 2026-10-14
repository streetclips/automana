import { PAIRS, expandDeck, pairDeck } from '../engine';

export interface PlayerDeck {
  key: string;
  cards: string[];
}

export function playerDecks(): PlayerDeck[] {
  return PAIRS.map(([a, b]) => ({ key: `${a}+${b}`, cards: expandDeck(pairDeck(a, b)) }));
}
