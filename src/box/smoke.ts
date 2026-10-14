import { chooseAction } from './ai';
import { applyAction, checkInvariants, createGame } from './engine';

const games = Number(process.argv[2] ?? 20);
const started = performance.now();
let wins = 0;
let turns = 0;
for (let seed = 1; seed <= games; seed++) {
  let s = createGame({ seed, players: [{ deck: 'emberwild' }, { deck: 'duskmire' }] });
  while (s.pending && s.pending.kind !== 'gameOver') {
    s = applyAction(s, chooseAction(s, s.pending.player));
    const problems = checkInvariants(s);
    if (problems.length > 0) throw new Error(problems.join('; '));
  }
  if (s.pending?.kind === 'gameOver' && s.pending.winner === 0) wins++;
  turns += s.turn;
}
const ms = performance.now() - started;
console.log(`${games} games, p0 won ${wins}, ${(turns / games).toFixed(1)} turns, ${(ms / games).toFixed(0)} ms/game`);
