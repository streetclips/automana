import type { CardDef } from '../types';

export const suspiciousShambler: CardDef = {
  id: 'suspicious_shambler',
  name: 'Suspicious Shambler',
  types: ['creature'],
  subtypes: ['Zombie'],
  cost: '{3}{B}',
  power: 4,
  toughness: 2,
  activated: [
    {
      cost: '{4}{B}{B}',
      fromGraveyard: true,
      exileSelf: true,
      sorcery: true,
      targets: [],
      effects: [{ kind: 'createTokens', token: 'zombie_token', amount: 2 }],
    },
  ],
};
