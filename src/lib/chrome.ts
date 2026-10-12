import { execFile } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);

function findHeadlessShell(): string | undefined {
  const cache = join(homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(cache)) return undefined;
  const dirs = readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse();
  for (const d of dirs) {
    for (const sub of readdirSync(join(cache, d))) {
      const bin = join(cache, d, sub, "chrome-headless-shell");
      if (existsSync(bin)) return bin;
    }
  }
  return undefined;
}

const SYSTEM_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export function chromeBinary(): { bin: string; headlessFlag: string[] } {
  const custom = process.env.PALMWALKER_CHROME;
  if (custom) return { bin: custom, headlessFlag: ["--headless=new"] };
  const shell = findHeadlessShell();
  if (shell) return { bin: shell, headlessFlag: [] };
  if (existsSync(SYSTEM_CHROME)) return { bin: SYSTEM_CHROME, headlessFlag: ["--headless=new"] };
  throw new Error("No Chrome found. Install one with `npx playwright install chromium-headless-shell` or set PALMWALKER_CHROME.");
}

export async function printPdf(htmlPath: string, pdfPath: string): Promise<void> {
  const { bin, headlessFlag } = chromeBinary();
  await run(bin, [...headlessFlag, "--disable-gpu", "--no-pdf-header-footer", "--hide-scrollbars", "--virtual-time-budget=4000",
    `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href], { timeout: 120_000 });
}

export async function screenshot(htmlPath: string, pngPath: string, width = 1920, height = 1080): Promise<void> {
  const { bin, headlessFlag } = chromeBinary();
  await run(bin, [...headlessFlag, "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", `--window-size=${width},${height}`,
    "--virtual-time-budget=3000", `--screenshot=${pngPath}`, pathToFileURL(htmlPath).href], { timeout: 60_000 });
}
