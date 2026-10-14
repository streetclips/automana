import type { CardDef } from '../types';

export const biteDown: CardDef = {
  id: 'bite_down',
  name: 'Bite Down',
  types: ['instant'],
  cost: '{1}{G}',
  spell: {
    targets: [
      { kind: 'creature', controller: 'you' },
      { kind: 'creature', controller: 'opponent' },
    ],
    effects: [{ kind: 'bite', a: 0, b: 1 }],
  },
};
