import type { CardDef } from '../types';

export const angelicEdict: CardDef = {
  id: 'angelic_edict',
  name: 'Angelic Edict',
  types: ['sorcery'],
  cost: '{4}{W}',
  spell: {
    targets: [{ kind: 'permanent', types: ['creature', 'enchantment'] }],
    effects: [{ kind: 'exile', to: 0 }],
  },
};
