import { type Action, PASS } from "../engine/agent";
import { DEFENDER, HASTE } from "../engine/defs";
import {
  applyAction, castable, declareAttack, endPlayerTurn, findMine, findNem, kwOf, manaLeft, nemBlocks, nemesisTurn,
  playerCombatDamage, pw,
} from "../engine/engine";
import { FACE, MAX_CREATURES, type Perm, type State, clone, defOf } from "../engine/state";
import { evaluate } from "./eval";
import type { Heuristic } from "./heuristic";
import type { Rng } from "../engine/rng";
import { type DecisionCtx, publicKey, resample } from "./know";

export type Phase = "main1" | "attack" | "tricks" | "main2";

export interface Step {
  phase: Phase;
  kind: "act" | "combat" | "attack" | "damage" | "end";
  a: Action;
  uids: number[];
  before: number;
}

export interface Plan {
  steps: Step[];
  score: number;
  nodes: number;
  leaves: number;
}

const PRE_TARGETS_BLOCKERS = new Set(["ember-bolt", "kindle", "lethal-whisper", "assassinate", "deep-freeze", "return-to-the-tide", "serene-judgment"]);
const PRE_TARGETS_ATTACKERS = new Set(["battle-fury", "surge-of-vigor", "molten-blade", "wild-strength", "luminous-aegis"]);
const HELD = new Set(["battle-fury", "surge-of-vigor", "luminous-aegis", "shield-formation", "banish-into-light", "deep-freeze"]);
const NEM_TARGETS = new Set(["lethal-whisper", "assassinate", "return-to-the-tide"]);

function sig(p: Perm): string {
  return `${p.def.id}|${+p.tapped}${+p.sick}${+p.pacified}${+p.harmless}${+p.shield}|${p.damage}|${p.tp}|${p.tt}|${p.ap}|${p.at}|${p.akw}|${p.auras.length}`;
}

function distinct(perms: Perm[]): number[] {
  const seen = new Set<string>();
  const out: number[] = [];
  for (const p of perms) {
    const k = sig(p);
    if (!seen.has(k)) { seen.add(k); out.push(p.uid); }
  }
  return out;
}

function distinctCards(s: State, uids: number[]): number[] {
  const seen = new Set<string>();
  const out: number[] = [];
  for (const u of uids) {
    const id = defOf(s, u).id;
    if (!seen.has(id)) { seen.add(id); out.push(u); }
  }
  return out;
}

export function canAttack(p: Perm): boolean {
  const k = kwOf(p);
  return !p.tapped && (!p.sick || (k & HASTE) !== 0) && !(k & DEFENDER) && pw(p) > 0;
}

export class Planner {
  budget = 4000;
  samples = 3;
  private dc!: DecisionCtx;
  private seen = [new Set<number>(), new Set<number>(), new Set<number>()];
  private cache = new Map<number, number>();
  private path: Step[] = [];
  private best: Step[] = [];
  private bestScore = -Infinity;
  private nodes = 0;
  private leaves = 0;
  explain: { score: number; steps: Step[] }[] | null = null;

  constructor(private readonly h: Heuristic, private readonly next: Rng) {}

  plan(root: State, phase: Phase, dc: DecisionCtx): Plan {
    this.dc = dc;
    for (const set of this.seen) set.clear();
    this.cache.clear();
    this.path = [];
    this.best = [];
    this.bestScore = -Infinity;
    this.nodes = 0;
    this.leaves = 0;
    const s = clone(root);
    if (phase === "main1") this.main(s, 1);
    else if (phase === "attack") this.attack(s);
    else if (phase === "tricks") this.tricks(s);
    else this.main(s, 2);
    this.stamp(root);
    return { steps: this.best, score: this.bestScore, nodes: this.nodes, leaves: this.leaves };
  }

  private stamp(root: State): void {
    const c = clone(root);
    for (const st of this.best) {
      st.before = publicKey(c);
      if (c.over) break;
      if (st.kind === "act") applyAction(c, st.a, this.h);
      else if (st.kind === "attack") {
        declareAttack(c, st.uids);
        if (st.uids.length) nemBlocks(c);
      } else if (st.kind === "damage") playerCombatDamage(c, this.h);
    }
  }

  private over(): boolean {
    return this.nodes > this.budget;
  }

  private record(score: number): void {
    let acts = 0;
    for (const st of this.path) if (st.kind === "act") acts++;
    score -= acts * 1e-4;
    if (this.explain) this.explain.push({ score, steps: this.path.map((st) => ({ ...st })) });
    if (score > this.bestScore) {
      this.bestScore = score;
      this.best = this.path.map((st) => ({ ...st }));
    }
  }

  private main(s: State, step: 1 | 2): void {
    if (s.over) { this.record(evaluate(s, this.dc)); return; }
    const key = publicKey(s);
    const seen = this.seen[step === 1 ? 0 : 2];
    if (seen.has(key)) return;
    seen.add(key);
    this.nodes++;
    if (!this.over()) {
      const phase: Phase = step === 1 ? "main1" : "main2";
      for (const a of step === 1 ? this.preCombat(s) : this.postCombat(s)) {
        const c = clone(s);
        applyAction(c, a, this.h);
        this.path.push({ phase, kind: "act", a, uids: [], before: 0 });
        this.main(c, step);
        this.path.pop();
      }
    }
    if (step === 1) this.combat(s);
    else {
      this.path.push({ phase: "main2", kind: "end", a: PASS, uids: [], before: 0 });
      this.leaf(s);
      this.path.pop();
    }
  }

  private combat(s: State): void {
    const eligible = s.mine.filter((p) => canAttack(p));
    const total = 1 << eligible.length;
    for (let mask = 0; mask < total; mask++) {
      if (mask > 0 && this.over()) break;
      this.path.push({ phase: "main1", kind: "combat", a: PASS, uids: [], before: 0 });
      this.declare(s, eligible.filter((_, i) => mask & (1 << i)).map((p) => p.uid));
      this.path.pop();
    }
  }

  private attack(s: State): void {
    const eligible = s.mine.filter((p) => canAttack(p));
    const total = 1 << eligible.length;
    for (let mask = 0; mask < total; mask++) {
      if (mask > 0 && this.over()) break;
      this.declare(s, eligible.filter((_, i) => mask & (1 << i)).map((p) => p.uid));
    }
  }

  private declare(s: State, uids: number[]): void {
    const c = clone(s);
    declareAttack(c, uids);
    this.path.push({ phase: "attack", kind: "attack", a: PASS, uids, before: 0 });
    if (uids.length) {
      nemBlocks(c);
      this.tricks(c);
    } else this.main(c, 2);
    this.path.pop();
  }

  private tricks(s: State): void {
    if (s.over) { this.record(evaluate(s, this.dc)); return; }
    const key = publicKey(s);
    if (this.seen[1].has(key)) return;
    this.seen[1].add(key);
    this.nodes++;
    if (!this.over()) {
      for (const a of this.trickOptions(s)) {
        const c = clone(s);
        applyAction(c, a, this.h);
        this.path.push({ phase: "tricks", kind: "act", a, uids: [], before: 0 });
        this.tricks(c);
        this.path.pop();
      }
    }
    const c = clone(s);
    playerCombatDamage(c, this.h);
    this.path.push({ phase: "tricks", kind: "damage", a: PASS, uids: [], before: 0 });
    this.main(c, 2);
    this.path.pop();
  }

  private leaf(s: State): void {
    this.leaves++;
    const c = clone(s);
    endPlayerTurn(c);
    if (c.over) { this.record(evaluate(c, this.dc)); return; }
    const key = publicKey(c);
    let score = this.cache.get(key);
    if (score === undefined) {
      score = 0;
      for (let k = 0; k < this.samples; k++) {
        const d = k === this.samples - 1 ? c : resample(clone(c), this.next);
        nemesisTurn(d, this.h);
        score += evaluate(d, this.dc);
      }
      score /= this.samples;
      this.cache.set(key, score);
    }
    this.record(score);
  }

  private casts(s: State, main: boolean, targetsFor: (uid: number) => number[]): Action[] {
    const out: Action[] = [];
    const have = manaLeft(s);
    for (const uid of distinctCards(s, s.hand)) {
      if (!castable(s, uid, main, have)) continue;
      for (const target of targetsFor(uid)) out.push({ t: "cast", uid, target });
    }
    return out;
  }

  private combatPossible(s: State): boolean {
    if (s.mine.some((p) => canAttack(p))) return true;
    if (s.mine.length >= MAX_CREATURES) return false;
    const have = manaLeft(s);
    return s.hand.some((u) => defOf(s, u).kind === "creature" && defOf(s, u).kw & HASTE && castable(s, u, true, have));
  }

  private preCombat(s: State): Action[] {
    if (!this.combatPossible(s)) return [];
    const blockers = distinct(s.nem.filter((p) => !p.tapped && !p.pacified));
    const attackers = distinct(s.mine.filter((p) => canAttack(p)));
    const bait = s.counters.length > 0;
    return this.casts(s, true, (uid) => {
      const d = defOf(s, uid);
      if (d.kind === "creature") {
        if (d.kw & HASTE) return [-1];
        if (d.id === "cinder-hound" && blockers.length) return blockers;
        return bait ? this.postTargets(s, uid) : [];
      }
      if (d.id === "serene-judgment") return blockers;
      if (PRE_TARGETS_BLOCKERS.has(d.id)) return blockers;
      if (PRE_TARGETS_ATTACKERS.has(d.id)) return attackers;
      if (d.id === "shield-formation") return attackers.length ? [-1] : [];
      if (d.id === "volcanic-roar" || d.id === "rising-tide") return blockers.length ? [-1] : [];
      return bait ? this.postTargets(s, uid) : [];
    });
  }

  private postTargets(s: State, uid: number): number[] {
    const d = defOf(s, uid);
    const nem = distinct(s.nem);
    const mine = distinct(s.mine);
    if (d.kind === "creature") {
      if (d.id === "cinder-hound") return [...nem, ...mine, uid];
      if (d.id === "crypt-lord") {
        const g = distinctCards(s, s.grave.filter((u) => defOf(s, u).kind === "creature" && defOf(s, u).mv <= 2));
        return g.length ? g : [-1];
      }
      return [-1];
    }
    if (HELD.has(d.id)) return [];
    switch (d.id) {
      case "molten-blade":
      case "wild-strength":
        return mine;
      case "serene-judgment":
        return distinct(s.nem.filter((p) => !p.pacified));
      case "ember-bolt":
      case "kindle":
        return [...nem, FACE];
      case "reanimate":
        return distinctCards(s, s.grave.filter((u) => defOf(s, u).kind === "creature"));
      case "bend-fate":
        return s.omen >= 0 ? [1] : [];
      case "rising-tide":
      case "volcanic-roar":
        return nem.length ? [-1] : [];
      default:
        return NEM_TARGETS.has(d.id) ? nem : [-1];
    }
  }

  private postCombat(s: State): Action[] {
    return this.casts(s, true, (uid) => this.postTargets(s, uid));
  }

  private trickOptions(s: State): Action[] {
    const attackers: Perm[] = [];
    const blocked: Perm[] = [];
    const blockers: Perm[] = [];
    s.atk.forEach((u, i) => {
      const a = findMine(s, u);
      if (!a) return;
      attackers.push(a);
      const b = s.blk[i] >= 0 ? findNem(s, s.blk[i]) : undefined;
      if (b) { blocked.push(a); blockers.push(b); }
    });
    const atk = distinct(attackers);
    const blk = distinct(blockers);
    const prot = distinct(blocked);
    return this.casts(s, false, (uid) => {
      switch (defOf(s, uid).id) {
        case "battle-fury":
        case "surge-of-vigor":
          return atk;
        case "luminous-aegis":
          return prot;
        case "shield-formation":
          return atk.length ? [-1] : [];
        case "ember-bolt":
        case "lethal-whisper":
        case "assassinate":
        case "return-to-the-tide":
        case "deep-freeze":
          return blk;
        default:
          return [];
      }
    });
  }
}
