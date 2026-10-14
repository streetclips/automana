import type { CardDef } from '../types';

export const kitesailCorsair: CardDef = {
  id: 'kitesail_corsair',
  name: 'Kitesail Corsair',
  types: ['creature'],
  subtypes: ['Human', 'Pirate'],
  cost: '{1}{U}',
  power: 2,
  toughness: 1,
  statics: [{ kind: 'keywordIf', keyword: 'flying', condition: 'attacking' }],
};
