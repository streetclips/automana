import type { Card } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { pips } from "../render/pips";

export function page(content: string, folio?: number, cls = ""): string {
  const f = folio ? `<div class="folio">— ${folio} —</div>` : "";
  return `<section class="page ${cls}">${content}${f}</section>`;
}

export function chip(name: string, pt = "", side = "you", low = false, note = ""): string {
  const cls = `chip ${side}${low ? " low" : ""}`;
  const ptx = pt ? `<span class="cpt">${pt}</span>` : "";
  const nt = note ? `<span class="cnote">${note}</span>` : "";
  const lt = low ? `<span class="lowtag">${t().lowered}</span>` : "";
  return `<div class="${cls}"><span class="cname">${name}</span>${nt}${ptx}${lt}</div>`;
}

export function landChip(kind: "M" | "F", low = false): string {
  return `<div class="lchip${low ? " low" : ""}">${pips(kind === "M" ? "{R}" : "{G}")}</div>`;
}

export function board(
  title: string, you: number, vor: number, phase: string, kael: string, omen: string,
  nemCreatures: string[], yourCreatures: string[], lands: string[], hand: number,
): string {
  const s = t();
  const empty = `<span class="empty">${s.noCreatures}</span>`;
  return `
<div class="board">
  <div class="btitle">${title}</div>
  <div class="brow nem">
    <div class="omen"><span>${s.omen}</span>${omen}</div>
    <div class="bslot"><div class="bossbadge">Vorthrax · ${phase}</div>${nemCreatures.join("") || empty}</div>
  </div>
  <div class="brow you">
    <div class="bslot">${yourCreatures.join("") || empty}</div>
    <div class="walkerchip">Kael <b>${kael}</b><div class="lands">${lands.join("")}</div></div>
  </div>
  <div class="meters"><span class="m you">📖 ${s.you} <b>${you}</b></span><span class="m vor">🜂 Vorthrax <b>${vor}</b></span><span class="m hand">✋ ${s.hand} ${hand}</span></div>
</div>`;
}

export function status(you: number, vor: number, phase: string, kael: string, omen: string): string {
  const s = t();
  return `<div class="status"><span class="s you">📖 ${s.you} ${you}</span><span class="s vor">🜂 Vorthrax ${vor}</span>`
    + `<span class="s ph">${phase}</span><span class="s k">Kael ${kael}</span><span class="s om">${s.omenLabel} ${omen}</span></div>`;
}

export function turn(head: string, side: string, steps: string[], why = ""): string {
  const items = steps.map((x) => `<li>${pips(x)}</li>`).join("");
  const w = why ? `<div class="why"><b>${t().why}</b> ${why}</div>` : "";
  return `<div class="turn ${side}"><div class="thead">${head}</div><ol>${items}</ol>${w}</div>`;
}

export function cardListRows(cards: Card[]): string {
  const s = t();
  return cards
    .map((c) => {
      const tx = c[getLocale()];
      const cost = c.cost.length && !c.threat ? pips(c.cost.map((x) => `{${x}}`).join("")) : "—";
      const type = s.typeLabel[c.type] + (tx.sub ? ` — ${tx.sub}` : "");
      return `<tr><td>${c.qty}</td><td><b>${tx.name}</b></td><td>${cost}</td><td>${type}</td><td>${c.pt ?? ""}</td><td>${pips(tx.text)}</td></tr>`;
    })
    .join("");
}
