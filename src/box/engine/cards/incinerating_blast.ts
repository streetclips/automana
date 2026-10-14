import type { CardDef } from '../types';

export const incineratingBlast: CardDef = {
  id: 'incinerating_blast',
  name: 'Incinerating Blast',
  types: ['sorcery'],
  cost: '{4}{R}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [
      { kind: 'damage', amount: 6, to: 0 },
      { kind: 'draw', amount: 1 },
      { kind: 'discard', amount: 1 },
    ],
  },
};
