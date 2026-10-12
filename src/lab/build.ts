import { copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";
import { DIST, SRC, ensureDir, readCss } from "../lib/paths";

const out = ensureDir(join(DIST, "lab"));
await build({
  entryPoints: [join(SRC, "lab/main.ts")],
  bundle: true,
  format: "iife",
  target: "es2022",
  outfile: join(out, "app.js"),
  logLevel: "warning",
});
writeFileSync(join(out, "lab.css"), readCss("render/card.css", "lab/skins.css", "lab/lab.css"), "utf8");
copyFileSync(join(SRC, "lab/index.html"), join(out, "index.html"));
console.log(join(out, "index.html"));
