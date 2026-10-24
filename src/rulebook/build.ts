import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RULEBOOK } from "../content/rulebook";
import type { Locale } from "../content/types";
import { DIST, ensureDir } from "../lib/paths";
import { convertToCmyk, dumpDom, printToPdf } from "../pnp/pdf";
import { artCss } from "../render/art";
import { rulebookCss, rulebookPages } from "./pages";

const PAGE = { w: 154, h: 216 };

const OVERFLOW_PROBE = `<script>
addEventListener("load", () => {
  const found = [];
  document.querySelectorAll(".rb-page").forEach((page, i) => {
    for (const area of page.querySelectorAll(".rb-body, .pf-body")) {
      const box = area.getBoundingClientRect();
      for (const el of area.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.bottom > box.bottom + 1 || r.right > box.right + 1 || r.left < box.left - 8)
          found.push("page " + (i + 1) + ": " + (el.textContent || el.className).trim().slice(0, 50));
      }
    }
  });
  document.body.dataset.overflow = JSON.stringify([...new Set(found)]);
});
</script>`;

function checkLayout(dir: string, head: string, body: string): void {
  const path = join(dir, "probe.html");
  writeFileSync(path, `${head}<body>${body}${OVERFLOW_PROBE}</body></html>`, "utf8");
  const report = /data-overflow="([^"]*)"/.exec(dumpDom(path));
  if (!report) throw new Error("The layout check did not run");
  const found: string[] = JSON.parse(report[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
  if (found.length > 0) throw new Error(`Rulebook content overflows its page:\n${found.join("\n")}`);
}

function buildRulebook(locale: Locale): string {
  const pages = rulebookPages(locale).join("");
  const head = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>Automana — ${RULEBOOK[locale].title}</title><style>${rulebookCss()}\n${artCss()}</style></head>`;
  const tmp = mkdtempSync(join(tmpdir(), "automana-rulebook-"));
  try {
    checkLayout(tmp, head, pages);
    const htmlPath = join(tmp, "rulebook.html");
    const rgbPath = join(tmp, "rulebook-rgb.pdf");
    writeFileSync(htmlPath, `${head}\n<body>${pages}</body></html>`, "utf8");
    printToPdf(htmlPath, rgbPath);
    const path = join(ensureDir(DIST), `automana-rulebook-${locale}.pdf`);
    convertToCmyk(rgbPath, path, PAGE);
    return path;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

for (const locale of ["en", "es"] as Locale[]) {
  console.log(buildRulebook(locale));
}
