import type { CardDef } from '../types';

export const fleetingDistraction: CardDef = {
  id: 'fleeting_distraction',
  name: 'Fleeting Distraction',
  types: ['instant'],
  cost: '{U}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [
      { kind: 'pump', power: -1, toughness: 0, to: 0 },
      { kind: 'draw', amount: 1 },
    ],
  },
};
