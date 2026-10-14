import type { CardDef } from '../types';

export const frenziedGoblin: CardDef = {
  id: 'frenzied_goblin',
  name: 'Frenzied Goblin',
  types: ['creature'],
  subtypes: ['Goblin', 'Berserker'],
  cost: '{R}',
  power: 1,
  toughness: 1,
  triggers: [
    {
      on: 'attacks',
      targets: [{ kind: 'creature' }],
      effects: [{ kind: 'cantBlock', to: 0, if: { payMana: '{R}' } }],
    },
  ],
};
