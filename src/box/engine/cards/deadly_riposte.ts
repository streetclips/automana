import type { CardDef } from '../types';

export const deadlyRiposte: CardDef = {
  id: 'deadly_riposte',
  name: 'Deadly Riposte',
  types: ['instant'],
  cost: '{1}{W}',
  spell: {
    targets: [{ kind: 'creature', tapped: true }],
    effects: [
      { kind: 'damage', amount: 3, to: 0 },
      { kind: 'gainLife', amount: 2 },
    ],
  },
};
