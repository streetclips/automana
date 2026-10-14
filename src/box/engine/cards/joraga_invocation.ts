import type { CardDef } from '../types';

export const joragaInvocation: CardDef = {
  id: 'joraga_invocation',
  name: 'Joraga Invocation',
  types: ['sorcery'],
  cost: '{4}{G}{G}',
  spell: {
    targets: [],
    effects: [{ kind: 'pumpTeam', power: 3, toughness: 3 }],
  },
};
