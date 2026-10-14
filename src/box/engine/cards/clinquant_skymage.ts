import type { CardDef } from '../types';

export const clinquantSkymage: CardDef = {
  id: 'clinquant_skymage',
  name: 'Clinquant Skymage',
  types: ['creature'],
  subtypes: ['Bird', 'Wizard'],
  cost: '{3}{U}',
  power: 1,
  toughness: 1,
  keywords: ['flying'],
  triggers: [{ on: 'draw', targets: [], effects: [{ kind: 'addCounters', amount: 1, to: 'self' }] }],
};
