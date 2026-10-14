import type { CardDef } from '../types';

export const bloodtitheCollector: CardDef = {
  id: 'bloodtithe_collector',
  name: 'Bloodtithe Collector',
  types: ['creature'],
  subtypes: ['Vampire', 'Noble'],
  cost: '{4}{B}',
  power: 3,
  toughness: 4,
  keywords: ['flying'],
  triggers: [
    {
      on: 'enters',
      condition: 'opponentLostLife',
      targets: [],
      effects: [{ kind: 'discard', amount: 1, who: 'opponent' }],
    },
  ],
};
