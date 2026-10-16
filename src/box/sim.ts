import { writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { DIST, ensureDir } from '../lib/paths';
import { playerDecks } from './nemesis/decks';
import { Pool } from './nemesis/pool';
import { emptyTally, merge, type Tally } from './nemesis/stats';
import { ALL_NEMESES as NEMESES } from './nemesis/all';
import type { Job } from './nemesis/worker';

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i] ?? '';
  if (!arg.startsWith('--')) continue;
  const next = process.argv[i + 1];
  args.set(arg.slice(2), next && !next.startsWith('--') ? (i++, next) : '1');
}

const games = Number(args.get('games') ?? 100);
const seed = Number(args.get('seed') ?? 1);
const workers = Math.max(1, Number(args.get('workers') ?? availableParallelism()));
const chunk = Math.max(1, Number(args.get('chunk') ?? 10));
const deckFilter = args.get('decks')?.split(',');
const nemesisFilter = args.get('nemeses')?.split(',');

const decks = playerDecks()
  .map((deck, index) => ({ deck, index }))
  .filter(({ deck }) => !deckFilter || deckFilter.includes(deck.key));
const nemeses = NEMESES.map((nemesis, index) => ({ nemesis, index })).filter(
  ({ nemesis }) => !nemesisFilter || nemesisFilter.includes(nemesis.id),
);
if (decks.length === 0 || nemeses.length === 0 || !Number.isFinite(games) || games < 1) {
  console.error(
    `Usage: npm run box -- [--games 100] [--seed 1] [--workers N] [--decks ${playerDecks()
      .slice(0, 2)
      .map((deck) => deck.key)
      .join(',')}] [--nemeses ${NEMESES.map((nemesis) => nemesis.id).join(',')}]`,
  );
  process.exit(1);
}

const key = (deck: number, nemesis: number): string => `${deck}:${nemesis}`;
const tallies = new Map<string, Tally>();
const jobs: Job[] = [];
for (const { index: deck } of decks) {
  for (const { index: nemesis } of nemeses) {
    tallies.set(key(deck, nemesis), emptyTally());
    for (let start = 0; start < games; start += chunk) {
      jobs.push({ deck, nemesis, start, end: Math.min(games, start + chunk), seed });
    }
  }
}

const total = games * decks.length * nemeses.length;
const started = performance.now();
let done = 0;
let shown = 0;
const pool = new Pool(Math.min(workers, jobs.length));
await pool.run(jobs, (job, tally) => {
  merge(tallies.get(key(job.deck, job.nemesis)) as Tally, tally);
  done += tally.games;
  const now = performance.now();
  if (process.stderr.isTTY && (now - shown > 1000 || done === total)) {
    shown = now;
    process.stderr.write(`\r${done} / ${total} games · ${((now - started) / 1000).toFixed(0)}s   `);
  }
});
pool.close();
if (process.stderr.isTTY) process.stderr.write('\n');
const seconds = (performance.now() - started) / 1000;

const pct = (part: number, whole: number): string => (whole ? `${((100 * part) / whole).toFixed(1)}%` : '—');
const avg = (sum: number, count: number): string => (count ? (sum / count).toFixed(1) : '—');
const sumOf = (list: Tally[]): Tally => list.reduce((acc, tally) => (merge(acc, tally), acc), emptyTally());
const rowTallies = (deck: number): Tally[] => nemeses.map(({ index }) => tallies.get(key(deck, index)) as Tally);
const columnTallies = (nemesis: number): Tally[] => decks.map(({ index }) => tallies.get(key(index, nemesis)) as Tally);
const everything = sumOf([...tallies.values()]);
const margin = (1.96 * Math.sqrt(0.25 / games) * 100).toFixed(1);

const lines: string[] = [];
lines.push('# Palmwalker Nemeses against Magic decks', '');
lines.push(
  `seed ${seed} · ${games} games per deck and Nemesis · ${decks.length} decks × ${nemeses.length} Nemeses · ${total} games · ${Math.min(workers, jobs.length)} workers · ${seconds.toFixed(0)} s · ${(total / seconds).toFixed(0)} games/s`,
  '',
);
lines.push(`## Player win rate (95% margin per cell ≤ ±${margin} pp)`, '');
lines.push(`| Deck | ${nemeses.map(({ nemesis }) => nemesis.name).join(' | ')} | All |`);
lines.push(`|---|${nemeses.map(() => '---:').join('|')}|---:|`);
for (const { deck, index } of decks) {
  const row = rowTallies(index);
  const all = sumOf(row);
  lines.push(`| ${deck.key} | ${row.map((t) => pct(t.wins, t.games - t.errors)).join(' | ')} | ${pct(all.wins, all.games - all.errors)} |`);
}
const columns = nemeses.map(({ index }) => sumOf(columnTallies(index)));
lines.push(
  `| All decks | ${columns.map((t) => pct(t.wins, t.games - t.errors)).join(' | ')} | ${pct(everything.wins, everything.games - everything.errors)} |`,
  '',
);
lines.push('## Game metrics by Nemesis', '');
lines.push(
  '| Nemesis | Win rate | Rounds | Rounds (wins) | Player life (wins) | Nemesis life (losses) | Mulligans / game | Draws | Errors |',
);
lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
const metrics = (name: string, t: Tally): string => {
  const valid = t.games - t.errors;
  const losses = valid - t.wins - t.draws;
  return `| ${name} | ${pct(t.wins, valid)} | ${avg(t.rounds, valid)} | ${avg(t.roundsInWins, t.wins)} | ${avg(t.lifeInWins, t.wins)} | ${avg(t.nemesisLifeInLosses, losses)} | ${(t.mulligans / Math.max(1, t.games)).toFixed(2)} | ${t.draws} | ${t.errors} |`;
};
nemeses.forEach(({ nemesis }, i) => lines.push(metrics(nemesis.name, columns[i] as Tally)));
lines.push(metrics('All', everything));
const errors = [...tallies.values()].map((t) => t.firstError).filter(Boolean);
if (errors.length > 0) lines.push('', `First error: ${errors[0]}`);

const markdown = lines.join('\n');
console.log(markdown);
const dir = ensureDir(join(DIST, 'box'));
const base = join(dir, `box-seed${seed}-g${games}`);
writeFileSync(`${base}.md`, `${markdown}\n`);
writeFileSync(`${base}.json`, JSON.stringify(Object.fromEntries(tallies), null, 2));
console.log(`\n${base}.{md,json}`);
