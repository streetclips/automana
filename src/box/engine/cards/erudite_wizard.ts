import type { CardDef } from '../types';

export const eruditeWizard: CardDef = {
  id: 'erudite_wizard',
  name: 'Erudite Wizard',
  types: ['creature'],
  subtypes: ['Human', 'Wizard'],
  cost: '{2}{U}',
  power: 2,
  toughness: 3,
  triggers: [{ on: 'secondDraw', targets: [], effects: [{ kind: 'addCounters', amount: 1, to: 'self' }] }],
};
