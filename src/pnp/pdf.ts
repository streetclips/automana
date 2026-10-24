import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const GHOSTSCRIPT = process.env.GS_PATH ?? "gs";

export interface PaperSize {
  w: number;
  h: number;
}

const points = (mm: number) => (mm * 72) / 25.4;

export function printToPdf(htmlPath: string, pdfPath: string): void {
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href], { stdio: "ignore" });
}

export function dumpDom(htmlPath: string): string {
  return execFileSync(CHROME, ["--headless", "--disable-gpu", "--virtual-time-budget=5000", "--dump-dom", pathToFileURL(htmlPath).href], { maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "ignore"] }).toString();
}

export function convertToCmyk(srcPath: string, destPath: string, size?: PaperSize): void {
  const paper = size ? [`-dDEVICEWIDTHPOINTS=${points(size.w)}`, `-dDEVICEHEIGHTPOINTS=${points(size.h)}`] : ["-sPAPERSIZE=a4"];
  execFileSync(GHOSTSCRIPT, [
    "-q", "-dNOPAUSE", "-dBATCH", "-dSAFER",
    "-sDEVICE=pdfwrite",
    "-sColorConversionStrategy=CMYK",
    "-dProcessColorModel=/DeviceCMYK",
    ...paper,
    "-dFIXEDMEDIA",
    "-dAutoRotatePages=/None",
    "-dDownsampleColorImages=false",
    `-sOutputFile=${destPath}`,
    srcPath,
  ]);
}
