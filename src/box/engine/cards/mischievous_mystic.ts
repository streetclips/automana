import type { CardDef } from '../types';

export const mischievousMystic: CardDef = {
  id: 'mischievous_mystic',
  name: 'Mischievous Mystic',
  types: ['creature'],
  subtypes: ['Human', 'Wizard'],
  cost: '{1}{U}',
  power: 2,
  toughness: 1,
  keywords: ['flying'],
  triggers: [
    { on: 'secondDraw', targets: [], effects: [{ kind: 'createTokens', token: 'faerie_token', amount: 1 }] },
  ],
};
