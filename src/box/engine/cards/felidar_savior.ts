import type { CardDef } from '../types';

export const felidarSavior: CardDef = {
  id: 'felidar_savior',
  name: 'Felidar Savior',
  types: ['creature'],
  subtypes: ['Cat', 'Beast'],
  cost: '{3}{W}',
  power: 2,
  toughness: 3,
  keywords: ['lifelink'],
  triggers: [
    {
      on: 'enters',
      targets: [
        { kind: 'creature', controller: 'you', other: true },
        { kind: 'creature', controller: 'you', other: true },
      ],
      minTargets: 0,
      effects: [
        { kind: 'addCounters', amount: 1, to: 0 },
        { kind: 'addCounters', amount: 1, to: 1 },
      ],
    },
  ],
};
