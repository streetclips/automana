import type { CardDef } from '../types';

export const reassemblingSkeleton: CardDef = {
  id: 'reassembling_skeleton',
  name: 'Reassembling Skeleton',
  types: ['creature'],
  subtypes: ['Skeleton', 'Warrior'],
  cost: '{1}{B}',
  power: 1,
  toughness: 1,
  activated: [{ cost: '{1}{B}', fromGraveyard: true, targets: [], effects: [{ kind: 'returnSelf', tapped: true }] }],
};
