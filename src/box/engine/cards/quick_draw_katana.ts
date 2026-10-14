import type { CardDef } from '../types';

export const quickDrawKatana: CardDef = {
  id: 'quick_draw_katana',
  name: 'Quick-Draw Katana',
  types: ['artifact'],
  subtypes: ['Equipment'],
  cost: '{2}',
  attachment: { power: 2, keywords: ['firstStrike'], yourTurn: true },
  activated: [
    {
      cost: '{2}',
      sorcery: true,
      targets: [{ kind: 'creature', controller: 'you' }],
      effects: [{ kind: 'attach', to: 0 }],
    },
  ],
};
