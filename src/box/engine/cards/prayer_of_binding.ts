import type { CardDef } from '../types';

export const prayerOfBinding: CardDef = {
  id: 'prayer_of_binding',
  name: 'Prayer of Binding',
  types: ['enchantment'],
  cost: '{3}{W}',
  keywords: ['flash'],
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'permanent', controller: 'opponent', types: ['nonland'] }],
      minTargets: 0,
      effects: [
        { kind: 'exile', to: 0 },
        { kind: 'gainLife', amount: 2 },
      ],
    },
  ],
};
