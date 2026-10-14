import type { CardDef } from '../types';

export const treasureToken: CardDef = {
  id: 'treasure_token',
  name: 'Treasure',
  types: ['artifact'],
  subtypes: ['Treasure'],
  token: true,
  colors: [],
  mana: ['W', 'U', 'B', 'R', 'G'],
  sacrificeForMana: true,
};
