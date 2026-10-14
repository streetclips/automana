import type { CardDef } from '../types';

export const deadlyPlot: CardDef = {
  id: 'deadly_plot',
  name: 'Deadly Plot',
  types: ['instant'],
  cost: '{3}{B}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'destroy', to: 0 }],
  },
};
