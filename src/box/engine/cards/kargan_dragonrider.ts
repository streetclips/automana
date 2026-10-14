import type { CardDef } from '../types';

export const karganDragonrider: CardDef = {
  id: 'kargan_dragonrider',
  name: 'Kargan Dragonrider',
  types: ['creature'],
  subtypes: ['Human', 'Warrior'],
  cost: '{1}{R}',
  power: 2,
  toughness: 2,
  statics: [{ kind: 'keywordIf', keyword: 'flying', condition: 'controlDragon' }],
};
