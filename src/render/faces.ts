import { REFERENCE } from "../content";
import { getLocale, t } from "../i18n/locale";
import { pips } from "./pips";

export type Face = "A" | "B";

interface Half {
  state: string;
  name: string;
  body: string[];
}

function fourStateCard(cls: string, upright: Half, flipped: Half, face: Face): string {
  const half = (h: Half, flip: boolean) => `
<div class="half${flip ? " flip" : ""}">
  <div class="hhead"><span class="state">${h.state}</span><span class="hname">${h.name}</span></div>
  <div class="hbody">${h.body.map((p) => `<p>${pips(p)}</p>`).join("")}</div>
</div>`;
  return `<div class="pw-card pw-face ${cls}"><div class="halves">${half(upright, false)}${half(flipped, true)}</div><div class="facetag">${t().face} ${face}</div></div>`;
}

export function referenceFace(face: Face): string {
  const sides = REFERENCE[getLocale()];
  const [upright, flipped] = face === "A" ? [sides[0], sides[1]] : [sides[2], sides[3]];
  const half = (side: (typeof sides)[number]): Half => ({ state: side.title, name: "", body: side.items });
  return fourStateCard("reference", half(upright), half(flipped), face);
}
