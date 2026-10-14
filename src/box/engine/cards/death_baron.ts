import type { CardDef } from '../types';

export const deathBaron: CardDef = {
  id: 'death_baron',
  name: 'Death Baron',
  types: ['creature'],
  subtypes: ['Zombie', 'Wizard'],
  cost: '{1}{B}{B}',
  power: 2,
  toughness: 2,
  statics: [
    { kind: 'anthem', subtypes: ['Skeleton', 'Zombie'], other: true, power: 1, toughness: 1, keywords: ['deathtouch'] },
  ],
};
