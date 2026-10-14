import type { CardDef } from '../types';

export const stormFleetSpy: CardDef = {
  id: 'storm_fleet_spy',
  name: 'Storm Fleet Spy',
  types: ['creature'],
  subtypes: ['Human', 'Pirate'],
  cost: '{2}{U}',
  power: 2,
  toughness: 2,
  triggers: [{ on: 'enters', condition: 'attackedThisTurn', targets: [], effects: [{ kind: 'draw', amount: 1 }] }],
};
