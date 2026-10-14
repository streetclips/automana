import type { CardDef } from '../types';

export const heraldOfFaith: CardDef = {
  id: 'herald_of_faith',
  name: 'Herald of Faith',
  types: ['creature'],
  subtypes: ['Angel'],
  cost: '{3}{W}{W}',
  power: 4,
  toughness: 3,
  keywords: ['flying'],
  triggers: [{ on: 'attacks', targets: [], effects: [{ kind: 'gainLife', amount: 2 }] }],
};
