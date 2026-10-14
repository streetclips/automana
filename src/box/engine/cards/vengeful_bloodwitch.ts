import type { CardDef } from '../types';

export const vengefulBloodwitch: CardDef = {
  id: 'vengeful_bloodwitch',
  name: 'Vengeful Bloodwitch',
  types: ['creature'],
  subtypes: ['Vampire', 'Warlock'],
  cost: '{1}{B}',
  power: 1,
  toughness: 1,
  triggers: [
    {
      on: 'dies',
      targets: [],
      effects: [
        { kind: 'loseLife', amount: 1, who: 'opponent' },
        { kind: 'gainLife', amount: 1 },
      ],
    },
    {
      on: 'allyDies',
      targets: [],
      effects: [
        { kind: 'loseLife', amount: 1, who: 'opponent' },
        { kind: 'gainLife', amount: 1 },
      ],
    },
  ],
};
