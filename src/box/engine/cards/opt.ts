import type { CardDef } from '../types';

export const opt: CardDef = {
  id: 'opt',
  name: 'Opt',
  types: ['instant'],
  cost: '{U}',
  spell: {
    targets: [],
    effects: [
      { kind: 'scry', amount: 1 },
      { kind: 'draw', amount: 1 },
    ],
  },
};
