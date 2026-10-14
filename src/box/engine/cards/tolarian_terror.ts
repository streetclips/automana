import type { CardDef } from '../types';

export const tolarianTerror: CardDef = {
  id: 'tolarian_terror',
  name: 'Tolarian Terror',
  types: ['creature'],
  subtypes: ['Serpent'],
  cost: '{6}{U}',
  power: 5,
  toughness: 5,
  keywords: ['ward'],
  costReduction: { per: { kind: 'instantsAndSorceriesInGraveyard' } },
};
