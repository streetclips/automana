import { icon, type IconName } from "./icons";

export function pip(sym: string): string {
  if (/^\d$/.test(sym)) return `<span class="pip pip-N">${sym}</span>`;
  return `<span class="pip pip-${sym}">${icon(sym as IconName)}</span>`;
}

export function pips(text: string): string {
  return text.replace(/\{([0-9RGWUBT])\}/g, (_, s: string) => pip(s));
}
