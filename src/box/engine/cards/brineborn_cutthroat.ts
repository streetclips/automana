import type { CardDef } from '../types';

export const brinebornCutthroat: CardDef = {
  id: 'brineborn_cutthroat',
  name: 'Brineborn Cutthroat',
  types: ['creature'],
  subtypes: ['Merfolk', 'Pirate'],
  cost: '{1}{U}',
  power: 2,
  toughness: 1,
  keywords: ['flash'],
  triggers: [
    {
      on: 'spell',
      spells: 'any',
      condition: 'opponentsTurn',
      targets: [],
      effects: [{ kind: 'addCounters', amount: 1, to: 'self' }],
    },
  ],
};
