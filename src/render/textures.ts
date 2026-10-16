import { crc32, deflateSync } from "node:zlib";

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

function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function grayPng(width: number, height: number, level: number, spread: number, value: (x: number, y: number) => number): string {
  const values = Array.from({ length: width * height }, (_, n) => value(n % width, Math.floor(n / width)));
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const deviation = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
  const bytes = values.map((v) => Math.round(255 * Math.min(1, Math.max(0, level + ((v - mean) / deviation) * spread))));
  const rows = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    rows[y * (width + 1)] = 1;
    for (let x = 0; x < width; x++) rows[y * (width + 1) + 1 + x] = (bytes[y * width + x] - (x ? bytes[y * width + x - 1] : 0)) & 255;
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(rows, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

const GRAIN = grayPng(224, 224, 0.627, 0.044, (x, y) => fractalNoise(x / 2, y / 2, 2, 112));
const MOTTLE = grayPng(250, 350, 0.688, 0.058, (x, y) => fractalNoise((x / 250) * 6, (y / 250) * 6, 5, 64));

export function textureCss(): string {
  return `.pw-card { --grain: url(${GRAIN}); --mottle: url(${MOTTLE}); }`;
}
