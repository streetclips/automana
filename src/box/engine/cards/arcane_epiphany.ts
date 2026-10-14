import type { CardDef } from '../types';

export const arcaneEpiphany: CardDef = {
  id: 'arcane_epiphany',
  name: 'Arcane Epiphany',
  types: ['instant'],
  cost: '{3}{U}{U}',
  costReduction: { ifControl: 'Wizard', amount: 1 },
  spell: {
    targets: [],
    effects: [{ kind: 'draw', amount: 3 }],
  },
};
