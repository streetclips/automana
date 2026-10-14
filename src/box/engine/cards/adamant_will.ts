import type { CardDef } from '../types';

export const adamantWill: CardDef = {
  id: 'adamant_will',
  name: 'Adamant Will',
  types: ['instant'],
  cost: '{1}{W}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'pump', power: 2, toughness: 2, to: 0, keywords: ['indestructible'] }],
  },
};
