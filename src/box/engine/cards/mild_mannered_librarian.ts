import type { CardDef } from '../types';

export const mildManneredLibrarian: CardDef = {
  id: 'mild_mannered_librarian',
  name: 'Mild-Mannered Librarian',
  types: ['creature'],
  subtypes: ['Human'],
  cost: '{G}',
  power: 1,
  toughness: 1,
  activated: [
    {
      cost: '{3}{G}',
      once: true,
      targets: [],
      effects: [
        { kind: 'addCounters', amount: 2, to: 'self' },
        { kind: 'draw', amount: 1 },
      ],
    },
  ],
};
