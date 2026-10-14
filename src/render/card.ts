import { collectorNumber, getCard, type CollectorNumber } from "../content";
import type { Card } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { hasArt } from "./art";
import { collectionIcon, grimoireMark, icon } from "./icons";
import { pip, pips } from "./pips";

const TIERS = ["", "I", "II", "III"];

export function renderCard(idOrCard: string | Card, copy = 0, number?: CollectorNumber): string {
  const card = typeof idOrCard === "string" ? getCard(idOrCard) : idOrCard;
  const num = number ?? collectorNumber(card.id);
  const set = num ? `<div class="c-set">${collectionIcon(num.collection)}<span>${num.first + copy}/${num.total}</span></div>` : "";
  const tx = card[getLocale()];
  const strings = t();
  const cost = card.tier ? `<span class="pip pip-X pip-tier"><b>${TIERS[card.tier]}</b></span>` : pip(card.threat ? "X" : String(card.cost ?? 0));
  const type = (card.threat ? strings.threatPrefix : "") + strings.typeLabel[card.type] + (tx.sub ? ` — ${tx.sub}` : "");
  const fit = tx.name.length > 20 ? "xlong" : tx.name.length > 16 ? "long" : "";
  const typeFit = type.length > 33 ? "type-xlong" : type.length > 30 ? "type-long" : "";
  const cls = ["pw-card", `col-${card.color}`, tx.flavor ? "" : "no-flavor", card.pt ? "has-pt" : "", fit, typeFit].filter(Boolean).join(" ");
  const art = hasArt(card.id) ? `<div class="c-img art-${card.id}"></div>` : `<div class="c-glow"></div>`;
  return `<div class="${cls}">
  <div class="c-art">${art}</div>
  <div class="c-name"><span>${tx.name}</span><div class="c-cost">${cost}</div></div>
  <div class="c-type"><span>${type}</span></div>
  <div class="c-text"><p class="c-rules">${pips(tx.text || "&nbsp;")}</p><p class="c-flavor">${tx.flavor ?? ""}</p>${set}</div>
  ${card.pt ? `<div class="c-pt"><span>${card.pt}</span></div>` : ""}
</div>`;
}

export function renderThreatBack(): string {
  return `<div class="pw-card pw-back col-T"><div class="c-art"><div class="c-glow">${icon("X")}</div></div></div>`;
}

export function renderGrimoireBack(): string {
  return `<div class="pw-card pw-back grimoire-back"><div class="c-art"><div class="c-glow">${grimoireMark()}<span class="c-mark">Palmwalker</span></div></div></div>`;
}
