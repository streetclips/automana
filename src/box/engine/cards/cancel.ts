import type { CardDef } from '../types';

export const cancel: CardDef = {
  id: 'cancel',
  name: 'Cancel',
  types: ['instant'],
  cost: '{1}{U}{U}',
  spell: {
    targets: [{ kind: 'spell' }],
    effects: [{ kind: 'counter', to: 0 }],
  },
};
