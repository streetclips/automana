import type { CardDef } from '../types';

export const thrashingBrontodon: CardDef = {
  id: 'thrashing_brontodon',
  name: 'Thrashing Brontodon',
  types: ['creature'],
  subtypes: ['Dinosaur'],
  cost: '{1}{G}{G}',
  power: 3,
  toughness: 4,
  activated: [
    {
      cost: '{1}',
      sacrifice: true,
      targets: [{ kind: 'permanent', types: ['artifact', 'enchantment'] }],
      effects: [{ kind: 'destroy', to: 0 }],
    },
  ],
};
