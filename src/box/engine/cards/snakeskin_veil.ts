import type { CardDef } from '../types';

export const snakeskinVeil: CardDef = {
  id: 'snakeskin_veil',
  name: 'Snakeskin Veil',
  types: ['instant'],
  cost: '{G}',
  spell: {
    targets: [{ kind: 'creature', controller: 'you' }],
    effects: [
      { kind: 'addCounters', amount: 1, to: 0 },
      { kind: 'pump', power: 0, toughness: 0, to: 0, keywords: ['hexproof'] },
    ],
  },
};
