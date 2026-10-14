import type { CardDef } from '../types';

export const spectralSailor: CardDef = {
  id: 'spectral_sailor',
  name: 'Spectral Sailor',
  types: ['creature'],
  subtypes: ['Spirit', 'Pirate'],
  cost: '{U}',
  power: 1,
  toughness: 1,
  keywords: ['flash', 'flying'],
  activated: [{ cost: '{3}{U}', targets: [], effects: [{ kind: 'draw', amount: 1 }] }],
};
