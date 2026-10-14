import type { CardDef } from '../types';

export const goblinOriflamme: CardDef = {
  id: 'goblin_oriflamme',
  name: 'Goblin Oriflamme',
  types: ['enchantment'],
  cost: '{1}{R}',
  statics: [{ kind: 'anthem', attacking: true, power: 1, toughness: 0 }],
};
