import type { CardDef } from '../types';

export const fellingBlow: CardDef = {
  id: 'felling_blow',
  name: 'Felling Blow',
  types: ['sorcery'],
  cost: '{2}{G}',
  spell: {
    targets: [
      { kind: 'creature', controller: 'you' },
      { kind: 'creature', controller: 'opponent' },
    ],
    effects: [
      { kind: 'addCounters', amount: 1, to: 0 },
      { kind: 'bite', a: 0, b: 1 },
    ],
  },
};
