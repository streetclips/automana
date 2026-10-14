import assert from "node:assert/strict";
import { Heuristic } from "./ai/heuristic";
import type { Action, Agent } from "./engine/agent";
import { NEMESIS_LIST, PAIRS } from "./engine/defs";
import {
  applyAction, beginNemesisTurn, beginPlayerTurn, castable, cleanup, declareAttack, drain, endPlayerTurn, enterMine, enterNem,
  manaLeft, nemAttackers, nemBlocks, playerCombatDamage, pw, sba, setup,
} from "./engine/engine";
import { rng } from "./engine/rng";
import { FACE, type Perm, ROUND_MANA, type State, T, type Window, buildCtx, defOf } from "./engine/state";

class Scripted extends Heuristic {
  blocks: number[] | null = null;
  block(s: State): number[] {
    return this.blocks ?? super.block(s);
  }
  respond(_s: State, _w: Window): Action {
    return { t: "pass" };
  }
}

function game(pairKey: string, nemesis: string): { s: State; uid: (id: string, nth?: number) => number; agent: Scripted } {
  const pair = PAIRS.find((p) => p.key === pairKey)!;
  const nem = NEMESIS_LIST.find((n) => n.id === nemesis)!;
  const s = setup(buildCtx(pair, nem), rng(1), rng(2));
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
  s.mana = ROUND_MANA;
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
  put(s, s.hand, uid("battle-fury"));
  applyAction(s, { t: "cast", uid: uid("battle-fury"), target: hound.uid }, agent);
  setNemLife(s, 8);
  playerCombatDamage(s, agent);
  assert.equal(s.nem.length, 0);
  assert.equal(s.mine.length, 1);
  assert.equal(s.faceDown.length, 5, "the unblocked Raider deals 3");
});

test("Desperation block only when unblocked damage is lethal", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
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

test("Mana: 3 at your untap, kept for the Nemesis turn; Grovekeeper adds 1", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
  s.mana = 0;
  beginPlayerTurn(s, agent);
  assert.equal(s.mana, ROUND_MANA);
  for (const id of ["thicket-bear", "mossback-boar", "ember-bolt", "kindle"]) put(s, s.hand, uid(id));
  applyAction(s, { t: "cast", uid: uid("thicket-bear"), target: -1 }, agent);
  assert.equal(s.mana, 1);
  assert.ok(!castable(s, uid("mossback-boar"), true), "a 3-cost card does not fit in 1 mana");
  beginNemesisTurn(s);
  assert.equal(s.mana, 1, "unspent mana lasts through the Nemesis turn");
  assert.ok(castable(s, uid("ember-bolt"), false));
  applyAction(s, { t: "cast", uid: uid("ember-bolt"), target: FACE }, agent);
  assert.equal(s.mana, 0);
  beginPlayerTurn(s, agent);
  assert.equal(s.mana, ROUND_MANA, "the pool resets, it does not add up");
  const elf = mine(s, uid("elvish-grovekeeper"), agent);
  assert.equal(manaLeft(s), ROUND_MANA + 1);
  applyAction(s, { t: "cast", uid: uid("mossback-boar"), target: -1 }, agent);
  applyAction(s, { t: "cast", uid: uid("kindle"), target: FACE }, agent);
  assert.ok(elf.tapped, "the fourth mana taps Elvish Grovekeeper");
  assert.equal(manaLeft(s), 0);
  beginPlayerTurn(s, agent);
  assert.ok(!elf.tapped);
  assert.equal(manaLeft(s), ROUND_MANA + 1);
});

test("Overflow hits for power and goes face-down to the bottom", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
  for (const id of ["ash-imp", "cinderclaw-brute", "magma-sentinel", "ember-wyrmling"]) nem(s, uid(id));
  setOmen(s, uid("lava-behemoth"));
  const lifeBefore = s.library.length;
  const nemBefore = s.faceDown.length;
  beginNemesisTurn(s);
  s.q = s.q.filter((t) => t.k <= 3);
  drain(s, agent);
  assert.equal(s.library.length, lifeBefore - 5, "Lava Behemoth's 5 power");
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
  assert.equal(s.library.length, life - 2, "Searing Breath with no creature");
});

test("Counterspell counters the next spell, then goes to the bottom", () => {
  const { s, uid, agent } = game("R/G", "mirror-archmage");
  put(s, s.hand, uid("kindle"));
  put(s, s.hand, uid("battle-fury"));
  take(s, uid("counterspell"));
  s.counters.push(uid("counterspell"));
  const n = s.faceDown.length;
  applyAction(s, { t: "cast", uid: uid("kindle"), target: FACE }, agent);
  assert.equal(s.counters.length, 0);
  assert.equal(s.faceDown.length, n + 1, "the Counterspell goes face-down to the bottom");
  assert.equal(s.mana, ROUND_MANA - 1, "the countered spell is still paid");
  assert.ok(s.grave.includes(uid("kindle")));
  const bear = mine(s, uid("thicket-bear"), agent);
  applyAction(s, { t: "cast", uid: uid("battle-fury"), target: bear.uid }, agent);
  assert.equal(pw(bear), 5, "the next spell resolves");
});

test("Lifelink, trample and deathtouch in combat", () => {
  const { s, uid, agent } = game("W/B", "vaskara");
  const cleric = mine(s, uid("dawn-cleric"), agent);
  const rat = mine(s, uid("crypt-rat"), agent);
  const beetle = nem(s, uid("shieldbreaker-beetle"));
  for (let i = 0; i < 5; i++) s.grave.push(s.library.shift()!);
  const life = s.library.length;
  declareAttack(s, [rat.uid]);
  nemBlocks(s);
  assert.deepEqual(s.blk, [beetle.uid], "the 3/3 Beetle can kill the Rat, so it trades with its deathtouch");
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

test("Deep Freeze prevents the damage a Nemesis creature would deal this turn", () => {
  const { s, uid, agent } = game("W/U", "vorthrax");
  const brute = nem(s, uid("cinderclaw-brute"));
  const fiend = nem(s, uid("scorch-fiend"));
  const squire = mine(s, uid("dawn-squire"), agent);
  put(s, s.hand, uid("deep-freeze"));
  applyAction(s, { t: "cast", uid: uid("deep-freeze"), target: fiend.uid }, agent);
  assert.ok(fiend.harmless);
  const life = s.library.length;
  s.active = 1;
  s.atk = [brute.uid, fiend.uid];
  brute.tapped = true;
  fiend.tapped = true;
  agent.blocks = [-1, squire.uid];
  s.q = [{ k: T.BLOCKS, u: -1 }, { k: T.AFTER_BLOCKS, u: -1 }, { k: T.DAMAGE, u: -1 }];
  drain(s, agent);
  assert.equal(s.library.length, life - 3, "only the Brute's 3 get through, the Fiend tramples nothing");
  assert.ok(s.mine.includes(squire), "the Squire blocks the Fiend and survives");
  cleanup(s);
  assert.ok(!fiend.harmless, "the effect ends with the turn");
});

test("Return to the Tide, Bend Fate and Rising Tide reorder the Threat deck", () => {
  const { s, uid, agent } = game("W/U", "vorthrax");
  const brute = nem(s, uid("cinderclaw-brute"));
  const imp = nem(s, uid("ash-imp"));
  setOmen(s, uid("searing-breath"));
  const omen = s.omen;
  const n = s.faceDown.length;
  put(s, s.hand, uid("return-to-the-tide"));
  applyAction(s, { t: "cast", uid: uid("return-to-the-tide"), target: brute.uid }, agent);
  assert.equal(s.omen, brute.uid);
  assert.equal(s.faceDown[0], omen);
  assert.equal(s.faceDown.length, n + 1);
  s.mana = ROUND_MANA;
  put(s, s.hand, uid("bend-fate"));
  applyAction(s, { t: "cast", uid: uid("bend-fate"), target: 1 }, agent);
  assert.equal(s.faceDown[s.faceDown.length - 1], brute.uid);
  assert.equal(s.omen, omen);
  s.mana = ROUND_MANA;
  put(s, s.hand, uid("rising-tide"));
  applyAction(s, { t: "cast", uid: uid("rising-tide"), target: -1 }, agent);
  assert.equal(s.omen, imp.uid);
  assert.equal(s.faceDown[0], omen);
  assert.equal(s.nem.length, 0);
});

test("Reanimate, Crypt Lord and Hungry Ghoul", () => {
  const { s, uid, agent } = game("B/G", "vaskara");
  put(s, s.grave, uid("ancient-crashhorn"));
  put(s, s.grave, uid("thicket-bear"));
  put(s, s.hand, uid("reanimate"));
  applyAction(s, { t: "cast", uid: uid("reanimate"), target: uid("ancient-crashhorn") }, agent);
  assert.ok(s.mine.some((p) => p.def.id === "ancient-crashhorn"));
  s.mana = ROUND_MANA;
  put(s, s.hand, uid("crypt-lord"));
  applyAction(s, { t: "cast", uid: uid("crypt-lord"), target: uid("thicket-bear") }, agent);
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

test("Inferno Charger attacks the turn it enters", () => {
  const { s, uid, agent } = game("R/G", "vorthrax");
  setOmen(s, uid("inferno-charger"));
  const life = s.library.length;
  beginNemesisTurn(s);
  drain(s, agent);
  assert.ok(s.nem.some((p) => p.def.id === "inferno-charger" && p.tapped), "it entered and attacked");
  assert.equal(s.library.length, life - 3);
});

test("Brood executes the creatures among the next 2 cards and bottoms the rest", () => {
  const { s, uid, agent } = game("R/G", "vaskara");
  setOmen(s, uid("brood"));
  for (const id of ["ravenous-larva", "pheromones", "mantis-queen"]) take(s, uid(id));
  s.faceDown.unshift(uid("mantis-queen"), uid("pheromones"), uid("ravenous-larva"));
  const n = s.faceDown.length;
  beginNemesisTurn(s);
  s.q = s.q.filter((t) => t.k <= T.REVEAL);
  drain(s, agent);
  assert.deepEqual(s.nem.map((p) => p.def.id), ["mantis-queen"]);
  assert.deepEqual(s.faceDown.slice(-2), [uid("pheromones"), uid("brood")]);
  assert.equal(s.omen, uid("ravenous-larva"));
  assert.equal(s.faceDown.length, n - 1, "the Queen enters and a new Omen is revealed; Pheromones and Brood go back");
});

test("Uprising returns the 2 strongest Ruin creatures, or costs 2 life", () => {
  const { s, uid, agent } = game("R/G", "morwen");
  for (const id of ["rotting-zombie", "deathless-knight", "morwens-ghoul"]) put(s, s.ruin, uid(id));
  setOmen(s, uid("uprising"));
  beginNemesisTurn(s);
  s.q = s.q.filter((t) => t.k <= T.REVEAL);
  drain(s, agent);
  assert.deepEqual(s.nem.map((p) => p.def.id), ["deathless-knight", "morwens-ghoul"]);
  assert.ok(s.ruin.includes(uid("rotting-zombie")));
  const v = game("R/G", "morwen");
  setOmen(v.s, v.uid("uprising"));
  const life = v.s.library.length;
  beginNemesisTurn(v.s);
  v.s.q = v.s.q.filter((t) => t.k <= T.REVEAL);
  drain(v.s, v.agent);
  assert.equal(v.s.nem.length, 0);
  assert.equal(v.s.library.length, life - 2);
});

test("Refraction Golem taxes the first spell of each turn", () => {
  const { s, uid, agent } = game("R/G", "mirror-archmage");
  nem(s, uid("refraction-golem"));
  for (const id of ["kindle", "ember-bolt", "battle-fury", "mossback-boar"]) put(s, s.hand, uid(id));
  assert.ok(!castable(s, uid("mossback-boar"), true), "3 + 1 does not fit in 3 mana");
  applyAction(s, { t: "cast", uid: uid("kindle"), target: FACE }, agent);
  assert.equal(s.mana, ROUND_MANA - 2, "the first spell costs 1 more");
  applyAction(s, { t: "cast", uid: uid("ember-bolt"), target: FACE }, agent);
  assert.equal(s.mana, 0, "the second costs 1");
  beginNemesisTurn(s);
  s.mana = 1;
  assert.ok(!castable(s, uid("battle-fury"), false), "the Nemesis turn has its own first spell");
  s.mana = 2;
  assert.ok(castable(s, uid("battle-fury"), false));
});

test("No hand limit, and decking out", () => {
  const pair = PAIRS[0];
  const s = setup(buildCtx(pair, NEMESIS_LIST[0]), rng(3), rng(4));
  const agent = new Heuristic();
  s.hand.push(...s.library.splice(0, 4));
  endPlayerTurn(s);
  assert.equal(s.hand.length, 8, "the hand keeps all its cards at the end of the turn");
  s.library = s.library.slice(0, 1);
  s.first = false;
  beginPlayerTurn(s, agent);
  assert.equal(s.over, 2);
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
