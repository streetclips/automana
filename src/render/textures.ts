import { crc32, deflateSync } from "node:zlib";
import type { FrameColor } from "./card";

type Rgb = number[];
type Stop = [color: string, at: number];
type Paint<T> = (x: number, y: number) => T;

interface Size {
  w: number;
  h: number;
}

interface Texture {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

interface Palette {
  k1: string;
  k2: string;
  k3: string;
  box: string;
  plate: string;
  ink?: string;
}

const PALETTES: Record<FrameColor, Palette> = {
  red: { k1: "#d2603f", k2: "#a8361f", k3: "#4e140b", box: "#f2e0d4", plate: "#f6e4d8" },
  green: { k1: "#58985a", k2: "#2b6b39", k3: "#102e18", box: "#e1e8d7", plate: "#e5ecdb" },
  black: { k1: "#5f5651", k2: "#34302d", k3: "#0f0d0c", box: "#ddd6d1", plate: "#dfd8d3" },
  blue: { k1: "#4a90cc", k2: "#1f5f9a", k3: "#0a2643", box: "#dbe6f0", plate: "#e0ebf4" },
  gold: { k1: "#e6c56b", k2: "#b48d36", k3: "#4d3810", box: "#f4ebcf", plate: "#f7eed3", ink: "#2a1b05" },
};

const REFERENCE: Palette = { k1: "#c3c7ca", k2: "#868c91", k3: "#2f3336", box: "#f2f1ed", plate: "#eef0f1" };

const CARD: Size = { w: 23, h: 33 };
const BOOKLET_COVER: Size = { w: 61.11, h: 85.71 };
const ART: Size = { w: 20.86, h: 16.01 };
const TEXT_BOX: Size = { w: 20.9, h: 9.2 };
const RULES_BOX: Size = { w: 21.33, h: 12.83 };
const GRAIN_TILE_EM = 9;

function hash(i: number, j: number, seed: number): number {
  let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number, seed: number, period: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const at = (a: number, b: number) => hash(a % period, b % period, seed);
  const sx = (x - i) * (x - i) * (3 - 2 * (x - i));
  const sy = (y - j) * (y - j) * (3 - 2 * (y - j));
  const top = at(i, j) + (at(i + 1, j) - at(i, j)) * sx;
  const bottom = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * sx;
  return top + (bottom - top) * sy;
}

function fractalNoise(x: number, y: number, octaves: number, period: number): number {
  let sum = 0;
  let weight = 0;
  for (let k = 0; k < octaves; k++) {
    sum += valueNoise(x * 2 ** k, y * 2 ** k, k + 1, period * 2 ** k) / 2 ** k;
    weight += 1 / 2 ** k;
  }
  return sum / weight;
}

function noise(width: number, height: number, level: number, spread: number, value: Paint<number>): Texture {
  const values = Array.from({ length: width * height }, (_, n) => value(n % width, Math.floor(n / width)));
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const deviation = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
  return { width, height, data: Uint8ClampedArray.from(values, (v) => 255 * (level + ((v - mean) / deviation) * spread)) };
}

const GRAIN = noise(224, 224, 0.627, 0.044, (x, y) => fractalNoise(x / 2, y / 2, 2, 112));
const MOTTLE = noise(250, 350, 0.688, 0.058, (x, y) => fractalNoise((x / 250) * 6, (y / 250) * 6, 5, 64));
const PX_PER_EM = GRAIN.width / GRAIN_TILE_EM;

const wrapped = (i: number, n: number) => ((i % n) + n) % n;
const clamped = (i: number, n: number) => Math.min(n - 1, Math.max(0, i));

function sample({ width, height, data }: Texture, u: number, v: number, wrap: boolean): number {
  const index = wrap ? wrapped : clamped;
  const x = Math.floor(u - 0.5);
  const y = Math.floor(v - 0.5);
  const fx = u - 0.5 - x;
  const fy = v - 0.5 - y;
  const [x0, x1, y0, y1] = [index(x, width), index(x + 1, width), index(y, height) * width, index(y + 1, height) * width];
  const top = data[y0 + x0] + (data[y0 + x1] - data[y0 + x0]) * fx;
  const bottom = data[y1 + x0] + (data[y1 + x1] - data[y1 + x0]) * fx;
  return (top + (bottom - top) * fy) / 255;
}

const grain: Paint<number> = (x, y) => sample(GRAIN, x * PX_PER_EM, y * PX_PER_EM, true);

function cover(texture: Texture, { w, h }: Size): Paint<number> {
  const emPerPx = Math.max(w / texture.width, h / texture.height);
  return (x, y) => sample(texture, x / emPerPx, y / emPerPx, false);
}

const WHITE: Rgb = [1, 1, 1];

const hex = (color: string): Rgb => [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255);
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const softLight = (b: number, s: number) => (s <= 0.5 ? b - (1 - 2 * s) * b * (1 - b) : b + (2 * s - 1) * ((b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b)) - b));
const overlay = (b: number, s: number) => (b <= 0.5 ? 2 * s * b : 1 - 2 * (1 - s) * (1 - b));
const blend = (rgb: Rgb, mode: (b: number, s: number) => number, s: number): Rgb => [mode(rgb[0], s), mode(rgb[1], s), mode(rgb[2], s)];

function ramp(stops: Stop[]): (t: number) => Rgb {
  const colors = stops.map(([color]) => hex(color));
  return (t) => {
    let next = 0;
    while (next < stops.length && t >= stops[next][1]) next++;
    if (next === 0) return colors[0];
    if (next === stops.length) return colors[next - 1];
    return mix(colors[next - 1], colors[next], (t - stops[next - 1][1]) / (stops[next][1] - stops[next - 1][1]));
  };
}

function linear({ w, h }: Size, deg: number, stops: Stop[]): Paint<Rgb> {
  const dx = Math.sin((deg * Math.PI) / 180);
  const dy = -Math.cos((deg * Math.PI) / 180);
  const length = Math.abs(w * dx) + Math.abs(h * dy);
  const color = ramp(stops);
  return (x, y) => color(((x - w / 2) * dx + (y - h / 2) * dy) / length + 0.5);
}

function radial({ w, h }: Size, cx: number, cy: number, stops: Stop[]): Paint<Rgb> {
  const radius = Math.hypot(Math.max(cx, 1 - cx) * w, Math.max(cy, 1 - cy) * h);
  const color = ramp(stops);
  return (x, y) => color(Math.hypot(x - cx * w, y - cy * h) / radius);
}

function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function rgbPng(width: number, height: number, data: Uint8ClampedArray): string {
  const stride = width * 3;
  const rows = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    rows[y * (stride + 1)] = 1;
    for (let x = 0; x < stride; x++) rows[y * (stride + 1) + 1 + x] = (data[y * stride + x] - (x >= 3 ? data[y * stride + x - 3] : 0)) & 255;
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(rows)), chunk("IEND", Buffer.alloc(0))]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

function bake({ w, h }: Size, paint: Paint<Rgb>): string {
  const width = Math.round(w * PX_PER_EM);
  const height = Math.round(h * PX_PER_EM);
  const data = new Uint8ClampedArray(width * height * 3);
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const rgb = paint(((i + 0.5) * w) / width, ((j + 0.5) * h) / height);
      for (let c = 0; c < 3; c++) data[(j * width + i) * 3 + c] = 255 * rgb[c];
    }
  }
  return rgbPng(width, height, data);
}

function frame(base: Paint<Rgb>, size: Size = CARD): string {
  const mottle = cover(MOTTLE, size);
  return bake(size, (x, y) => blend(blend(base(x, y), softLight, mottle(x, y)), overlay, grain(x, y)));
}

function artGlow(p: Palette): string {
  const base = radial(ART, 0.5, 0.45, [[p.k1, 0], [p.k2, 0.55], [p.k3, 1]]);
  const mottle = cover(MOTTLE, ART);
  return bake(ART, (x, y) => blend(base(x, y), softLight, mottle(x, y)));
}

function textBox(size: Size, color: string): string {
  const box = hex(color);
  return bake(size, (x, y) => {
    const highlight = 0.65 * Math.max(0, 1 - Math.hypot((x / size.w - 0.3) / 0.8, (y / size.h - 0.25) / 0.7));
    return blend(mix(box, WHITE, highlight), softLight, grain(x, y));
  });
}

function paletteCss(selector: string, p: Palette, box: Size, art: boolean): string {
  const textures = [
    `--frame: url(${frame(linear(CARD, 160, [[p.k1, 0], [p.k2, 0.48], [p.k3, 1]]))});`,
    `--box: url(${textBox(box, p.box)});`,
    art ? `--glow: url(${artGlow(p)});` : "",
  ];
  return `${selector} { --k-1: ${p.k1}; --k-2: ${p.k2}; --k-3: ${p.k3}; --k-box: ${p.box}; --k-plate: ${p.plate};${p.ink ? ` --ink: ${p.ink};` : ""} ${textures.join(" ")} }`;
}

const TEXTURE_CSS = [
  ...Object.entries(PALETTES).map(([color, p]) => paletteCss(`.k-${color}`, p, TEXT_BOX, true)),
  paletteCss(".pw-face.reference", REFERENCE, RULES_BOX, false),
  `.pw-back { --k-2: #2a0b06; --frame: url(${frame(radial(CARD, 0.5, 0.46, [["#a8361f", 0], ["#5a160b", 0.45], ["#1a0604", 0.8]]))}); }`,
].join("\n");

export function textureCss(): string {
  return TEXTURE_CSS;
}

let bookletCss: string | undefined;

export function bookletCoverCss(): string {
  bookletCss ??= `.rb-dark { background-image: url(${frame(radial(BOOKLET_COVER, 0.5, 0.42, [["#a8361f", 0], ["#5a160b", 0.42], ["#1a0604", 0.85]]), BOOKLET_COVER)}); }`;
  return bookletCss;
}
