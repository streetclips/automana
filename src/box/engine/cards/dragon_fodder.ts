import type { CardDef } from '../types';

export const dragonFodder: CardDef = {
  id: 'dragon_fodder',
  name: 'Dragon Fodder',
  types: ['sorcery'],
  cost: '{1}{R}',
  spell: {
    targets: [],
    effects: [{ kind: 'createTokens', token: 'goblin_token', amount: 2 }],
  },
};
