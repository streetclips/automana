import type { CardDef } from '../types';

export const goblinFirebomb: CardDef = {
  id: 'goblin_firebomb',
  name: 'Goblin Firebomb',
  types: ['artifact'],
  cost: '{1}',
  keywords: ['flash'],
  activated: [
    {
      cost: '{7}',
      tap: true,
      sacrifice: true,
      targets: [{ kind: 'permanent' }],
      effects: [{ kind: 'destroy', to: 0 }],
    },
  ],
};
