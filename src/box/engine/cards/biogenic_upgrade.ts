import type { CardDef } from '../types';

export const biogenicUpgrade: CardDef = {
  id: 'biogenic_upgrade',
  name: 'Biogenic Upgrade',
  types: ['sorcery'],
  cost: '{4}{G}{G}',
  spell: {
    targets: [{ kind: 'creature' }, { kind: 'creature' }, { kind: 'creature' }],
    minTargets: 1,
    effects: [{ kind: 'distributeCounters', amount: 3 }],
  },
};
