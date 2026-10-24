import type { BlockStep, PlayerCreature } from "../box/nemesis/examples";
import { getPrintedCard } from "../content";
import type { Card, RulebookList, RulebookText } from "../content/types";
import { getLocale } from "../i18n/locale";
import { BOX_DECKS } from "../pnp/box";
import { renderCard, renderThreatBack } from "../render/card";
import type { AttackExample, BlockExample, TargetExample, TurnExample } from "./data";

type Labels = RulebookText["diagram"];

interface Printed {
  card: Card;
  collection: string;
  first: number;
  total: number;
}

const RATIO = 35 / 25;

export const STEP_NUMBER: Record<BlockStep, number> = { safe: 1, trade: 2, desperation: 3 };

const STEP_COLOR: Record<BlockStep, string> = { safe: "#2f7a4b", trade: "#c27a12", desperation: "#b2271d" };

const PRINTED = new Map<string, Printed>(
  BOX_DECKS.flatMap((deck) => {
    const total = deck.cards.reduce((sum, c) => sum + c.qty, 0);
    let first = 1;
    return deck.cards.map((card) => {
      const entry: [string, Printed] = [card.id, { card, collection: deck.id, first, total }];
      first += card.qty;
      return entry;
    });
  }),
);

function printed(id: string): Printed {
  const entry = PRINTED.get(id);
  if (!entry) throw new Error(`No Nemesis card ${id}`);
  return entry;
}

export const mm = (n: number): string => `${+n.toFixed(2)}mm`;

export function cardName(id: string): string {
  return getPrintedCard(id)[getLocale()].name;
}

export function cardPt(id: string): string {
  return printed(id).card.pt ?? "";
}

export function nemesisCard(id: string, width: number): string {
  const { card, collection, first, total } = printed(id);
  return `<div class="rb-card" style="font-size:${mm(width / 25)}">${renderCard(card, 0, { collection, first, total })}</div>`;
}

export function threatBack(width: number): string {
  return `<div class="rb-card" style="font-size:${mm(width / 25)}">${renderThreatBack()}</div>`;
}

export function yourCard(creature: PlayerCreature, width: number, labels: Labels): string {
  const [power, toughness] = creature.pt;
  const keywords = (creature.keywords ?? []).map((keyword) => (keyword === "hexproof" ? labels.hexproof : keyword)).join(", ");
  return `<div class="rb-yours" style="font-size:${mm(width / 25)}"><span class="y-who">${labels.you}</span><span class="y-pt">${power}/${toughness}</span>${keywords ? `<span class="y-kw">${keywords}</span>` : ""}</div>`;
}

function at(x: number, y: number, html: string): string {
  return `<div class="rb-at" style="left:${mm(x)};top:${mm(y)}">${html}</div>`;
}

function figure(w: number, h: number, parts: string[], svg = ""): string {
  const box = `${+w.toFixed(2)} ${+h.toFixed(2)}`;
  return `<div class="rb-fig" style="width:${mm(w)};height:${mm(h)}"><svg class="rb-svg" viewBox="0 0 ${box}" width="${mm(w)}" height="${mm(h)}">${svg}</svg>${parts.join("")}</div>`;
}

function arrow(x1: number, y1: number, x2: number, y2: number, color: string, dashed = false): string {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const [ux, uy] = [(x2 - x1) / length, (y2 - y1) / length];
  const [bx, by] = [x2 - ux * 2.4, y2 - uy * 2.4];
  const head = [
    [x2, y2],
    [bx - uy * 1.3, by + ux * 1.3],
    [bx + uy * 1.3, by - ux * 1.3],
  ]
    .map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`)
    .join(" ");
  const dash = dashed ? ' stroke-dasharray="1.4 1.1"' : "";
  return `<line x1="${+x1.toFixed(2)}" y1="${+y1.toFixed(2)}" x2="${+bx.toFixed(2)}" y2="${+by.toFixed(2)}" stroke="${color}" stroke-width=".7" stroke-linecap="round"${dash}/><polygon points="${head}" fill="${color}"/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, color: string): string {
  return `<line x1="${+x1.toFixed(2)}" y1="${+y1.toFixed(2)}" x2="${+x2.toFixed(2)}" y2="${+y2.toFixed(2)}" stroke="${color}" stroke-width=".45" stroke-dasharray="1.2 1" stroke-linecap="round"/>`;
}

function rowX(width: number, count: number, cardW: number, gap: number, index: number): number {
  return (width - (count * cardW + (count - 1) * gap)) / 2 + index * (cardW + gap);
}

function caption(id: string, width: number): string {
  return `<span class="rb-cap" style="width:${mm(width)}">${cardName(id)}<b>${cardPt(id)}</b></span>`;
}

export function lifeBadge(life: number, labels: Labels): string {
  return `<span class="rb-life">${labels.life} <b>${life}</b></span>`;
}

export function stepBadge(step: BlockStep): string {
  return `<span class="rb-step ${step}">${STEP_NUMBER[step]}</span>`;
}

export interface CombatLayout {
  cardW: number;
  gap: number;
  width?: number;
  rise?: number;
}

export function combatFigure(ex: BlockExample, labels: Labels, { cardW, gap, width, rise = 13 }: CombatLayout): string {
  const cardH = cardW * RATIO;
  const cols = Math.max(ex.nemesis.length, ex.yours.length);
  const w = width ?? cols * cardW + (cols - 1) * gap;
  const top = 7;
  const arrowsFrom = top + cardH + 8.2;
  const bottom = arrowsFrom + rise;
  const h = bottom + cardH + 6;
  const parts = [at(0, 0, lifeBadge(ex.life, labels))];
  ex.nemesis.forEach((id, i) => {
    const x = rowX(w, ex.nemesis.length, cardW, gap, i);
    parts.push(at(x, top, nemesisCard(id, cardW)), at(x - 1.8, top - 1.8, `<span class="rb-order">${i + 1}</span>`), at(x, top + cardH + 0.9, caption(id, cardW)));
  });
  const blocked = new Set(ex.blocks.map(([, attacker]) => attacker));
  ex.yours.forEach((creature, i) => {
    const x = rowX(w, ex.yours.length, cardW, gap, i);
    parts.push(at(x, bottom, yourCard(creature, cardW, labels)));
    if (!blocked.has(i)) parts.push(at(x, bottom + cardH + 1.2, `<span class="rb-pill hit" style="width:${mm(cardW)}">${labels.damage.replace("{n}", String(creature.pt[0]))}</span>`));
  });
  const svg = ex.blocks.map(([blocker, attacker, step]) => {
    const x1 = rowX(w, ex.nemesis.length, cardW, gap, blocker) + cardW / 2;
    const x2 = rowX(w, ex.yours.length, cardW, gap, attacker) + cardW / 2;
    const [bx, by] = [x1 + (x2 - x1) * 0.62, arrowsFrom + (bottom - 1 - arrowsFrom) * 0.62];
    parts.push(at(bx - 2.3, by - 2.3, stepBadge(step)));
    return arrow(x1, arrowsFrom, x2, bottom - 1, STEP_COLOR[step]);
  });
  return figure(w, h, parts, svg.join(""));
}

export function attackFigure(ex: AttackExample, labels: Labels, notes: string[], cardW: number, gap: number): string {
  const cardH = cardW * RATIO;
  const w = ex.nemesis.length * cardW + (ex.nemesis.length - 1) * gap;
  const pillY = cardH + 2.2;
  const yourW = cardW * 0.8;
  const yourY = pillY + 13;
  const yourX = 2;
  const parts: string[] = [];
  const svg: string[] = [];
  ex.nemesis.forEach((id, i) => {
    const x = rowX(w, ex.nemesis.length, cardW, gap, i);
    const attacks = ex.attackers.includes(i);
    parts.push(
      at(x, 1.8, nemesisCard(id, cardW)),
      at(x - 1.8, 0, `<span class="rb-order">${i + 1}</span>`),
      at(x, pillY, `<span class="rb-pill ${attacks ? "hit" : "home"}" style="width:${mm(cardW)}">${attacks ? labels.attacks : labels.stays}</span>`),
    );
    if (!attacks) svg.push(line(yourX + yourW / 2, yourY - 0.8, x + cardW / 2, pillY + 4.6, "#2f7a4b"));
  });
  parts.push(at(yourX, yourY, yourCard(ex.yours[0], yourW, labels)));
  const list = notes.map((note, i) => `<li><span class="rb-order">${i + 1}</span>${note}</li>`).join("");
  parts.push(at(yourX + yourW + 7, yourY + 1, `<ol class="rb-notes" style="width:${mm(w - yourW - 9)}">${list}</ol>`));
  return figure(w, yourY + yourW * RATIO + 1, parts, svg.join(""));
}

export function targetFigure(ex: TargetExample, labels: Labels, spellW: number, cardW: number, gap: number): string {
  const spellH = spellW * RATIO;
  const cardH = cardW * RATIO;
  const startX = spellW + 12;
  const top = spellH - cardH;
  const w = startX + ex.yours.length * cardW + (ex.yours.length - 1) * gap;
  const parts = [at(0, 4, nemesisCard(ex.spell, spellW))];
  ex.yours.forEach((creature, i) => {
    const x = startX + i * (cardW + gap);
    parts.push(at(x, top + 4, yourCard(creature, cardW, labels)));
    if (i === ex.target) parts.push(at(x, top + cardH + 5.5, `<span class="rb-pill hit" style="width:${mm(cardW)}">${labels.target}</span>`));
    else if (creature.keywords?.includes("hexproof")) parts.push(at(x, top + cardH + 5.5, `<span class="rb-pill home" style="width:${mm(cardW)}">${labels.skipped}</span>`));
  });
  const tx = startX + ex.target * (cardW + gap) + cardW / 2;
  const path = `<path d="M${+(spellW - 2).toFixed(2)} 9 C ${+(spellW + 18).toFixed(2)} -6, ${+(tx - 8).toFixed(2)} -6, ${+tx.toFixed(2)} ${+(top + 2.2).toFixed(2)}" fill="none" stroke="#b2271d" stroke-width=".7"/>`;
  const head = arrow(tx - 0.4, top + 0.2, tx, top + 3.2, "#b2271d");
  return figure(w, top + cardH + 11, parts, path + head);
}

export function revealFigure(id: string): string {
  return `<div class="rb-reveal">${threatBack(13)}<svg viewBox="0 0 12 6" width="12mm" height="6mm">${arrow(1, 3, 11, 3, "#8a2b17")}</svg>${nemesisCard(id, 19)}</div>`;
}

export function cycleFigure(you: RulebookList, it: RulebookList): string {
  const panel = (list: RulebookList, cls: string) => `<div class="cy-panel ${cls}"><h3>${list.title}</h3><ol>${list.items.map((item) => `<li>${item}</li>`).join("")}</ol></div>`;
  const arrows = `<svg class="cy-arrows" viewBox="0 0 12 30" width="12mm" height="30mm">${arrow(1, 9, 11, 9, "#8a2b17")}${arrow(11, 21, 1, 21, "#8a2b17")}</svg>`;
  return `<div class="rb-cycle">${panel(you, "you")}${arrows}${panel(it, "it")}</div>`;
}

export function tableFigure(labels: RulebookText["setup"]["table"], d: Labels): string {
  const w = 124;
  const small = 14;
  const smallH = small * RATIO;
  const rowW = 15;
  const rowH = rowW * RATIO;
  const label = (x: number, y: number, text: string, width: number, cls = "") => at(x, y, `<span class="tb-label ${cls}" style="width:${mm(width)}">${text}</span>`);
  const rowX = 34;
  const rowY = 35;
  const rowEnd = rowX + 4 * rowW + 3 * 4;
  const zone = rowY + rowH + 7.4;
  const you = zone + 3;
  const parts = [
    label(3, 2.4, labels.nemesis, 40, "zone"),
    at(5, 8, threatBack(small)),
    label(2, 9 + smallH, labels.library, 20),
    at(24, 8, `<div class="tb-slot" style="width:${mm(small)};height:${mm(smallH)}"></div>`),
    label(21, 9 + smallH, labels.graveyard, 20),
    at(44, 8, nemesisCard("ch_war_drums", small)),
    label(61, 13, labels.permanents, 32, "left"),
    at(104, 9, `<span class="tb-life">20</span>`),
    label(98.5, 9 + smallH, labels.life, 24),
    label(3, rowY + 7, labels.row, 28, "left strong"),
    ...["ch_revel_king", "ch_drunken_throng", "ch_drunken_throng"].map((id, i) => at(rowX + i * (rowW + 4), rowY, nemesisCard(id, rowW))),
    at(rowX + 3 * (rowW + 4), rowY, `<div class="tb-slot new" style="width:${mm(rowW)};height:${mm(rowH)}">+</div>`),
    label(rowX, rowY + rowH + 3.6, labels.oldest, 25, "left"),
    label(rowEnd - 25, rowY + rowH + 3.6, labels.newest, 25, "right"),
    label(3, you + 2.4, labels.you, 40, "zone"),
    ...[0, 1, 2].map((i) => at(5 + i * 5, you + 10 + Math.abs(i - 1) * 0.9, `<div class="tb-back" style="transform:rotate(${(i - 1) * 9}deg)"></div>`)),
    label(2, you + 29, labels.hand, 24),
    at(37, you + 8.5, yourCard({ pt: [3, 3] }, 13, d)),
    at(53, you + 8.5, yourCard({ pt: [2, 2] }, 13, d)),
    label(35, you + 29, labels.creatures, 33),
    ...[0, 1, 2].map((i) => at(75 + i * 11, you + 10.3, `<div class="tb-land"></div>`)),
    label(73, you + 29, labels.lands, 34),
    at(108, you + 9, `<div class="tb-back mine"></div>`),
    label(100, you + 29, labels.library, 24),
  ];
  const lineY = rowY + rowH + 2;
  const svg = `<rect x=".3" y=".3" width="${w - 0.6}" height="${+(zone - 0.6).toFixed(2)}" rx="2.5" fill="#efe1d1" stroke="#cdb79a" stroke-width=".3"/><rect x=".3" y="${+(you + 0.3).toFixed(2)}" width="${w - 0.6}" height="34.4" rx="2.5" fill="#e6dccb" stroke="#c9b99c" stroke-width=".3"/>${arrow(rowX, lineY, rowEnd, lineY, "#8a2b17")}`;
  return figure(w, you + 35, parts, svg);
}

export function anatomyFigure(id: string, width: number): string {
  const f = width / 25;
  const spots: [number, number][] = [
    [-0.2, 2.6],
    [25.2, 2.6],
    [-0.2, 21.6],
    [25.2, 21.6],
    [-0.2, 27.4],
    [25.2, 32.6],
    [-0.2, 33.1],
  ];
  const badges = spots.map(([x, y], i) => at(3 + x * f - 2.2, y * f - 2.2, `<span class="rb-callout">${i + 1}</span>`));
  return `<div class="rb-anat" style="width:${mm(width + 6)};height:${mm(width * RATIO)}">${at(3, 0, nemesisCard(id, width))}${badges.join("")}</div>`;
}

export function turnFigure(ex: TurnExample, d: Labels): string {
  const cardW = 21;
  const cardH = cardW * RATIO;
  const top = 6;
  const bottom = top + cardH + 15;
  const xs = [14, 42];
  const revealX = 92;
  const pumped = (id: string) => {
    const [power, toughness] = cardPt(id).split("/").map(Number);
    return `${power + 1}/${toughness}`;
  };
  const parts = [
    ...ex.nemesis.flatMap((id, i) => [
      at(xs[i], top, nemesisCard(id, cardW)),
      at(xs[i] + cardW - 3.85 * (cardW / 25), top + cardH - 2.45 * (cardW / 25), `<span class="rb-pump">${pumped(id)}</span>`),
    ]),
    at(revealX, top, nemesisCard(ex.hand[0], cardW)),
    at(revealX + cardW / 2 - 6, top - 5.6, `<span class="rb-pill gold" style="width:12mm">+1/+0</span>`),
    ...ex.yours.map((creature, i) => at(xs[i], bottom, yourCard(creature, cardW, d))),
    at(78, bottom + 8, `<span class="rb-life">${d.you} <b>${ex.life} → ${ex.life - Number(pumped(ex.nemesis[1]).split("/")[0])}</b></span>`),
  ];
  const svg = [
    arrow(revealX - 1, top + cardH / 2, xs[1] + cardW + 1.5, top + cardH / 2, "#b48d36", true),
    arrow(xs[0] + cardW / 2, top + cardH + 1, xs[0] + cardW / 2, bottom - 1, "#b2271d"),
    arrow(xs[1] + cardW / 2, top + cardH + 1, 86, bottom + 7, "#b2271d"),
  ];
  return figure(124, bottom + cardH + 1, parts, svg.join(""));
}
