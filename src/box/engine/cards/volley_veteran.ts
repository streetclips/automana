import type { CardDef } from '../types';

export const volleyVeteran: CardDef = {
  id: 'volley_veteran',
  name: 'Volley Veteran',
  types: ['creature'],
  subtypes: ['Goblin', 'Warrior'],
  cost: '{3}{R}',
  power: 4,
  toughness: 2,
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'creature', controller: 'opponent' }],
      effects: [{ kind: 'damage', amount: 1, to: 0, times: { kind: 'creatures', subtype: 'Goblin' } }],
    },
  ],
};
