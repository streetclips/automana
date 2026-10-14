import type { CardDef } from '../types';

export const scorchingDragonfire: CardDef = {
  id: 'scorching_dragonfire',
  name: 'Scorching Dragonfire',
  types: ['instant'],
  cost: '{1}{R}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [
      { kind: 'damage', amount: 3, to: 0 },
      { kind: 'exileIfDies', to: 0 },
    ],
  },
};
