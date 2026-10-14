import type { CardDef } from '../types';

export const dazzlingAngel: CardDef = {
  id: 'dazzling_angel',
  name: 'Dazzling Angel',
  types: ['creature'],
  subtypes: ['Angel'],
  cost: '{2}{W}',
  power: 2,
  toughness: 3,
  keywords: ['flying'],
  triggers: [{ on: 'allyEnters', targets: [], effects: [{ kind: 'gainLife', amount: 1 }] }],
};
