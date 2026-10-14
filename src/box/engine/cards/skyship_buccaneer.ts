import type { CardDef } from '../types';

export const skyshipBuccaneer: CardDef = {
  id: 'skyship_buccaneer',
  name: 'Skyship Buccaneer',
  types: ['creature'],
  subtypes: ['Human', 'Pirate'],
  cost: '{3}{U}{U}',
  power: 4,
  toughness: 3,
  keywords: ['flying'],
  triggers: [{ on: 'enters', condition: 'attackedThisTurn', targets: [], effects: [{ kind: 'draw', amount: 1 }] }],
};
