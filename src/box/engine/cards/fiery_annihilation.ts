import type { CardDef } from '../types';

export const fieryAnnihilation: CardDef = {
  id: 'fiery_annihilation',
  name: 'Fiery Annihilation',
  types: ['instant'],
  cost: '{2}{R}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [
      { kind: 'damage', amount: 5, to: 0 },
      { kind: 'exileIfDies', to: 0 },
    ],
  },
};
