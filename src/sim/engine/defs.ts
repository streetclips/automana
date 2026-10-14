import { GRIMOIRES, KAEL, NEMESES } from "../../content";
import type { Card, HalfGrimoire, Nemesis } from "../../content/types";

export type Mana = "W" | "U" | "B" | "R" | "G";
export type Kind = "creature" | "instant" | "sorcery" | "aura" | "spell";
export type NemesisId = "vorthrax" | "vaskara" | "morwen" | "mirror-archmage";

export const FLYING = 1;
export const REACH = 2;
export const TRAMPLE = 4;
export const HASTE = 8;
export const DEFENDER = 16;
export const VIGILANCE = 32;
export const LIFELINK = 64;
export const DEATHTOUCH = 128;

const KEYWORDS: Record<string, number> = {
  Flying: FLYING, Reach: REACH, Trample: TRAMPLE, Haste: HASTE,
  Defender: DEFENDER, Vigilance: VIGILANCE, Lifelink: LIFELINK, Deathtouch: DEATHTOUCH,
};

export interface CardDef {
  id: string;
  name: string;
  color: Mana | "T";
  kind: Kind;
  generic: number;
  pips: Mana[];
  mv: number;
  power: number;
  toughness: number;
  kw: number;
  threat: boolean;
}

const RULES_TEXT: Record<string, string[]> = {
  "luminous-aegis": ["Prevent all damage that would be dealt to a creature you control this turn."],
  "serene-judgment": ["Pacify: tuck behind a Nemesis creature. It can't attack or block."],
  "prayer-of-restoration": ["Gain 3 life. You may put one of those cards into your hand instead of your library."],
  "shield-formation": ["Creatures you control get +1/+1 until end of turn."],
  "banish-into-light": ["Put an attacking Nemesis creature face-down at the bottom of the Threat deck."],
  "tide-apprentice": ["When Tide Apprentice enters, Scry 2."],
  "bend-fate": ["You may put the Omen face-down at the bottom of the Threat deck; if you do, reveal a new Omen. Scry 1."],
  "deep-freeze": ["Freeze a Nemesis creature."],
  "return-to-the-tide": ["Put a Nemesis creature on top of the Threat deck as the new Omen. The old Omen goes face-down right behind it."],
  "learned-archivist": ["{T}: Scry 1."],
  "arcane-study": ["Scry 2, then draw 2 cards."],
  "rising-tide": ["Put every Nemesis creature on top of the Threat deck in any order; the top one becomes the Omen."],
  "lethal-whisper": ["A Nemesis creature gets −2/−2 until end of turn."],
  "blood-acolyte": ["When Blood Acolyte enters, you lose 1 life and it deals 1 damage to the Nemesis."],
  "forbidden-pact": ["Draw 2 cards."],
  "assassinate": ["Destroy a Nemesis creature."],
  "reanimate": ["Put a creature card from your graveyard onto the Table."],
  "hungry-ghoul": ["When Hungry Ghoul dies, return a card from your graveyard to your hand."],
  "drain-essence": ["Drain Essence deals 2 damage to the Nemesis and you gain 2 life."],
  "crypt-lord": ["When Crypt Lord enters, put a creature card with cost 2 or less from your graveyard onto the Table."],
  "ember-bolt": ["Ember Bolt deals 3 damage to a creature or to the Nemesis."],
  "cinder-hound": ["When Cinder Hound enters, it deals 1 damage to a creature."],
  "battle-fury": ["A creature gets +3/+0 until end of turn."],
  "molten-blade": ["Tuck behind a creature you control. It gets +2/+0 and has Trample."],
  "kindle": ["Kindle deals 2 damage to a creature or to the Nemesis."],
  "volcanic-roar": ["Volcanic Roar deals 2 damage to each Nemesis creature."],
  "pyre-titan": ["When Pyre Titan enters, it deals 2 damage to the Nemesis."],
  "surge-of-vigor": ["A creature gets +3/+3 until end of turn."],
  "elvish-grovekeeper": ["{T}: Add {G}."],
  "wild-strength": ["Tuck behind a creature you control. It gets +2/+2 and has Trample."],
  "bloom-of-life": ["Gain 4 life."],
  "grovesinger-druid": ["When Grovesinger Druid enters, gain 2 life."],
  "vorthraxs-herald": ["When it enters, it deals 1 damage to you."],
  "searing-breath": ["Deal 2 damage to your highest-power creature. If you have none, deal 2 damage to you."],
  "rain-of-cinders": ["Deal 1 damage to each of your creatures and 1 damage to you."],
  "tyrants-roar": ["Nemesis creatures get +1/+0 until end of turn."],
  "cinder-rebirth": ["Return the highest-power creature from the Ruin to the Table. If there is none, deal 2 damage to you."],
  "mantis-queen": ["When it enters, other Nemesis creatures get +1/+0 until end of turn."],
  "pheromones": ["Nemesis creatures get +1/+1 until end of turn."],
  "egg-laying": ["Reveal the next face-down card. If it is a creature, execute it. Otherwise put it face-down at the bottom."],
  "insect-plague": ["Deal 1 damage to each of your creatures."],
  "wandering-skeleton": ["When it dies, put it face-down at the bottom of the Threat deck (Morwen gains 1 life)."],
  "crypt-horror": ["When it enters, you lose 1 life."],
  "withering-touch": ["Your highest-power creature gets −2/−2 until end of turn. If you have none, you lose 2 life."],
  "exhume": ["Return the highest-power creature from the Ruin to the Table. If there is none, you lose 2 life."],
  "soul-drain": ["You lose 2 life. Return 2 Ruin cards face-down to the bottom of the Threat deck."],
  "plague": ["All creatures (both sides) get −1/−1 until end of turn."],
  "counterspell": ["Counter reminder: the next spell you cast is countered."],
  "rebound": ["Return your highest-power creature to your hand. If you have none, discard the leftmost card of your hand."],
  "mind-theft": ["Discard the leftmost card of your hand. If you can't, you lose 2 life."],
  "mass-illusion": ["Lower all your creatures."],
};

const KAEL_TEXT = [
  "(+1 state): a creature you control gets +1/+0 until end of turn.",
  "(−2 states): Kael deals 2 damage to a creature.",
  "(go to I): Kael deals 3 damage to the Nemesis. Your creatures get +1/+0 until end of turn.",
];

function plain(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function expect(owner: string, text: string, snippets: string[]): void {
  for (const snippet of snippets) {
    if (!text.includes(snippet)) throw new Error(`Simulator rules out of date for ${owner}: expected "${snippet}" in "${text}"`);
  }
}

function keywords(card: Card): number {
  if (card.type !== "creature") return 0;
  let kw = 0;
  for (const m of card.en.text.matchAll(/<b>([^<]+)<\/b>/g)) kw |= KEYWORDS[m[1]] ?? 0;
  return kw;
}

function toDef(card: Card): CardDef {
  const generic = card.cost.filter((c) => /^\d+$/.test(c)).reduce((n, c) => n + Number(c), 0);
  const pips = card.cost.filter((c): c is Mana => !/^\d+$/.test(c));
  const [power, toughness] = card.pt ? card.pt.split("/").map(Number) : [0, 0];
  const text = plain(card.en.text);
  const kw = keywords(card);
  const leftover = card.type === "creature" ? text.replace(/Flying|Reach|Trample|Haste|Defender|Vigilance|Lifelink|Deathtouch|[,.\s]/g, "") : text;
  const rules = RULES_TEXT[card.id];
  if (rules) expect(card.id, text, rules);
  else if (leftover) throw new Error(`Simulator has no rules for ${card.id}: "${text}"`);
  return {
    id: card.id, name: card.en.name, color: card.color as Mana | "T", kind: card.type === "land" ? "spell" : card.type,
    generic, pips, mv: generic + pips.length, power, toughness, kw, threat: !!card.threat,
  };
}

const DEFS = new Map<string, CardDef>();
for (const card of [...GRIMOIRES.flatMap((g) => g.cards), ...NEMESES.flatMap((n) => n.threats)]) DEFS.set(card.id, toDef(card));

expect("Kael", plain([KAEL.en.charge, KAEL.en.discharge, KAEL.en.ultimate].join(" ")), KAEL_TEXT);

for (const id of Object.keys(RULES_TEXT)) if (!DEFS.has(id)) throw new Error(`Simulator rules for unknown card ${id}`);

export function def(id: string): CardDef {
  const d = DEFS.get(id);
  if (!d) throw new Error(`Unknown card ${id}`);
  return d;
}

export function expand(cards: Card[]): CardDef[] {
  return cards.flatMap((c) => Array.from({ length: c.qty }, () => def(c.id)));
}

export interface Pair {
  key: string;
  halves: [HalfGrimoire, HalfGrimoire];
}

export const PAIRS: Pair[] = GRIMOIRES.flatMap((a, i) =>
  GRIMOIRES.slice(i + 1).map((b): Pair => ({ key: `${a.color}/${b.color}`, halves: [a, b] })),
);

export const NEMESIS_LIST: Nemesis[] = NEMESES;
