import type { CardDef } from '../types';

export const burrogBefuddler: CardDef = {
  id: 'burrog_befuddler',
  name: 'Burrog Befuddler',
  types: ['creature'],
  subtypes: ['Frog', 'Wizard'],
  cost: '{1}{U}',
  power: 2,
  toughness: 1,
  keywords: ['flash'],
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'creature', controller: 'opponent' }],
      effects: [{ kind: 'pump', power: -1, toughness: 0, to: 0 }],
    },
  ],
};
