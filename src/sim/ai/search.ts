import { type Action, type Agent, PASS } from "../engine/agent";
import {
  applyAction, canBlock, castable, drain, findNem, manaLeft, nemAttackers, targets, windowTask,
} from "../engine/engine";
import { type Rng, rng } from "../engine/rng";
import { type Perm, type State, type Window, clone, defOf } from "../engine/state";
import { evaluate } from "./eval";
import { Heuristic } from "./heuristic";
import { type DecisionCtx, determinize, publicKey, unknownSet } from "./know";
import { type Phase, Planner, type Step } from "./planner";
import { avgThreat, cardValue } from "./values";

const PUMPS = new Set(["battle-fury", "surge-of-vigor", "luminous-aegis"]);
const ANYTIME = new Set(["ember-bolt", "lethal-whisper", "assassinate", "return-to-the-tide"]);

function describe(s: State, a: Action): string {
  switch (a.t) {
    case "cast": return `${defOf(s, a.uid).name}${a.target === -2 ? "→face" : a.target >= 0 && defOf(s, a.uid).id !== "bend-fate" ? `→${defOf(s, a.target).name}` : ""}`;
    default: return a.t;
  }
}

export interface SearchStats {
  plans: number;
  nodes: number;
  leaves: number;
  responses: number;
  blocks: number;
}

export class SearchAgent implements Agent {
  readonly h = new Heuristic();
  readonly stats: SearchStats = { plans: 0, nodes: 0, leaves: 0, responses: 0, blocks: 0 };
  private readonly next: Rng;
  private readonly planner: Planner;
  samples = 3;
  private steps: Step[] = [];
  private pos = 0;

  constructor(seed: number) {
    this.next = rng(seed);
    this.planner = new Planner(this.h, this.next);
  }

  private ctx(s: State): DecisionCtx {
    const unknown = unknownSet(s);
    const eff = s.library.length - 1;
    let total = 0;
    let n = 0;
    for (const uid of s.library) {
      if (!unknown[uid]) continue;
      total += cardValue(s, defOf(s, uid), eff, 1.5);
      n++;
    }
    return { unknown, avgCard: n ? total / n : 1.5, avgThreat: avgThreat(s, unknown) };
  }

  explainRound = -1;
  explained: string[] = [];

  private replan(s: State, phase: Phase): void {
    const explain = s.round === this.explainRound;
    this.planner.explain = explain ? [] : null;
    const plan = this.planner.plan(determinize(s, this.next), phase, this.ctx(s));
    if (explain && this.planner.explain) {
      const fmt = (st: Step): string => st.kind === "act" ? describe(s, st.a) : st.kind === "attack" ? `attack[${st.uids.map((u) => defOf(s, u).name).join(",")}]` : st.kind;
      const seen = new Set<string>();
      const lines = this.planner.explain
        .sort((a, b) => b.score - a.score)
        .map((e) => `${e.score.toFixed(2).padStart(8)}  ${e.steps.map(fmt).filter((x) => x !== "combat" && x !== "end" && x !== "damage").join(" → ") || "(nothing)"}`)
        .filter((l) => !seen.has(l.slice(10)) && seen.add(l.slice(10)));
      this.explained.push(`--- R${s.round} plan from ${phase}: ${plan.nodes} nodes, ${plan.leaves} leaves`, ...lines.slice(0, 25));
    }
    this.stats.plans++;
    this.stats.nodes += plan.nodes;
    this.stats.leaves += plan.leaves;
    this.steps = plan.steps;
    this.pos = 0;
  }

  private step(s: State, phase: Phase): Step {
    let st = this.steps[this.pos];
    if (!st || st.phase !== phase || st.before !== publicKey(s)) {
      this.replan(s, phase);
      st = this.steps[this.pos];
    }
    if (!st || st.phase !== phase) throw new Error(`Planner returned no ${phase} step`);
    this.pos++;
    return st;
  }

  main(s: State, step: 1 | 2): Action {
    const st = this.step(s, step === 1 ? "main1" : "main2");
    return st.kind === "act" ? st.a : PASS;
  }

  attack(s: State): number[] {
    return this.step(s, "attack").uids;
  }

  trick(s: State): Action {
    const st = this.step(s, "tricks");
    return st.kind === "act" ? st.a : PASS;
  }

  private responseOptions(s: State, w: Window): Action[] {
    const out: Action[] = [];
    if (w === "end" && s.mine.some((p) => p.def.id === "learned-archivist" && !p.tapped && !p.sick)) out.push({ t: "archivist" });
    const have = manaLeft(s);
    const seen = new Set<string>();
    for (const uid of s.hand) {
      const d = defOf(s, uid);
      if (d.kind !== "instant" || seen.has(d.id)) continue;
      seen.add(d.id);
      if (!castable(s, uid, false, have)) continue;
      let list = targets(s, uid);
      if (PUMPS.has(d.id)) list = list.filter((t) => s.mine.some((p) => p.uid === t));
      else if (d.id === "bend-fate") list = w === "start" ? list.filter((t) => t === 1) : w === "end" ? list : [];
      else if (d.id === "shield-formation") list = s.mine.length && (w === "spell" || w === "blocks" || w === "pre") ? [-1] : [];
      else if (d.id === "banish-into-light") list = w === "blocks" ? list : [];
      else if (d.id === "deep-freeze") list = w === "blocks" ? list.filter((t) => s.atk.includes(t)) : w === "pre" ? list.filter((t) => nemAttackers(s).includes(t)) : [];
      else if (!ANYTIME.has(d.id)) list = [];
      const uniq = new Set<string>();
      for (const t of list) {
        const p = t >= 0 ? findNem(s, t) ?? s.mine.find((m) => m.uid === t) : undefined;
        const k = p ? `${p.def.id}|${p.damage}|${p.tapped}|${p.tp}|${p.tt}|${p.auras.length}|${s.atk.includes(t)}` : String(t);
        if (uniq.has(k)) continue;
        uniq.add(k);
        out.push({ t: "cast", uid, target: t });
      }
    }
    return out;
  }

  private finish(dets: State[], a: Action | null, task: number, dc: DecisionCtx): number {
    let total = 0;
    for (const det of dets) {
      const c = clone(det);
      if (a) {
        applyAction(c, a, this.h);
        if (!c.over && task) c.q.unshift({ k: task, u: -1 });
      }
      drain(c, this.h);
      total += evaluate(c, dc);
    }
    return total / dets.length;
  }

  private dets(s: State): State[] {
    return Array.from({ length: this.samples }, () => determinize(s, this.next));
  }

  respond(s: State, w: Window): Action {
    if (s.active === 0) return this.h.respond(s, w);
    const options = this.responseOptions(s, w);
    if (!options.length) return PASS;
    this.stats.responses++;
    const dets = this.dets(s);
    const dc = this.ctx(s);
    const task = windowTask(w);
    let best: Action = PASS;
    let bestV = this.finish(dets, null, task, dc);
    for (const a of options) {
      const v = this.finish(dets, a, task, dc);
      if (v > bestV + 1e-6) { bestV = v; best = a; }
    }
    return best;
  }

  block(s: State): number[] {
    const atk = s.atk.map((u) => findNem(s, u));
    const free = s.mine.filter((p) => !p.tapped);
    const none = atk.map(() => -1);
    if (!free.length || !atk.some(Boolean)) return none;
    this.stats.blocks++;
    const dets = this.dets(s);
    const dc = this.ctx(s);
    let best = none;
    let bestV = -Infinity;
    const cur = none.slice();
    const used = new Set<Perm>();
    const visit = (i: number): void => {
      if (i === atk.length) {
        let v = 0;
        for (const det of dets) {
          const c = clone(det);
          c.blk = cur.slice();
          drain(c, this.h);
          v += evaluate(c, dc);
        }
        if (v > bestV) { bestV = v; best = cur.slice(); }
        return;
      }
      cur[i] = -1;
      visit(i + 1);
      const a = atk[i];
      if (!a) return;
      const tried = new Set<string>();
      for (const b of free) {
        if (used.has(b) || !canBlock(b, a)) continue;
        const k = `${b.def.id}|${b.damage}|${b.tp}|${b.tt}|${b.ap}|${b.at}|${b.shield}`;
        if (tried.has(k)) continue;
        tried.add(k);
        used.add(b);
        cur[i] = b.uid;
        visit(i + 1);
        used.delete(b);
      }
      cur[i] = -1;
    };
    visit(0);
    return best;
  }

  scry(s: State, cards: number[]): number[] {
    return this.h.scry(s, cards);
  }

  ghoul(s: State): number {
    return this.h.ghoul(s);
  }

  prayer(s: State, cards: number[]): number {
    return this.h.prayer(s, cards);
  }

  cryptLord(s: State, options: number[]): number {
    return this.h.cryptLord(s, options);
  }

  hound(s: State): number {
    return this.h.hound(s);
  }

  tideOrder(s: State, uids: number[]): number[] {
    return this.h.tideOrder(s, uids);
  }
}

