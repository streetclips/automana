import type { CardDef } from '../types';

export const piratesCutlass: CardDef = {
  id: 'pirates_cutlass',
  name: "Pirate's Cutlass",
  types: ['artifact'],
  subtypes: ['Equipment'],
  cost: '{3}',
  attachment: { power: 2, toughness: 1 },
  triggers: [
    {
      on: 'enters',
      targets: [{ kind: 'creature', controller: 'you', subtype: 'Pirate' }],
      effects: [{ kind: 'attach', to: 0 }],
    },
  ],
  activated: [
    {
      cost: '{2}',
      sorcery: true,
      targets: [{ kind: 'creature', controller: 'you' }],
      effects: [{ kind: 'attach', to: 0 }],
    },
  ],
};
