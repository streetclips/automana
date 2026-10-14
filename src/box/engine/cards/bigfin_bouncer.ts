import type { CardDef } from '../types';

export const bigfinBouncer: CardDef = {
  id: 'bigfin_bouncer',
  name: 'Bigfin Bouncer',
  types: ['creature'],
  subtypes: ['Shark', 'Pirate'],
  cost: '{3}{U}',
  power: 3,
  toughness: 2,
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'creature', controller: 'opponent' }],
      effects: [{ kind: 'bounce', to: 0 }],
    },
  ],
};
