import type { Nemesis } from "../../content/types";
import { type CardDef, type NemesisId, type Pair, expand } from "./defs";

export const OPENING_HAND = 4;
export const MAX_CREATURES = 4;
export const ROUND_MANA = 3;
export const MAX_ROUNDS = 60;
export const FACE = -2;

export type Window = "upkeep" | "start" | "spell" | "pre" | "blocks" | "end";

export const T = {
  START: 1, EXEC_OMEN: 2, EXEC: 3, SPELL: 4, RESOLVE: 5, REVEAL: 6, PRE: 7,
  ATTACK: 8, BLOCKS: 9, AFTER_BLOCKS: 10, DAMAGE: 11, END: 12, CLEANUP: 13,
} as const;

export interface Task {
  k: number;
  u: number;
}

export interface Ctx {
  defs: CardDef[];
  nemesis: NemesisId;
  pair: string;
  players: number;
}

export interface Perm {
  uid: number;
  def: CardDef;
  tapped: boolean;
  sick: boolean;
  pacified: boolean;
  shield: boolean;
  harmless: boolean;
  dt: boolean;
  damage: number;
  tp: number;
  tt: number;
  ap: number;
  at: number;
  akw: number;
  auras: number[];
}

export interface State {
  ctx: Ctx;
  round: number;
  active: 0 | 1;
  first: boolean;
  library: number[];
  hand: number[];
  grave: number[];
  mana: number;
  spells: number;
  mine: Perm[];
  omen: number;
  faceDown: number[];
  ruin: number[];
  nem: Perm[];
  counters: number[];
  atk: number[];
  blk: number[];
  pend: number;
  pendTarget: number;
  q: Task[];
  known: Uint8Array;
  over: 0 | 1 | 2;
  log: string[] | null;
  tally: Map<string, number> | null;
}

export function buildCtx(pair: Pair, nemesis: Nemesis): Ctx {
  const grimoire = [...expand(pair.halves[0].cards), ...expand(pair.halves[1].cards)];
  const threats = expand(nemesis.threats);
  return {
    defs: [...grimoire, ...threats],
    nemesis: nemesis.id as NemesisId,
    pair: pair.key,
    players: grimoire.length,
  };
}

export function newPerm(uid: number, def: CardDef): Perm {
  return { uid, def, tapped: false, sick: true, pacified: false, shield: false, harmless: false, dt: false, damage: 0, tp: 0, tt: 0, ap: 0, at: 0, akw: 0, auras: [] };
}

function clonePerm(p: Perm): Perm {
  return {
    uid: p.uid, def: p.def, tapped: p.tapped, sick: p.sick, pacified: p.pacified, shield: p.shield, harmless: p.harmless, dt: p.dt,
    damage: p.damage, tp: p.tp, tt: p.tt, ap: p.ap, at: p.at, akw: p.akw, auras: p.auras.length ? p.auras.slice() : [],
  };
}

export function clone(s: State): State {
  return {
    ctx: s.ctx, round: s.round, active: s.active, first: s.first,
    library: s.library.slice(), hand: s.hand.slice(), grave: s.grave.slice(), mana: s.mana, spells: s.spells, mine: s.mine.map(clonePerm),
    omen: s.omen, faceDown: s.faceDown.slice(), ruin: s.ruin.slice(), nem: s.nem.map(clonePerm), counters: s.counters.slice(),
    atk: s.atk.slice(), blk: s.blk.slice(), pend: s.pend, pendTarget: s.pendTarget,
    q: s.q.slice(), known: s.known.slice(), over: s.over, log: null, tally: null,
  };
}

export function defOf(s: State, uid: number): CardDef {
  return s.ctx.defs[uid];
}
