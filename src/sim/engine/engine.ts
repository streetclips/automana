import type { Action, Agent } from "./agent";
import { DEATHTOUCH, DEFENDER, FLYING, HASTE, LIFELINK, REACH, TRAMPLE, VIGILANCE } from "./defs";
import { type Rng, shuffle } from "./rng";
import {
  FACE, HAND_LIMIT, MAX_CREATURES, OPENING_HAND, ROUND_MANA, T,
  type Ctx, type Perm, type State, type Task, type Window, defOf, newPerm,
} from "./state";

export const GROVEKEEPER = "elvish-grovekeeper";
export const ARCHIVIST = "learned-archivist";

const WINDOW_TASK: Record<Window, number> = { upkeep: 0, start: T.START, spell: T.SPELL, pre: T.PRE, blocks: T.AFTER_BLOCKS, end: T.END };

export function windowTask(w: Window): number {
  return WINDOW_TASK[w];
}

export function log(s: State, msg: string): void {
  if (s.log) s.log.push(`R${s.round} ${s.active ? "Nemesis" : "You"}: ${msg}`);
}

export function count(s: State, key: string): void {
  if (s.tally) s.tally.set(key, (s.tally.get(key) ?? 0) + 1);
}

export function nm(s: State, uid: number): string {
  return defOf(s, uid).name;
}

export function life(s: State): number {
  return s.library.length;
}

export function nemLife(s: State): number {
  return s.faceDown.length;
}

export function kwOf(p: Perm): number {
  return p.def.kw | p.akw;
}

export function pw(p: Perm): number {
  return p.def.power + p.ap + p.tp;
}

export function tg(p: Perm): number {
  return p.def.toughness + p.at + p.tt;
}

export function hp(p: Perm): number {
  return tg(p) - p.damage;
}

export function canBlock(blocker: Perm, attacker: Perm): boolean {
  return !(kwOf(attacker) & FLYING) || (kwOf(blocker) & (FLYING | REACH)) !== 0;
}

export function kills(a: Perm, b: Perm): boolean {
  const pa = pw(a);
  if (pa <= 0 || b.shield) return false;
  return (kwOf(a) & DEATHTOUCH) !== 0 || pa >= hp(b);
}

export function lethalFor(a: Perm, b: Perm): number {
  const rest = Math.max(0, hp(b));
  return kwOf(a) & DEATHTOUCH ? Math.min(1, rest) : rest;
}

export function findMine(s: State, uid: number): Perm | undefined {
  for (const p of s.mine) if (p.uid === uid) return p;
  return undefined;
}

export function findNem(s: State, uid: number): Perm | undefined {
  for (const p of s.nem) if (p.uid === uid) return p;
  return undefined;
}

export function nemTarget(s: State): Perm | undefined {
  let best: Perm | undefined;
  for (const p of s.mine) {
    if (!best) { best = p; continue; }
    const a = pw(p), b = pw(best);
    if (a > b || (a === b && tg(p) > tg(best))) best = p;
  }
  return best;
}

export function bestRuinCreature(s: State): number {
  let best = -1;
  for (let i = 0; i < s.ruin.length; i++) {
    const d = defOf(s, s.ruin[i]);
    if (d.kind !== "creature") continue;
    if (best < 0) { best = i; continue; }
    const b = defOf(s, s.ruin[best]);
    if (d.power > b.power || (d.power === b.power && d.toughness >= b.toughness)) best = i;
  }
  return best;
}

export function loseLife(s: State, n: number): void {
  for (let i = 0; i < n && !s.over; i++) {
    const uid = s.library.shift();
    if (uid === undefined) break;
    s.known[uid] = 0;
    s.grave.push(uid);
    if (s.library.length === 0) s.over = 2;
  }
  if (n > 0) log(s, `you lose ${n} life (${s.library.length} left)`);
}

export function gainLife(s: State, n: number): void {
  let k = 0;
  for (; k < n && s.grave.length; k++) {
    const uid = s.grave.pop()!;
    s.library.push(uid);
    s.known[uid] = 1;
  }
  if (k) log(s, `you gain ${k} life (${s.library.length} left)`);
}

export function draw(s: State, n: number): void {
  for (let i = 0; i < n && !s.over; i++) {
    const uid = s.library.shift();
    if (uid === undefined) { s.over = 2; break; }
    s.known[uid] = 0;
    s.hand.push(uid);
    log(s, `draws ${nm(s, uid)} (${s.library.length} life)`);
    if (s.library.length === 0) s.over = 2;
  }
}

export function scry(s: State, n: number, agent: Agent): void {
  const cards = s.library.slice(0, n);
  if (!cards.length) return;
  const top = agent.scry(s, cards);
  const bottom = cards.filter((c) => !top.includes(c));
  s.library.splice(0, cards.length);
  s.library = [...top, ...s.library, ...bottom];
  for (const c of cards) s.known[c] = 1;
  log(s, `scry ${n}: keeps ${top.map((u) => nm(s, u)).join(", ") || "nothing"}, bottoms ${bottom.map((u) => nm(s, u)).join(", ") || "nothing"}`);
}

export function nemGain(s: State, n: number): void {
  let k = 0;
  for (; k < n && s.ruin.length; k++) {
    const uid = s.ruin.pop()!;
    s.faceDown.push(uid);
    s.known[uid] = 1;
  }
  if (k) log(s, `Nemesis gains ${k} life (${s.faceDown.length} left)`);
}

export function toBottom(s: State, uid: number): void {
  s.faceDown.push(uid);
  s.known[uid] = 1;
}

export function damageNemesis(s: State, n: number): void {
  if (s.over || n <= 0) return;
  const k = Math.min(n, s.faceDown.length);
  for (let i = 0; i < k; i++) {
    const uid = s.faceDown.shift()!;
    s.known[uid] = 0;
    s.ruin.push(uid);
  }
  log(s, `Nemesis takes ${n} (${nemLife(s)} left)`);
  if (s.faceDown.length === 0) s.over = 1;
}

export function reveal(s: State): void {
  if (s.over || s.omen >= 0) return;
  const uid = s.faceDown.shift();
  if (uid === undefined) { s.over = 1; return; }
  s.omen = uid;
  s.known[uid] = 0;
  log(s, `reveals Omen ${nm(s, uid)} (${nemLife(s)} left)`);
  if (s.faceDown.length === 0) s.over = 1;
}

function returnFromRuin(s: State): boolean {
  const i = bestRuinCreature(s);
  if (i < 0 || s.nem.length >= MAX_CREATURES) return false;
  const uid = s.ruin.splice(i, 1)[0];
  enterNem(s, uid, false);
  return true;
}

export function bounceMine(s: State, p: Perm): void {
  s.mine.splice(s.mine.indexOf(p), 1);
  s.grave.push(...p.auras);
  s.hand.push(p.uid);
  log(s, `${p.def.name} returns to your hand`);
}

export function removeNem(s: State, p: Perm): void {
  s.nem.splice(s.nem.indexOf(p), 1);
  s.grave.push(...p.auras);
}

export function damageCreature(p: Perm, n: number, deathtouch: boolean): number {
  if (n <= 0 || p.shield) return 0;
  p.damage += n;
  if (deathtouch) p.dt = true;
  return n;
}

export function sba(s: State, agent: Agent): void {
  for (;;) {
    const deadMine: Perm[] = [];
    const deadNem: Perm[] = [];
    for (const p of s.mine) {
      const t = tg(p);
      if (t <= 0 || p.damage >= t || p.dt) deadMine.push(p);
    }
    for (const p of s.nem) {
      const t = tg(p);
      if (t <= 0 || p.damage >= t || p.dt) deadNem.push(p);
    }
    if (!deadMine.length && !deadNem.length) return;
    for (const p of deadMine) {
      s.mine.splice(s.mine.indexOf(p), 1);
      s.grave.push(p.uid, ...p.auras);
      log(s, `${p.def.name} dies`);
    }
    for (const p of deadNem) {
      removeNem(s, p);
      if (p.def.id === "wandering-skeleton") toBottom(s, p.uid);
      else s.ruin.push(p.uid);
      log(s, `${p.def.name} dies`);
    }
    for (const p of deadMine) {
      if (p.def.id !== "hungry-ghoul" || !s.grave.length) continue;
      const uid = agent.ghoul(s);
      const i = s.grave.indexOf(uid);
      if (i >= 0) {
        s.grave.splice(i, 1);
        s.hand.push(uid);
        log(s, `Hungry Ghoul returns ${nm(s, uid)} to hand`);
      }
    }
  }
}

export function enterNem(s: State, uid: number, executed: boolean): void {
  const d = defOf(s, uid);
  if (s.nem.length >= MAX_CREATURES) {
    if (executed) {
      log(s, `Overflow: ${d.name} deals ${d.power}`);
      loseLife(s, d.power);
      toBottom(s, uid);
    } else s.ruin.push(uid);
    return;
  }
  const p = newPerm(uid, d);
  s.nem.push(p);
  log(s, `${d.name} enters (${pw(p)}/${tg(p)})`);
  switch (d.id) {
    case "vorthraxs-herald":
    case "crypt-horror":
      loseLife(s, 1);
      break;
    case "mantis-queen":
      for (const o of s.nem) if (o !== p) o.tp += 1;
      break;
  }
}

export function enterMine(s: State, uid: number, agent: Agent, target: number): void {
  const d = defOf(s, uid);
  if (s.mine.length >= MAX_CREATURES) { s.grave.push(uid); return; }
  const p = newPerm(uid, d);
  s.mine.push(p);
  log(s, `${d.name} enters`);
  sba(s, agent);
  switch (d.id) {
    case "tide-apprentice":
      scry(s, 2, agent);
      break;
    case "blood-acolyte":
      loseLife(s, 1);
      damageNemesis(s, 1);
      break;
    case "cinder-hound": {
      const t = findAny(s, target >= 0 ? target : agent.hound(s));
      if (t) {
        damageCreature(t, 1, false);
        log(s, `Cinder Hound pings ${t.def.name}`);
        sba(s, agent);
      }
      break;
    }
    case "pyre-titan":
      damageNemesis(s, 2);
      break;
    case "grovesinger-druid":
      gainLife(s, 2);
      break;
    case "crypt-lord": {
      const options = s.grave.filter((u) => defOf(s, u).kind === "creature" && defOf(s, u).mv <= 2);
      if (!options.length || s.mine.length >= MAX_CREATURES) break;
      const pick = options.includes(target) ? target : agent.cryptLord(s, options);
      const i = s.grave.indexOf(pick);
      if (i >= 0) {
        s.grave.splice(i, 1);
        enterMine(s, pick, agent, -1);
      }
      break;
    }
  }
}

export function findAny(s: State, uid: number): Perm | undefined {
  return findMine(s, uid) ?? findNem(s, uid);
}

export function manaLeft(s: State): number {
  let n = s.mana;
  for (const p of s.mine) if (p.def.id === GROVEKEEPER && !p.tapped && !p.sick) n++;
  return n;
}

function payMana(s: State, uid: number): void {
  const d = defOf(s, uid);
  const pool = Math.min(d.mv, s.mana);
  s.mana -= pool;
  let rest = d.mv - pool;
  for (const p of s.mine) {
    if (!rest) break;
    if (p.def.id === GROVEKEEPER && !p.tapped && !p.sick) { p.tapped = true; rest--; }
  }
  if (rest) throw new Error(`Cannot pay ${d.name}`);
}

export function targets(s: State, uid: number): number[] {
  const d = defOf(s, uid);
  const nem = s.nem.map((p) => p.uid);
  const mine = s.mine.map((p) => p.uid);
  switch (d.id) {
    case "cinder-hound":
      return [...nem, ...mine, uid];
    case "crypt-lord": {
      const g = s.grave.filter((u) => defOf(s, u).kind === "creature" && defOf(s, u).mv <= 2);
      return g.length ? g : [-1];
    }
    case "reanimate":
      return s.grave.filter((u) => defOf(s, u).kind === "creature");
    case "ember-bolt":
    case "kindle":
      return [...nem, FACE];
    case "lethal-whisper":
    case "assassinate":
    case "deep-freeze":
    case "return-to-the-tide":
      return nem;
    case "serene-judgment":
      return s.nem.filter((p) => !p.pacified).map((p) => p.uid);
    case "banish-into-light":
      return s.active === 1 ? s.atk.filter((u) => findNem(s, u)) : [];
    case "battle-fury":
    case "surge-of-vigor":
    case "luminous-aegis":
    case "molten-blade":
    case "wild-strength":
      return mine;
    case "bend-fate":
      return s.omen >= 0 ? [1, 0] : [0];
    case "rising-tide":
      return nem.length ? [-1] : [];
    default:
      return [-1];
  }
}

export function sorcerySpeed(d: { kind: string }): boolean {
  return d.kind !== "instant";
}

export function castable(s: State, uid: number, main: boolean, have = manaLeft(s)): boolean {
  const d = defOf(s, uid);
  if (sorcerySpeed(d) && !main) return false;
  if (d.kind === "creature" && s.mine.length >= MAX_CREATURES) return false;
  return d.mv <= have;
}

function castSpell(s: State, a: Extract<Action, { t: "cast" }>, agent: Agent): void {
  const d = defOf(s, a.uid);
  const i = s.hand.indexOf(a.uid);
  if (i < 0) throw new Error(`${d.name} is not in hand`);
  s.hand.splice(i, 1);
  payMana(s, a.uid);
  if (s.counters.length) {
    toBottom(s, s.counters.shift()!);
    s.grave.push(a.uid);
    log(s, `casts ${d.name}: countered`);
    count(s, `countered:${d.id}`);
    return;
  }
  count(s, `cast:${d.id}`);
  log(s, `casts ${d.name}${a.target === FACE ? " at the Nemesis" : a.target >= 0 && d.id !== "bend-fate" ? ` on ${nm(s, a.target)}` : ""}`);
  if (d.kind === "creature") { enterMine(s, a.uid, agent, a.target); return; }
  if (d.kind === "aura") { attach(s, a.uid, a.target, agent); return; }
  resolveSpell(s, a.uid, a.target, agent);
  s.grave.push(a.uid);
}

function attach(s: State, uid: number, target: number, agent: Agent): void {
  const d = defOf(s, uid);
  const p = d.id === "serene-judgment" ? findNem(s, target) : findMine(s, target);
  if (!p) { s.grave.push(uid); return; }
  p.auras.push(uid);
  if (d.id === "serene-judgment") p.pacified = true;
  else if (d.id === "molten-blade") { p.ap += 2; p.akw |= TRAMPLE; }
  else if (d.id === "wild-strength") { p.ap += 2; p.at += 2; p.akw |= TRAMPLE; }
  sba(s, agent);
}

function resolveSpell(s: State, uid: number, target: number, agent: Agent): void {
  const d = defOf(s, uid);
  const nemT = target >= 0 ? findNem(s, target) : undefined;
  const mineT = target >= 0 ? findMine(s, target) : undefined;
  switch (d.id) {
    case "luminous-aegis":
      if (mineT) mineT.shield = true;
      break;
    case "prayer-of-restoration": {
      const cards = s.grave.slice(-3).reverse();
      const pick = cards.length ? agent.prayer(s, cards) : -1;
      for (const c of cards) {
        s.grave.splice(s.grave.lastIndexOf(c), 1);
        if (c === pick) { s.hand.push(c); log(s, `takes ${nm(s, c)} into hand`); }
        else { s.library.push(c); s.known[c] = 1; }
      }
      break;
    }
    case "shield-formation":
      for (const p of s.mine) { p.tp += 1; p.tt += 1; }
      break;
    case "banish-into-light":
      if (nemT && s.atk.includes(nemT.uid)) {
        removeNem(s, nemT);
        toBottom(s, nemT.uid);
      }
      break;
    case "bend-fate":
      if (target === 1 && s.omen >= 0) {
        toBottom(s, s.omen);
        s.omen = -1;
        reveal(s);
      }
      if (!s.over) scry(s, 1, agent);
      break;
    case "deep-freeze":
      if (nemT) { nemT.tapped = true; nemT.frozen = true; }
      break;
    case "return-to-the-tide":
      if (nemT) {
        removeNem(s, nemT);
        if (s.omen >= 0) { s.faceDown.unshift(s.omen); s.known[s.omen] = 1; }
        s.omen = nemT.uid;
      }
      break;
    case "arcane-study":
      scry(s, 2, agent);
      draw(s, 2);
      break;
    case "rising-tide": {
      if (!s.nem.length) break;
      const order = agent.tideOrder(s, s.nem.map((p) => p.uid));
      for (const p of s.nem.slice()) removeNem(s, p);
      if (s.omen >= 0) { s.faceDown.unshift(s.omen); s.known[s.omen] = 1; }
      for (let i = order.length - 1; i >= 1; i--) { s.faceDown.unshift(order[i]); s.known[order[i]] = 1; }
      s.omen = order[0];
      break;
    }
    case "lethal-whisper":
      if (nemT) { nemT.tp -= 2; nemT.tt -= 2; sba(s, agent); }
      break;
    case "forbidden-pact":
      draw(s, 2);
      break;
    case "assassinate":
      if (nemT) { nemT.dt = true; sba(s, agent); }
      break;
    case "reanimate": {
      const i = s.grave.indexOf(target);
      if (i >= 0 && s.mine.length < MAX_CREATURES) {
        s.grave.splice(i, 1);
        enterMine(s, target, agent, -1);
      }
      break;
    }
    case "drain-essence":
      damageNemesis(s, 2);
      gainLife(s, 2);
      break;
    case "ember-bolt":
    case "kindle": {
      const n = d.id === "ember-bolt" ? 3 : 2;
      if (target === FACE) damageNemesis(s, n);
      else {
        const p = findAny(s, target);
        if (p) { damageCreature(p, n, false); sba(s, agent); }
      }
      break;
    }
    case "battle-fury":
      if (mineT) mineT.tp += 3;
      break;
    case "volcanic-roar":
      for (const p of s.nem) damageCreature(p, 2, false);
      sba(s, agent);
      break;
    case "surge-of-vigor":
      if (mineT) { mineT.tp += 3; mineT.tt += 3; }
      break;
    case "bloom-of-life":
      gainLife(s, 4);
      break;
    default:
      throw new Error(`No resolution for ${d.id}`);
  }
}

export function applyAction(s: State, a: Action, agent: Agent): void {
  switch (a.t) {
    case "cast":
      castSpell(s, a, agent);
      break;
    case "archivist": {
      const p = s.mine.find((m) => m.def.id === ARCHIVIST && !m.tapped && !m.sick);
      if (!p) throw new Error("No Archivist ready");
      p.tapped = true;
      scry(s, 1, agent);
      break;
    }
    case "pass":
      break;
  }
}

export function nemAttackers(s: State): number[] {
  const res: number[] = [];
  for (const p of s.nem) {
    if (p.tapped || p.pacified) continue;
    const k = kwOf(p);
    if (k & DEFENDER) continue;
    if (p.sick && !(k & HASTE)) continue;
    let deterred = false;
    for (const b of s.mine) {
      if (!b.tapped && canBlock(b, p) && kills(b, p) && !kills(p, b)) { deterred = true; break; }
    }
    if (!deterred) res.push(p.uid);
  }
  return res;
}

function strongest(list: Perm[], ok: (a: Perm) => boolean): number {
  let best = -1;
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!ok(a)) continue;
    if (best < 0) { best = i; continue; }
    const b = list[best];
    const pa = pw(a), pb = pw(b);
    if (pa > pb || (pa === pb && tg(a) > tg(b))) best = i;
  }
  return best;
}

export function unblockedToNemesis(attackers: Perm[], blockers: (Perm | null)[]): number {
  let dmg = 0;
  for (let i = 0; i < attackers.length; i++) {
    const a = attackers[i];
    const pa = Math.max(0, pw(a));
    const b = blockers[i];
    if (!b) dmg += pa;
    else if (kwOf(a) & TRAMPLE) dmg += Math.max(0, pa - lethalFor(a, b));
  }
  return dmg;
}

export function nemBlocks(s: State): void {
  const attackers = s.atk.map((u) => findMine(s, u)!).filter(Boolean);
  const order = s.mine.filter((p) => attackers.includes(p));
  const assigned: (Perm | null)[] = order.map(() => null);
  const free = s.nem.filter((p) => !p.tapped && !p.pacified);
  const used = new Set<Perm>();
  const step = (ok: (b: Perm, a: Perm) => boolean): void => {
    for (const b of free) {
      if (used.has(b)) continue;
      const i = strongest(order, (a) => assigned[order.indexOf(a)] === null && canBlock(b, a) && ok(b, a));
      if (i >= 0) { assigned[i] = b; used.add(b); }
    }
  };
  step((b, a) => kills(b, a) && !kills(a, b));
  step((b, a) => kills(b, a));
  if (unblockedToNemesis(order, assigned) >= nemLife(s)) step(() => true);
  s.atk = order.map((p) => p.uid);
  s.blk = assigned.map((b) => (b ? b.uid : -1));
  if (s.atk.length) log(s, `attacks with ${order.map((p, i) => `${p.def.name}${assigned[i] ? ` (blocked by ${assigned[i]!.def.name})` : ""}`).join(", ")}`);
}

export function declareAttack(s: State, uids: number[]): void {
  s.atk = [];
  s.blk = [];
  for (const uid of uids) {
    const p = findMine(s, uid);
    if (!p || p.tapped || (p.sick && !(kwOf(p) & HASTE)) || kwOf(p) & DEFENDER) throw new Error(`Illegal attacker ${uid}`);
    if (!(kwOf(p) & VIGILANCE)) p.tapped = true;
    s.atk.push(uid);
    s.blk.push(-1);
  }
}

interface Hit {
  to: Perm;
  n: number;
  dt: boolean;
}

function fight(s: State, attackers: (Perm | undefined)[], defendersMine: boolean): { toPlayer: number; hits: Hit[]; gainMine: number; gainNem: number; perAttacker: number[] } {
  const hits: Hit[] = [];
  let toPlayer = 0;
  let gainMine = 0;
  let gainNem = 0;
  const perAttacker: number[] = [];
  for (let i = 0; i < attackers.length; i++) {
    perAttacker.push(0);
    const a = attackers[i];
    if (!a) continue;
    const pa = Math.max(0, pw(a));
    const ka = kwOf(a);
    const bu = s.blk[i];
    const b = bu >= 0 ? (defendersMine ? findMine(s, bu) : findNem(s, bu)) : undefined;
    let dealt = 0;
    if (bu >= 0) {
      if (b) {
        const toB = ka & TRAMPLE ? Math.min(pa, lethalFor(a, b)) : pa;
        const excess = pa - toB;
        if (!b.shield) dealt += toB;
        hits.push({ to: b, n: toB, dt: (ka & DEATHTOUCH) !== 0 });
        toPlayer += excess;
        perAttacker[i] = excess;
        const pb = Math.max(0, pw(b));
        hits.push({ to: a, n: pb, dt: (kwOf(b) & DEATHTOUCH) !== 0 });
        if (kwOf(b) & LIFELINK && !a.shield) {
          if (defendersMine) gainMine += pb;
          else gainNem += pb;
        }
      } else if (ka & TRAMPLE) { toPlayer += pa; perAttacker[i] = pa; }
    } else { toPlayer += pa; perAttacker[i] = pa; }
    if (ka & LIFELINK && dealt) {
      if (defendersMine) gainNem += dealt;
      else gainMine += dealt;
    }
  }
  return { toPlayer, hits, gainMine, gainNem, perAttacker };
}

export function playerCombatDamage(s: State, agent: Agent): void {
  const attackers = s.atk.map((u) => findMine(s, u));
  const r = fight(s, attackers, false);
  let gainMine = r.gainMine;
  attackers.forEach((a, i) => {
    if (a && kwOf(a) & LIFELINK) gainMine += r.perAttacker[i];
  });
  for (const h of r.hits) damageCreature(h.to, h.n, h.dt);
  gainLife(s, gainMine);
  nemGain(s, r.gainNem);
  sba(s, agent);
  damageNemesis(s, r.toPlayer);
  s.atk = [];
  s.blk = [];
}

function nemCombatDamage(s: State, agent: Agent): void {
  const attackers = s.atk.map((u) => findNem(s, u));
  const r = fight(s, attackers, true);
  let gainNem = r.gainNem;
  attackers.forEach((a, i) => {
    if (a && kwOf(a) & LIFELINK) gainNem += r.perAttacker[i];
  });
  for (const h of r.hits) damageCreature(h.to, h.n, h.dt);
  nemGain(s, gainNem);
  gainLife(s, r.gainMine);
  sba(s, agent);
  if (r.toPlayer) {
    log(s, `combat deals ${r.toPlayer} to you`);
    loseLife(s, r.toPlayer);
  }
  s.atk = [];
  s.blk = [];
}

function executeCard(s: State, uid: number): void {
  const d = defOf(s, uid);
  if (d.kind === "creature") { enterNem(s, uid, true); return; }
  s.pend = uid;
  const t = d.id === "searing-breath" || d.id === "withering-touch" || d.id === "rebound" ? nemTarget(s) : undefined;
  s.pendTarget = t ? t.uid : -1;
  log(s, `executes ${d.name}${t ? ` on ${t.def.name}` : ""}`);
  s.q.unshift({ k: T.SPELL, u: uid }, { k: T.RESOLVE, u: uid });
}

function resolveThreat(s: State, uid: number, agent: Agent): void {
  const d = defOf(s, uid);
  const target = s.pendTarget >= 0 ? findMine(s, s.pendTarget) : undefined;
  s.pend = -1;
  switch (d.id) {
    case "searing-breath":
      if (s.pendTarget < 0) loseLife(s, 2);
      else if (target) { damageCreature(target, 2, false); sba(s, agent); }
      break;
    case "rain-of-cinders":
      for (const p of s.mine) damageCreature(p, 1, false);
      sba(s, agent);
      loseLife(s, 1);
      break;
    case "tyrants-roar":
      for (const p of s.nem) p.tp += 1;
      break;
    case "cinder-rebirth":
    case "exhume":
      if (bestRuinCreature(s) < 0) loseLife(s, 2);
      else returnFromRuin(s);
      break;
    case "pheromones":
      for (const p of s.nem) { p.tp += 1; p.tt += 1; }
      break;
    case "egg-laying": {
      const next = s.faceDown.shift();
      if (next === undefined) { s.over = 1; break; }
      s.known[next] = 0;
      log(s, `Egg Laying reveals ${nm(s, next)}`);
      if (s.faceDown.length === 0) { s.over = 1; break; }
      if (defOf(s, next).kind === "creature") enterNem(s, next, true);
      else toBottom(s, next);
      break;
    }
    case "insect-plague":
      for (const p of s.mine) damageCreature(p, 1, false);
      sba(s, agent);
      break;
    case "withering-touch":
      if (s.pendTarget < 0) loseLife(s, 2);
      else if (target) { target.tp -= 2; target.tt -= 2; sba(s, agent); }
      break;
    case "soul-drain":
      loseLife(s, 2);
      nemGain(s, 2);
      break;
    case "plague":
      for (const p of s.mine) { p.tp -= 1; p.tt -= 1; }
      for (const p of s.nem) { p.tp -= 1; p.tt -= 1; }
      sba(s, agent);
      break;
    case "counterspell":
      s.counters.push(uid);
      return;
    case "rebound":
      if (s.pendTarget < 0) discardLeftmost(s);
      else if (target) bounceMine(s, target);
      break;
    case "mind-theft":
      if (s.hand.length) discardLeftmost(s);
      else loseLife(s, 2);
      break;
    case "mass-illusion":
      for (const p of s.mine) p.tapped = true;
      break;
    default:
      throw new Error(`No resolution for threat ${d.id}`);
  }
  if (!s.over) toBottom(s, uid);
}

function discardLeftmost(s: State): void {
  const uid = s.hand.shift();
  if (uid === undefined) return;
  count(s, `discard:${defOf(s, uid).id}`);
  s.grave.push(uid);
  log(s, `you discard ${nm(s, uid)}`);
}

export function cleanup(s: State): void {
  for (const p of s.mine) { p.damage = 0; p.dt = false; p.tp = 0; p.tt = 0; p.shield = false; }
  for (const p of s.nem) { p.damage = 0; p.dt = false; p.tp = 0; p.tt = 0; p.shield = false; }
  s.atk = [];
  s.blk = [];
}

export function window(s: State, agent: Agent, w: Window): boolean {
  const a = agent.respond(s, w);
  if (a.t === "pass") return false;
  applyAction(s, a, agent);
  return true;
}

function process(s: State, task: Task, agent: Agent): void {
  switch (task.k) {
    case T.START:
    case T.PRE:
    case T.END:
    case T.SPELL:
    case T.AFTER_BLOCKS: {
      const w: Window = task.k === T.START ? "start" : task.k === T.PRE ? "pre" : task.k === T.END ? "end" : task.k === T.SPELL ? "spell" : "blocks";
      if (window(s, agent, w) && !s.over) s.q.unshift(task);
      break;
    }
    case T.EXEC_OMEN: {
      const uid = s.omen;
      if (uid < 0) break;
      s.omen = -1;
      s.q.unshift({ k: T.EXEC, u: uid });
      break;
    }
    case T.EXEC:
      executeCard(s, task.u);
      break;
    case T.RESOLVE:
      resolveThreat(s, task.u, agent);
      break;
    case T.REVEAL:
      reveal(s);
      break;
    case T.ATTACK: {
      const atk = nemAttackers(s);
      if (!atk.length) break;
      for (const u of atk) findNem(s, u)!.tapped = true;
      s.atk = atk;
      s.blk = atk.map(() => -1);
      s.q.unshift({ k: T.BLOCKS, u: -1 }, { k: T.AFTER_BLOCKS, u: -1 }, { k: T.DAMAGE, u: -1 });
      break;
    }
    case T.BLOCKS: {
      const blk = agent.block(s);
      const used = new Set<number>();
      s.blk = s.atk.map((u, i) => {
        const b = findMine(s, blk[i] ?? -1);
        const a = findNem(s, u);
        if (!b || !a || b.tapped || used.has(b.uid) || !canBlock(b, a)) return -1;
        used.add(b.uid);
        return b.uid;
      });
      log(s, `attacks with ${s.atk.map((u, i) => `${nm(s, u)}${s.blk[i] >= 0 ? ` (blocked by ${nm(s, s.blk[i])})` : ""}`).join(", ")}`);
      break;
    }
    case T.DAMAGE:
      nemCombatDamage(s, agent);
      break;
    case T.CLEANUP:
      cleanup(s);
      break;
  }
}

export function drain(s: State, agent: Agent): void {
  while (s.q.length && !s.over) process(s, s.q.shift()!, agent);
  if (s.over) s.q.length = 0;
}

export function beginNemesisTurn(s: State): void {
  s.active = 1;
  for (const p of s.nem) {
    p.sick = false;
    if (p.frozen) p.frozen = false;
    else p.tapped = false;
  }
  for (const p of s.mine) p.sick = false;
  s.q.push(
    { k: T.START, u: -1 }, { k: T.EXEC_OMEN, u: -1 }, { k: T.REVEAL, u: -1 }, { k: T.PRE, u: -1 },
    { k: T.ATTACK, u: -1 }, { k: T.END, u: -1 }, { k: T.CLEANUP, u: -1 },
  );
}

export function nemesisTurn(s: State, agent: Agent): void {
  beginNemesisTurn(s);
  drain(s, agent);
}

export function beginPlayerTurn(s: State, agent: Agent): void {
  s.round++;
  s.active = 0;
  s.mana = ROUND_MANA;
  for (const p of s.mine) { p.tapped = false; p.sick = false; }
  if (!s.first) {
    if (s.library.length <= 1) while (!s.over && window(s, agent, "upkeep"));
    if (!s.over) draw(s, 1);
  }
  if (s.log && !s.over) {
    const names = (uids: number[]): string => uids.map((u) => nm(s, u)).join(", ") || "—";
    const board = (ps: Perm[]): string => ps.map((p) => `${p.def.name} ${pw(p)}/${tg(p)}${p.tapped ? " (tapped)" : ""}${p.pacified ? " (pacified)" : ""}`).join(", ") || "—";
    log(s, `hand [${names(s.hand)}] · board [${board(s.mine)}] · Nemesis [${board(s.nem)}] · Omen ${s.omen >= 0 ? nm(s, s.omen) : "—"} · life ${s.library.length} vs ${s.faceDown.length}`);
  }
}

export function endPlayerTurn(s: State, agent: Agent): void {
  if (s.hand.length > HAND_LIMIT) {
    for (const uid of agent.discard(s, s.hand.length - HAND_LIMIT)) {
      const i = s.hand.indexOf(uid);
      if (i < 0) continue;
      s.hand.splice(i, 1);
      s.grave.push(uid);
      log(s, `discards ${nm(s, uid)}`);
      count(s, `discard:${defOf(s, uid).id}`);
    }
  }
  cleanup(s);
  s.first = false;
}

export function playerTurn(s: State, agent: Agent): void {
  beginPlayerTurn(s, agent);
  for (let step = 1 as 1 | 2; !s.over; ) {
    const a = agent.main(s, step);
    if (a.t !== "pass") { applyAction(s, a, agent); continue; }
    if (step === 2) break;
    declareAttack(s, agent.attack(s));
    if (s.atk.length) {
      nemBlocks(s);
      for (let t = agent.trick(s); t.t !== "pass" && !s.over; t = agent.trick(s)) applyAction(s, t, agent);
      if (!s.over) playerCombatDamage(s, agent);
    }
    step = 2;
  }
  if (!s.over) endPlayerTurn(s, agent);
}

export function setup(ctx: Ctx, rp: Rng, rn: Rng): State {
  const library = shuffle(Array.from({ length: ctx.players }, (_, i) => i), rp);
  const hand = library.splice(0, OPENING_HAND);
  const faceDown = shuffle(Array.from({ length: ctx.defs.length - ctx.players }, (_, i) => ctx.players + i), rn);
  const omen = faceDown.shift()!;
  return {
    ctx, round: 0, active: 0, first: true, library, hand, grave: [], mana: 0, mine: [],
    omen, faceDown, ruin: [], nem: [], counters: [], atk: [], blk: [],
    pend: -1, pendTarget: -1, q: [], known: new Uint8Array(ctx.defs.length), over: 0, mulligan: false, log: null, tally: null,
  };
}

export function mulligan(s: State, agent: Agent, rp: Rng): void {
  s.library.push(...s.hand);
  shuffle(s.library, rp);
  s.hand = s.library.splice(0, OPENING_HAND);
  const uid = agent.mulliganDiscard(s);
  s.hand.splice(s.hand.indexOf(uid), 1);
  s.grave.push(uid);
  s.known.fill(0);
  s.mulligan = true;
  log(s, `mulligan, discards ${nm(s, uid)}`);
}

export function stepTask(s: State, agent: Agent): void {
  const t = s.q.shift();
  if (t) process(s, t, agent);
  if (s.over) s.q.length = 0;
}
