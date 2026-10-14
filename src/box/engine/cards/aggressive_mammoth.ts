import type { CardDef } from '../types';

export const aggressiveMammoth: CardDef = {
  id: 'aggressive_mammoth',
  name: 'Aggressive Mammoth',
  types: ['creature'],
  subtypes: ['Elephant'],
  cost: '{3}{G}{G}{G}',
  power: 8,
  toughness: 8,
  keywords: ['trample'],
  statics: [{ kind: 'anthem', other: true, keywords: ['trample'] }],
};
