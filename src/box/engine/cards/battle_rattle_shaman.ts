import type { CardDef } from '../types';

export const battleRattleShaman: CardDef = {
  id: 'battle_rattle_shaman',
  name: 'Battle-Rattle Shaman',
  types: ['creature'],
  subtypes: ['Goblin', 'Shaman'],
  cost: '{3}{R}',
  power: 2,
  toughness: 2,
  triggers: [
    {
      on: 'beginCombat',
      targets: [{ kind: 'creature' }],
      minTargets: 0,
      effects: [{ kind: 'pump', power: 2, toughness: 0, to: 0 }],
    },
  ],
};
