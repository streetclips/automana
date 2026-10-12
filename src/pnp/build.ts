import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Locale } from "../content/types";
import { setLocale, t } from "../i18n/locale";
import { DIST, ensureDir, readCss } from "../lib/paths";
import { artCss } from "../render/art";
import { buildDeck } from "./deck";
import { impose } from "./imposition";
import { convertToCmyk, printToPdf } from "./pdf";

function buildPnp(locale: Locale): string {
  setLocale(locale);
  const deck = buildDeck();
  const css = [readCss("render/card.css", "render/faces.css", "pnp/pnp.css"), artCss()].join("\n");
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${t().sheetTitle}</title><style>${css}</style></head>
<body>${impose(deck).join("")}</body></html>`;
  const tmp = mkdtempSync(join(tmpdir(), "palmwalker-pnp-"));
  try {
    const htmlPath = join(tmp, "deck.html");
    const rgbPath = join(tmp, "deck-rgb.pdf");
    writeFileSync(htmlPath, html, "utf8");
    printToPdf(htmlPath, rgbPath);
    const path = join(ensureDir(DIST), `palmwalker-pnp-${locale}.pdf`);
    convertToCmyk(rgbPath, path);
    return `${path} (${deck.length} cards)`;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

for (const locale of ["en", "es"] as Locale[]) {
  console.log(buildPnp(locale));
}
