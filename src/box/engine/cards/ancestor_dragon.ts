import type { CardDef } from '../types';

export const ancestorDragon: CardDef = {
  id: 'ancestor_dragon',
  name: 'Ancestor Dragon',
  types: ['creature'],
  subtypes: ['Dragon'],
  cost: '{4}{W}{W}',
  power: 5,
  toughness: 6,
  keywords: ['flying'],
  triggers: [
    { on: 'youAttack', targets: [], effects: [{ kind: 'gainLife', amount: 1, times: { kind: 'attacking' } }] },
  ],
};
