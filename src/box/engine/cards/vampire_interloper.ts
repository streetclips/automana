import type { CardDef } from '../types';

export const vampireInterloper: CardDef = {
  id: 'vampire_interloper',
  name: 'Vampire Interloper',
  types: ['creature'],
  subtypes: ['Vampire', 'Scout'],
  cost: '{1}{B}',
  power: 2,
  toughness: 1,
  keywords: ['flying'],
  statics: [{ kind: 'cantBlock' }],
};
