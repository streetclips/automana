import type { CardDef } from '../types';

export const jazalGoldmane: CardDef = {
  id: 'jazal_goldmane',
  name: 'Jazal Goldmane',
  types: ['creature'],
  subtypes: ['Cat', 'Warrior'],
  cost: '{2}{W}{W}',
  power: 4,
  toughness: 4,
  supertypes: ['Legendary'],
  keywords: ['firstStrike'],
  activated: [{ cost: '{3}{W}{W}', targets: [], effects: [{ kind: 'pumpAttackers', perAttacker: 1 }] }],
};
