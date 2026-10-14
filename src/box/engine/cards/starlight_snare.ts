import type { CardDef } from '../types';

export const starlightSnare: CardDef = {
  id: 'starlight_snare',
  name: 'Starlight Snare',
  types: ['enchantment'],
  subtypes: ['Aura'],
  cost: '{2}{U}',
  enchant: { kind: 'creature' },
  attachment: { doesntUntap: true },
  triggers: [{ on: 'enters', targets: [], effects: [{ kind: 'tap', to: 'attached' }] }],
};
