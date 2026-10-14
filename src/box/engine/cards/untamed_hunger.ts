import type { CardDef } from '../types';

export const untamedHunger: CardDef = {
  id: 'untamed_hunger',
  name: 'Untamed Hunger',
  types: ['enchantment'],
  subtypes: ['Aura'],
  cost: '{2}{B}',
  enchant: { kind: 'creature' },
  attachment: { power: 2, toughness: 1, keywords: ['menace'] },
};
