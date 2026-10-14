import type { CardDef } from '../types';

export const ingeniousLeonin: CardDef = {
  id: 'ingenious_leonin',
  name: 'Ingenious Leonin',
  types: ['creature'],
  subtypes: ['Cat', 'Soldier'],
  cost: '{4}{W}',
  power: 4,
  toughness: 4,
  activated: [
    {
      cost: '{3}{W}',
      targets: [{ kind: 'creature', controller: 'you', other: true, combat: 'attacking' }],
      effects: [
        { kind: 'addCounters', amount: 1, to: 0 },
        { kind: 'pump', power: 0, toughness: 0, to: 0, keywords: ['firstStrike'], if: { targetSubtype: 'Cat', target: 0 } },
      ],
    },
  ],
};
