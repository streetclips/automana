import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const GHOSTSCRIPT = process.env.GS_PATH ?? "gs";

export function printToPdf(htmlPath: string, pdfPath: string): void {
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href], { stdio: "ignore" });
}

export function convertToCmyk(srcPath: string, destPath: string): void {
  execFileSync(GHOSTSCRIPT, [
    "-q", "-dNOPAUSE", "-dBATCH", "-dSAFER",
    "-sDEVICE=pdfwrite",
    "-sColorConversionStrategy=CMYK",
    "-dProcessColorModel=/DeviceCMYK",
    "-sPAPERSIZE=a4",
    "-dFIXEDMEDIA",
    "-dAutoRotatePages=/None",
    "-dDownsampleColorImages=false",
    `-sOutputFile=${destPath}`,
    srcPath,
  ]);
}
