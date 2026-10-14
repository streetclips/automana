import type { CardDef } from '../types';

export const dragonlordsServant: CardDef = {
  id: 'dragonlords_servant',
  name: "Dragonlord's Servant",
  types: ['creature'],
  subtypes: ['Goblin', 'Shaman'],
  cost: '{1}{R}',
  power: 1,
  toughness: 3,
  statics: [{ kind: 'spellDiscount', subtype: 'Dragon', amount: 1 }],
};
