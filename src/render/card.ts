import type { Card } from "../content/types";
import { getLocale, t } from "../i18n/locale";
import { hasArt } from "./art";
import { collectionIcon, icon } from "./icons";

export interface CollectorNumber {
  collection: string;
  first: number;
  total: number;
}

type FrameColor = "red" | "green" | "black" | "blue" | "gold";

const SETS: Record<string, { code: string; color: FrameColor }> = {
  vorthrax: { code: "VOR", color: "red" },
  vaskara: { code: "VAS", color: "green" },
  morwen: { code: "MOR", color: "black" },
  "mirror-archmage": { code: "MIR", color: "blue" },
  stampede: { code: "STA", color: "red" },
  revel: { code: "REV", color: "gold" },
  hydra: { code: "HYD", color: "green" },
};

const plainLength = (html: string) => html.replace(/<[^>]+>/g, "").length;

export function renderCard(card: Card, copy: number, number: CollectorNumber): string {
  const set = SETS[number.collection];
  if (!set) throw new Error(`No set code for collection ${number.collection}`);
  const tx = card[getLocale()];
  const strings = t();
  const symbol = collectionIcon(number.collection);
  const type = strings.threatPrefix + strings.typeLabel[card.type] + (tx.sub ? ` — ${tx.sub}` : "");
  const cls = ["pw-card", `k-${set.color}`, card.pt ? "has-pt" : ""].filter(Boolean).join(" ");
  const fit = `--name-len:${tx.name.length};--type-len:${type.length};--text-len:${Math.max(1, plainLength(tx.text))}`;
  const art = hasArt(card.id) ? `<div class="c-img art-${card.id}"></div>` : `<div class="c-glow">${symbol}</div>`;
  return `<div class="${cls}" style="${fit}">
  <div class="c-art">${art}</div>
  <div class="c-name"><span class="c-title">${tx.name}</span><span class="pip">${icon("X")}</span></div>
  <div class="c-type"><span class="c-line">${type}</span><span class="c-sym">${symbol}</span></div>
  <div class="c-text"><p class="c-rules">${tx.text}</p>${tx.flavor ? `<p class="c-flavor">${tx.flavor}</p>` : ""}</div>
  ${card.pt ? `<div class="c-pt"><span>${card.pt}</span></div>` : ""}
  <div class="c-info"><span>${number.first + copy}/${number.total}</span><span>${set.code} • ${getLocale().toUpperCase()}</span></div>
  <div class="c-stamp">${icon("X")}</div>
</div>`;
}

export function renderThreatBack(): string {
  return `<div class="pw-card pw-back"><div class="b-frame"></div><div class="b-seal">${icon("X")}</div><div class="b-word">Automana</div></div>`;
}
