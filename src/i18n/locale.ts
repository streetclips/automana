import type { Locale } from "../content/types";
import { STRINGS, type Strings } from "./strings";

let current: Locale = "en";

export function setLocale(locale: Locale): void {
  current = locale;
}

export function getLocale(): Locale {
  return current;
}

export function t(): Strings {
  return STRINGS[current];
}
