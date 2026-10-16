import type { Card } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { hasArt } from "./art";
import { collectionIcon, icon } from "./icons";

export interface CollectorNumber {
  collection: string;
  first: number;
  total: number;
}

export function renderCard(card: Card, copy: number, number: CollectorNumber): string {
  const set = `<div class="c-set">${collectionIcon(number.collection)}<span>${number.first + copy}/${number.total}</span></div>`;
  const tx = card[getLocale()];
  const strings = t();
  const cost = `<span class="pip pip-X">${icon("X")}</span>`;
  const type = strings.threatPrefix + strings.typeLabel[card.type] + (tx.sub ? ` — ${tx.sub}` : "");
  const fit = tx.name.length > 20 ? "xlong" : tx.name.length > 16 ? "long" : "";
  const typeFit = type.length > 33 ? "type-xlong" : type.length > 30 ? "type-long" : "";
  const cls = ["pw-card", "col-T", tx.flavor ? "" : "no-flavor", card.pt ? "has-pt" : "", fit, typeFit].filter(Boolean).join(" ");
  const art = hasArt(card.id) ? `<div class="c-img art-${card.id}"></div>` : `<div class="c-glow"></div>`;
  return `<div class="${cls}">
  <div class="c-art">${art}</div>
  <div class="c-name"><span>${tx.name}</span><div class="c-cost">${cost}</div></div>
  <div class="c-type"><span>${type}</span></div>
  <div class="c-text"><p class="c-rules">${tx.text || "&nbsp;"}</p><p class="c-flavor">${tx.flavor ?? ""}</p>${set}</div>
  ${card.pt ? `<div class="c-pt"><span>${card.pt}</span></div>` : ""}
</div>`;
}

export function renderThreatBack(): string {
  return `<div class="pw-card pw-back col-T"><div class="c-art"><div class="c-glow">${icon("X")}</div></div></div>`;
}
