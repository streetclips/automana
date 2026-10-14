import type { CardDef } from '../types';

export const mysticArchaeologist: CardDef = {
  id: 'mystic_archaeologist',
  name: 'Mystic Archaeologist',
  types: ['creature'],
  subtypes: ['Human', 'Wizard'],
  cost: '{1}{U}',
  power: 2,
  toughness: 1,
  activated: [{ cost: '{3}{U}{U}', targets: [], effects: [{ kind: 'draw', amount: 2 }] }],
};
