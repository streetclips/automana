import type { CardDef } from '../types';

export const crosswayTroublemakers: CardDef = {
  id: 'crossway_troublemakers',
  name: 'Crossway Troublemakers',
  types: ['creature'],
  subtypes: ['Vampire'],
  cost: '{5}{B}',
  power: 5,
  toughness: 5,
  statics: [{ kind: 'anthem', subtypes: ['Vampire'], attacking: true, keywords: ['deathtouch', 'lifelink'] }],
  triggers: [
    { on: 'dies', targets: [], effects: [{ kind: 'draw', amount: 1, if: { payLife: 2 } }] },
    { on: 'allyDies', subtype: 'Vampire', targets: [], effects: [{ kind: 'draw', amount: 1, if: { payLife: 2 } }] },
  ],
};
