import type { CardDef } from '../types';

export const momentOfTriumph: CardDef = {
  id: 'moment_of_triumph',
  name: 'Moment of Triumph',
  types: ['instant'],
  cost: '{W}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [
      { kind: 'pump', power: 2, toughness: 2, to: 0 },
      { kind: 'gainLife', amount: 2 },
    ],
  },
};
