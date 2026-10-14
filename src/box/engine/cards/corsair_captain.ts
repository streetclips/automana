import type { CardDef } from '../types';

export const corsairCaptain: CardDef = {
  id: 'corsair_captain',
  name: 'Corsair Captain',
  types: ['creature'],
  subtypes: ['Human', 'Pirate'],
  cost: '{2}{U}',
  power: 2,
  toughness: 2,
  statics: [{ kind: 'anthem', subtypes: ['Pirate'], other: true, power: 1, toughness: 1 }],
  triggers: [{ on: 'enters', targets: [], effects: [{ kind: 'createTokens', token: 'treasure_token', amount: 1 }] }],
};
