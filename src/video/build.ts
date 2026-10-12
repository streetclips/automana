import { execFile } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { setLocale } from "../i18n/locale";
import { screenshot } from "../lib/chrome";
import { DIST, ensureDir, readCss } from "../lib/paths";
import { boardHtml } from "./board";
import type { Beat } from "./model";
import { SCENES } from "./scenes";
import { script } from "./script";

const run = promisify(execFile);

const FPS = 30;
const PAD = 0.75;
const LEAD_IN = 0.2;
const XFADE = 0.3;
const VOICE = process.env.PALMWALKER_VOICE ?? "Mónica";
const RATE = "182";
const CONCURRENCY = 6;

const OUT_DIR = ensureDir(join(DIST, "video"));
const WORK = join(OUT_DIR, "work");
const OUT = join(OUT_DIR, "palmwalker-guia-es.mp4");

const pad3 = (i: number) => String(i).padStart(3, "0");

async function pool<T, R>(items: T[], size: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

function frameHtml(beat: Beat, i: number, total: number, css: string): string {
  const inner = beat.kind === "scene" ? SCENES[beat.scene](beat.k) : boardHtml(beat.state);
  const prog = `<div class="prog"><i style="width:${(((i + 1) / total) * 100).toFixed(2)}%"></i></div>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}</style></head>`
    + `<body><div class="frame">${inner}<div class="sub">${beat.sub}</div>${prog}</div></body></html>`;
}

async function duration(path: string): Promise<number> {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]);
  return Number(stdout.trim());
}

async function renderSegment(i: number, dur: number): Promise<void> {
  const prev = join(WORK, `f${pad3(Math.max(i - 1, 0))}.png`);
  const cur = join(WORK, `f${pad3(i)}.png`);
  await run("ffmpeg", ["-y", "-loop", "1", "-framerate", String(FPS), "-t", (XFADE + 0.1).toFixed(3), "-i", prev,
    "-loop", "1", "-framerate", String(FPS), "-t", dur.toFixed(4), "-i", cur,
    "-filter_complex", `[0:v][1:v]xfade=transition=fade:duration=${XFADE}:offset=0,format=yuv420p[v]`,
    "-map", "[v]", "-r", String(FPS), "-frames:v", String(Math.round(dur * FPS)),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-tune", "stillimage", join(WORK, `s${pad3(i)}.mp4`)]);
  await run("ffmpeg", ["-y", "-i", join(WORK, `a${pad3(i)}.aiff`),
    "-af", `adelay=${LEAD_IN * 1000}:all=1,apad=whole_dur=${dur.toFixed(4)},atrim=0:${dur.toFixed(4)}`,
    "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", join(WORK, `p${pad3(i)}.wav`)]);
}

async function preview(indexes: number[], beats: Beat[], css: string): Promise<void> {
  const dir = ensureDir(join(OUT_DIR, "preview"));
  await pool(indexes, CONCURRENCY, async (i) => {
    const html = join(dir, `f${pad3(i)}.html`);
    writeFileSync(html, frameHtml(beats[i], i, beats.length, css), "utf8");
    await screenshot(html, join(dir, `f${pad3(i)}.png`));
  });
  console.log(dir);
}

async function main(): Promise<void> {
  setLocale("es");
  const css = readCss("render/card.css", "render/faces.css", "rulebook/rulebook.css", "video/video.css");
  const beats = script();
  const previewArg = process.argv.find((a) => a.startsWith("--preview="));
  if (previewArg) return preview(previewArg.slice(10).split(",").map(Number), beats, css);
  rmSync(WORK, { recursive: true, force: true });
  ensureDir(WORK);
  console.log(`${beats.length} beats`);

  await pool(beats, CONCURRENCY, async (beat, i) => {
    const html = join(WORK, `f${pad3(i)}.html`);
    writeFileSync(html, frameHtml(beat, i, beats.length, css), "utf8");
    await screenshot(html, join(WORK, `f${pad3(i)}.png`));
  });
  console.log("frames ok");

  const audio = await pool(beats, CONCURRENCY, async (beat, i) => {
    const aiff = join(WORK, `a${pad3(i)}.aiff`);
    await run("say", ["-v", VOICE, "-r", RATE, "-o", aiff, beat.say]);
    return duration(aiff);
  });
  const durs = audio.map((a) => Math.round((a + LEAD_IN + PAD) * FPS) / FPS);
  console.log(`audio ok · ${(durs.reduce((x, y) => x + y, 0) / 60).toFixed(1)} min`);

  await pool(durs, 4, (dur, i) => renderSegment(i, dur));
  writeFileSync(join(WORK, "v.txt"), durs.map((_, i) => `file 's${pad3(i)}.mp4'\n`).join(""));
  writeFileSync(join(WORK, "a.txt"), durs.map((_, i) => `file 'p${pad3(i)}.wav'\n`).join(""));
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", join(WORK, "v.txt"), "-c", "copy", join(WORK, "video.mp4")]);
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", join(WORK, "a.txt"), "-c", "copy", join(WORK, "audio.wav")]);
  await run("ffmpeg", ["-y", "-i", join(WORK, "video.mp4"), "-i", join(WORK, "audio.wav"), "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", OUT]);
  if (!process.argv.includes("--keep-work")) rmSync(WORK, { recursive: true, force: true });
  console.log(OUT);
}

await main();
