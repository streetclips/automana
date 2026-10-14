import type { GameResult } from "../game";

export interface Tally {
  games: number;
  wins: number;
  timeouts: number;
  rounds: number;
  winRounds: number;
  lifeOnWin: number;
  nemLifeOnLoss: number;
  mulligans: number;
  ms: number;
}

export function emptyTally(): Tally {
  return { games: 0, wins: 0, timeouts: 0, rounds: 0, winRounds: 0, lifeOnWin: 0, nemLifeOnLoss: 0, mulligans: 0, ms: 0 };
}

export function addResult(t: Tally, r: GameResult, ms: number): void {
  t.games++;
  t.rounds += r.rounds;
  t.ms += ms;
  if (r.win) { t.wins++; t.winRounds += r.rounds; t.lifeOnWin += r.life; }
  else t.nemLifeOnLoss += r.nemLife;
  if (r.timeout) t.timeouts++;
  if (r.mulligan) t.mulligans++;
}

export function merge(into: Tally, from: Tally): void {
  for (const k of Object.keys(into) as (keyof Tally)[]) into[k] += from[k];
}
