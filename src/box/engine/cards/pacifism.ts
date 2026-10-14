import type { CardDef } from '../types';

export const pacifism: CardDef = {
  id: 'pacifism',
  name: 'Pacifism',
  types: ['enchantment'],
  subtypes: ['Aura'],
  cost: '{1}{W}',
  enchant: { kind: 'creature' },
  attachment: { cantAttack: true, cantBlock: true },
};
