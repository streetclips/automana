import { statSync } from "node:fs";
import { BOX_REFERENCE, DECK_NAMES } from "../content";
import type { Card, Locale } from "../content/types";
import { setLocale, t } from "../i18n/locale";
import { artPath, readCss } from "../lib/paths";
import { BOX_DECKS, buildBoxDeck } from "../pnp/box";
import { impose } from "../pnp/imposition";
import { artCss } from "../render/art";
import { renderCard, renderThreatBack } from "../render/card";
import { referenceFace, type Face } from "../render/faces";
import { textureCss } from "../render/textures";

export type View = "cards" | "pnp";

export const LOCALES: Locale[] = ["en", "es"];

const VIEWS: View[] = ["cards", "pnp"];

const KEEP_SCROLL = `<script>
for (const a of document.querySelectorAll(".locales a")) a.onclick = () => sessionStorage.setItem("scrollY", String(scrollY));
const y = sessionStorage.getItem("scrollY");
if (y) { sessionStorage.removeItem("scrollY"); scrollTo(0, Number(y)); }
</script>`;

interface Section {
  id: string;
  title: string;
  slots: string[];
}

interface Body {
  css: string;
  nav: string;
  main: string;
}

function artUrl(cardId: string): string {
  return `/art/${cardId}.jpg?v=${statSync(artPath(cardId)).mtimeMs}`;
}

function slot(html: string, label: string): string {
  return `<figure>${html}<figcaption>${label}</figcaption></figure>`;
}

function cardSlots(collection: string, cards: Card[]): string[] {
  const total = cards.reduce((sum, c) => sum + c.qty, 0);
  let first = 1;
  return cards.map((card) => {
    const html = renderCard(card, 0, { collection, first, total });
    first += card.qty;
    return slot(html, card.qty > 1 ? `${card.id} ×${card.qty}` : card.id);
  });
}

function faceSlots(name: string, render: (face: Face) => string): string[] {
  return (["A", "B"] as Face[]).map((face) => slot(render(face), `${name} · ${face}`));
}

function sections(locale: Locale): Section[] {
  const s = t();
  return [
    { id: "reference", title: s.reference, slots: faceSlots("reference", (face) => referenceFace(face, BOX_REFERENCE)) },
    { id: "backs", title: s.backs, slots: [slot(renderThreatBack(), "threat-back")] },
    ...BOX_DECKS.map((d) => ({ id: d.id, title: `${DECK_NAMES[d.id][locale].name} · ${s.threatDeck}`, slots: cardSlots(d.id, d.cards) })),
  ];
}

function cardsBody(locale: Locale): Body {
  const all = sections(locale);
  return {
    css: readCss("render/card.css", "render/faces.css", "preview/preview.css"),
    nav: all.map((sec) => `<a href="#${sec.id}">${sec.id}</a>`).join(""),
    main: all.map((sec) => `<section id="${sec.id}"><h2>${sec.title}</h2><div class="grid">${sec.slots.join("")}</div></section>`).join(""),
  };
}

function pnpBody(): Body {
  const pages = impose(buildBoxDeck()).map((sheet, i) => `<figure class="page">${sheet}<figcaption>sheet ${Math.floor(i / 2) + 1} · ${i % 2 ? "back" : "front"}</figcaption></figure>`);
  return { css: readCss("render/card.css", "render/faces.css", "pnp/pnp.css", "preview/preview.css"), nav: "", main: pages.join("") };
}

function link(href: string, label: string, on: boolean): string {
  return `<a href="${href}"${on ? ' class="on"' : ""}>${label}</a>`;
}

export function pagePath(view: View, locale: Locale): string {
  return view === "cards" ? `/${locale}` : `/${locale}/${view}`;
}

export function renderPage(view: View, locale: Locale): string {
  setLocale(locale);
  const { css, nav, main } = view === "cards" ? cardsBody(locale) : pnpBody();
  const views = VIEWS.map((v) => link(pagePath(v, locale), v, v === view)).join("");
  const locales = LOCALES.map((l) => link(pagePath(view, l), l, l === locale)).join("");
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${t().sheetTitle}</title><link rel="icon" href="data:,"><style>${css}\n${textureCss()}\n${artCss(artUrl)}</style></head>
<body><header><b>Automana</b><nav>${views}</nav><nav class="locales">${locales}</nav><nav>${nav}</nav></header>
<main>${main}</main>${KEEP_SCROLL}</body></html>`;
}
