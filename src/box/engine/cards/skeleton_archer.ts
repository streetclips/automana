import type { CardDef } from '../types';

export const skeletonArcher: CardDef = {
  id: 'skeleton_archer',
  name: 'Skeleton Archer',
  types: ['creature'],
  subtypes: ['Skeleton', 'Archer'],
  cost: '{3}{B}',
  power: 3,
  toughness: 3,
  triggers: [{ on: 'enters', targets: [{ kind: 'any' }], effects: [{ kind: 'damage', amount: 1, to: 0 }] }],
};
