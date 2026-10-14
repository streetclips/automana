import type { CardDef } from '../types';

export const eatenAlive: CardDef = {
  id: 'eaten_alive',
  name: 'Eaten Alive',
  types: ['sorcery'],
  cost: '{B}',
  sacrificeCreatureOr: '{3}{B}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'exile', to: 0 }],
  },
};
