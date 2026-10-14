import type { CardDef } from '../types';

export const beastKinRanger: CardDef = {
  id: 'beast_kin_ranger',
  name: 'Beast-Kin Ranger',
  types: ['creature'],
  subtypes: ['Elf', 'Ranger'],
  cost: '{2}{G}',
  power: 3,
  toughness: 3,
  keywords: ['trample'],
  triggers: [{ on: 'allyEnters', targets: [], effects: [{ kind: 'pump', power: 1, toughness: 0, to: 'self' }] }],
};
