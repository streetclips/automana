import { getCard } from "../content";
import type { Card } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { pip, pips } from "./pips";

const GLYPHS: Record<Card["type"], string> = { creature: "⚔", instant: "ϟ", sorcery: "✶", aura: "◈", land: "▲", spell: "✹" };

function manaValue(card: Card): string {
  if (card.type === "land") return "▲";
  if (card.threat) return "—";
  return String(card.cost.reduce((n, c) => n + (/^\d$/.test(c) ? Number(c) : 1), 0));
}

export function renderCard(idOrCard: string | Card): string {
  const card = typeof idOrCard === "string" ? getCard(idOrCard) : idOrCard;
  const tx = card[getLocale()];
  const strings = t();
  const cost = card.threat ? '<span class="pip pip-X">✹</span>' : card.cost.map(pip).join("");
  const glyph = card.threat ? "✹" : GLYPHS[card.type];
  const type = (card.threat ? strings.threatPrefix : "") + strings.typeLabel[card.type] + (tx.sub ? ` — ${tx.sub}` : "");
  const fit = tx.name.length > 20 ? "xlong" : tx.name.length > 16 ? "long" : "";
  const cls = ["pw-card", `col-${card.color}`, tx.flavor ? "" : "no-flavor", fit].filter(Boolean).join(" ");
  return `<div class="${cls}">
  <div class="c-art"><div class="c-emoji">${card.emoji}</div></div>
  <div class="c-index"><div class="c-cmc">${manaValue(card)}</div><div class="c-cost">${cost}</div><div class="c-glyph">${glyph}</div><div class="c-ipt">${card.pt ?? ""}</div></div>
  <div class="c-name"><span>${tx.name}</span></div>
  <div class="c-type"><span>${type}</span></div>
  <div class="c-text"><p class="c-rules">${pips(tx.text || "&nbsp;")}</p><p class="c-flavor">${tx.flavor ?? ""}</p></div>
</div>`;
}
