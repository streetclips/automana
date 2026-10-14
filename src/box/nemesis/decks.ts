import { DECK_LIST, expandDeck } from '../engine';

export interface PlayerDeck {
  key: string;
  cards: string[];
}

export function playerDecks(): PlayerDeck[] {
  return DECK_LIST.map((deck) => ({ key: deck.id, cards: expandDeck(deck) }));
}
