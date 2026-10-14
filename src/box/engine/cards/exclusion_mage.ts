import type { CardDef } from '../types';

export const exclusionMage: CardDef = {
  id: 'exclusion_mage',
  name: 'Exclusion Mage',
  types: ['creature'],
  subtypes: ['Human', 'Wizard'],
  cost: '{2}{U}',
  power: 2,
  toughness: 2,
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'creature', controller: 'opponent' }],
      effects: [{ kind: 'bounce', to: 0 }],
    },
  ],
};
