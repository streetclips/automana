import type { CardDef } from '../types';

export const dwynensElite: CardDef = {
  id: 'dwynens_elite',
  name: "Dwynen's Elite",
  types: ['creature'],
  subtypes: ['Elf', 'Warrior'],
  cost: '{1}{G}',
  power: 2,
  toughness: 2,
  triggers: [
    {
      on: 'enters',
      condition: 'anotherElf',
      targets: [],
      effects: [{ kind: 'createTokens', token: 'elf_warrior_token', amount: 1 }],
    },
  ],
};
