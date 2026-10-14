import type { GameResult } from './game';

export interface Tally {
  games: number;
  wins: number;
  draws: number;
  errors: number;
  rounds: number;
  roundsInWins: number;
  lifeInWins: number;
  nemesisLifeInLosses: number;
  mulligans: number;
  overflows: number;
  ms: number;
  firstError?: string;
}

export function emptyTally(): Tally {
  return {
    games: 0,
    wins: 0,
    draws: 0,
    errors: 0,
    rounds: 0,
    roundsInWins: 0,
    lifeInWins: 0,
    nemesisLifeInLosses: 0,
    mulligans: 0,
    overflows: 0,
    ms: 0,
  };
}

export function addResult(t: Tally, r: GameResult, ms: number): void {
  t.games += 1;
  t.ms += ms;
  t.mulligans += r.mulligans;
  t.overflows += r.overflows;
  if (r.error) {
    t.errors += 1;
    t.firstError ??= r.error;
    return;
  }
  t.rounds += r.rounds;
  if (r.draw) t.draws += 1;
  else if (r.won) {
    t.wins += 1;
    t.roundsInWins += r.rounds;
    t.lifeInWins += r.playerLife;
  } else t.nemesisLifeInLosses += r.nemesisLife;
}

export function merge(into: Tally, from: Tally): void {
  into.games += from.games;
  into.wins += from.wins;
  into.draws += from.draws;
  into.errors += from.errors;
  into.rounds += from.rounds;
  into.roundsInWins += from.roundsInWins;
  into.lifeInWins += from.lifeInWins;
  into.nemesisLifeInLosses += from.nemesisLifeInLosses;
  into.mulligans += from.mulligans;
  into.overflows += from.overflows;
  into.ms += from.ms;
  into.firstError ??= from.firstError;
}
