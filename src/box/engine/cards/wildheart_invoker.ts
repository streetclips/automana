import type { CardDef } from '../types';

export const wildheartInvoker: CardDef = {
  id: 'wildheart_invoker',
  name: 'Wildheart Invoker',
  types: ['creature'],
  subtypes: ['Elf', 'Shaman'],
  cost: '{2}{G}{G}',
  power: 4,
  toughness: 3,
  activated: [
    {
      cost: '{8}',
      targets: [{ kind: 'creature' }],
      effects: [{ kind: 'pump', power: 5, toughness: 5, to: 0, keywords: ['trample'] }],
    },
  ],
};
