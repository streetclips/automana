import type { CardDef } from '../types';

export const hungryGhoul: CardDef = {
  id: 'hungry_ghoul',
  name: 'Hungry Ghoul',
  types: ['creature'],
  subtypes: ['Zombie'],
  cost: '{1}{B}',
  power: 2,
  toughness: 2,
  activated: [
    { cost: '{1}', sacrificeAnother: true, targets: [], effects: [{ kind: 'addCounters', amount: 1, to: 'self' }] },
  ],
};
