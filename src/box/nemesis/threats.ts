import { registerCard, type CardDef, type Keyword, type ThreatInfo, type TriggeredAbility } from '../engine';

export interface NemesisDeck {
  id: string;
  name: string;
  threats: string[];
}

interface CreatureSpec {
  id: string;
  name: string;
  subtype: string;
  power: number;
  toughness: number;
  threat: ThreatInfo;
  keywords?: Keyword[];
  triggers?: TriggeredAbility[];
}

function creature(spec: CreatureSpec): CardDef {
  return {
    id: spec.id,
    name: spec.name,
    types: ['creature'],
    subtypes: [spec.subtype],
    power: spec.power,
    toughness: spec.toughness,
    keywords: spec.keywords,
    triggers: spec.triggers,
    threat: spec.threat,
  };
}

function spell(id: string, name: string, threat: ThreatInfo, ability: Partial<NonNullable<CardDef['spell']>> = {}): CardDef {
  return {
    id,
    name,
    types: ['sorcery'],
    spell: { targets: ability.targets ?? [], effects: ability.effects ?? [] },
    threat,
  };
}

const THREATS: CardDef[] = [
  creature({ id: 'nm_ash_imp', name: 'Ash Imp', subtype: 'Imp', power: 3, toughness: 2, keywords: ['flying'], threat: { tier: 1 } }),
  creature({ id: 'nm_magma_sentinel', name: 'Magma Sentinel', subtype: 'Elemental', power: 3, toughness: 5, keywords: ['defender'], threat: { tier: 1 } }),
  spell('nm_rain_of_cinders', 'Rain of Cinders', { tier: 1, effect: { kind: 'damageEach', creatures: 1, player: 1 } }),
  spell('nm_tyrants_roar', "Tyrant's Roar", { tier: 1 }, { effects: [{ kind: 'pumpTeam', power: 1, toughness: 0 }] }),
  spell('nm_searing_breath', 'Searing Breath', { tier: 2 }, { targets: [{ kind: 'any' }], effects: [{ kind: 'damage', amount: 2, to: 0 }] }),
  creature({ id: 'nm_cinderclaw_brute', name: 'Cinderclaw Brute', subtype: 'Demon', power: 6, toughness: 3, threat: { tier: 2 } }),
  creature({ id: 'nm_ember_wyrmling', name: 'Ember Wyrmling', subtype: 'Dragon', power: 5, toughness: 3, keywords: ['flying'], threat: { tier: 2 } }),
  creature({
    id: 'nm_vorthraxs_herald',
    name: "Vorthrax's Herald",
    subtype: 'Cultist',
    power: 6,
    toughness: 4,
    threat: { tier: 3 },
    triggers: [{ on: 'enters', targets: [{ kind: 'player', controller: 'opponent' }], effects: [{ kind: 'damage', amount: 1, to: 0 }] }],
  }),
  creature({ id: 'nm_scorch_fiend', name: 'Scorch Fiend', subtype: 'Demon', power: 7, toughness: 4, keywords: ['trample'], threat: { tier: 3 } }),
  creature({ id: 'nm_lava_behemoth', name: 'Lava Behemoth', subtype: 'Elemental', power: 7, toughness: 6, threat: { tier: 3 } }),
  creature({ id: 'nm_inferno_charger', name: 'Inferno Charger', subtype: 'Elemental', power: 6, toughness: 3, keywords: ['haste'], threat: { tier: 3 } }),
  spell('nm_cinder_rebirth', 'Cinder Rebirth', { tier: 3, effect: { kind: 'reanimate', count: 1, fallback: 2, damage: true } }),

  creature({ id: 'nm_ravenous_larva', name: 'Ravenous Larva', subtype: 'Insect', power: 3, toughness: 3, keywords: ['lifelink'], threat: { tier: 1 } }),
  spell('nm_pheromones', 'Pheromones', { tier: 1 }, { effects: [{ kind: 'pumpTeam', power: 1, toughness: 1 }] }),
  spell('nm_insect_plague', 'Insect Plague', { tier: 1, effect: { kind: 'damageEach', creatures: 1, player: 0 } }),
  creature({ id: 'nm_armored_drone', name: 'Armored Drone', subtype: 'Insect', power: 4, toughness: 4, threat: { tier: 2 } }),
  creature({ id: 'nm_darting_wasp', name: 'Darting Wasp', subtype: 'Insect', power: 4, toughness: 3, keywords: ['flying'], threat: { tier: 2 } }),
  creature({ id: 'nm_shieldbreaker_beetle', name: 'Shieldbreaker Beetle', subtype: 'Insect', power: 4, toughness: 5, keywords: ['trample'], threat: { tier: 3 } }),
  creature({
    id: 'nm_mantis_queen',
    name: 'Mantis Queen',
    subtype: 'Insect',
    power: 5,
    toughness: 6,
    threat: { tier: 3 },
    triggers: [{ on: 'enters', targets: [], effects: [{ kind: 'pumpTeam', power: 1, toughness: 0 }] }],
  }),
  spell('nm_egg_laying', 'Egg Laying', { tier: 3, effect: { kind: 'reveal', count: 1 } }),
  spell('nm_brood', 'Brood', { tier: 3, effect: { kind: 'reveal', count: 2 } }),

  creature({ id: 'nm_wandering_skeleton', name: 'Wandering Skeleton', subtype: 'Skeleton', power: 3, toughness: 2, threat: { tier: 1, recur: true } }),
  creature({ id: 'nm_rotting_zombie', name: 'Rotting Zombie', subtype: 'Zombie', power: 3, toughness: 4, threat: { tier: 1 } }),
  spell('nm_plague', 'Plague', { tier: 1, effect: { kind: 'shrinkAll', amount: 1 } }),
  creature({ id: 'nm_vampire_bat', name: 'Vampire Bat', subtype: 'Bat', power: 3, toughness: 3, keywords: ['flying', 'lifelink'], threat: { tier: 2 } }),
  spell('nm_withering_touch', 'Withering Touch', { tier: 2, effect: { kind: 'shrinkTarget', amount: 2, fallback: 2 } }, { targets: [{ kind: 'any' }] }),
  spell('nm_soul_drain', 'Soul Drain', { tier: 2 }, {
    effects: [
      { kind: 'loseLife', amount: 2, who: 'opponent' },
      { kind: 'gainLife', amount: 2 },
    ],
  }),
  spell('nm_exhume', 'Exhume', { tier: 2, effect: { kind: 'reanimate', count: 1, fallback: 2, damage: false } }),
  creature({ id: 'nm_morwens_ghoul', name: "Morwen's Ghoul", subtype: 'Zombie', power: 4, toughness: 3, keywords: ['deathtouch'], threat: { tier: 3 } }),
  creature({ id: 'nm_deathless_knight', name: 'Deathless Knight', subtype: 'Zombie Knight', power: 5, toughness: 5, keywords: ['lifelink'], threat: { tier: 3 } }),
  creature({
    id: 'nm_crypt_horror',
    name: 'Crypt Horror',
    subtype: 'Horror',
    power: 6,
    toughness: 5,
    keywords: ['lifelink'],
    threat: { tier: 3 },
    triggers: [{ on: 'enters', targets: [], effects: [{ kind: 'loseLife', amount: 1, who: 'opponent' }] }],
  }),
  spell('nm_uprising', 'Uprising', { tier: 3, effect: { kind: 'reanimate', count: 2, fallback: 2, damage: false } }),

  creature({ id: 'nm_crystal_golem', name: 'Crystal Golem', subtype: 'Golem', power: 2, toughness: 4, keywords: ['defender'], threat: { tier: 1 } }),
  spell('nm_mind_theft', 'Mind Theft', { tier: 2, effect: { kind: 'randomDiscard', fallback: 2 } }),
  spell('nm_mass_illusion', 'Mass Illusion', { tier: 2, effect: { kind: 'tapAll' } }),
  spell('nm_counterspell', 'Counterspell', { tier: 1, effect: { kind: 'counterNext' } }),
  spell('nm_rebound', 'Rebound', { tier: 2, effect: { kind: 'rebound' } }, { targets: [{ kind: 'any' }] }),
  creature({ id: 'nm_fragile_illusion', name: 'Fragile Illusion', subtype: 'Illusion', power: 4, toughness: 1, keywords: ['flying'], threat: { tier: 1 } }),
  creature({ id: 'nm_water_elemental', name: 'Water Elemental', subtype: 'Elemental', power: 4, toughness: 4, threat: { tier: 2 } }),
  creature({ id: 'nm_guardian_sphinx', name: 'Guardian Sphinx', subtype: 'Sphinx', power: 4, toughness: 3, keywords: ['flying'], threat: { tier: 3 } }),
  creature({ id: 'nm_mirror_djinn', name: 'Mirror Djinn', subtype: 'Djinn', power: 5, toughness: 2, keywords: ['flying'], threat: { tier: 3 } }),
  creature({ id: 'nm_tide_serpent', name: 'Tide Serpent', subtype: 'Serpent', power: 5, toughness: 5, threat: { tier: 3 } }),
  creature({ id: 'nm_refraction_golem', name: 'Refraction Golem', subtype: 'Golem', power: 2, toughness: 4, keywords: ['defender'], threat: { tier: 3, tax: 1 } }),
];


function copies(entries: [string, number][]): string[] {
  return entries.flatMap(([id, count]) => Array.from({ length: count }, () => id));
}

export const NEMESES: NemesisDeck[] = [
  {
    id: 'vorthrax',
    name: 'Vorthrax',
    threats: copies([
      ['nm_ash_imp', 3],
      ['nm_magma_sentinel', 1],
      ['nm_rain_of_cinders', 1],
      ['nm_tyrants_roar', 1],
      ['nm_searing_breath', 2],
      ['nm_cinderclaw_brute', 3],
      ['nm_ember_wyrmling', 2],
      ['nm_vorthraxs_herald', 2],
      ['nm_scorch_fiend', 2],
      ['nm_lava_behemoth', 1],
      ['nm_inferno_charger', 1],
      ['nm_cinder_rebirth', 1],
    ]),
  },
  {
    id: 'vaskara',
    name: 'Vaskara',
    threats: copies([
      ['nm_ravenous_larva', 3],
      ['nm_pheromones', 2],
      ['nm_insect_plague', 1],
      ['nm_armored_drone', 4],
      ['nm_darting_wasp', 3],
      ['nm_shieldbreaker_beetle', 2],
      ['nm_mantis_queen', 2],
      ['nm_egg_laying', 2],
      ['nm_brood', 1],
    ]),
  },
  {
    id: 'morwen',
    name: 'Morwen',
    threats: copies([
      ['nm_wandering_skeleton', 4],
      ['nm_rotting_zombie', 1],
      ['nm_plague', 1],
      ['nm_vampire_bat', 3],
      ['nm_withering_touch', 2],
      ['nm_soul_drain', 1],
      ['nm_exhume', 1],
      ['nm_morwens_ghoul', 2],
      ['nm_deathless_knight', 2],
      ['nm_crypt_horror', 2],
      ['nm_uprising', 1],
    ]),
  },
  {
    id: 'mirror-archmage',
    name: 'Mirror Archmage',
    threats: copies([
      ['nm_crystal_golem', 1],
      ['nm_mind_theft', 1],
      ['nm_mass_illusion', 1],
      ['nm_counterspell', 2],
      ['nm_rebound', 2],
      ['nm_fragile_illusion', 3],
      ['nm_water_elemental', 3],
      ['nm_guardian_sphinx', 2],
      ['nm_mirror_djinn', 2],
      ['nm_tide_serpent', 2],
      ['nm_refraction_golem', 1],
    ]),
  },
];

const SIZES = new Map(
  (process.env.BOX_THREAT_SIZES ?? '')
    .split(',')
    .filter(Boolean)
    .map((entry) => {
      const [id = '', power = '0', toughness = '0'] = entry.split(/[=/]/);
      return [id, [Number(power), Number(toughness)] as const];
    }),
);

function resized(def: CardDef): CardDef {
  const owner = NEMESES.find((nemesis) => nemesis.threats.includes(def.id));
  const [deckPower, deckToughness] = SIZES.get(owner?.id ?? '') ?? [0, 0];
  const [cardPower, cardToughness] = SIZES.get(def.id) ?? [0, 0];
  if (def.power === undefined || def.toughness === undefined) return def;
  return {
    ...def,
    power: Math.max(0, def.power + deckPower + cardPower),
    toughness: Math.max(1, def.toughness + deckToughness + cardToughness),
  };
}

for (const def of THREATS) registerCard(resized(def));

export function getNemesis(id: string): NemesisDeck {
  const nemesis = NEMESES.find((candidate) => candidate.id === id);
  if (!nemesis) throw new Error(`Unknown Nemesis "${id}"`);
  return nemesis;
}
