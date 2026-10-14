import type { CardDef } from '../types';

export const wildwoodScourge: CardDef = {
  id: 'wildwood_scourge',
  name: 'Wildwood Scourge',
  types: ['creature'],
  subtypes: ['Hydra'],
  cost: '{X}{G}',
  power: 0,
  toughness: 0,
  xCounters: true,
  triggers: [{ on: 'allyCounters', targets: [], effects: [{ kind: 'addCounters', amount: 1, to: 'self' }] }],
};
