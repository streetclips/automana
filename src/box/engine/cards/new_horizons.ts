import type { CardDef } from '../types';

export const newHorizons: CardDef = {
  id: 'new_horizons',
  name: 'New Horizons',
  types: ['enchantment'],
  subtypes: ['Aura'],
  cost: '{2}{G}',
  enchant: { kind: 'permanent', controller: 'you', types: ['land'] },
  attachment: { landMana: 2 },
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'creature', controller: 'you' }],
      effects: [{ kind: 'addCounters', amount: 1, to: 0 }],
    },
  ],
};
