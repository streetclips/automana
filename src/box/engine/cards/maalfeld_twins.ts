import type { CardDef } from '../types';

export const maalfeldTwins: CardDef = {
  id: 'maalfeld_twins',
  name: 'Maalfeld Twins',
  types: ['creature'],
  subtypes: ['Zombie'],
  cost: '{5}{B}',
  power: 4,
  toughness: 4,
  triggers: [{ on: 'dies', targets: [], effects: [{ kind: 'createTokens', token: 'zombie_token', amount: 2 }] }],
};
