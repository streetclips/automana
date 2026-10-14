import type { CardDef } from '../types';

export const terrorOfMountVelus: CardDef = {
  id: 'terror_of_mount_velus',
  name: 'Terror of Mount Velus',
  types: ['creature'],
  subtypes: ['Dragon'],
  cost: '{5}{R}{R}',
  power: 5,
  toughness: 5,
  keywords: ['flying', 'doubleStrike'],
  triggers: [
    { on: 'enters', targets: [], effects: [{ kind: 'pumpTeam', power: 0, toughness: 0, keywords: ['doubleStrike'] }] },
  ],
};
