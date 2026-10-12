import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "../content/types";
import { setLocale } from "../i18n/locale";
import { printPdf } from "../lib/chrome";
import { DIST, ensureDir, readCss } from "../lib/paths";
import { buildPages as buildEn } from "./pages.en";
import { buildPages as buildEs } from "./pages.es";

const EDITIONS: Record<Locale, { build: () => string[]; file: string; title: string }> = {
  en: { build: buildEn, file: "palmwalker-rulebook-en", title: "Palmwalker — Rulebook" },
  es: { build: buildEs, file: "palmwalker-reglamento-es", title: "Palmwalker — Reglamento" },
};

export async function buildRulebook(locale: Locale): Promise<string> {
  setLocale(locale);
  const edition = EDITIONS[locale];
  const css = readCss("render/card.css", "render/faces.css", "rulebook/rulebook.css");
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${edition.title}</title><style>${css}</style></head>
<body>${edition.build().join("")}</body></html>`;
  const outDir = ensureDir(join(DIST, "rulebook"));
  const htmlPath = join(outDir, `${edition.file}.html`);
  const pdfPath = join(outDir, `${edition.file}.pdf`);
  writeFileSync(htmlPath, html, "utf8");
  await printPdf(htmlPath, pdfPath);
  return pdfPath;
}

const requested = process.argv.slice(2).filter((a): a is Locale => a === "en" || a === "es");
for (const locale of requested.length ? requested : (["en", "es"] as Locale[])) {
  console.log(await buildRulebook(locale));
}
