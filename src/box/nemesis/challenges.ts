import {
  registerCard,
  type CardDef,
  type ChallengeEffect,
  type ChallengeInfo,
  type Effect,
  type Keyword,
  type StaticAbility,
  type TriggeredAbility,
} from '../engine';
import type { NemesisDeck } from './threats';

interface CreatureSpec {
  id: string;
  name: string;
  subtypes: string[];
  power: number;
  toughness: number;
  types?: CardDef['types'];
  keywords?: Keyword[];
  triggers?: TriggeredAbility[];
  challenge?: ChallengeInfo;
  entersTapped?: boolean;
  statics?: StaticAbility[];
}

function creature(spec: CreatureSpec): CardDef {
  return {
    id: spec.id,
    name: spec.name,
    types: spec.types ?? ['creature'],
    subtypes: spec.subtypes,
    power: spec.power,
    toughness: spec.toughness,
    keywords: spec.keywords,
    triggers: spec.triggers,
    challenge: spec.challenge,
    entersTapped: spec.entersTapped,
    statics: spec.statics,
  };
}

function sorcery(id: string, name: string, ...effects: ChallengeEffect[]): CardDef {
  return {
    id,
    name,
    types: ['sorcery'],
    spell: { targets: [], effects: effects.map((effect) => ({ kind: 'challenge', effect })) },
  };
}

function permanent(
  id: string,
  name: string,
  types: CardDef['types'],
  extra: { challenge?: ChallengeInfo; triggers?: TriggeredAbility[]; statics?: StaticAbility[] },
): CardDef {
  return { id, name, types, ...extra };
}

const on = (event: TriggeredAbility['on'], ...effects: Effect[]): TriggeredAbility => ({
  on: event,
  targets: [],
  effects,
});
const rule = (effect: ChallengeEffect): Effect => ({ kind: 'challenge', effect });
const gain = (amount: number): Effect => ({ kind: 'gainLife', amount, who: 'opponent' });
const draw: Effect = { kind: 'draw', amount: 1, who: 'opponent' };
const relic = (reward: Effect): { challenge: ChallengeInfo; triggers: TriggeredAbility[] } => ({
  challenge: { reveals: 1 },
  triggers: [on('graveyard', reward)],
});
const minotaur = ['Minotaur'];
const ping = (amount: number): TriggeredAbility => on('beginCombat', rule({ kind: 'pingIfUntapped', amount }));
const regrow = on('dies', rule({ kind: 'revealHead', count: 2 }));

const CARDS: CardDef[] = [
  creature({ id: 'ch_hornbound_raider', name: 'Hornbound Raider', subtypes: minotaur, power: 3, toughness: 2, keywords: ['haste'], challenge: { mustAttack: true } }),
  creature({ id: 'ch_hornbound_whelp', name: 'Hornbound Whelp', subtypes: minotaur, power: 2, toughness: 2, keywords: ['haste'], challenge: { mustAttack: true } }),
  creature({ id: 'ch_warlords_chosen', name: "Warlord's Chosen", subtypes: minotaur, power: 5, toughness: 4, entersTapped: true, challenge: { mustAttack: true } }),
  creature({ id: 'ch_hornbound_reaver', name: 'Hornbound Reaver', subtypes: minotaur, power: 2, toughness: 3, keywords: ['haste'], challenge: { mustAttack: true } }),
  creature({
    id: 'ch_frenzied_charger',
    name: 'Frenzied Charger',
    subtypes: minotaur,
    power: 4,
    toughness: 1,
    keywords: ['haste'],
    challenge: { mustAttack: true },
    triggers: [on('endStep', { kind: 'destroy', to: 'self' })],
  }),
  sorcery('ch_blood_frenzy', 'Blood Frenzy', { kind: 'turnRule', rule: { kind: 'attackers', subtype: 'Minotaur', power: 2, keywords: [], destroy: true } }),
  sorcery('ch_hunt_the_weak', 'Hunt the Weak', { kind: 'turnRule', rule: { kind: 'attackers', subtype: 'Minotaur', power: 0, keywords: ['firstStrike'] } }),
  sorcery('ch_storm_of_judgment', 'Storm of Judgment', { kind: 'turnRule', rule: { kind: 'combatDamage', creatures: 3 } }),
  sorcery('ch_venom_horns', 'Venom Horns', { kind: 'turnRule', rule: { kind: 'attackers', subtype: 'Minotaur', power: 0, keywords: ['deathtouch'] } }),
  sorcery('ch_unbroken_charge', 'Unbroken Charge', { kind: 'turnRule', rule: { kind: 'attackers', subtype: 'Minotaur', power: 0, keywords: ['menace'] } }),
  permanent('ch_war_altar', 'War Altar', ['artifact'], relic(rule({ kind: 'sacrificeOwn', subtype: 'Minotaur', count: 2 }))),
  permanent('ch_skull_totem', 'Skull Totem', ['artifact'], relic({ kind: 'mill', amount: 7 })),
  permanent('ch_looted_idol', 'Looted Idol', ['artifact'], relic(draw)),
  permanent('ch_spring_draught', 'Spring Draught', ['artifact'], relic(gain(5))),
  permanent('ch_healing_balm', 'Healing Balm', ['artifact'], relic(rule({ kind: 'returnCreatures' }))),
  permanent('ch_war_drums', 'War Drums', ['enchantment'], { challenge: { reveals: 1 } }),

  creature({
    id: 'ch_revel_king',
    name: 'The Revel King',
    types: ['enchantment', 'creature'],
    subtypes: ['God'],
    power: 3,
    toughness: 5,
    challenge: { anchor: true, reveals: 1, revealsWith: 3, passive: true },
    statics: [{ kind: 'cantBlock' }],
  }),
  creature({
    id: 'ch_crazed_nymph',
    name: 'Crazed Nymph',
    types: ['enchantment', 'creature'],
    subtypes: ['Nymph', 'Reveler'],
    power: 4,
    toughness: 2,
    challenge: { mustAttack: 5, passive: true },
    triggers: [on('dies', gain(3))],
  }),
  creature({
    id: 'ch_frenzied_piper',
    name: 'Frenzied Piper',
    subtypes: ['Satyr', 'Reveler'],
    power: 2,
    toughness: 1,
    challenge: { passive: true },
    triggers: [on('enters', rule({ kind: 'turnRule', rule: { kind: 'mustAttack', subtype: 'God' } })), on('dies', gain(2))],
  }),
  creature({ id: 'ch_wildband_centaur', name: 'Wildband Centaur', subtypes: ['Centaur', 'Reveler'], power: 4, toughness: 2, challenge: { passive: true },
    triggers: [on('dies', draw)] }),
  creature({
    id: 'ch_drunken_throng',
    name: 'Drunken Throng',
    subtypes: ['Human', 'Reveler'],
    power: 1,
    toughness: 1,
    challenge: { passive: true },
    triggers: [on('enters', rule({ kind: 'revealCast', count: 1 }))],
  }),
  creature({ id: 'ch_viper_dancers', name: 'Viper Dancers', subtypes: ['Human', 'Reveler'], power: 2, toughness: 2, keywords: ['deathtouch'], challenge: { passive: true },
    triggers: [on('dies', draw)] }),
  creature({ id: 'ch_howling_maenads', name: 'Howling Maenads', subtypes: ['Human', 'Reveler'], power: 3, toughness: 1, keywords: ['firstStrike'], challenge: { passive: true },
    triggers: [on('dies', gain(3))] }),
  sorcery('ch_reckless_rush', 'Reckless Rush', { kind: 'turnRule', rule: { kind: 'mustAttack', subtype: 'Reveler', haste: true } }),
  sorcery('ch_wild_smashing', 'Wild Smashing', { kind: 'sacrificeOrDamage', types: ['artifact', 'enchantment'], amount: 3 }),
  sorcery(
    'ch_encore',
    'Encore',
    { kind: 'returnNamed', card: 'ch_frenzied_piper', count: 2 },
    { kind: 'turnRule', rule: { kind: 'revelerDamage', creatures: false } },
  ),
  sorcery('ch_tear_apart', 'Tear Apart', { kind: 'turnRule', rule: { kind: 'revelerDamage', creatures: true } }),
  sorcery('ch_kings_scorn', "King's Scorn", { kind: 'turnRule', rule: { kind: 'mustAttack', subtype: 'God', keywords: ['trample'] } }),
  sorcery('ch_kings_strike', "King's Strike", { kind: 'damagePlayer', amount: 4 }),
  permanent('ch_fire_dance', 'Fire Dance', ['enchantment'], { challenge: { flame: 1 } }),
  permanent('ch_panic_dance', 'Panic Dance', ['enchantment'], {
    challenge: { panic: 5 },
    statics: [{ kind: 'anthem', subtypes: ['Reveler'], keywords: ['haste'], ifCount: 5 }],
  }),

  creature({ id: 'ch_lesser_head', name: 'Lesser Head', subtypes: ['Head'], power: 0, toughness: 2, triggers: [ping(1), regrow, on('dies', gain(2))] }),
  creature({ id: 'ch_brute_head', name: 'Brute Head', subtypes: ['Head'], power: 0, toughness: 2, challenge: { elite: true }, triggers: [ping(1), regrow, on('dies', gain(2), draw)] }),
  creature({
    id: 'ch_frenzy_head',
    name: 'Frenzy Head',
    subtypes: ['Head'],
    power: 0,
    toughness: 4,
    challenge: { elite: true },
    triggers: [ping(1), regrow, on('endStep', rule({ kind: 'revealCast', count: 1 })), on('dies', gain(4), draw)],
  }),
  creature({
    id: 'ch_screaming_head',
    name: 'Screaming Head',
    subtypes: ['Head'],
    power: 0,
    toughness: 4,
    challenge: { elite: true },
    triggers: [ping(1), regrow, on('endStep', { kind: 'discard', amount: 1, who: 'opponent' }), on('dies', gain(4), draw)],
  }),
  creature({
    id: 'ch_fang_head',
    name: 'Fang Head',
    subtypes: ['Head'],
    power: 0,
    toughness: 4,
    challenge: { elite: true },
    triggers: [ping(1), regrow, on('endStep', rule({ kind: 'damagePlayer', amount: 1 })), on('dies', gain(4), draw)],
  }),
  sorcery('ch_dazing_gaze', 'Dazing Gaze', { kind: 'silence' }),
  sorcery('ch_bait_the_beast', 'Bait the Beast', { kind: 'distract', life: 3 }),
  sorcery('ch_regrowth', 'Regrowth', { kind: 'regrow', card: 'ch_lesser_head', count: 2 }),
  sorcery('ch_iron_scales', 'Iron Scales', { kind: 'hide' }),
  sorcery('ch_tangled_necks', 'Tangled Necks', { kind: 'tangle', heads: 5 }),
  sorcery('ch_toxic_breath', 'Toxic Breath', { kind: 'breath', amount: 5 }),
  sorcery('ch_weak_spot', 'Weak Spot', { kind: 'weakSpot' }),
  sorcery('ch_swallowed_whole', 'Swallowed Whole', { kind: 'swallow' }),
  sorcery('ch_divided_fury', 'Divided Fury', { kind: 'freezeHeads', count: 2 }, { kind: 'damagePlayer', amount: 5 }),
  sorcery('ch_all_heads_lunge', 'All-Heads Lunge', { kind: 'damagePlayer', amount: 0, perHead: true }),
];

interface Override {
  battlefield?: string[];
  copies?: Record<string, number>;
  sizes?: Record<string, [number, number]>;
}

const OVERRIDES: Record<string, Override> = JSON.parse(process.env.BOX_CHALLENGE || '{}');
const SIZES = new Map(Object.values(OVERRIDES).flatMap((override) => Object.entries(override.sizes ?? {})));

for (const def of CARDS) {
  const size = SIZES.get(def.id);
  registerCard(size ? { ...def, power: size[0], toughness: size[1] } : def);
}

function copies(entries: [string, number][]): string[] {
  return entries.flatMap(([id, count]) => Array.from({ length: count }, () => id));
}

const DECKS: NemesisDeck[] = [
  {
    id: 'stampede',
    name: 'The Stampede',
    threats: copies([
      ['ch_hornbound_raider', 5],
      ['ch_hornbound_whelp', 6],
      ['ch_warlords_chosen', 4],
      ['ch_hornbound_reaver', 5],
      ['ch_frenzied_charger', 4],
      ['ch_blood_frenzy', 2],
      ['ch_hunt_the_weak', 2],
      ['ch_storm_of_judgment', 2],
      ['ch_venom_horns', 2],
      ['ch_unbroken_charge', 2],
      ['ch_war_altar', 1],
      ['ch_skull_totem', 1],
      ['ch_looted_idol', 2],
      ['ch_spring_draught', 2],
      ['ch_healing_balm', 1],
      ['ch_war_drums', 2],
    ]),
  },
  {
    id: 'revel',
    name: 'The Revel King',
    battlefield: ['ch_revel_king', 'ch_drunken_throng', 'ch_drunken_throng'],
    threats: copies([
      ['ch_crazed_nymph', 2],
      ['ch_frenzied_piper', 6],
      ['ch_wildband_centaur', 2],
      ['ch_drunken_throng', 2],
      ['ch_viper_dancers', 1],
      ['ch_howling_maenads', 1],
      ['ch_reckless_rush', 7],
      ['ch_wild_smashing', 2],
      ['ch_encore', 4],
      ['ch_tear_apart', 2],
      ['ch_kings_scorn', 3],
      ['ch_kings_strike', 5],
      ['ch_fire_dance', 2],
      ['ch_panic_dance', 2],
      ['ch_war_drums', 2],
    ]),
  },
  {
    id: 'hydra',
    name: 'The Hydra',
    battlefield: ['ch_lesser_head', 'ch_lesser_head'],
    threats: copies([
      ['ch_lesser_head', 3],
      ['ch_frenzy_head', 1],
      ['ch_screaming_head', 1],
      ['ch_fang_head', 1],
      ['ch_dazing_gaze', 5],
      ['ch_bait_the_beast', 5],
      ['ch_iron_scales', 2],
      ['ch_tangled_necks', 3],
      ['ch_toxic_breath', 4],
      ['ch_weak_spot', 2],
      ['ch_swallowed_whole', 5],
      ['ch_divided_fury', 2],
      ['ch_all_heads_lunge', 2],
    ]),
  },
];

function overridden(deck: NemesisDeck): NemesisDeck {
  const override = OVERRIDES[deck.id];
  if (!override) return deck;
  const counts = new Map<string, number>();
  for (const id of deck.threats) counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const [id, count] of Object.entries(override.copies ?? {})) counts.set(id, count);
  return {
    ...deck,
    battlefield: override.battlefield ?? deck.battlefield,
    threats: copies([...counts]),
  };
}

export const CHALLENGES: NemesisDeck[] = DECKS.map(overridden);
