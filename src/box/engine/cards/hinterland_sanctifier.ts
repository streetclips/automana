import type { CardDef } from '../types';

export const hinterlandSanctifier: CardDef = {
  id: 'hinterland_sanctifier',
  name: 'Hinterland Sanctifier',
  types: ['creature'],
  subtypes: ['Rabbit', 'Cleric'],
  cost: '{W}',
  power: 1,
  toughness: 2,
  triggers: [{ on: 'allyEnters', targets: [], effects: [{ kind: 'gainLife', amount: 1 }] }],
};
