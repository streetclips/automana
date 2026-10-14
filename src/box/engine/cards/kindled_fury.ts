import type { CardDef } from '../types';

export const kindledFury: CardDef = {
  id: 'kindled_fury',
  name: 'Kindled Fury',
  types: ['instant'],
  cost: '{R}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'pump', power: 1, toughness: 0, to: 0, keywords: ['firstStrike'] }],
  },
};
