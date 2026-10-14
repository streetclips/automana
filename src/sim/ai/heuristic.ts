import { type Action, type Agent, PASS } from "../engine/agent";
import { TRAMPLE } from "../engine/defs";
import {
  ARCHIVIST, applyAction, canBlock, castable, findMine, findNem, kills, kwOf, lethalFor, nemAttackers, pw,
  sources, stepTask, targets,
} from "../engine/engine";
import { FACE, type Perm, type State, T, type Window, clone, defOf } from "../engine/state";
import { WIN } from "./eval";
import {
  W, creatureValue, handValue, lifeGain, lifeScore, manaCtx, mineValue, nemScore, nemValue, omenThreat,
} from "./values";

const AVG = 2.0;

export function quickScore(s: State): number {
  if (s.over === 1) return WIN;
  if (s.over === 2) return -WIN;
  const eff = s.library.length - 1;
  let v = lifeScore(eff) - nemScore(s.faceDown.length);
  for (const p of s.mine) v += mineValue(s, p);
  for (const p of s.nem) v -= nemValue(p);
  const m = manaCtx(s);
  for (const uid of s.hand) v += handValue(s, uid, eff, AVG, m);
  return v;
}

function hasCard(s: State, id: string): number {
  for (const uid of s.hand) if (defOf(s, uid).id === id) return uid;
  return -1;
}

export class Heuristic implements Agent {
  private quiet = 0;

  mulligan(): boolean {
    return false;
  }

  mulliganDiscard(s: State): number {
    return this.discard(s, 1)[0];
  }

  main(): Action {
    return PASS;
  }

  attack(): number[] {
    return [];
  }

  trick(): Action {
    return PASS;
  }

  private instant(s: State, uid: number, target: number): Action | null {
    if (s.counters.length) return null;
    if (!castable(s, uid, false)) return null;
    if (!targets(s, uid).includes(target)) return null;
    return { t: "cast", uid, target };
  }

  private lethal(s: State): Action | null {
    const bolts = s.hand.filter((u) => defOf(s, u).id === "ember-bolt");
    if (!bolts.length || s.counters.length) return null;
    const usable = Math.min(bolts.length, sources(s)[3]);
    if (usable && usable * 3 >= s.faceDown.length) return this.instant(s, bolts[0], FACE);
    return null;
  }

  respond(s: State, w: Window): Action {
    if (this.quiet || s.over) return PASS;
    const lethal = this.lethal(s);
    if (lethal) return lethal;
    switch (w) {
      case "start":
        return this.bendFate(s) ?? PASS;
      case "spell":
        return this.best(s, this.spellOptions(s), T.RESOLVE) ?? PASS;
      case "pre":
        return this.freeze(s) ?? PASS;
      case "blocks":
        return this.best(s, this.combatOptions(s), T.DAMAGE) ?? PASS;
      case "end": {
        const p = s.mine.find((m) => m.def.id === ARCHIVIST && !m.tapped && !m.sick);
        return p ? { t: "archivist" } : PASS;
      }
      default:
        return PASS;
    }
  }

  private bendFate(s: State): Action | null {
    const uid = hasCard(s, "bend-fate");
    if (uid < 0 || s.omen < 0) return null;
    let total = 0;
    let n = 0;
    for (const u of s.faceDown) if (!s.known[u]) { total += omenThreat(s, u); n++; }
    if (!n || omenThreat(s, s.omen) - total / n < W.bendMargin) return null;
    return this.instant(s, uid, 1);
  }

  private freeze(s: State): Action | null {
    const uid = hasCard(s, "deep-freeze");
    if (uid < 0) return null;
    const attackers = nemAttackers(s).map((u) => findNem(s, u)!);
    if (!attackers.length) return null;
    attackers.sort((a, b) => nemValue(b) - nemValue(a));
    const top = attackers[0];
    const incoming = attackers.reduce((n, p) => n + Math.max(0, pw(p)), 0);
    if (nemValue(top) < W.freezeMin && s.library.length - 1 - incoming > 3) return null;
    return this.instant(s, uid, top.uid);
  }

  private spellOptions(s: State): Action[] {
    const out: Action[] = [];
    const d = s.pend >= 0 ? defOf(s, s.pend) : null;
    if (!d) return out;
    const mass = d.id === "rain-of-cinders" || d.id === "insect-plague" || d.id === "plague";
    const targeted = d.id === "searing-breath" || d.id === "withering-touch";
    if (!mass && !targeted) return out;
    const victims = targeted ? s.mine.filter((p) => p.uid === s.pendTarget) : s.mine;
    for (const uid of new Set(s.hand)) {
      const id = defOf(s, uid).id;
      if (id === "surge-of-vigor" || (id === "luminous-aegis" && d.id !== "withering-touch" && d.id !== "plague")) {
        for (const p of victims) {
          const a = this.instant(s, uid, p.uid);
          if (a) out.push(a);
        }
      } else if (id === "shield-formation" && s.mine.length) {
        const a = this.instant(s, uid, -1);
        if (a) out.push(a);
      }
    }
    return out;
  }

  private combatOptions(s: State): Action[] {
    const out: Action[] = [];
    const attackers = s.atk.filter((u) => findNem(s, u));
    const blockers = s.blk.filter((u) => u >= 0 && findMine(s, u));
    const seen = new Set<string>();
    for (const uid of s.hand) {
      const id = defOf(s, uid).id;
      if (seen.has(id)) continue;
      seen.add(id);
      let list: number[] = [];
      if (id === "banish-into-light" || id === "ember-bolt" || id === "lethal-whisper" || id === "assassinate" || id === "return-to-the-tide") list = attackers;
      else if (id === "surge-of-vigor" || id === "battle-fury" || id === "luminous-aegis") list = blockers;
      else if (id === "shield-formation" && blockers.length) list = [-1];
      for (const t of list) {
        const a = this.instant(s, uid, t);
        if (a) out.push(a);
      }
    }
    return out;
  }

  private best(s: State, options: Action[], until: number): Action | null {
    if (!options.length) return null;
    this.quiet++;
    try {
      const base = this.outcome(s, null, until);
      let best: Action | null = null;
      let bestScore = base + 0.3;
      for (const a of options) {
        const v = this.outcome(s, a, until);
        if (v > bestScore) { bestScore = v; best = a; }
      }
      return best;
    } finally {
      this.quiet--;
    }
  }

  private outcome(s: State, a: Action | null, until: number): number {
    const c = clone(s);
    if (a) applyAction(c, a, this);
    while (c.q.length && !c.over) {
      const t = c.q[0];
      stepTask(c, this);
      if (t.k === until) break;
    }
    return quickScore(c);
  }

  block(s: State): number[] {
    const atk = s.atk.map((u) => findNem(s, u));
    const res = atk.map(() => -1);
    const free = s.mine.filter((p) => !p.tapped);
    if (!free.length) return res;
    const used = new Set<Perm>();
    const eff = s.library.length - 1;
    const order = atk.map((_, i) => i).filter((i) => atk[i]).sort((x, y) => pw(atk[y]!) - pw(atk[x]!));
    const assign = (i: number, ok: (b: Perm, a: Perm) => boolean): void => {
      const a = atk[i]!;
      let pick: Perm | null = null;
      for (const b of free) {
        if (used.has(b) || !canBlock(b, a) || !ok(b, a)) continue;
        if (!pick || mineValue(s, b) < mineValue(s, pick)) pick = b;
      }
      if (pick) { res[i] = pick.uid; used.add(pick); }
    };
    for (const i of order) assign(i, (b, a) => kills(b, a) && !kills(a, b));
    for (const i of order) if (res[i] < 0) assign(i, (b, a) => !kills(a, b));
    for (const i of order) if (res[i] < 0) assign(i, (b, a) => kills(b, a) && mineValue(s, b) <= nemValue(a) * W.tradeRatio);
    const incoming = (): number => {
      let d = 0;
      order.forEach((i) => {
        const a = atk[i]!;
        const p = Math.max(0, pw(a));
        if (res[i] < 0) d += p;
        else if (kwOf(a) & TRAMPLE) d += Math.max(0, p - lethalFor(a, findMine(s, res[i])!));
      });
      return d;
    };
    while (incoming() >= eff - W.chumpMargin) {
      const i = order.find((k) => res[k] < 0 && free.some((b) => !used.has(b) && canBlock(b, atk[k]!)));
      if (i === undefined) break;
      assign(i, () => true);
      if (res[i] < 0) break;
    }
    return res;
  }

  scry(s: State, cards: number[]): number[] {
    const eff = s.library.length - 1;
    const m = manaCtx(s);
    const rest = s.library.filter((u) => !cards.includes(u));
    let avg = AVG;
    if (rest.length) avg = rest.reduce((n, u) => n + handValue(s, u, eff, AVG, m), 0) / rest.length;
    return cards
      .map((u) => ({ u, v: handValue(s, u, eff, AVG, m) }))
      .filter((x) => x.v >= avg)
      .sort((a, b) => b.v - a.v)
      .map((x) => x.u);
  }

  ghoul(s: State): number {
    return this.bestOf(s, s.grave);
  }

  prayer(s: State, cards: number[]): number {
    const best = this.bestOf(s, cards);
    const eff = s.library.length - 1;
    return best >= 0 && handValue(s, best, eff, AVG) > lifeGain(eff + 2, 1) ? best : -1;
  }

  private bestOf(s: State, uids: number[]): number {
    const eff = s.library.length - 1;
    const m = manaCtx(s);
    let best = -1;
    let bestV = -Infinity;
    for (const u of uids) {
      const v = handValue(s, u, eff, AVG, m);
      if (v > bestV) { bestV = v; best = u; }
    }
    return best;
  }

  discard(s: State, n: number): number[] {
    const eff = s.library.length - 1;
    const m = manaCtx(s);
    return s.hand
      .map((u) => ({ u, v: handValue(s, u, eff, AVG, m) }))
      .sort((a, b) => a.v - b.v)
      .slice(0, n)
      .map((x) => x.u);
  }

  cryptLord(s: State, options: number[]): number {
    let best = -1;
    let bestV = -Infinity;
    for (const u of options) {
      const d = defOf(s, u);
      const v = creatureValue(s, d.power, d.toughness, d.kw, d.id);
      if (v > bestV) { bestV = v; best = u; }
    }
    return best;
  }

  hound(s: State): number {
    let best = -1;
    let bestV = -Infinity;
    for (const p of s.nem) {
      const v = (p.def.toughness + p.tt - p.damage <= 1 ? 100 : 0) + nemValue(p);
      if (v > bestV) { bestV = v; best = p.uid; }
    }
    if (best >= 0) return best;
    for (const p of s.mine) {
      const v = (p.def.toughness + p.at + p.tt - p.damage > 1 ? 100 : 0) - mineValue(s, p);
      if (v > bestV) { bestV = v; best = p.uid; }
    }
    return best;
  }

  tideOrder(s: State, uids: number[]): number[] {
    return uids.slice().sort((a, b) => nemValue(findNem(s, a)!) - nemValue(findNem(s, b)!));
  }
}
