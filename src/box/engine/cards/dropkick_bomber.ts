import type { CardDef } from '../types';

export const dropkickBomber: CardDef = {
  id: 'dropkick_bomber',
  name: 'Dropkick Bomber',
  types: ['creature'],
  subtypes: ['Goblin', 'Warrior'],
  cost: '{2}{R}',
  power: 2,
  toughness: 3,
  statics: [{ kind: 'anthem', subtypes: ['Goblin'], other: true, power: 1, toughness: 1 }],
  activated: [
    {
      cost: '{R}',
      targets: [{ kind: 'creature', controller: 'you', other: true, subtype: 'Goblin' }],
      effects: [
        { kind: 'pump', power: 0, toughness: 0, to: 0, keywords: ['flying'] },
        { kind: 'doom', to: 0 },
      ],
    },
  ],
};
