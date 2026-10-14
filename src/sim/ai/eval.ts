import { DEATHTOUCH, DEFENDER, FLYING, type Mana, REACH, TRAMPLE } from "../engine/defs";
import { GROVEKEEPER, kwOf } from "../engine/engine";
import { MAX_CREATURES, type Perm, type State, defOf } from "../engine/state";
import type { DecisionCtx } from "./know";
import {
  W, castFactor, kaelValue, landsValue, lifeScore, manaCtx, mineValue, nemScore, nemValue,
  omenThreat, staticPow, staticTough, cardValue,
} from "./values";

export const WIN = 10000;

interface Body {
  p: number;
  t: number;
  kw: number;
}

function body(p: Perm): Body {
  return { p: Math.max(0, staticPow(p)), t: staticTough(p), kw: kwOf(p) };
}

function canBlock(b: Body, a: Body): boolean {
  return !(a.kw & FLYING) || (b.kw & (FLYING | REACH)) !== 0;
}

function kills(a: Body, b: Body): boolean {
  return a.p > 0 && ((a.kw & DEATHTOUCH) !== 0 || a.p >= b.t);
}

function strongest(list: Body[], ok: (a: Body, i: number) => boolean): number {
  let best = -1;
  for (let i = 0; i < list.length; i++) {
    if (!ok(list[i], i)) continue;
    if (best < 0 || list[i].p > list[best].p || (list[i].p === list[best].p && list[i].t > list[best].t)) best = i;
  }
  return best;
}

export function allOutDamage(s: State): number {
  const atk: Body[] = [];
  for (const p of s.mine) {
    const b = body(p);
    if (b.t > 0 && b.p > 0 && !(b.kw & DEFENDER)) atk.push(b);
  }
  if (!atk.length) return 0;
  const blockers: Body[] = [];
  for (const p of s.nem) if (!p.tapped && !p.pacified) blockers.push(body(p));
  const assigned: (Body | null)[] = atk.map(() => null);
  const used = blockers.map(() => false);
  const step = (ok: (b: Body, a: Body) => boolean): void => {
    blockers.forEach((b, j) => {
      if (used[j]) return;
      const i = strongest(atk, (a, k) => assigned[k] === null && canBlock(b, a) && ok(b, a));
      if (i >= 0) { assigned[i] = b; used[j] = true; }
    });
  };
  const unblocked = (): number => {
    let d = 0;
    atk.forEach((a, i) => {
      const b = assigned[i];
      if (!b) d += a.p;
      else if (a.kw & TRAMPLE) d += Math.max(0, a.p - (a.kw & DEATHTOUCH ? 1 : Math.max(0, b.t)));
    });
    return d;
  };
  step((b, a) => kills(b, a) && !kills(a, b));
  step((b, a) => kills(b, a));
  if (unblocked() >= s.faceDown.length) step(() => true);
  return unblocked();
}

function burnNextTurn(s: State): number {
  let mana = s.lands.length;
  let red = 0;
  for (const uid of s.lands) if (defOf(s, uid).color === "R") red++;
  for (const p of s.mine) if (p.def.id === GROVEKEEPER) mana++;
  let burn = 0;
  for (const uid of s.hand) {
    const d = defOf(s, uid);
    const dmg = d.id === "ember-bolt" ? 3 : d.id === "kindle" ? 2 : d.id === "drain-essence" ? 2 : d.id === "pyre-titan" ? 2 : d.id === "blood-acolyte" ? 1 : 0;
    if (!dmg || d.mv > mana) continue;
    if (d.pips[0] === "R" && red === 0) continue;
    if (d.pips[0] !== "R" && !s.lands.some((u) => defOf(s, u).color === (d.pips[0] as Mana))) continue;
    mana -= d.mv;
    burn += dmg;
  }
  if (s.kael === 4) burn += 3;
  return burn;
}

export function upkeepLethal(s: State): boolean {
  let red = 0;
  for (const uid of s.lands) if (defOf(s, uid).color === "R") red++;
  let dmg = 0;
  for (const uid of s.hand) if (defOf(s, uid).id === "ember-bolt" && red > 0) { red--; dmg += 3; }
  return dmg >= s.faceDown.length;
}

function danger(s: State, eff: number): number {
  let d = 0;
  const mine = s.mine.map((p) => body(p)).filter((b) => b.t > 0);
  const attackers: Body[] = [];
  for (const p of s.nem) {
    if (p.pacified || (p.frozen && p.tapped)) continue;
    const a = body(p);
    if (a.kw & DEFENDER || a.p <= 0) continue;
    if (mine.some((b) => canBlock(b, a) && kills(b, a) && !kills(a, b))) continue;
    attackers.push(a);
  }
  attackers.sort((x, y) => y.p - x.p);
  const used = mine.map(() => false);
  for (const a of attackers) {
    let safe = -1;
    let chump = -1;
    mine.forEach((b, j) => {
      if (used[j] || !canBlock(b, a)) return;
      if (!kills(a, b)) { if (safe < 0) safe = j; }
      else if (chump < 0 || mine[j].p + mine[j].t < mine[chump].p + mine[chump].t) chump = j;
    });
    const trample = a.kw & TRAMPLE ? 1 : 0;
    if (safe >= 0) {
      used[safe] = true;
      d += trample * Math.max(0, a.p - mine[safe].t);
    } else if (chump >= 0) {
      used[chump] = true;
      d += trample ? Math.max(0, a.p - mine[chump].t) : a.p * 0.5;
    } else d += a.p;
  }
  if (s.omen >= 0) {
    const od = defOf(s, s.omen);
    if (od.kind === "creature" && s.nem.length >= MAX_CREATURES) d += od.power;
  }
  return W.danger * Math.max(0, d + W.dangerMargin - eff);
}

function material(s: State): number {
  let v = s.library.length - s.faceDown.length;
  for (const p of s.mine) v += mineValue(s, p);
  for (const p of s.nem) v -= nemValue(p);
  return Math.max(-40, Math.min(40, v));
}

export function evaluate(s: State, dc: DecisionCtx): number {
  if (s.over === 1) return WIN + 1000 - 10 * s.round + (s.active === 0 ? 5 : 0) + s.library.length * 0.1;
  if (s.over === 2) return -WIN + 10 * s.round + 0.1 * material(s);
  const eff = s.library.length - 1;
  if (eff <= 0) return upkeepLethal(s) ? WIN / 2 : -WIN + 10 * s.round + 5 + 0.1 * material(s);
  const n = s.faceDown.length;
  let v = lifeScore(eff) - nemScore(n);
  for (const p of s.mine) v += mineValue(s, p);
  for (const p of s.nem) v -= nemValue(p);
  const m = manaCtx(s);
  for (const uid of s.hand) v += dc.unknown[uid] ? dc.avgCard : cardValue(s, defOf(s, uid), eff, dc.avgCard) * castFactor(defOf(s, uid), m);
  v += landsValue(s.lands.length);
  v += kaelValue(s.kael);
  if (s.omen >= 0) v -= dc.unknown[s.omen] ? dc.avgThreat : omenThreat(s, s.omen);
  v -= W.counter * s.counters.length;
  v -= danger(s, eff);
  const combat = allOutDamage(s);
  if (combat + burnNextTurn(s) >= n) v += W.lethal;
  v -= W.clock * Math.min(12, n / (combat + W.selfMill));
  return v;
}
