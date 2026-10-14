import type { CardDef } from '../types';

export const leoninVanguard: CardDef = {
  id: 'leonin_vanguard',
  name: 'Leonin Vanguard',
  types: ['creature'],
  subtypes: ['Cat', 'Soldier'],
  cost: '{W}',
  power: 1,
  toughness: 1,
  triggers: [
    {
      on: 'beginCombat',
      condition: 'threeCreatures',
      targets: [],
      effects: [
        { kind: 'pump', power: 1, toughness: 1, to: 'self' },
        { kind: 'gainLife', amount: 1 },
      ],
    },
  ],
};
