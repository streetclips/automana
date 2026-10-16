export type IconName = "X";

function polar(r: number, turn: number): string {
  const a = turn * 2 * Math.PI;
  return `${+(12 + r * Math.sin(a)).toFixed(2)} ${+(12 - r * Math.cos(a)).toFixed(2)}`;
}

function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}

function star(points: number, outer: number, inner: number): string {
  return `M${Array.from({ length: 2 * points }, (_, i) => polar(i % 2 ? inner : outer, i / (2 * points))).join("L")}Z`;
}

const path = (d: string, rotate = 0) => `<path${rotate ? ` transform="rotate(${rotate} 12 12)"` : ""} d="${d}"/>`;

const BURST = path(star(12, 11.2, 7));


const ICONS: Record<IconName, string> = {
  X: BURST,
};

const COLLECTIONS: Record<string, string> = {
  vorthrax: path(`M1 12c3.6-7.2 18.4-7.2 22 0-3.6 7.2-18.4 7.2-22 0Z${circle(12, 12, 5.2)}M12 7.6c1.6 2.4 1.6 6.4 0 8.8-1.6-2.4-1.6-6.4 0-8.8Z`),
  vaskara: path("M12 1.99l4.68 2.7v5.4L12 12.79l-4.68-2.7v-5.4ZM6.67 11.21l4.68 2.7v5.4l-4.68 2.7L2 19.31v-5.4ZM17.33 11.21 22 13.91v5.4l-4.67 2.7-4.68-2.7v-5.4Z"),
  morwen: path(`M3 8.6l4.6 4.8L12 6.2l4.4 7.2L21 8.6l-1.6 9.8H4.6ZM4.4 19.8h15.2V22H4.4Z${circle(3, 6.8, 1.7)}${circle(12, 4.2, 1.9)}${circle(21, 6.8, 1.7)}`),
  stampede: path("M2 3.5c.8 6 4.8 9.5 10 9.5s9.2-3.5 10-9.5c-2 3.2-5.4 5.2-10 5.2S4 6.7 2 3.5ZM8.6 14.6h6.8v5.2L12 22.4l-3.4-2.6Z"),
  revel: path("M5 2h14c0 6.2-3 9.4-6 9.9V19h4.2v2.4H6.8V19H11v-7.1C8 11.4 5 8.2 5 2Z"),
  hydra: path(`${circle(4.6, 5, 2.6)}${circle(12, 3.4, 2.6)}${circle(19.4, 5, 2.6)}M3.6 7.6l1.9-.5L10.6 20h2.8l5.1-12.9 1.9.5L15 22.4H9ZM10.9 5.8h2.2v14.4h-2.2Z`),
  "mirror-archmage": path("M12.6 3c1.6 3 2.8 8 4 13.6H7.4c1.4-4.8 3-8.8 6-10.8-1.2-.6-1.4-1.6-.8-2.8ZM2 19c3-1.8 17-1.8 20 0-3 2-17 2-20 0ZM11.7 9.4l.5 1.31 1.4.07-1.09.88.37 1.36-1.18-.77-1.18.77.37-1.36-1.09-.88 1.4-.07Z"),
};

function svg(body: string): string {
  return `<svg class="icon" viewBox="0 0 24 24" fill-rule="evenodd" aria-hidden="true">${body}</svg>`;
}

export function icon(name: IconName): string {
  return svg(ICONS[name]);
}

export function collectionIcon(collection: string): string {
  const body = COLLECTIONS[collection];
  if (!body) throw new Error(`No symbol for collection ${collection}`);
  return svg(body);
}
