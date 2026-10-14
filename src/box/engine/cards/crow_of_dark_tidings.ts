import type { CardDef } from '../types';

export const crowOfDarkTidings: CardDef = {
  id: 'crow_of_dark_tidings',
  name: 'Crow of Dark Tidings',
  types: ['creature'],
  subtypes: ['Zombie', 'Bird'],
  cost: '{2}{B}',
  power: 2,
  toughness: 1,
  keywords: ['flying'],
  triggers: [
    { on: 'enters', targets: [], effects: [{ kind: 'mill', amount: 2 }] },
    { on: 'dies', targets: [], effects: [{ kind: 'mill', amount: 2 }] },
  ],
};
