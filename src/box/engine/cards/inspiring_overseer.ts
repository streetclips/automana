import type { CardDef } from '../types';

export const inspiringOverseer: CardDef = {
  id: 'inspiring_overseer',
  name: 'Inspiring Overseer',
  types: ['creature'],
  subtypes: ['Angel', 'Cleric'],
  cost: '{2}{W}',
  power: 2,
  toughness: 1,
  keywords: ['flying'],
  triggers: [
    {
      on: 'enters',
      targets: [],
      effects: [
        { kind: 'gainLife', amount: 1 },
        { kind: 'draw', amount: 1 },
      ],
    },
  ],
};
