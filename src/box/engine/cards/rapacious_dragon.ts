import type { CardDef } from '../types';

export const rapaciousDragon: CardDef = {
  id: 'rapacious_dragon',
  name: 'Rapacious Dragon',
  types: ['creature'],
  subtypes: ['Dragon'],
  cost: '{4}{R}',
  power: 3,
  toughness: 3,
  keywords: ['flying'],
  triggers: [{ on: 'enters', targets: [], effects: [{ kind: 'createTokens', token: 'treasure_token', amount: 2 }] }],
};
