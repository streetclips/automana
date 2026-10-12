import assert from "node:assert/strict";
import { Heuristic } from "./ai/heuristic";
import { type Action, type Agent, CHARGE, ULTIMATE } from "./engine/agent";
import { NEMESIS_LIST, PAIRS } from "./engine/defs";
import {
  applyAction, beginNemesisTurn, beginPlayerTurn, damageNemesis, declareAttack, drain, enterMine, enterNem, mulligan,
  nemAttackers, nemBlocks, playerCombatDamage, pw, sba, setup, tg,
} from "./engine/engine";
import { rng } from "./engine/rng";
import { FACE, type Perm, type State, type Window, buildCtx, defOf } from "./engine/state";

class Scripted extends Heuristic {
  blocks: number[] | null = null;
  block(s: State): number[] {
    return this.blocks ?? super.block(s);
  }
  respond(_s: State, _w: Window): Action {
    return { t: "pass" };
  }
}

function game(pairKey: string, nemesis: string, heroic = false): { s: State; uid: (id: string, nth?: number) => number; agent: Scripted } {
  const pair = PAIRS.find((p) => p.key === pairKey)!;
  const nem = NEMESIS_LIST.find((n) => n.id === nemesis)!;
  const s = setup(buildCtx(pair, nem, heroic), rng(1), rng(2));
  const uid = (id: string, nth = 0): number => {
    let seen = 0;
    for (let i = 0; i < s.ctx.defs.length; i++) if (s.ctx.defs[i].id === id && seen++ === nth) return i;
    throw new Error(`no ${id} #${nth}`);
  };
  const all = s.ctx.defs.map((_, i) => i);
  s.library = all.filter((i) => i < s.ctx.players);
  s.hand = [];
  s.faceDown = all.filter((i) => i >= s.ctx.players);
  s.omen = s.faceDown.shift()!;
  s.first = false;
  return { s, uid, agent: new Scripted() };
}

function take(s: State, uid: number): void {
  for (const zone of [s.library, s.hand, s.grave, s.faceDown, s.ruin]) {
    const i = zone.indexOf(uid);
    if (i >= 0) zone.splice(i, 1);
  }
  if (s.omen === uid) s.omen = -1;
}

function put(s: State, zone: number[], uid: number): void {
  take(s, uid);
  zone.push(uid);
}

function mine(s: State, uid: number, agent: Agent): Perm {
  take(s, uid);
  enterMine(s, uid, agent, -1);
  const p = s.mine.find((m) => m.uid === uid)!;
  p.sick = false;
  return p;
}

function nem(s: State, uid: number): Perm {
  take(s, uid);
  enterNem(s, uid, false);
  const p = s.nem.find((m) => m.uid === uid)!;
  p.sick = false;
  return p;
}

function setNemLife(s: State, n: number): void {
  while (s.faceDown.length > n) s.ruin.push(s.faceDown.pop()!);
}

function setOmen(s: State, uid: number): void {
  if (s.omen >= 0) s.faceDown.unshift(s.omen);
  take(s, uid);
  s.omen = uid;
}

function land(s: State, id: string, uid: (id: string, nth?: number) => number, nth = 0): void {
  const u = uid(id, nth);
  take(s, u);
  s.lands.push(u);
}

const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void): void => {
  tests.push([name, fn]);
};

test("Nemesis attacks unless a blocker can kill it and survive", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
  const brute = nem(s, uid("cinderclaw-brute"));
  mine(s, uid("thicket-bear"), agent);
  assert.deepEqual(nemAttackers(s), [brute.uid]);
  mine(s, uid("mossback-boar"), agent);
  assert.deepEqual(nemAttackers(s), [brute.uid], "a 3/3 kills the Brute but dies too");
  mine(s, uid("ancient-crashhorn"), agent);
  assert.deepEqual(nemAttackers(s), []);
  const imp = nem(s, uid("ash-imp"));
  assert.deepEqual(nemAttackers(s), [imp.uid]);
});

test("Nemesis blocks: safe block first, then the trick wins it (rulebook example)", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
  const hound = mine(s, uid("cinder-hound"), agent);
  const raider = mine(s, uid("firebrand-raider"), agent);
  const fiend = nem(s, uid("scorch-fiend"));
  declareAttack(s, [hound.uid, raider.uid]);
  nemBlocks(s);
  assert.deepEqual(s.blk, [fiend.uid, -1]);
  land(s, "battle-fury", uid);
  put(s, s.hand, uid("battle-fury"));
  applyAction(s, { t: "cast", uid: uid("battle-fury"), target: hound.uid, pay: false }, agent);
  setNemLife(s, 8);
  playerCombatDamage(s, agent);
  assert.equal(s.nem.length, 0);
  assert.equal(s.mine.length, 1);
  assert.equal(s.faceDown.length, 10, "3 − 2 Ash Hide = 1 → 7 → Rekindle +3");
  assert.equal(s.phase, 2);
});

test("Desperation block only when unblocked damage is lethal", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
  s.phase = 2;
  const raider = mine(s, uid("firebrand-raider"), agent);
  const spider = mine(s, uid("spider-of-the-canopy"), agent);
  const sentinel = nem(s, uid("magma-sentinel"));
  setNemLife(s, 1);
  declareAttack(s, [raider.uid, spider.uid]);
  nemBlocks(s);
  assert.deepEqual(s.blk, [sentinel.uid, -1]);
  playerCombatDamage(s, agent);
  assert.equal(s.over, 1);
});

test("Ash Hide prevents the first 2 damage each turn", () => {
  const { s, agent } = game("R/G", "vorthrax");
  setNemLife(s, 14);
  damageNemesis(s, 1, agent);
  damageNemesis(s, 3, agent);
  assert.equal(s.faceDown.length, 12);
  beginPlayerTurn(s, agent);
  damageNemesis(s, 3, agent);
  assert.equal(s.faceDown.length, 11);
});

test("Kael ultimate after charging", () => {
  const { s, uid, agent } = game("R/G", "vaskara");
  const bear = mine(s, uid("thicket-bear"), agent);
  s.kael = 3;
  applyAction(s, { t: "kael", ab: CHARGE, target: bear.uid }, agent);
  assert.equal(pw(s, bear), 3);
  assert.equal(s.kael, 4);
  s.kaelUsed = false;
  const before = s.faceDown.length;
  applyAction(s, { t: "kael", ab: ULTIMATE, target: -1 }, agent);
  assert.equal(s.kael, 1);
  assert.equal(s.faceDown.length, before - 3);
  assert.equal(pw(s, bear), 4);
});

test("Overflow hits for power and goes face-down to the bottom", () => {
  const { s, uid, agent } = game("R/G", "vorthrax", true);
  for (const id of ["ash-imp", "cinderclaw-brute", "magma-sentinel", "ember-wyrmling"]) nem(s, uid(id));
  setOmen(s, uid("lava-behemoth"));
  const lifeBefore = s.library.length;
  const nemBefore = s.faceDown.length;
  beginNemesisTurn(s);
  s.q = s.q.filter((t) => t.k <= 3);
  drain(s, agent);
  assert.equal(s.library.length, lifeBefore - 6, "5 power + Heroic");
  assert.equal(s.faceDown[s.faceDown.length - 1], uid("lava-behemoth"));
  assert.equal(s.faceDown.length, nemBefore + 1);
});

test("Executed spells go face-down to the bottom and come back", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
  setOmen(s, uid("searing-breath"));
  const n = s.faceDown.length;
  const life = s.library.length;
  beginNemesisTurn(s);
  drain(s, agent);
  assert.equal(s.faceDown.length, n, "+1 spell to the bottom, −1 reveal");
  assert.equal(s.library.length, life - 2 - 1, "Searing Breath with no creature + Smolder");
});

test("Vaskara Brood executes the new Omen when she has 2 or fewer creatures", () => {
  const { s, uid, agent } = game("R/G", "vaskara");
  setOmen(s, uid("ravenous-larva"));
  s.faceDown.unshift(uid("armored-drone"));
  s.faceDown.splice(2, 0, uid("ravenous-larva", 1));
  beginNemesisTurn(s);
  drain(s, agent);
  assert.equal(s.nem.length, 2);
  assert.equal(defOf(s, s.nem[1].uid).id, "armored-drone");
});

test("Morwen Grave Tithe returns the strongest Ruin creature, Withering kills X/1", () => {
  const { s, uid, agent } = game("W/U", "morwen");
  for (const id of ["wandering-skeleton", "rotting-zombie", "deathless-knight"]) put(s, s.ruin, uid(id));
  setOmen(s, uid("withering-touch"));
  beginNemesisTurn(s);
  s.q = s.q.filter((t) => t.k !== 2 && t.k !== 3);
  drain(s, agent);
  assert.ok(s.nem.some((p) => p.def.id === "deathless-knight"));
  const squire = mine(s, uid("dawn-squire"), agent);
  mine(s, uid("tide-apprentice"), agent);
  s.phase = 1;
  setNemLife(s, 8);
  damageNemesis(s, 1, agent);
  assert.equal(s.phase, 2);
  assert.deepEqual(s.mine.map((p) => p.def.id), ["dawn-squire"]);
  assert.equal(pw(s, squire), 0);
  assert.equal(tg(s, squire), 1);
});

test("Counterspell, Refraction and Mirror Ward", () => {
  const { s, uid, agent } = game("R/G", "mirror-archmage");
  s.lands = [uid("ember-bolt"), uid("ember-bolt", 1), uid("reckless-goblin"), uid("reckless-goblin", 1)];
  for (const u of s.lands) take(s, u);
  put(s, s.hand, uid("kindle"));
  put(s, s.hand, uid("battle-fury"));
  take(s, uid("counterspell"));
  s.counters.push(uid("counterspell"));
  const n = s.faceDown.length;
  applyAction(s, { t: "cast", uid: uid("kindle"), target: FACE, pay: false }, agent);
  assert.equal(s.counters.length, 0);
  assert.equal(s.faceDown.length, n + 1, "the Counterspell goes face-down to the bottom");
  assert.equal(s.tapped, 0b11, "Refraction: the first spell costs {1} more");
  assert.ok(s.grave.includes(uid("kindle")));
  s.phase = 2;
  s.spells = 0;
  s.tapped = 0;
  applyAction(s, { t: "cast", uid: uid("battle-fury"), target: -1, pay: false }, agent);
  assert.ok(s.grave.includes(uid("battle-fury")), "Mirror Ward counters an unpaid first spell");
  assert.equal(s.tapped, 0b1);
});

test("Mind Tide discards the leftmost card", () => {
  const { s, uid, agent } = game("R/G", "mirror-archmage");
  put(s, s.hand, uid("kindle"));
  put(s, s.hand, uid("thicket-bear"));
  put(s, s.hand, uid("ember-bolt"));
  setOmen(s, uid("water-elemental"));
  beginNemesisTurn(s);
  drain(s, agent);
  assert.deepEqual(s.hand, [uid("thicket-bear"), uid("ember-bolt")]);
});

test("Lifelink, trample and deathtouch in combat", () => {
  const { s, uid, agent } = game("W/B", "vaskara");
  s.phase = 2;
  const cleric = mine(s, uid("dawn-cleric"), agent);
  const rat = mine(s, uid("crypt-rat"), agent);
  const beetle = nem(s, uid("shieldbreaker-beetle"));
  for (let i = 0; i < 5; i++) s.grave.push(s.library.shift()!);
  const life = s.library.length;
  declareAttack(s, [rat.uid]);
  nemBlocks(s);
  assert.deepEqual(s.blk, [beetle.uid], "3/3 trample +1 Frenzy safe-blocks... trades with deathtouch");
  playerCombatDamage(s, agent);
  assert.equal(s.nem.length, 0);
  assert.equal(s.mine.length, 1);
  const larva = nem(s, uid("ravenous-larva"));
  s.atk = [larva.uid];
  s.blk = [cleric.uid];
  larva.tapped = true;
  agent.blocks = [cleric.uid];
  s.active = 1;
  s.q = [{ k: 10, u: -1 }, { k: 11, u: -1 }];
  drain(s, agent);
  assert.equal(s.library.length, life + 1, "Dawn Cleric lifelink");
  assert.equal(s.nem.length, 0);
});

test("Freeze keeps a creature down through its next untap", () => {
  const { s, uid, agent } = game("W/U", "vorthrax");
  const brute = nem(s, uid("cinderclaw-brute"));
  land(s, "deep-freeze", uid);
  land(s, "mist-hawk", uid);
  put(s, s.hand, uid("deep-freeze"));
  applyAction(s, { t: "cast", uid: uid("deep-freeze"), target: brute.uid, pay: false }, agent);
  beginNemesisTurn(s);
  assert.ok(brute.tapped);
  assert.ok(!brute.frozen);
  assert.deepEqual(nemAttackers(s), []);
});

test("Return to the Tide, Bend Fate and Rising Tide reorder the Threat deck", () => {
  const { s, uid, agent } = game("W/U", "vorthrax");
  const brute = nem(s, uid("cinderclaw-brute"));
  const imp = nem(s, uid("ash-imp"));
  for (const id of ["return-to-the-tide", "bend-fate", "rising-tide", "mist-hawk", "cloud-djinn"]) land(s, id, uid);
  setOmen(s, uid("searing-breath"));
  const omen = s.omen;
  const n = s.faceDown.length;
  put(s, s.hand, uid("return-to-the-tide"));
  applyAction(s, { t: "cast", uid: uid("return-to-the-tide"), target: brute.uid, pay: false }, agent);
  assert.equal(s.omen, brute.uid);
  assert.equal(s.faceDown[0], omen);
  assert.equal(s.faceDown.length, n + 1);
  s.tapped = 0;
  s.spells = 0;
  put(s, s.hand, uid("bend-fate"));
  applyAction(s, { t: "cast", uid: uid("bend-fate"), target: 1, pay: false }, agent);
  assert.equal(s.faceDown[s.faceDown.length - 1], brute.uid);
  assert.equal(s.omen, omen);
  s.tapped = 0;
  put(s, s.hand, uid("rising-tide"));
  applyAction(s, { t: "cast", uid: uid("rising-tide"), target: -1, pay: false }, agent);
  assert.equal(s.omen, imp.uid);
  assert.equal(s.faceDown[0], omen);
  assert.equal(s.nem.length, 0);
});

test("Reanimate, Crypt Lord and Hungry Ghoul", () => {
  const { s, uid, agent } = game("B/G", "vaskara");
  for (let i = 0; i < 5; i++) land(s, i < 3 ? "crypt-rat" : "thicket-bear", uid, i % 2);
  s.lands = [uid("assassinate"), uid("forbidden-pact"), uid("night-specter"), uid("bloom-of-life"), uid("ironbark-wall")];
  for (const u of s.lands) take(s, u);
  put(s, s.grave, uid("ancient-crashhorn"));
  put(s, s.grave, uid("thicket-bear"));
  put(s, s.hand, uid("reanimate"));
  applyAction(s, { t: "cast", uid: uid("reanimate"), target: uid("ancient-crashhorn"), pay: false }, agent);
  assert.ok(s.mine.some((p) => p.def.id === "ancient-crashhorn"));
  s.tapped = 0;
  put(s, s.hand, uid("crypt-lord"));
  applyAction(s, { t: "cast", uid: uid("crypt-lord"), target: uid("thicket-bear"), pay: false }, agent);
  assert.equal(s.mine.length, 3);
  const ghoul = mine(s, uid("hungry-ghoul"), agent);
  put(s, s.grave, uid("assassinate"));
  ghoul.damage = 5;
  const n = s.hand.length;
  sba(s, agent);
  assert.equal(s.hand.length, n + 1);
});

test("Wandering Skeleton returns face-down when it dies; Egg Laying executes creatures", () => {
  const { s, uid, agent } = game("R/G", "morwen");
  const sk = nem(s, uid("wandering-skeleton"));
  const n = s.faceDown.length;
  sk.damage = 1;
  sba(s, agent);
  assert.equal(s.faceDown.length, n + 1);
  assert.equal(s.faceDown[s.faceDown.length - 1], sk.uid);
  const v = game("R/G", "vaskara");
  setOmen(v.s, v.uid("egg-laying"));
  v.s.faceDown.unshift(v.uid("mantis-queen"));
  v.s.faceDown.splice(1, 0, v.uid("pheromones"));
  beginNemesisTurn(v.s);
  v.s.q = v.s.q.filter((t) => t.k <= 6);
  drain(v.s, v.agent);
  assert.equal(v.s.nem[0]?.def.id, "mantis-queen");
  assert.equal(defOf(v.s, v.s.omen).id, "pheromones");
});

test("Mulligan and decking out", () => {
  const pair = PAIRS[0];
  const s = setup(buildCtx(pair, NEMESIS_LIST[0], false), rng(3), rng(4));
  const agent = new Heuristic();
  mulligan(s, agent, rng(5));
  assert.equal(s.hand.length, 3);
  assert.equal(s.grave.length, 1);
  assert.equal(s.library.length, 20);
  s.library = s.library.slice(0, 1);
  s.first = false;
  beginPlayerTurn(s, agent);
  assert.equal(s.over, 2);
});

test("Hatching executes the Omen in the middle of your turn, Reflection bounces", () => {
  const { s, uid, agent } = game("R/G", "vaskara");
  setOmen(s, uid("armored-drone"));
  setNemLife(s, 8);
  damageNemesis(s, 1, agent);
  assert.equal(s.phase, 2);
  assert.equal(s.nem[0]?.def.id, "armored-drone");
  assert.equal(s.faceDown.length, 6);
  const m = game("R/G", "mirror-archmage");
  const boar = mine(m.s, m.uid("mossback-boar"), m.agent);
  mine(m.s, m.uid("thicket-bear"), m.agent);
  setNemLife(m.s, 8);
  damageNemesis(m.s, 1, m.agent);
  assert.ok(m.s.hand.includes(boar.uid));
  assert.equal(m.s.faceDown.length, 9);
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}\n     ${(e as Error).message}`);
  }
}
console.log(failed ? `${failed} of ${tests.length} failed` : `all ${tests.length} passed`);
process.exit(failed ? 1 : 0);
