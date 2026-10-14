import { chooseAction } from './ai';
import { PAIRS, applyAction, checkInvariants, createGame, describeState, nextRandom, type GameState } from './engine';

const games = Number(process.argv[2] ?? 450);
const firstSeed = Number(process.argv[3] ?? 1);
const MAX_ACTIONS = 5000;

function pairFor(seed: number, seat: number): string {
  const [value] = nextRandom(seed * 7919 + seat * 104729);
  const pair = PAIRS[Math.floor(value * PAIRS.length)] as readonly [string, string];
  return `${pair[0]}+${pair[1]}`;
}

const started = performance.now();
let wins = 0;
let draws = 0;
let turns = 0;
const failures: string[] = [];
for (let seed = firstSeed; seed < firstSeed + games; seed++) {
  const decks = [pairFor(seed, 0), pairFor(seed, 1)] as const;
  let s: GameState = createGame({ seed, players: [{ deck: decks[0] }, { deck: decks[1] }] });
  let actions = 0;
  try {
    while (s.pending && s.pending.kind !== 'gameOver') {
      if (++actions > MAX_ACTIONS) throw new Error('game did not finish');
      s = applyAction(s, chooseAction(s, s.pending.player));
      const problems = checkInvariants(s);
      if (problems.length > 0) throw new Error(problems.join('; '));
    }
  } catch (error) {
    failures.push(`seed ${seed} (${decks.join(' vs ')}): ${(error as Error).message}\n${describeState(s, 0, true)}`);
    continue;
  }
  if (s.pending?.kind === 'gameOver') {
    if (s.pending.winner === 0) wins++;
    if (s.pending.winner === null) draws++;
  }
  turns += s.turn;
}
const ms = performance.now() - started;
const played = games - failures.length;
console.log(
  `${games} games: ${failures.length} errors, p0 won ${wins}, ${draws} draws, ${(turns / Math.max(1, played)).toFixed(1)} turns, ${(ms / games).toFixed(0)} ms/game`,
);
for (const failure of failures.slice(0, 5)) console.log(`\n${failure}`);
if (failures.length > 0) process.exitCode = 1;
