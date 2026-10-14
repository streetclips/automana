import type { CardDef } from '../types';

export const pridefulParent: CardDef = {
  id: 'prideful_parent',
  name: 'Prideful Parent',
  types: ['creature'],
  subtypes: ['Cat'],
  cost: '{2}{W}',
  power: 2,
  toughness: 2,
  keywords: ['vigilance'],
  triggers: [{ on: 'enters', targets: [], effects: [{ kind: 'createTokens', token: 'cat_token', amount: 1 }] }],
};
