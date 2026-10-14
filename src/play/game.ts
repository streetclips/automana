import { NEMESIS_LIST, PAIRS } from "../sim/engine/defs";
import { beginNemesisTurn, drain, playerTurn, setup } from "../sim/engine/engine";
import { hash32, rng } from "../sim/engine/rng";
import { MAX_ROUNDS, type State, buildCtx, clone } from "../sim/engine/state";
import { type Answer, type Ask, Pending, ReplayAgent } from "./agent";

export interface GameSpec {
  pair: string;
  nemesis: string;
  seed: number;
  decisions: Answer[];
}

export interface Frame {
  at: number;
  s: State;
}

export interface Snapshot {
  s: State;
  ask: Ask | null;
  decisions: Answer[];
  mark: number;
  dropped: number;
  base: State | null;
  frames: Frame[];
}

export function replay(spec: GameSpec): Snapshot {
  const pair = PAIRS.find((p) => p.key === spec.pair);
  const nemesis = NEMESIS_LIST.find((n) => n.id === spec.nemesis);
  if (!pair || !nemesis) throw new Error(`Unknown game: ${spec.pair} vs ${spec.nemesis}`);
  const rp = rng(hash32(spec.seed, 1));
  const rn = rng(hash32(spec.seed, 2));
  const s = setup(buildCtx(pair, nemesis), rp, rn);
  const agent = new ReplayAgent(spec.decisions.slice());
  const frames: Frame[] = [];
  const lines: string[] = [];
  lines.push = (...items: string[]): number => {
    for (const line of items) {
      Array.prototype.push.call(lines, line);
      if (agent.pos === agent.decisions.length) frames.push({ at: lines.length - 1, s: clone(s) });
    }
    return lines.length;
  };
  s.log = lines;
  let ask: Ask | null = null;
  try {
    while (!s.over && s.round < MAX_ROUNDS) {
      playerTurn(s, agent);
      if (s.over) break;
      beginNemesisTurn(s);
      drain(s, agent);
    }
  } catch (err) {
    if (!(err instanceof Pending)) throw err;
    ask = err.ask;
  }
  return { s, ask, decisions: agent.decisions, mark: agent.mark, dropped: agent.dropped, base: agent.base, frames };
}
