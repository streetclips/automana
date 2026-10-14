import type { CardDef } from '../types';

export const vampireSpawn: CardDef = {
  id: 'vampire_spawn',
  name: 'Vampire Spawn',
  types: ['creature'],
  subtypes: ['Vampire'],
  cost: '{2}{B}',
  power: 2,
  toughness: 3,
  triggers: [
    {
      on: 'enters',
      targets: [],
      effects: [
        { kind: 'loseLife', amount: 2, who: 'opponent' },
        { kind: 'gainLife', amount: 2 },
      ],
    },
  ],
};
