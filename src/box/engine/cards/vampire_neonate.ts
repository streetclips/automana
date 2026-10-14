import type { CardDef } from '../types';

export const vampireNeonate: CardDef = {
  id: 'vampire_neonate',
  name: 'Vampire Neonate',
  types: ['creature'],
  subtypes: ['Vampire'],
  cost: '{B}',
  power: 0,
  toughness: 3,
  activated: [
    {
      cost: '{2}',
      tap: true,
      targets: [],
      effects: [
        { kind: 'loseLife', amount: 1, who: 'opponent' },
        { kind: 'gainLife', amount: 1 },
      ],
    },
  ],
};
