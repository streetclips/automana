export function pip(sym: string): string {
  if (sym === "T") return '<span class="pip pip-T">↓</span>';
  if (/^\d$/.test(sym)) return `<span class="pip pip-N">${sym}</span>`;
  return `<span class="pip pip-${sym}"></span>`;
}

export function pips(text: string): string {
  return text.replace(/\{([0-9RGWUBT])\}/g, (_, s: string) => pip(s));
}
