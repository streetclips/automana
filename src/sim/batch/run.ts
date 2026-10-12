import { writeFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join } from "node:path";
import { DIST, ensureDir } from "../../lib/paths";
import { allConfigs } from "../game";
import { Pool } from "./pool";
import { type Row, render } from "./report";
import { emptyTally, merge, type Tally } from "./stats";
import type { Job } from "./worker";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith("--")) continue;
  const next = process.argv[i + 1];
  args.set(a.slice(2), next && !next.startsWith("--") ? (i++, next) : "1");
}

const games = Number(args.get("games") ?? 1000);
const seed = Number(args.get("seed") ?? 1);
const workers = Math.max(1, Number(args.get("workers") ?? availableParallelism()));
const pairs = args.get("pairs")?.toUpperCase().split(",");
const nemeses = args.get("nemeses")?.split(",");
const modes = (args.get("modes") ?? "normal,heroic").split(",");
const chunk = Number(args.get("chunk") ?? 20);

const all = allConfigs();
const selected = all
  .map((cfg, index) => ({ cfg, index }))
  .filter(({ cfg }) => (!pairs || pairs.includes(cfg.pair.key)) && (!nemeses || nemeses.includes(cfg.nemesis.id)) && modes.includes(cfg.heroic ? "heroic" : "normal"));
if (!selected.length || !Number.isFinite(games) || games < 1) {
  console.error("Usage: npm run sim -- [--games 1000] [--seed 1] [--workers N] [--pairs W/U,R/G] [--nemeses vorthrax,morwen] [--modes normal,heroic]");
  process.exit(1);
}

const jobs: Job[] = [];
for (let g = 0; g < games; g += chunk) for (const { index } of selected) jobs.push({ config: index, start: g, end: Math.min(games, g + chunk), seed });
const tallies = new Map<number, Tally>(selected.map(({ index }) => [index, emptyTally()]));
const total = games * selected.length;
let done = 0;
let shown = 0;
const t0 = performance.now();

function progress(): void {
  if (!process.stderr.isTTY) return;
  const now = performance.now();
  if (now - shown < 1000 && done < total) return;
  shown = now;
  const elapsed = (now - t0) / 1000;
  const eta = done ? (elapsed / done) * (total - done) : 0;
  process.stderr.write(`\r${done.toLocaleString("en")} / ${total.toLocaleString("en")} games · ${elapsed.toFixed(0)}s elapsed · ~${eta.toFixed(0)}s left   `);
}

const pool = new Pool(Math.min(workers, jobs.length));
await pool.run(jobs, (job, tally) => {
  merge(tallies.get(job.config)!, tally);
  done += tally.games;
  progress();
});
pool.close();
if (process.stderr.isTTY) process.stderr.write("\n");

const rows: Row[] = selected.map(({ cfg, index }) => ({ cfg, tally: tallies.get(index)! }));
const out = render(rows, { seed, games, workers, seconds: (performance.now() - t0) / 1000 });
console.log(out.console);
const dir = ensureDir(join(DIST, "sim"));
const base = join(dir, `sim-seed${seed}-g${games}`);
writeFileSync(`${base}.md`, out.markdown);
writeFileSync(`${base}.csv`, out.csv);
writeFileSync(`${base}.json`, out.json);
console.log(`\n${base}.{md,csv,json}`);
