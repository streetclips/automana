import { costColors } from './mana';
import { getCardDef, getCost } from './registry';
import { DECK_TEXTS, localizer } from './text/content';
import type { CardDef, Color } from './types';

export interface DeckEntry {
  card: string;
  count: number;
}

export interface DeckDef {
  id: string;
  name: string;
  description: string;
  colors: Color[];
  featured: string;
  cards: DeckEntry[];
}

export type DeckSpec = string | DeckDef;

function half(
  id: string,
  name: string,
  description: string,
  color: Color,
  lands: number,
  featured: string,
  spells: string[],
): DeckDef {
  const basic = { W: 'plains', U: 'island', B: 'swamp', R: 'mountain', G: 'forest' }[color];
  return {
    id,
    name,
    description,
    colors: [color],
    featured,
    cards: [
      { card: basic, count: lands },
      { card: 'uncharted_haven', count: 1 },
      ...spells.map((card) => ({ card, count: 1 })),
    ],
  };
}

export const CATS = half('cats', 'Cats', 'White: cheap Cats, a Cat lord and lifelink.', 'W', 7, 'jazal_goldmane', [
  'savannah_lions',
  'leonin_skyhunter',
  'prideful_parent',
  'felidar_savior',
  'angelic_edict',
  'jazal_goldmane',
  'pacifism',
  'ingenious_leonin',
  'helpful_hunter',
  'leonin_vanguard',
  'moment_of_triumph',
  'elspeths_smite',
]);

export const VAMPIRES = half('vampires', 'Vampires', 'Black: flyers, drain and removal.', 'B', 7, 'crossway_troublemakers', [
  'vampire_interloper',
  'vampire_spawn',
  'moment_of_craving',
  'highborn_vampire',
  'untamed_hunger',
  'bloodtithe_collector',
  'crossway_troublemakers',
  'vengeful_bloodwitch',
  'heros_downfall',
  'vampire_neonate',
  'offer_immortality',
  'stromkirk_bloodthief',
]);

export const HEALING = half('healing', 'Healing', 'White: life gain that grows creatures, and Angels.', 'W', 7, 'ancestor_dragon', [
  'ancestor_dragon',
  'dazzling_angel',
  'quick_draw_katana',
  'ajanis_pridemate',
  'adamant_will',
  'bishops_soldier',
  'deadly_riposte',
  'herald_of_faith',
  'inspiring_overseer',
  'prayer_of_binding',
  'twinblade_paladin',
  'hinterland_sanctifier',
]);

export const PIRATES = half('pirates', 'Pirates', 'Blue: Pirates, Treasure, bounce and a counterspell.', 'U', 7, 'tolarian_terror', [
  'corsair_captain',
  'bigfin_bouncer',
  'skyship_buccaneer',
  'brineborn_cutthroat',
  'spectral_sailor',
  'tolarian_terror',
  'cancel',
  'eaten_by_piranhas',
  'kitesail_corsair',
  'opt',
  'storm_fleet_spy',
  'pirates_cutlass',
]);

export const WIZARDS = half('wizards', 'Wizards', 'Blue: card draw that feeds Wizards, bounce and tricks.', 'U', 7, 'arcane_epiphany', [
  'mystic_archaeologist',
  'arcane_epiphany',
  'clinquant_skymage',
  'erudite_wizard',
  'icewind_elemental',
  'mischievous_mystic',
  'fleeting_distraction',
  'burrog_befuddler',
  'exclusion_mage',
  'into_the_roil',
  'quick_study',
  'starlight_snare',
]);

export const UNDEAD = half('undead', 'Undead', 'Black: Zombies and Skeletons that keep coming back.', 'B', 7, 'death_baron', [
  'death_baron',
  'hungry_ghoul',
  'diregraf_ghoul',
  'eaten_alive',
  'reassembling_skeleton',
  'cemetery_recruitment',
  'crow_of_dark_tidings',
  'deadly_plot',
  'maalfeld_twins',
  'skeleton_archer',
  'suspicious_shambler',
  'undying_malice',
]);

export const GOBLINS = half('goblins', 'Goblins', 'Red: a swarm of Goblins and their lords.', 'R', 7, 'dropkick_bomber', [
  'dropkick_bomber',
  'incinerating_blast',
  'frenzied_goblin',
  'battle_rattle_shaman',
  'dragon_fodder',
  'goblin_oriflamme',
  'goblin_smuggler',
  'kindled_fury',
  'raging_redcap',
  'swab_goblin',
  'volley_veteran',
  'goblin_firebomb',
]);

export const INFERNO = half('inferno', 'Inferno', 'Red: Dragons, Treasure and burn.', 'R', 8, 'terror_of_mount_velus', [
  'terror_of_mount_velus',
  'fiery_annihilation',
  'firespitter_whelp',
  'carnelian_orb_of_dragonkind',
  'dragonlords_servant',
  'fire_elemental',
  'kargan_dragonrider',
  'rapacious_dragon',
  'scorching_dragonfire',
  'seize_the_spoils',
  'skyraker_giant',
]);

export const ELVES = half('elves', 'Elves', 'Green: Elves that make mana and pump each other.', 'G', 7, 'elvish_archdruid', [
  'elvish_archdruid',
  'beast_kin_ranger',
  'elvish_regrower',
  'felling_blow',
  'broken_wings',
  'dwynens_elite',
  'llanowar_elves',
  'snakeskin_veil',
  'joraga_invocation',
  'tajuru_pathwarden',
  'thornweald_archer',
  'wildheart_invoker',
]);

export const PRIMAL = half('primal', 'Primal', 'Green: ramp into huge creatures and +1/+1 counters.', 'G', 8, 'aggressive_mammoth', [
  'aggressive_mammoth',
  'bite_down',
  'giant_growth',
  'mild_mannered_librarian',
  'wildwood_scourge',
  'bear_cub',
  'biogenic_upgrade',
  'druid_of_the_cowl',
  'magnigoth_sentry',
  'new_horizons',
  'thrashing_brontodon',
]);

export const DECK_LIST: readonly DeckDef[] = [
  CATS,
  VAMPIRES,
  HEALING,
  PIRATES,
  WIZARDS,
  UNDEAD,
  GOBLINS,
  INFERNO,
  ELVES,
  PRIMAL,
];

export const DECKS: Record<string, DeckDef> = Object.fromEntries(DECK_LIST.map((deck) => [deck.id, deck]));

export const DEFAULT_DECK_ID = 'cats+goblins';

export function pairDeck(a: string, b: string): DeckDef {
  const first = getDeck(a);
  const second = getDeck(b);
  const counts = new Map<string, number>();
  for (const entry of [...first.cards, ...second.cards]) counts.set(entry.card, (counts.get(entry.card) ?? 0) + entry.count);
  return {
    id: `${first.id}+${second.id}`,
    name: `${first.name} + ${second.name}`,
    description: `${first.description} ${second.description}`,
    colors: [...new Set([...first.colors, ...second.colors])],
    featured: first.featured,
    cards: [...counts].map(([card, count]) => ({ card, count })),
  };
}

export const PAIRS: readonly (readonly [string, string])[] = DECK_LIST.flatMap((a, i) =>
  DECK_LIST.slice(i + 1).map((b) => [a.id, b.id] as const),
);

export function hasDeck(id: string): boolean {
  if (Object.hasOwn(DECKS, id)) return true;
  const [a, b, ...rest] = id.split('+');
  return rest.length === 0 && a !== undefined && b !== undefined && Object.hasOwn(DECKS, a) && Object.hasOwn(DECKS, b);
}

const translations = localizer<DeckDef>(DECK_TEXTS);

export function localizeDeck(deck: DeckDef): DeckDef {
  return DECKS[deck.id] === deck ? translations.localize(deck) : deck;
}

export function getDeck(id: string): DeckDef {
  if (!hasDeck(id)) throw new Error(`Unknown deck "${id}"`);
  const [a, b] = id.split('+');
  if (b !== undefined) return pairDeck(a as string, b);
  return localizeDeck(DECKS[id] as DeckDef);
}

export function resolveDeck(spec: DeckSpec): DeckDef {
  return typeof spec === 'string' ? getDeck(spec) : localizeDeck(spec);
}

export function deckIdOf(spec: DeckSpec): string {
  return typeof spec === 'string' ? spec : spec.id;
}

export function cardColors(def: CardDef): Color[] {
  if (def.types.includes('land')) return def.mana ?? [];
  if (def.token) return def.colors ?? [];
  return costColors(getCost(def.id));
}

export function expandDeck(deck: DeckDef): string[] {
  const cards: string[] = [];
  for (const entry of deck.cards) {
    getCardDef(entry.card);
    for (let i = 0; i < entry.count; i++) cards.push(entry.card);
  }
  return cards;
}

export function deckSize(deck: DeckDef): number {
  return deck.cards.reduce((sum, entry) => sum + entry.count, 0);
}
