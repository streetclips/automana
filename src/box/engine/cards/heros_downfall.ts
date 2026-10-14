import type { CardDef } from '../types';

export const herosDownfall: CardDef = {
  id: 'heros_downfall',
  name: "Hero's Downfall",
  types: ['instant'],
  cost: '{1}{B}{B}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'destroy', to: 0 }],
  },
};
