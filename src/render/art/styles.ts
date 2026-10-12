import { KANJI, PALETTES } from "../../content/palettes";
import type { Card } from "../../content/types";
import { bodyClip, detailColor, layer, subject, svgWrap, tint } from "./primitives";
import { mix, seeded, uid } from "./util";

export type ArtStyleId = "oil" | "engraving" | "stained-glass" | "watercolor" | "pixel" | "neon" | "paper" | "flat" | "sumi" | "deco";

export const DEFAULT_ART: ArtStyleId = "paper";

type Render = (card: Card) => string;

const oil: Render = (card) => {
  const p = PALETTES[card.color];
  const id = uid();
  const tn = tint(card);
  return svgWrap(`<defs>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky1}"/><stop offset="1" stop-color="${p.sky2}"/></linearGradient>
    <radialGradient id="${id}b" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${mix(tn, "#ffffff", 0.45)}"/><stop offset=".55" stop-color="${tn}"/><stop offset="1" stop-color="${mix(tn, "#000000", 0.5)}"/></radialGradient>
    <radialGradient id="${id}g" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}v" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
    <filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>
  </defs>
  <g filter="url(#${id}f)">
    <rect width="100" height="100" fill="url(#${id}s)"/>
    ${layer(card, 0, `fill="${mix(p.s, p.sky1, 0.3)}" opacity=".6"`)}
    ${layer(card, 1, `fill="${mix(p.p, p.d, 0.25)}" opacity=".8"`)}
    ${layer(card, 2, `fill="${p.d}"`)}
    <circle cx="50" cy="48" r="34" fill="url(#${id}g)"/>
    ${subject(card, { bodyFill: `url(#${id}b)`, bodyStroke: mix(tn, "#000000", 0.6), bodyStrokeW: 1.2, detailFill: detailColor(card) })}
  </g>
  <rect width="100" height="100" fill="url(#${id}v)"/>`);
};

const engraving: Render = (card) => {
  const p = PALETTES[card.color];
  const id = uid();
  const ink = "#2a1d12";
  const paper = "#f1e6cc";
  const hatch = (n: string, gap: number, w: number, rot: number) =>
    `<pattern id="${id}${n}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot})"><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${ink}" stroke-width="${w}"/></pattern>`;
  return svgWrap(`<defs>
    ${hatch("a", 3.2, 0.35, 45)}${hatch("b", 2, 0.55, 45)}${hatch("c", 2, 0.55, -45)}${hatch("d", 1.6, 0.5, 20)}
    ${bodyClip(card, id + "k")}
  </defs>
  <rect width="100" height="100" fill="${paper}"/>
  <rect width="100" height="100" fill="${p.p}" opacity=".12"/>
  ${layer(card, 0, `fill="url(#${id}a)"`)}
  ${layer(card, 1, `fill="url(#${id}b)"`)}
  ${layer(card, 2, `fill="url(#${id}b)"`)}${layer(card, 2, `fill="url(#${id}c)"`)}
  <circle cx="50" cy="48" r="31" fill="${paper}" opacity=".85"/>
  ${subject(card, {
    bodyFill: paper, bodyStroke: ink, bodyStrokeW: 2, detailFill: ink,
    over: `<rect x="50" y="0" width="60" height="100" fill="url(#${id}d)" clip-path="url(#${id}k)"/>`,
  })}
  <rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="${ink}" stroke-width="1"/>`);
};

const stainedGlass: Render = (card) => {
  const p = PALETTES[card.color];
  const id = uid();
  const rnd = seeded(card.id + "vitral");
  const lead = "#1a1410";
  const n = 5;
  const step = 100 / n;
  const pts: [number, number][][] = [];
  for (let j = 0; j <= n; j++) {
    pts.push([]);
    for (let i = 0; i <= n; i++) {
      const edge = i === 0 || j === 0 || i === n || j === n;
      pts[j].push([i * step + (edge ? 0 : (rnd() - 0.5) * step * 0.7), j * step + (edge ? 0 : (rnd() - 0.5) * step * 0.7)]);
    }
  }
  const cols = [p.p, p.s, p.sky2, mix(p.p, p.d, 0.35), mix(p.s, "#ffffff", 0.3), p.sky1];
  let tiles = "";
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i + 1], d = pts[j + 1][i];
      const tris = rnd() > 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
      for (const tri of tris) {
        tiles += `<polygon points="${tri.map((q) => q.join(",")).join(" ")}" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
      }
    }
  }
  return svgWrap(`<defs>
    <radialGradient id="${id}l" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    ${bodyClip(card, id + "k")}
  </defs>
  <g stroke="${lead}" stroke-width="1.3" stroke-linejoin="round">${tiles}</g>
  ${subject(card, {
    bodyFill: mix(tint(card), "#ffffff", 0.1), bodyStroke: lead, bodyStrokeW: 4, detailFill: detailColor(card),
    over: `<g clip-path="url(#${id}k)" stroke="${lead}" stroke-width="2.2"><line x1="0" y1="40" x2="100" y2="60"/><line x1="50" y1="0" x2="40" y2="100"/><line x1="0" y1="75" x2="100" y2="30"/></g>`,
  })}
  <rect width="100" height="100" fill="url(#${id}l)" style="mix-blend-mode:screen"/>`);
};

const watercolor: Render = (card) => {
  const p = PALETTES[card.color];
  const id = uid();
  const rnd = seeded(card.id + "wc");
  let splat = "";
  for (let i = 0; i < 14; i++) splat += `<circle cx="${rnd() * 100}" cy="${rnd() * 100}" r="${0.4 + rnd() * 1.6}" fill="${i % 2 ? p.p : p.s}" opacity=".45"/>`;
  return svgWrap(`<defs>
    <filter id="${id}w" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/><feGaussianBlur stdDeviation=".7"/></filter>
    <filter id="${id}e" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/></filter>
    <filter id="${id}p"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="2"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .22"/></feComponentTransfer></filter>
  </defs>
  <rect width="100" height="100" fill="#fbf6ec"/>
  <g filter="url(#${id}w)">
    <ellipse cx="45" cy="30" rx="60" ry="30" fill="${p.sky2}" opacity=".35"/>
    ${layer(card, 0, `fill="${p.s}" opacity=".45"`)}
    ${layer(card, 1, `fill="${p.p}" opacity=".4"`)}
    ${layer(card, 2, `fill="${p.d}" opacity=".3"`)}
  </g>
  ${subject(card, { bodyFill: tint(card), bodyOpacity: 0.8, bodyStroke: mix(tint(card), "#000000", 0.45), bodyStrokeW: 1.2, detailFill: detailColor(card), detailOpacity: 0.85, filter: id + "e" })}
  ${splat}
  <rect width="100" height="100" filter="url(#${id}p)"/>`);
};

const pixel: Render = (card) => {
  const p = PALETTES[card.color];
  const flat = svgWrap(`<rect width="100" height="34" fill="${p.sky1}"/><rect y="34" width="100" height="22" fill="${mix(p.sky1, p.sky2, 0.5)}"/><rect y="56" width="100" height="44" fill="${p.sky2}"/>
    ${layer(card, 0, `fill="${p.s}"`)}
    ${layer(card, 1, `fill="${p.p}"`)}
    ${layer(card, 2, `fill="${p.d}"`)}
    ${subject(card, { bodyFill: tint(card), bodyStroke: mix(tint(card), "#000000", 0.6), bodyStrokeW: 3, detailFill: detailColor(card) })}`);
  return `<img class="pixel-art" alt="" data-svg="${encodeURIComponent(flat)}">`;
};

const neon: Render = (card) => {
  const p = PALETTES[card.color];
  const id = uid();
  const glow = mix(p.s, "#ffffff", 0.15);
  let grid = "";
  for (let x = -60; x <= 160; x += 16) grid += `<line x1="50" y1="62" x2="${x}" y2="100"/>`;
  for (const y of [64, 67, 71, 77, 86, 99]) grid += `<line x1="0" y1="${y}" x2="100" y2="${y}"/>`;
  let stripes = "";
  for (let y = 40; y < 62; y += 4) stripes += `<rect x="20" y="${y}" width="60" height="${1 + (y - 40) / 8}" fill="#000"/>`;
  return svgWrap(`<defs>
    <linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08041a"/><stop offset=".6" stop-color="#24093d"/><stop offset="1" stop-color="#08041a"/></linearGradient>
    <linearGradient id="${id}sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="${p.p}"/></linearGradient>
    <mask id="${id}m"><rect width="100" height="100" fill="#fff"/>${stripes}</mask>
    <filter id="${id}g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="100" height="100" fill="url(#${id}bg)"/>
  <circle cx="50" cy="44" r="24" fill="url(#${id}sun)" mask="url(#${id}m)" opacity=".85"/>
  <g stroke="${p.p}" stroke-width=".5" opacity=".9" filter="url(#${id}g)">${grid}</g>
  <rect y="62" width="100" height="38" fill="#08041a" opacity=".35"/>
  ${subject(card, { bodyFill: "#0b0618", bodyOpacity: 0.75, bodyStroke: glow, bodyStrokeW: 2, detailFill: p.p, detailStroke: p.p, filter: id + "g" })}`);
};

const paper: Render = (card) => {
  const p = PALETTES[card.color];
  const id = uid();
  return svgWrap(`<defs>
    <filter id="${id}d" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx=".7" dy="1.1" stdDeviation=".9" flood-color="#000" flood-opacity=".35"/></filter>
    <filter id="${id}D" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1.4" dy="2" stdDeviation="1.4" flood-color="#000" flood-opacity=".45"/></filter>
    <filter id="${id}o" x="-25%" y="-25%" width="150%" height="150%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="grow"/>
      <feFlood flood-color="#ffffff"/><feComposite in2="grow" operator="in" result="outline"/>
      <feDropShadow in="outline" dx="1.4" dy="2" stdDeviation="1.4" flood-color="#000" flood-opacity=".45" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${id}p"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="9"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .12"/></feComponentTransfer></filter>
  </defs>
  <rect width="100" height="100" fill="${mix(p.l, p.sky1, 0.4)}"/>
  ${layer(card, 0, `fill="${mix(p.s, "#ffffff", 0.35)}" filter="url(#${id}d)"`)}
  ${layer(card, 1, `fill="${p.s}" filter="url(#${id}d)"`)}
  ${layer(card, 2, `fill="${p.p}" filter="url(#${id}d)"`)}
  ${subject(card, { bodyFill: tint(card), bodyStroke: "#ffffff", bodyStrokeW: 4.5, detailFill: detailColor(card), filter: id + "D", emojiFilter: id + "o" })}
  <rect width="100" height="100" filter="url(#${id}p)"/>`);
};

const flat: Render = (card) => {
  const p = PALETTES[card.color];
  return svgWrap(`<rect width="100" height="100" fill="${p.l}"/>
  <circle cx="50" cy="50" r="33" fill="${p.s}"/>
  ${layer(card, 2, `fill="${p.p}"`) || `<rect y="88" width="100" height="12" fill="${p.p}"/>`}
  ${subject(card, { bodyFill: tint(card), detailFill: detailColor(card) })}
  <line x1="10" y1="12" x2="24" y2="12" stroke="${p.p}" stroke-width="1.5" stroke-linecap="round"/>`);
};

const sumi: Render = (card) => {
  const id = uid();
  const paperColor = "#f4efe3";
  return svgWrap(`<defs>
    <filter id="${id}i" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".11" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter>
    <filter id="${id}p"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="1"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer></filter>
  </defs>
  <rect width="100" height="100" fill="${paperColor}"/>
  <g filter="url(#${id}i)">
    ${layer(card, 0, `fill="#1b1b1b" opacity=".12"`)}
    ${layer(card, 1, `fill="#1b1b1b" opacity=".22"`)}
  </g>
  ${subject(card, { bodyFill: "#1b1b1b", bodyOpacity: 0.88, detailFill: paperColor, filter: id + "b" })}
  <rect x="76" y="74" width="16" height="16" rx="1.5" fill="#b8322a"/>
  <text x="84" y="86.3" font-size="11" text-anchor="middle" fill="${paperColor}" font-family="Hiragino Mincho ProN, serif">${KANJI[card.color]}</text>
  <rect width="100" height="100" filter="url(#${id}p)"/>`);
};

const deco: Render = (card) => {
  const p = PALETTES[card.color];
  const id = uid();
  const gold = "#d4af37";
  let burst = "";
  for (let k = 0; k < 24; k++) {
    const a0 = (k * Math.PI) / 12;
    const a1 = a0 + Math.PI / 24;
    burst += `<polygon points="50,58 ${50 + 90 * Math.cos(a0)},${58 + 90 * Math.sin(a0)} ${50 + 90 * Math.cos(a1)},${58 + 90 * Math.sin(a1)}"/>`;
  }
  return svgWrap(`<defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbeaa0"/><stop offset=".5" stop-color="${gold}"/><stop offset="1" stop-color="#8a6a1c"/></linearGradient>
  </defs>
  <rect width="100" height="100" fill="#0e0d0b"/>
  <g fill="${gold}" opacity=".2">${burst}</g>
  <g fill="none" stroke="${gold}" stroke-width=".6" opacity=".8"><circle cx="50" cy="58" r="22"/><circle cx="50" cy="58" r="28"/><circle cx="50" cy="58" r="34"/></g>
  <path d="M14 58 A36 36 0 0 1 86 58" fill="none" stroke="${p.p}" stroke-width="2.2"/>
  <polygon points="0,100 0,86 12,86 12,80 24,80 24,74 36,74 36,100" fill="${gold}" opacity=".35"/>
  <polygon points="100,100 100,86 88,86 88,80 76,80 76,74 64,74 64,100" fill="${gold}" opacity=".35"/>
  ${subject(card, { bodyFill: `url(#${id}g)`, bodyStroke: "#0e0d0b", bodyStrokeW: 1.6, detailFill: "#0e0d0b" })}
  <rect x="2" y="2" width="96" height="96" fill="none" stroke="${gold}" stroke-width=".8"/>`);
};

export const ART_STYLES: Record<ArtStyleId, Render> = {
  oil,
  engraving,
  "stained-glass": stainedGlass,
  watercolor,
  pixel,
  neon,
  paper,
  flat,
  sumi,
  deco,
};

export const ART_ORDER: ArtStyleId[] = ["oil", "engraving", "stained-glass", "watercolor", "pixel", "neon", "paper", "flat", "sumi", "deco"];

export function renderArt(card: Card, style: ArtStyleId = DEFAULT_ART): string {
  return ART_STYLES[style](card);
}
