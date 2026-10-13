import { getCard } from "../content";
import type { Card } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { hasArt } from "./art";
import { icon } from "./icons";
import { pip, pips } from "./pips";

export function renderCard(idOrCard: string | Card): string {
  const card = typeof idOrCard === "string" ? getCard(idOrCard) : idOrCard;
  const tx = card[getLocale()];
  const strings = t();
  const cost = card.threat ? pip("X") : [...card.cost].sort((a, b) => Number(/^\d$/.test(a)) - Number(/^\d$/.test(b))).map(pip).join("");
  const glyph = icon(card.threat ? "X" : card.type);
  const type = (card.threat ? strings.threatPrefix : "") + strings.typeLabel[card.type] + (tx.sub ? ` — ${tx.sub}` : "");
  const fit = tx.name.length > 20 ? "xlong" : tx.name.length > 16 ? "long" : "";
  const typeFit = type.length > 33 ? "type-xlong" : type.length > 30 ? "type-long" : "";
  const cls = ["pw-card", `col-${card.color}`, tx.flavor ? "" : "no-flavor", fit, typeFit].filter(Boolean).join(" ");
  const art = hasArt(card.id) ? `<div class="c-img art-${card.id}"></div>` : `<div class="c-emoji">${card.emoji}</div>`;
  return `<div class="${cls}">
  <div class="c-art">${art}</div>
  <div class="c-index"><div class="c-cost">${cost}</div><div class="c-glyph">${glyph}</div><div class="c-ipt">${card.pt ?? ""}</div></div>
  <div class="c-name"><span>${tx.name}</span></div>
  <div class="c-type"><span>${type}</span></div>
  <div class="c-text"><p class="c-rules">${pips(tx.text || "&nbsp;")}</p><p class="c-flavor">${tx.flavor ?? ""}</p></div>
</div>`;
}

export function renderThreatBack(): string {
  return `<div class="pw-card pw-back col-T"><div class="c-art"><div class="c-emoji">${icon("X")}</div></div></div>`;
}
