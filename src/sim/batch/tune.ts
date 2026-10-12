import { availableParallelism } from "node:os";
import { W, type Weights } from "../ai/values";
import { allConfigs } from "../game";
import { Pool } from "./pool";
import type { Job } from "./worker";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i].replace(/^--/, ""), process.argv[i + 1] ?? "");

const games = Number(args.get("games") ?? 40);
const seed = Number(args.get("seed") ?? 9001);
const rounds = Number(args.get("rounds") ?? 2);
const threshold = Number(args.get("threshold") ?? 0.5);
const params = (args.get("params") ?? Object.keys(W).join(",")).split(",") as (keyof Weights)[];
let step = Number(args.get("step") ?? 0.35);

const configs = allConfigs();
const pool = new Pool(availableParallelism());

async function score(weights: Partial<Weights>): Promise<number> {
  const jobs: Job[] = [];
  for (let c = 0; c < configs.length; c++) for (let g = 0; g < games; g += 10) jobs.push({ config: c, start: g, end: Math.min(games, g + 10), seed, weights });
  let wins = 0;
  let total = 0;
  await pool.run(jobs, (_, t) => {
    wins += t.wins;
    total += t.games;
  });
  return (100 * wins) / total;
}

const compare = args.get("compare");
if (compare) {
  const a = await score({});
  const b = await score(JSON.parse(compare) as Partial<Weights>);
  console.log(`current ${a.toFixed(2)}% · candidate ${b.toFixed(2)}% · ${b - a >= 0 ? "+" : ""}${(b - a).toFixed(2)} pp over ${games * configs.length} games`);
  pool.close();
  process.exit(0);
}

const current: Partial<Weights> = {};
let best = await score(current);
console.log(`baseline ${best.toFixed(2)}% over ${games * configs.length} games`);
for (let r = 0; r < rounds; r++) {
  for (const p of params) {
    const base = (current[p] ?? W[p]) as number;
    for (const factor of [1 + step, 1 / (1 + step)]) {
      const value = Number((base * factor).toFixed(3));
      const v = await score({ ...current, [p]: value });
      const gain = v - best;
      console.log(`${String(p).padEnd(16)} ${String(base).padStart(7)} → ${String(value).padStart(7)}  ${v.toFixed(2)}% (${gain >= 0 ? "+" : ""}${gain.toFixed(2)})${gain > threshold ? "  ✓" : ""}`);
      if (gain > threshold) {
        current[p] = value as never;
        best = v;
        break;
      }
    }
  }
  step *= 0.6;
  console.log(`round ${r + 1}: ${best.toFixed(2)}%  ${JSON.stringify(current)}`);
}
pool.close();
