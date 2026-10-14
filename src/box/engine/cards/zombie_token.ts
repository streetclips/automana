import type { CardDef } from '../types';

export const zombieToken: CardDef = {
  id: 'zombie_token',
  name: 'Zombie',
  types: ['creature'],
  subtypes: ['Zombie'],
  token: true,
  colors: ['B'],
  power: 2,
  toughness: 2,
};
