import type { CardDef } from '../types';

export const helpfulHunter: CardDef = {
  id: 'helpful_hunter',
  name: 'Helpful Hunter',
  types: ['creature'],
  subtypes: ['Cat'],
  cost: '{1}{W}',
  power: 1,
  toughness: 1,
  triggers: [{ on: 'enters', targets: [], effects: [{ kind: 'draw', amount: 1 }] }],
};
