import type { CardDef } from '../types';

export const intoTheRoil: CardDef = {
  id: 'into_the_roil',
  name: 'Into the Roil',
  types: ['instant'],
  cost: '{1}{U}',
  kicker: '{1}{U}',
  spell: {
    targets: [{ kind: 'permanent', types: ['nonland'] }],
    effects: [
      { kind: 'bounce', to: 0 },
      { kind: 'draw', amount: 1, if: { kicked: true } },
    ],
  },
};
