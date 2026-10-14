import type { CardDef } from '../types';

export const goblinSmuggler: CardDef = {
  id: 'goblin_smuggler',
  name: 'Goblin Smuggler',
  types: ['creature'],
  subtypes: ['Goblin', 'Rogue'],
  cost: '{2}{R}',
  power: 2,
  toughness: 2,
  keywords: ['haste'],
  activated: [
    {
      cost: '{0}',
      tap: true,
      targets: [{ kind: 'creature', other: true, maxPower: 2 }],
      effects: [{ kind: 'unblockable', to: 0 }],
    },
  ],
};
