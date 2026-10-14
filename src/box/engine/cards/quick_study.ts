import type { CardDef } from '../types';

export const quickStudy: CardDef = {
  id: 'quick_study',
  name: 'Quick Study',
  types: ['instant'],
  cost: '{2}{U}',
  spell: {
    targets: [],
    effects: [{ kind: 'draw', amount: 2 }],
  },
};
