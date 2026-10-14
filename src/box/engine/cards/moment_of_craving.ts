import type { CardDef } from '../types';

export const momentOfCraving: CardDef = {
  id: 'moment_of_craving',
  name: 'Moment of Craving',
  types: ['instant'],
  cost: '{1}{B}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [
      { kind: 'pump', power: -2, toughness: -2, to: 0 },
      { kind: 'gainLife', amount: 2 },
    ],
  },
};
