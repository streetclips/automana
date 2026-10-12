import { NEMESIS_LIST, PAIRS } from "./engine/defs";
import { playGame } from "./game";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i].replace(/^--/, ""), process.argv[i + 1] ?? "");

const pair = PAIRS.find((p) => p.key === (args.get("pair") ?? "R/G").toUpperCase());
const nemesis = NEMESIS_LIST.find((n) => n.id === (args.get("nemesis") ?? "vorthrax"));
if (!pair || !nemesis) {
  console.error(`Usage: npm run sim:trace -- --pair R/G --nemesis vorthrax [--heroic 1] [--seed 1] [--game 0]\nPairs: ${PAIRS.map((p) => p.key).join(" ")}\nNemeses: ${NEMESIS_LIST.map((n) => n.id).join(" ")}`);
  process.exit(1);
}
const log: string[] = [];
const t0 = performance.now();
const r = playGame({ pair, nemesis, heroic: args.get("heroic") === "1" }, Number(args.get("seed") ?? 1), Number(args.get("game") ?? 0), log, Number(args.get("explain") ?? -1));
console.log(log.join("\n"));
console.log(`\n${r.win ? "WIN" : "LOSS"} · ${r.rounds} rounds · ${(performance.now() - t0).toFixed(0)} ms · plans ${r.stats.plans} · nodes ${r.stats.nodes} · leaves ${r.stats.leaves} · responses ${r.stats.responses} · blocks ${r.stats.blocks}`);
