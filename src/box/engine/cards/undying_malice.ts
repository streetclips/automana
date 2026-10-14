import type { CardDef } from '../types';

export const undyingMalice: CardDef = {
  id: 'undying_malice',
  name: 'Undying Malice',
  types: ['instant'],
  cost: '{B}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'pump', power: 0, toughness: 0, to: 0, keywords: ['undying'] }],
  },
};
