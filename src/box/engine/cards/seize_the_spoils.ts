import type { CardDef } from '../types';

export const seizeTheSpoils: CardDef = {
  id: 'seize_the_spoils',
  name: 'Seize the Spoils',
  types: ['sorcery'],
  cost: '{2}{R}',
  spell: {
    targets: [],
    effects: [
      { kind: 'draw', amount: 2 },
      { kind: 'createTokens', token: 'treasure_token', amount: 1 },
      { kind: 'discard', amount: 1 },
    ],
  },
};
