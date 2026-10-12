export function fan(cards: string[], angles: number[], spread = 11): string {
  const n = cards.length;
  return cards
    .map((html, i) => {
      const dx = (i - (n - 1) / 2) * spread;
      const style = `style="transform: translateX(${dx}mm) rotate(${angles[i]}deg); z-index:${i};"`;
      return html.replace(/class="(card|pw-card)/, `${style} class="$1`);
    })
    .join("");
}
