import { SCENES, SHAPES } from "../../content/subjects";
import type { Card } from "../../content/types";

export const SUBJECT_TRANSFORM = "translate(20 19) scale(.6)";

export function svgWrap(inner: string): string {
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

export function layer(card: Card, index: 0 | 1 | 2, attrs: string): string {
  const shape = SCENES[card.art.scene][index];
  return shape ? `<g ${attrs}>${shape}</g>` : "";
}

export interface SubjectOptions {
  bodyFill: string;
  bodyStroke?: string;
  bodyStrokeW?: number;
  bodyOpacity?: number;
  detailFill: string;
  detailStroke?: string;
  detailOpacity?: number;
  filter?: string;
  emojiFilter?: string;
  under?: string;
  over?: string;
}

export function tint(card: Card): string {
  return card.art.tint ?? "#888888";
}

export function detailColor(card: Card): string {
  return card.art.detail ?? "#222222";
}

export function subject(card: Card, o: SubjectOptions): string {
  const s = card.art.subject;
  if ("emoji" in s) {
    const f = o.emojiFilter ?? o.filter;
    return `<g ${f ? `filter="url(#${f})"` : ""}><text x="50" y="54" font-size="46" text-anchor="middle" dominant-baseline="central">${s.emoji}</text></g>`;
  }
  const shape = SHAPES[s.shape];
  const ds = o.detailStroke ?? o.detailFill;
  return `<g transform="${SUBJECT_TRANSFORM}" ${o.filter ? `filter="url(#${o.filter})"` : ""}>
    ${o.under ?? ""}
    <g fill="${o.bodyFill}" stroke="${o.bodyStroke ?? "none"}" stroke-width="${o.bodyStrokeW ?? 0}" stroke-linejoin="round" ${o.bodyOpacity ? `fill-opacity="${o.bodyOpacity}"` : ""}>${shape.body.join("")}</g>
    ${o.over ?? ""}
    <g fill="${o.detailFill}" stroke="${ds}" stroke-width="0" ${o.detailOpacity ? `opacity="${o.detailOpacity}"` : ""}>${shape.detail.join("")}</g>
  </g>`;
}

export function bodyClip(card: Card, id: string): string {
  const s = card.art.subject;
  return "shape" in s ? `<clipPath id="${id}">${SHAPES[s.shape].body.join("")}</clipPath>` : "";
}
