import type { CardDef } from '../types';

export const firespitterWhelp: CardDef = {
  id: 'firespitter_whelp',
  name: 'Firespitter Whelp',
  types: ['creature'],
  subtypes: ['Dragon'],
  cost: '{2}{R}',
  power: 2,
  toughness: 2,
  keywords: ['flying'],
  triggers: [
    {
      on: 'spell',
      spells: 'noncreatureOrDragon',
      targets: [],
      effects: [{ kind: 'damage', amount: 1, to: 'opponent' }],
    },
  ],
};
