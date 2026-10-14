import type { CardDef } from '../types';

export const elspethsSmite: CardDef = {
  id: 'elspeths_smite',
  name: "Elspeth's Smite",
  types: ['instant'],
  cost: '{W}',
  spell: {
    targets: [{ kind: 'creature', combat: 'attackingOrBlocking' }],
    effects: [
      { kind: 'damage', amount: 3, to: 0 },
      { kind: 'exileIfDies', to: 0 },
    ],
  },
};
