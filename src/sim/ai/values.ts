import { type CardDef, DEATHTOUCH, DEFENDER, FLYING, LIFELINK, type Mana, REACH, TRAMPLE, VIGILANCE } from "../engine/defs";
import { ARCHIVIST, GROVEKEEPER, bestRuinCreature, kwOf, nemTarget, pw, tg } from "../engine/engine";
import { MAX_CREATURES, MAX_LANDS, type Perm, type State, defOf } from "../engine/state";

export const W = {
  cBase: 0.6, cPow: 1.0, cTough: 0.55, flyPow: 0.5, flyBase: 0.3, tramplePow: 0.2, lifelinkPow: 0.6, deathtouch: 1.6,
  vigilancePow: 0.3, reach: 0.4, defenderTough: 0.3, elfMana: 1.4, archivist: 0.8, ghoul: 0.9,
  nBase: 0.6, nPow: 1.25, nTough: 0.55, nFlyPow: 0.6, nFlyBase: 0.2, nTramplePow: 0.3, nDeathtouch: 1.6, nLifelinkPow: 0.8,
  nDefenderOff: 0.75, nPacified: 0.3, nFrozen: 0.7,
  creatureInHand: 0.72, missing: 0.66, offColor: 0.55, dropColor: 0.85,
  lifeA: 0.75, lifeB: 2.2, lifeC: 3.5, nemA: 0.74, nemB: 1.6, nemC: 2.5,
  land1: 2.6, land2: 2.2, land3: 1.8, land4: 1.1, land5: 0.6,
  k2: 0.9, k3: 1.9, k4: 2.8,
  counter: 1.8, danger: 2.0, dangerMargin: 2, lethal: 5.0, clock: 0.35, selfMill: 0.6,
  omenScale: 0.8, omenCreature: 0.75, eggLaying: 1.5,
  bolt: 3.0, kindle: 2.2, whisper: 1.9, assassinate: 3.4, roar: 2.2, judgment: 2.6, freeze: 1.8, tide: 1.8, risingTide: 2.6,
  banish: 2.2, aegis: 1.4, shield: 1.6, bend: 1.6, fury: 1.4, surge: 1.9, blade: 1.8, strength: 2.4, scryCard: 0.25,
  hold: 0.85, noBoard: 0.6,
  bendMargin: 1.5, tradeRatio: 1.05, chumpMargin: 2, freezeMin: 4.0, mullMargin: 5,
};

export type Weights = typeof W;

const DEFAULTS: Weights = { ...W };

export function setWeights(w: Partial<Weights>): void {
  Object.assign(W, w);
}

export function resetWeights(): void {
  Object.assign(W, DEFAULTS);
}

const COLOR_BIT: Record<Mana, number> = { W: 1, U: 2, B: 4, R: 8, G: 16 };

function geo(n: number, a: number, b: number, c: number): number {
  if (n <= 0) return 0;
  const r = Math.exp(-1 / c);
  return n * a + (b * (1 - Math.pow(r, n))) / (1 - r);
}

export function lifeScore(n: number): number {
  return geo(n, W.lifeA, W.lifeB, W.lifeC);
}

export function nemScore(n: number): number {
  return geo(n, W.nemA, W.nemB, W.nemC);
}

export function lifeGain(eff: number, k: number): number {
  return lifeScore(eff + k) - lifeScore(eff);
}

export function lifeCost(eff: number, k: number): number {
  return lifeScore(eff) - lifeScore(eff - k);
}

export function nemDamage(n: number, k: number): number {
  return nemScore(n) - nemScore(n - k);
}

export function landsValue(n: number): number {
  const m = [W.land1, W.land2, W.land3, W.land4, W.land5];
  let v = 0;
  for (let i = 0; i < n && i < m.length; i++) v += m[i];
  return v;
}

export function kaelValue(state: number): number {
  return state === 2 ? W.k2 : state === 3 ? W.k3 : state === 4 ? W.k4 : 0;
}

export function staticPow(p: Perm): number {
  return pw(p) - p.tp;
}

export function staticTough(p: Perm): number {
  return tg(p) - p.tt;
}

export function creatureValue(s: State, power: number, toughness: number, kw: number, id: string): number {
  if (toughness <= 0) return 0;
  const p = Math.max(0, power);
  let v = W.cBase + W.cPow * p + W.cTough * toughness;
  if (kw & FLYING) v += W.flyPow * p + W.flyBase;
  if (kw & TRAMPLE) v += W.tramplePow * p;
  if (kw & LIFELINK) v += W.lifelinkPow * p;
  if (kw & DEATHTOUCH) v += W.deathtouch;
  if (kw & VIGILANCE) v += W.vigilancePow * p;
  if (kw & REACH) v += W.reach;
  if (kw & DEFENDER) v += W.defenderTough * toughness - W.cPow * p * 0.7;
  if (id === GROVEKEEPER) v += s.lands.length < MAX_LANDS ? W.elfMana : W.elfMana * 0.3;
  else if (id === ARCHIVIST) v += W.archivist;
  else if (id === "hungry-ghoul") v += W.ghoul;
  return v;
}

export function mineValue(s: State, p: Perm): number {
  return creatureValue(s, staticPow(p), staticTough(p), kwOf(p), p.def.id);
}

function nemStats(power: number, toughness: number, kw: number): number {
  const p = Math.max(0, power);
  let v = W.nBase + W.nPow * p + W.nTough * toughness;
  if (kw & FLYING) v += W.nFlyPow * p + W.nFlyBase;
  if (kw & TRAMPLE) v += W.nTramplePow * p;
  if (kw & DEATHTOUCH) v += W.nDeathtouch;
  if (kw & LIFELINK) v += W.nLifelinkPow * p;
  if (kw & DEFENDER) v -= W.nPow * p * W.nDefenderOff;
  return v;
}

export function nemValue(p: Perm): number {
  if (p.pacified) return W.nPacified;
  const v = nemStats(staticPow(p), staticTough(p), kwOf(p));
  return p.frozen && p.tapped ? v * W.nFrozen : v;
}

export function nemDefValue(d: CardDef): number {
  return nemStats(d.power, d.toughness, d.kw);
}

function bestNem(s: State, ok: (p: Perm) => boolean): number {
  let best = 0;
  for (const p of s.nem) if (!p.pacified && ok(p)) best = Math.max(best, nemValue(p));
  return best;
}

function bestGraveCreature(s: State, maxMv: number): number {
  let best = 0;
  for (const uid of s.grave) {
    const d = defOf(s, uid);
    if (d.kind !== "creature" || d.mv > maxMv) continue;
    best = Math.max(best, creatureValue(s, d.power, d.toughness, d.kw, d.id));
  }
  return best;
}

function board(s: State): number {
  return s.mine.length ? 1 : W.noBoard;
}

export function cardValue(s: State, d: CardDef, eff: number, avgCard: number): number {
  const n = s.faceDown.length;
  if (d.kind === "creature") {
    let v = creatureValue(s, d.power, d.toughness, d.kw, d.id) * W.creatureInHand;
    switch (d.id) {
      case "tide-apprentice": v += 2 * W.scryCard; break;
      case "blood-acolyte": v += nemDamage(n, 1) - lifeCost(eff, 1); break;
      case "cinder-hound": v += Math.max(0.5, 0.8 * bestNem(s, (p) => staticTough(p) <= 1)); break;
      case "pyre-titan": v += nemDamage(n, 2); break;
      case "grovesinger-druid": v += lifeGain(eff, Math.min(2, s.grave.length)); break;
      case "crypt-lord": v += 0.8 * bestGraveCreature(s, 2); break;
    }
    return v;
  }
  switch (d.id) {
    case "ember-bolt": return Math.max(W.bolt, 0.9 * bestNem(s, (p) => staticTough(p) <= 3));
    case "kindle": return Math.max(W.kindle, 0.9 * bestNem(s, (p) => staticTough(p) <= 2));
    case "lethal-whisper": return Math.max(W.whisper, 0.9 * bestNem(s, (p) => staticTough(p) <= 2));
    case "assassinate": return Math.max(W.assassinate, 0.9 * bestNem(s, () => true));
    case "volcanic-roar": {
      let v = 0;
      for (const p of s.nem) if (!p.pacified && staticTough(p) <= 2) v += 0.8 * nemValue(p);
      return Math.max(W.roar, v);
    }
    case "serene-judgment": return Math.max(W.judgment, 0.85 * bestNem(s, (p) => !(kwOf(p) & DEFENDER)));
    case "deep-freeze": return Math.max(W.freeze, 0.4 * bestNem(s, () => true));
    case "return-to-the-tide": return Math.max(W.tide, 0.5 * bestNem(s, () => true));
    case "rising-tide": {
      let v = 0;
      for (const p of s.nem) v += 0.5 * nemValue(p);
      return Math.max(W.risingTide, v);
    }
    case "banish-into-light": return W.banish;
    case "luminous-aegis": return W.aegis * board(s);
    case "shield-formation": return W.shield * (0.5 + 0.35 * s.mine.length);
    case "bend-fate": return W.bend;
    case "battle-fury": return W.fury * board(s);
    case "surge-of-vigor": return W.surge * board(s);
    case "molten-blade": return W.blade * board(s);
    case "wild-strength": return W.strength * board(s);
    case "forbidden-pact": return W.hold * (2 * avgCard - lifeCost(eff, 2));
    case "arcane-study": return W.hold * (2 * avgCard + 2 * W.scryCard - lifeCost(eff, 2));
    case "bloom-of-life": return W.hold * lifeGain(eff, Math.min(4, s.grave.length + 1));
    case "drain-essence": return nemDamage(n, 2) + W.hold * lifeGain(eff, Math.min(2, s.grave.length + 1));
    case "reanimate": return 0.6 + 0.85 * bestGraveCreature(s, 99);
    case "prayer-of-restoration": {
      const back = s.grave.slice(-3);
      let best = 0;
      for (const uid of back) if (defOf(s, uid).id !== d.id) best = Math.max(best, cardValue(s, defOf(s, uid), eff, avgCard));
      return W.hold * Math.max(lifeGain(eff, Math.min(3, back.length + 1)), lifeGain(eff, 2) + best * 0.9);
    }
    default: return 1;
  }
}

export interface ManaCtx {
  mana: number;
  max: number;
  colors: number;
  counts: number[];
}

const COLOR_INDEX: Record<Mana, number> = { W: 0, U: 1, B: 2, R: 3, G: 4 };

export function manaCtx(s: State): ManaCtx {
  let colors = 0;
  for (const uid of s.lands) colors |= COLOR_BIT[defOf(s, uid).color as Mana];
  let elves = 0;
  for (const p of s.mine) if (p.def.id === GROVEKEEPER) { elves++; colors |= COLOR_BIT.G; }
  const counts = [0, 0, 0, 0, 0];
  for (const uid of s.hand) counts[COLOR_INDEX[defOf(s, uid).color as Mana]]++;
  return { mana: s.lands.length + elves + (s.lands.length < MAX_LANDS ? 1 : 0), max: MAX_LANDS + elves, colors, counts };
}

export function castFactor(d: CardDef, m: ManaCtx): number {
  const cost = d.mv;
  if (cost > m.max) return 0.08;
  let f = cost > m.mana ? Math.pow(W.missing, cost - m.mana) : 1;
  for (const c of d.pips) {
    if (m.colors & COLOR_BIT[c]) continue;
    const others = m.counts[COLOR_INDEX[c]] - (d.color === c ? 1 : 0);
    f *= others > 0 ? W.dropColor : W.offColor;
  }
  return f;
}

export function handValue(s: State, uid: number, eff: number, avgCard: number, m = manaCtx(s)): number {
  const d = defOf(s, uid);
  return cardValue(s, d, eff, avgCard) * castFactor(d, m);
}

export function avgLibraryValue(s: State, eff: number): number {
  if (!s.library.length) return 1.5;
  const m = manaCtx(s);
  let total = 0;
  for (const uid of s.library) total += cardValue(s, defOf(s, uid), eff, 1.5) * castFactor(defOf(s, uid), m);
  return total / s.library.length;
}

export function omenThreat(s: State, uid: number): number {
  if (uid < 0) return 0;
  const d = defOf(s, uid);
  const eff = s.library.length - 1;
  if (d.kind === "creature") {
    if (s.nem.length >= MAX_CREATURES) return lifeCost(eff, d.power) * W.omenScale;
    let v = nemDefValue(d) * W.omenCreature;
    if (d.id === "vorthraxs-herald" || d.id === "crypt-horror") v += lifeCost(eff, 1);
    if (d.id === "mantis-queen") v += 0.4 * s.nem.length;
    return v * W.omenScale;
  }
  const target = nemTarget(s);
  let v = 0;
  switch (d.id) {
    case "searing-breath":
      v = !target ? lifeCost(eff, 2) : staticTough(target) <= 2 ? mineValue(s, target) * 0.8 : 0.25;
      break;
    case "withering-touch":
      v = !target ? lifeCost(eff, 2) : staticTough(target) <= 2 ? mineValue(s, target) * 0.8 : 0.3;
      break;
    case "rain-of-cinders":
      for (const p of s.mine) if (staticTough(p) <= 1) v += mineValue(s, p);
      v += lifeCost(eff, 1);
      break;
    case "insect-plague":
      for (const p of s.mine) if (staticTough(p) <= 1) v += mineValue(s, p);
      break;
    case "plague":
      for (const p of s.mine) if (staticTough(p) <= 1) v += mineValue(s, p);
      for (const p of s.nem) if (staticTough(p) <= 1) v -= 0.8 * nemValue(p);
      break;
    case "tyrants-roar":
    case "pheromones":
      v = 0.55 * s.nem.filter((p) => !p.pacified).length;
      break;
    case "cinder-rebirth":
    case "exhume": {
      const i = bestRuinCreature(s);
      v = i < 0 ? lifeCost(eff, 2) : s.nem.length < MAX_CREATURES ? nemDefValue(defOf(s, s.ruin[i])) * 0.75 : 0;
      break;
    }
    case "egg-laying":
      v = W.eggLaying;
      break;
    case "soul-drain":
      v = lifeCost(eff, 2) + nemScore(s.faceDown.length + 2) - nemScore(s.faceDown.length);
      break;
    case "counterspell":
      v = W.counter;
      break;
    case "rebound":
      v = target ? 0.4 * mineValue(s, target) + 1.5 * target.auras.length : s.hand.length ? 0.8 * cardValue(s, defOf(s, s.hand[0]), eff, 1.5) : 0;
      break;
    case "mind-theft":
      v = s.hand.length ? 0.9 * cardValue(s, defOf(s, s.hand[0]), eff, 1.5) : lifeCost(eff, 2);
      break;
    case "mass-illusion":
      for (const p of s.nem) if (!p.pacified && !(kwOf(p) & DEFENDER)) v += 0.4 * Math.max(0, staticPow(p));
      break;
  }
  return v * W.omenScale;
}

export function avgThreat(s: State, unknown: Uint8Array): number {
  let total = 0;
  let n = 0;
  for (const uid of s.faceDown) {
    if (!unknown[uid]) continue;
    total += omenThreat(s, uid);
    n++;
  }
  return n ? total / n : 0;
}
