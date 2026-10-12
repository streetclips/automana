import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { GRIMOIRES, NEMESES } from "../content";
import type { Card, Locale } from "../content/types";
import { getLocale, setLocale, t } from "../i18n/locale";
import { renderCard } from "../render/card";
import { nemesisFace, referenceFace, walkerFace } from "../render/faces";
import { DIST, ensureDir, readCss } from "../lib/paths";

function copies(cards: Card[]): string {
  return cards.flatMap((c) => Array.from({ length: c.qty }, () => renderCard(c))).join("");
}

function section(title: string, cards: string): string {
  return `<section><h2>${title}</h2><div class="grid">${cards}</div></section>`;
}

function buildSheet(locale: Locale): string {
  setLocale(locale);
  const s = t();
  const sections = [
    section(`${s.walker} · ${s.reference}`, walkerFace("A") + walkerFace("B") + referenceFace("A") + referenceFace("B")),
    section(s.lands, GRIMOIRES.map((g) => renderCard(g.land)).join("")),
    ...GRIMOIRES.map((g) => section(`${s.halfGrimoire} · ${g[locale].name}`, copies(g.cards))),
    ...NEMESES.map((n) => section(`${n[locale].name} · ${s.threatDeck}`, nemesisFace(n, "A") + nemesisFace(n, "B") + copies(n.threats))),
  ];
  const css = readCss("render/card.css", "render/faces.css", "sheet/sheet.css");
  const html = `<!doctype html><html lang="${getLocale()}"><head><meta charset="utf-8"><title>${s.sheetTitle}</title><style>${css}</style></head>
<body><h1>${s.sheetTitle}</h1>${sections.join("")}</body></html>`;
  const path = join(ensureDir(DIST), `palmwalker-cards-${locale}.html`);
  writeFileSync(path, html, "utf8");
  return path;
}

for (const locale of ["en", "es"] as Locale[]) {
  console.log(buildSheet(locale));
}
