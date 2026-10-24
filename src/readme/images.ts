import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ALL_NEMESES } from "../box/nemesis/all";
import { DECK_NAMES } from "../content";
import { setLocale } from "../i18n/locale";
import { ROOT, artPath, ensureDir } from "../lib/paths";
import { screenshot } from "../pnp/pdf";
import { artCss } from "../render/art";
import { nemesisCard } from "../rulebook/diagrams";
import { rulebookCss, rulebookPages } from "../rulebook/pages";

const IMAGES = join(ROOT, "docs/images");
const JPEG_QUALITY = "82";
const PAGE = { w: 582, h: 816 };

const FACES: Record<string, string> = {
  vorthrax: "nm_scorch_fiend",
  vaskara: "nm_mantis_queen",
  morwen: "nm_deathless_knight",
  "mirror-archmage": "nm_fragile_illusion",
  stampede: "ch_warlords_chosen",
  revel: "ch_revel_king",
  hydra: "ch_frenzy_head",
};

const STAGE_CSS = `
body { margin: 0; overflow: hidden; }
.stage { position: relative; overflow: hidden; background-size: cover; }
.stage > div { position: absolute; }
.shot { box-shadow: 0 18px 44px rgba(0, 0, 0, .6); }
.shot .rb-page { break-after: auto; }
.stage .rb-card .pw-card { box-shadow: 0 10px 26px rgba(0, 0, 0, .55); }
.fan { transform-origin: 50% 230%; }
.name { width: 158px; text-align: center; font: bold 13px/1.2 Optima, "Avenir Next", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #f3dca6; }`;

function scaledPage(html: string, scale: number, x: number, y: number, rotate: number): string {
  return `<div class="shot" style="left:${x}px;top:${y}px;width:${PAGE.w * scale}px;height:${PAGE.h * scale}px;transform:rotate(${rotate}deg)"><div style="transform:scale(${scale});transform-origin:0 0">${html}</div></div>`;
}

function card(id: string, width: number, x: number, y: number, cls = "", rotate = 0): string {
  return `<div class="${cls}" style="left:${x}px;top:${y}px;transform:rotate(${rotate}deg)">${nemesisCard(id, (width * 25.4) / 96)}</div>`;
}

function hero(pages: string[]): string {
  const fan = ALL_NEMESES.map(({ id }, i) => card(FACES[id], 165, 902, 205, "fan", (i - 3) * 6));
  return [scaledPage(pages[9], 0.6, 360, 74, 5), scaledPage(pages[0], 0.6, 70, 66, -6), ...fan].join("");
}

function nemeses(): string {
  return ALL_NEMESES.map(({ id }, i) => {
    const x = 33 + i * 176;
    return `${card(FACES[id], 158, x, 26)}<div class="name" style="left:${x}px;top:264px">${DECK_NAMES[id].en.name.split(",")[0].replace(/^The /, "")}</div>`;
  }).join("");
}

function rulebook(pages: string[]): string {
  return [3, 8, 9, 18].map((index, i) => scaledPage(pages[index], 0.5, 22 + i * 315, 40, 0)).join("");
}

function shoot(dir: string, name: string, width: number, height: number, stage: string): string {
  const html = join(dir, `${name}.html`);
  const png = join(dir, `${name}.png`);
  const css = `${rulebookCss()}\n${artCss((id) => pathToFileURL(artPath(id)).href)}\n${STAGE_CSS}`;
  writeFileSync(html, `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body><div class="stage rb-dark" style="width:${width}px;height:${height}px">${stage}</div></body></html>`, "utf8");
  screenshot(html, png, width, height);
  const jpeg = join(IMAGES, `${name}.jpg`);
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", JPEG_QUALITY, png, "--out", jpeg], { stdio: "ignore" });
  return jpeg;
}

setLocale("en");
ensureDir(IMAGES);
const pages = rulebookPages("en");
const tmp = mkdtempSync(join(tmpdir(), "automana-readme-"));
try {
  console.log(shoot(tmp, "hero", 1280, 640, hero(pages)));
  console.log(shoot(tmp, "nemeses", 1280, 300, nemeses()));
  console.log(shoot(tmp, "rulebook", 1280, 488, rulebook(pages)));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
