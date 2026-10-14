import type { CardDef } from '../types';

export const brokenWings: CardDef = {
  id: 'broken_wings',
  name: 'Broken Wings',
  types: ['instant'],
  cost: '{2}{G}',
  spell: {
    targets: [{ kind: 'permanent', types: ['artifact', 'enchantment', 'flyingCreature'] }],
    effects: [{ kind: 'destroy', to: 0 }],
  },
};
