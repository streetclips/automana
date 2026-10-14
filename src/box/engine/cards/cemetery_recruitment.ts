import type { CardDef } from '../types';

export const cemeteryRecruitment: CardDef = {
  id: 'cemetery_recruitment',
  name: 'Cemetery Recruitment',
  types: ['sorcery'],
  cost: '{1}{B}',
  spell: {
    targets: [{ kind: 'graveyard', cards: 'creature' }],
    effects: [
      { kind: 'returnToHand', to: 0 },
      { kind: 'draw', amount: 1, if: { targetSubtype: 'Zombie', target: 0 } },
    ],
  },
};
