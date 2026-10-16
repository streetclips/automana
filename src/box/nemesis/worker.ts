import { parentPort } from 'node:worker_threads';
import { playerDecks } from './decks';
import { playNemesisGame } from './game';
import { addResult, emptyTally } from './stats';
import { ALL_NEMESES as NEMESES } from './all';

export interface Job {
  deck: number;
  nemesis: number;
  start: number;
  end: number;
  seed: number;
}

export function gameSeed(job: Pick<Job, 'deck' | 'nemesis' | 'seed'>, game: number): number {
  return (job.seed * 1_000_003 + job.deck * 7_919 + job.nemesis * 104_729 + game * 15_485_863) >>> 0;
}

const decks = playerDecks();

parentPort?.on('message', (job: Job | null) => {
  if (!job) process.exit(0);
  const tally = emptyTally();
  const deck = decks[job.deck];
  const nemesis = NEMESES[job.nemesis];
  if (!deck || !nemesis) throw new Error(`unknown job ${JSON.stringify(job)}`);
  for (let game = job.start; game < job.end; game++) {
    const started = performance.now();
    addResult(tally, playNemesisGame(gameSeed(job, game), deck.cards, nemesis), performance.now() - started);
  }
  parentPort?.postMessage({ job, tally });
});
