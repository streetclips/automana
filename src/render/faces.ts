import { REFERENCE } from "../content";
import type { Reference } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { pips } from "./pips";

export type Face = "A" | "B";

interface Half {
  state: string;
  name: string;
  body: string[];
}

function twoHalfCard(cls: string, top: Half, bottom: Half, face: Face): string {
  const half = (h: Half) => `
<div class="half">
  <div class="hhead"><span class="state">${h.state}</span><span class="hname">${h.name}</span></div>
  <div class="hbody">${h.body.map((p) => `<p>${pips(p)}</p>`).join("")}</div>
</div>`;
  return `<div class="pw-card pw-face ${cls}"><div class="halves">${half(top)}${half(bottom)}</div><div class="facetag">${t().face} ${face}</div></div>`;
}

export function referenceFace(face: Face, reference: Reference = REFERENCE): string {
  const sides = reference[getLocale()];
  const [top, bottom] = face === "A" ? [sides[0], sides[1]] : [sides[2], sides[3]];
  const half = (side: (typeof sides)[number]): Half => ({ state: side.title, name: "", body: side.items });
  return twoHalfCard("reference", half(top), half(bottom), face);
}
