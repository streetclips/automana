import { GRIMOIRES } from "../../content";
import { NEMESIS_LIST, PAIRS } from "../engine/defs";
import type { Config } from "../game";
import { type Tally, emptyTally } from "./stats";

export interface Row {
  cfg: Config;
  tally: Tally;
}

export interface Meta {
  seed: number;
  games: number;
  workers: number;
  seconds: number;
}

const SHORT: Record<string, string> = { vorthrax: "Vorthrax", vaskara: "Vaskara", morwen: "Morwen", "mirror-archmage": "Archmage" };

function pct(wins: number, games: number): string {
  return games ? `${((100 * wins) / games).toFixed(1)}%` : "—";
}

function sum(rows: Row[]): { wins: number; games: number } {
  return rows.reduce((a, r) => ({ wins: a.wins + r.tally.wins, games: a.games + r.tally.games }), { wins: 0, games: 0 });
}

function duration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

function grid(rows: Row[]): string[][] {
  const nemeses = NEMESIS_LIST.filter((n) => rows.some((r) => r.cfg.nemesis === n));
  const pairs = PAIRS.filter((p) => rows.some((r) => r.cfg.pair === p));
  const out: string[][] = [["Pair", ...nemeses.map((n) => SHORT[n.id]), "All"]];
  for (const p of pairs) {
    const line = rows.filter((r) => r.cfg.pair === p);
    out.push([`${p.key} ${p.halves[0].en.name} + ${p.halves[1].en.name}`, ...nemeses.map((n) => {
      const t = sum(line.filter((r) => r.cfg.nemesis === n));
      return pct(t.wins, t.games);
    }), pct(sum(line).wins, sum(line).games)]);
  }
  out.push(["All pairs", ...nemeses.map((n) => {
    const t = sum(rows.filter((r) => r.cfg.nemesis === n));
    return pct(t.wins, t.games);
  }), pct(sum(rows).wins, sum(rows).games)]);
  return out;
}

function halves(rows: Row[]): string[][] {
  const out: string[][] = [["Half-grimoire", "Win rate"]];
  for (const g of GRIMOIRES) {
    const mine = rows.filter((r) => r.cfg.pair.halves.includes(g));
    if (!mine.length) continue;
    const t = sum(mine);
    out.push([`${g.color} ${g.en.name}`, pct(t.wins, t.games)]);
  }
  return out;
}

function metrics(rows: Row[]): string[][] {
  const out: string[][] = [["Nemesis", "Win rate", "Rounds", "Rounds (wins)", "Life left (wins)", "Nemesis life (losses)"]];
  for (const n of NEMESIS_LIST) {
    const list = rows.filter((r) => r.cfg.nemesis === n);
    if (!list.length) continue;
    const t = list.reduce((a, r) => {
      for (const k of Object.keys(a) as (keyof Tally)[]) a[k] += r.tally[k];
      return a;
    }, emptyTally());
    const losses = t.games - t.wins;
    out.push([
      SHORT[n.id], pct(t.wins, t.games), (t.rounds / t.games).toFixed(1),
      t.wins ? (t.winRounds / t.wins).toFixed(1) : "—", t.wins ? (t.lifeOnWin / t.wins).toFixed(1) : "—",
      losses ? (t.nemLifeOnLoss / losses).toFixed(1) : "—",
    ]);
  }
  return out;
}

function text(table: string[][]): string {
  const widths = table[0].map((_, i) => Math.max(...table.map((r) => r[i].length)));
  return table.map((r) => r.map((c, i) => (i ? c.padStart(widths[i]) : c.padEnd(widths[i]))).join("  ")).join("\n");
}

function md(table: string[][]): string {
  const [head, ...body] = table;
  return [`| ${head.join(" | ")} |`, `|${head.map((_, i) => (i ? "---:" : "---")).join("|")}|`, ...body.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

export function render(rows: Row[], meta: Meta): { console: string; markdown: string; csv: string; json: string } {
  const total = rows.reduce((n, r) => n + r.tally.games, 0);
  const margin = (1.96 * Math.sqrt(0.25 / meta.games) * 100).toFixed(1);
  const header = `seed ${meta.seed} · ${meta.games.toLocaleString("en")} games per configuration · ${rows.length} configurations · ${total.toLocaleString("en")} games · ${meta.workers} workers · ${duration(meta.seconds)}`;
  const tables: [string, string[][]][] = [];
  tables.push([`Win rate (95% margin per cell ≤ ±${margin} pp)`, grid(rows)]);
  tables.push(["Half-grimoires (average over their 4 pairs and all Nemeses)", halves(rows)]);
  tables.push(["Game metrics by Nemesis", metrics(rows)]);
  const consoleOut = [`Palmwalker balance simulation`, header, ...tables.map(([t, tb]) => `\n${t}\n${text(tb)}`)].join("\n");
  const markdown = [`# Palmwalker balance simulation`, "", header, ...tables.map(([t, tb]) => `\n## ${t}\n\n${md(tb)}`), ""].join("\n");
  const csvHead = "pair,nemesis,games,wins,win_rate,avg_rounds,avg_rounds_win,avg_life_on_win,avg_nemesis_life_on_loss,timeouts,avg_ms";
  const csv = [csvHead, ...rows.map(({ cfg, tally: t }) => [
    cfg.pair.key, cfg.nemesis.id, t.games, t.wins, (t.wins / t.games).toFixed(4),
    (t.rounds / t.games).toFixed(2), t.wins ? (t.winRounds / t.wins).toFixed(2) : "", t.wins ? (t.lifeOnWin / t.wins).toFixed(2) : "",
    t.games - t.wins ? (t.nemLifeOnLoss / (t.games - t.wins)).toFixed(2) : "",
    t.timeouts, (t.ms / t.games).toFixed(2),
  ].join(","))].join("\n");
  const json = JSON.stringify({
    ...meta, configurations: rows.map(({ cfg, tally }) => ({ pair: cfg.pair.key, nemesis: cfg.nemesis.id, ...tally, winRate: tally.wins / tally.games })),
  }, null, 2);
  return { console: consoleOut, markdown, csv: `${csv}\n`, json: `${json}\n` };
}
