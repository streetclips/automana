import type { CardDef } from '../types';

export const giantGrowth: CardDef = {
  id: 'giant_growth',
  name: 'Giant Growth',
  types: ['instant'],
  cost: '{G}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'pump', power: 3, toughness: 3, to: 0 }],
  },
};
