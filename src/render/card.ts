import { getCard } from "../content";
import type { Card } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { renderArt, type ArtStyleId } from "./art/styles";
import { pip, pips } from "./pips";

export type CardSize = "xs" | "sm" | "md" | "lg" | "vd" | "hd" | "big" | "lab";

export type Skin = "palm" | `f${number}`;

export interface CardOptions {
  skin?: Skin;
  art?: ArtStyleId;
  extra?: string;
  num?: string;
}

const GLYPHS: Record<Card["type"], string> = { creature: "⚔", instant: "ϟ", sorcery: "✶", aura: "◈", land: "▲", spell: "✹" };

function manaValue(card: Card): string {
  if (card.type === "land") return "▲";
  if (card.threat) return "—";
  return String(card.cost.reduce((n, c) => n + (/^\d$/.test(c) ? Number(c) : 1), 0));
}

export function renderCard(idOrCard: string | Card, size: CardSize = "md", opts: CardOptions = {}): string {
  const card = typeof idOrCard === "string" ? getCard(idOrCard) : idOrCard;
  const tx = card[getLocale()];
  const strings = t();
  const skin = opts.skin ?? "palm";
  const cost = card.threat ? '<span class="pip pip-X">✹</span>' : card.cost.map(pip).join("");
  const glyph = card.threat ? "✹" : GLYPHS[card.type];
  const type = (card.threat ? strings.threatPrefix : "") + strings.typeLabel[card.type] + (tx.sub ? ` — ${tx.sub}` : "");
  const fit = tx.name.length > 20 ? "xlong" : tx.name.length > 16 ? "long" : "";
  const cls = ["pw-card", `skin-${skin}`, skin.startsWith("f") ? skin : "", `size-${size}`, `col-${card.color}`, card.pt ? "" : "no-pt", tx.flavor ? "" : "no-flavor", fit, opts.extra ?? ""]
    .filter(Boolean)
    .join(" ");
  return `<div class="${cls}">
  <div class="c-deco"><i>❦</i><i>❦</i><i>❦</i><i>❦</i></div>
  <div class="c-art">${renderArt(card, opts.art)}</div>
  <div class="c-index"><div class="c-cmc">${manaValue(card)}</div><div class="c-cost">${cost}</div><div class="c-glyph">${glyph}</div><div class="c-ipt">${card.pt ?? ""}</div></div>
  <div class="c-name"><span>${tx.name}</span></div>
  <div class="c-num">${opts.num ?? ""}</div>
  <div class="c-type"><span>${type}</span></div>
  <div class="c-text"><p class="c-rules">${pips(tx.text || "&nbsp;")}</p><p class="c-flavor">${tx.flavor ?? ""}</p></div>
  <div class="c-pt"><span>${card.pt ?? ""}</span></div>
</div>`;
}

export function land(kind: "Mountain" | "Forest", size: CardSize = "md"): string {
  return renderCard(kind === "Mountain" ? "mountain" : "forest", size);
}
