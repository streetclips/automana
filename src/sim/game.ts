import type { Nemesis } from "../content/types";
import { SearchAgent, type SearchStats } from "./ai/search";
import { NEMESIS_LIST, PAIRS, type Pair } from "./engine/defs";
import { beginNemesisTurn, drain, playerTurn, setup } from "./engine/engine";
import { hash32, rng } from "./engine/rng";
import { MAX_ROUNDS, buildCtx } from "./engine/state";

export interface Config {
  pair: Pair;
  nemesis: Nemesis;
}

export interface GameResult {
  win: boolean;
  timeout: boolean;
  rounds: number;
  life: number;
  nemLife: number;
  stats: SearchStats;
}

export function allConfigs(): Config[] {
  return PAIRS.flatMap((pair) => NEMESIS_LIST.map((nemesis) => ({ pair, nemesis })));
}

export function playGame(cfg: Config, seed: number, game: number, trace: string[] | null = null, explainRound = -1): GameResult {
  const ctx = buildCtx(cfg.pair, cfg.nemesis);
  const pi = PAIRS.indexOf(cfg.pair);
  const ni = NEMESIS_LIST.indexOf(cfg.nemesis);
  const rp = rng(hash32(seed, game, 1, pi));
  const rn = rng(hash32(seed, game, 2, ni));
  const agent = new SearchAgent(hash32(seed, game, 3, pi, ni));
  agent.explainRound = explainRound;
  const s = setup(ctx, rp, rn);
  s.log = trace;
  while (!s.over && s.round < MAX_ROUNDS) {
    playerTurn(s, agent);
    if (s.over) break;
    beginNemesisTurn(s);
    drain(s, agent);
  }
  if (trace && agent.explained.length) trace.push(...agent.explained);
  if (trace) trace.push(s.over === 1 ? `Victory in round ${s.round} with ${s.library.length} life` : s.over === 2 ? `Defeat in round ${s.round} (Nemesis at ${s.faceDown.length})` : "Timeout");
  return {
    win: s.over === 1, timeout: s.over === 0, rounds: s.round, life: s.library.length, nemLife: s.faceDown.length, stats: agent.stats,
  };
}
