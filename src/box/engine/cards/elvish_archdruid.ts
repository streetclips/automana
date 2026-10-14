import type { CardDef } from '../types';

export const elvishArchdruid: CardDef = {
  id: 'elvish_archdruid',
  name: 'Elvish Archdruid',
  types: ['creature'],
  subtypes: ['Elf', 'Druid'],
  cost: '{1}{G}{G}',
  power: 2,
  toughness: 2,
  mana: ['G'],
  manaTimes: { kind: 'creatures', subtype: 'Elf' },
  statics: [{ kind: 'anthem', subtypes: ['Elf'], other: true, power: 1, toughness: 1 }],
};
