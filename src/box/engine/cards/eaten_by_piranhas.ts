import type { CardDef } from '../types';

export const eatenByPiranhas: CardDef = {
  id: 'eaten_by_piranhas',
  name: 'Eaten by Piranhas',
  types: ['enchantment'],
  subtypes: ['Aura'],
  cost: '{1}{U}',
  keywords: ['flash'],
  enchant: { kind: 'creature' },
  attachment: { loseAbilities: true, base: [1, 1] },
};
