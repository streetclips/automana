import type { CardType } from "../content/types";

export type IconName = "W" | "U" | "B" | "R" | "G" | "T" | "X" | CardType;

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

function rays(count: number, from: number, to: number, spread: number): string {
  return Array.from({ length: count }, (_, i) => `M${polar(to, i / count)}L${polar(from, i / count + spread)}L${polar(from, i / count - spread)}Z`).join("");
}

const path = (d: string, rotate = 0) => `<path${rotate ? ` transform="rotate(${rotate} 12 12)"` : ""} d="${d}"/>`;

const SWORD = "M12-1.8 13.5 1.2v16h1.9V19h-2.5v4h.7v2.4h-3.2V23h.7v-4H8.6v-1.8h1.9v-16Z";

const BURST = path(star(12, 11.2, 7));

const ICONS: Record<IconName, string> = {
  W: path(rays(8, 6.9, 11.6, 0.034) + circle(12, 12, 4.9)),
  U: path("M12 2c-1 2-7 7.2-7 12.8a7 7 0 0 0 14 0C19 9.2 13 4 12 2Z"),
  B: path(`M12 2.4c-4.8 0-8.2 3.4-8.2 8 0 2.7 1.3 4.8 3.6 6v2.8c0 1.1.9 2 2 2h5.2c1.1 0 2-.9 2-2v-2.8c2.3-1.2 3.6-3.3 3.6-6 0-4.6-3.4-8-8.2-8Z${circle(8.6, 11, 2.5)}${circle(15.4, 11, 2.5)}M12 14l1.3 2.5h-2.6Z`),
  R: path("M13 1.8c1 3.7 6 6.7 6 12.5 0 4.3-3.1 7.5-7 7.5s-7-3.2-7-7.2c0-3.2 1.6-5.2 3.2-6.6 0 2.4.8 3.8 2.2 4.4-.6-4 .4-7.8 2.6-10.6ZM12.2 11.8c.8 2.2 3.2 3.2 3.2 5.6 0 1.6-1.5 2.6-3.4 2.6s-3.4-1-3.4-2.6c0-2 2.6-3 3.6-5.6Z"),
  G: path("M12 1.5l4.6 6.9h-2l4.2 6h-2.4l4.2 5.8h-7.2v2.4h-2.8v-2.4H3.4l4.2-5.8H5.2l4.2-6h-2Z"),
  T: path("M10.3 2.6h3.4v9.8h4.9L12 21l-6.6-8.6h4.9Z"),
  X: BURST,
  creature: path(SWORD, -45) + path(SWORD, 45),
  instant: path("M14.6 1.5 5.6 13.4h5.6l-2 9.1 9.2-12.5h-5.6Z"),
  sorcery: path(star(6, 11.2, 4.4)),
  aura: path("M12 1 23 12 12 23 1 12ZM12 4.4 4.4 12l7.6 7.6 7.6-7.6ZM12 7.6l4.4 4.4-4.4 4.4L7.6 12Z"),
  land: path("M12 3.5l9.6 16.5H2.4Z"),
  spell: BURST,
};

const COLLECTIONS: Record<string, string> = {
  "dawnward-order": path("M7 14.2a5 5 0 0 1 10 0ZM1.54 10.8l4.78.04-.89 2.74ZM5.53 5.3l3.85 2.84-2.33 1.7ZM12 3.2l1.44 4.56h-2.88ZM18.47 5.3l-1.52 4.54-2.33-1.7ZM22.46 10.8l-3.89 2.78-.89-2.74ZM1.5 15.6h21v2.1h-21ZM5.5 19.3h13v1.9h-13Z"),
  "arcane-tide": path([5.2, 10.6, 16].map((y) => `M2 ${y}q2.5-2.8 5 0t5 0 5 0 5 0v2.5q-2.5 2.8-5 0t-5 0-5 0-5 0Z`).join("")),
  "grim-pact": path("M11.09 2.44A9.6 9.6 0 1 0 21.16 14.88 8 8 0 0 1 11.09 2.44Z"),
  emberkin: path("M10.2 1.6h3.6v1.8h-3.6ZM11 3.4h2v19.1h-2ZM13.6 5.2c3.4.4 6.8-1.6 8.4-3.4 1.2 4.2 1.2 8.8 0 13-1.6-1.8-5-3.4-8.4-3ZM10.4 5.2c-3.4.4-6.8-1.6-8.4-3.4-1.2 4.2-1.2 8.8 0 13 1.6-1.8 5-3.4 8.4-3Z"),
  wildwood: path("M12 1.5c6.5 4 8.5 9.5 7 14-1.3 3.8-4.4 5.5-7 5.7-2.6-.2-5.7-1.9-7-5.7-1.5-4.5.5-10 7-14ZM11.4 6.5h1.2V23h-1.2ZM12.6 12.2 17 8.6l.4 1-4.8 4ZM12.6 16.4l4.6-3.2.4 1-5 3.6ZM11.4 12.2 7 8.6l-.4 1 4.8 4ZM11.4 16.4l-4.6-3.2-.4 1 5 3.6Z"),
  vorthrax: path(`M1 12c3.6-7.2 18.4-7.2 22 0-3.6 7.2-18.4 7.2-22 0Z${circle(12, 12, 5.2)}M12 7.6c1.6 2.4 1.6 6.4 0 8.8-1.6-2.4-1.6-6.4 0-8.8Z`),
  vaskara: path("M12 1.99l4.68 2.7v5.4L12 12.79l-4.68-2.7v-5.4ZM6.67 11.21l4.68 2.7v5.4l-4.68 2.7L2 19.31v-5.4ZM17.33 11.21 22 13.91v5.4l-4.67 2.7-4.68-2.7v-5.4Z"),
  morwen: path(`M3 8.6l4.6 4.8L12 6.2l4.4 7.2L21 8.6l-1.6 9.8H4.6ZM4.4 19.8h15.2V22H4.4Z${circle(3, 6.8, 1.7)}${circle(12, 4.2, 1.9)}${circle(21, 6.8, 1.7)}`),
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
