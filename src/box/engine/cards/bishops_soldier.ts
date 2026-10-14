import type { CardDef } from '../types';

export const bishopsSoldier: CardDef = {
  id: 'bishops_soldier',
  name: "Bishop's Soldier",
  types: ['creature'],
  subtypes: ['Vampire', 'Soldier'],
  cost: '{1}{W}',
  power: 2,
  toughness: 2,
  keywords: ['lifelink'],
};
