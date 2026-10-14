import type { CardDef } from '../types';

export const elvishRegrower: CardDef = {
  id: 'elvish_regrower',
  name: 'Elvish Regrower',
  types: ['creature'],
  subtypes: ['Elf', 'Druid'],
  cost: '{2}{G}{G}',
  power: 4,
  toughness: 3,
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'graveyard', cards: 'permanent' }],
      effects: [{ kind: 'returnToHand', to: 0 }],
    },
  ],
};
