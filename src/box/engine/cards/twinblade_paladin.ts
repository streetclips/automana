import type { CardDef } from '../types';

export const twinbladePaladin: CardDef = {
  id: 'twinblade_paladin',
  name: 'Twinblade Paladin',
  types: ['creature'],
  subtypes: ['Human', 'Knight'],
  cost: '{3}{W}',
  power: 3,
  toughness: 3,
  statics: [{ kind: 'keywordIf', keyword: 'doubleStrike', condition: 'life25' }],
  triggers: [{ on: 'lifeGain', targets: [], effects: [{ kind: 'addCounters', amount: 1, to: 'self' }] }],
};
