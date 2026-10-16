export interface PrintCard {
  front: string;
  back: string;
}

const SHEET = { w: 210, h: 297 };
const TRIM = { w: 63, h: 88 };
const BLEED = 3;
const COLS = 3;
const ROWS = 3;
const CELL = { w: TRIM.w + 2 * BLEED, h: TRIM.h + 2 * BLEED };
const ORIGIN = { x: (SHEET.w - COLS * CELL.w) / 2, y: (SHEET.h - ROWS * CELL.h) / 2 };

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function cell(html: string, col: number, row: number): string {
  return `<div class="cell" style="left:${ORIGIN.x + col * CELL.w}mm;top:${ORIGIN.y + row * CELL.h}mm">${html}</div>`;
}

function cropMarks(): string {
  const xs = range(COLS).flatMap((c) => [ORIGIN.x + c * CELL.w + BLEED, ORIGIN.x + (c + 1) * CELL.w - BLEED]);
  const ys = range(ROWS).flatMap((r) => [ORIGIN.y + r * CELL.h + BLEED, ORIGIN.y + (r + 1) * CELL.h - BLEED]);
  const vertical = xs.flatMap((x) => [0, SHEET.h - ORIGIN.y].map((y) => `<i class="mark v" style="left:${x}mm;top:${y}mm;height:${ORIGIN.y}mm"></i>`));
  const horizontal = ys.flatMap((y) => [0, SHEET.w - ORIGIN.x].map((x) => `<i class="mark h" style="left:${x}mm;top:${y}mm;width:${ORIGIN.x}mm"></i>`));
  return [...vertical, ...horizontal].join("");
}

function sheet(cards: PrintCard[], side: "front" | "back"): string {
  const cells = cards.map((card, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return cell(card[side], side === "front" ? col : COLS - 1 - col, row);
  });
  return `<div class="sheet">${cells.join("")}${cropMarks()}</div>`;
}

export function impose(deck: PrintCard[]): string[] {
  const perSheet = COLS * ROWS;
  return range(Math.ceil(deck.length / perSheet)).flatMap((i) => {
    const cards = deck.slice(i * perSheet, (i + 1) * perSheet);
    return [sheet(cards, "front"), sheet(cards, "back")];
  });
}
