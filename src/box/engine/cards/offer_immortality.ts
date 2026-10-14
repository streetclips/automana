import type { CardDef } from '../types';

export const offerImmortality: CardDef = {
  id: 'offer_immortality',
  name: 'Offer Immortality',
  types: ['instant'],
  cost: '{1}{B}',
  spell: {
    targets: [{ kind: 'creature' }],
    effects: [{ kind: 'pump', power: 0, toughness: 0, to: 0, keywords: ['deathtouch', 'indestructible'] }],
  },
};
