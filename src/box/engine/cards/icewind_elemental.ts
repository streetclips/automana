import type { CardDef } from '../types';

export const icewindElemental: CardDef = {
  id: 'icewind_elemental',
  name: 'Icewind Elemental',
  types: ['creature'],
  subtypes: ['Elemental'],
  cost: '{4}{U}',
  power: 3,
  toughness: 4,
  keywords: ['flying'],
  triggers: [
    {
      on: 'enters',
      targets: [],
      effects: [
        { kind: 'draw', amount: 1 },
        { kind: 'discard', amount: 1 },
      ],
    },
  ],
};
