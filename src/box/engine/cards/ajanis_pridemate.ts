import type { CardDef } from '../types';

export const ajanisPridemate: CardDef = {
  id: 'ajanis_pridemate',
  name: "Ajani's Pridemate",
  types: ['creature'],
  subtypes: ['Cat', 'Soldier'],
  cost: '{1}{W}',
  power: 2,
  toughness: 2,
  triggers: [{ on: 'lifeGain', targets: [], effects: [{ kind: 'addCounters', amount: 1, to: 'self' }] }],
};
