import type { CardDef } from '../types';

export const stromkirkBloodthief: CardDef = {
  id: 'stromkirk_bloodthief',
  name: 'Stromkirk Bloodthief',
  types: ['creature'],
  subtypes: ['Vampire', 'Rogue'],
  cost: '{2}{B}',
  power: 2,
  toughness: 2,
  triggers: [
    {
      on: 'endStep',
      condition: 'opponentLostLife',
      targets: [{ kind: 'creature', controller: 'you', subtype: 'Vampire' }],
      effects: [{ kind: 'addCounters', amount: 1, to: 0 }],
    },
  ],
};
