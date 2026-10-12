# Palmwalker

A solo, in-hand dueling card game. This repo holds the complete game: the rules in `docs/rulebook.md` and the card data in `src/content/`, plus a printable sheet with every card.

## Commands

| Command | Output |
|---|---|
| `npm run typecheck` | Type-checks everything in `src/` |
| `npm run cards` | `dist/palmwalker-cards-en.html` and `palmwalker-cards-es.html`: all 126 cards, one section per component, ready to print |
| `npm run build` | Both of the above |
| `npm run pnp` | `dist/palmwalker-pnp-en.pdf` and `palmwalker-pnp-es.pdf`: print-and-play PDFs for [Imprenta Soriano](https://imprentasoriano.com/producto/baraja-de-cartas) |

Requirements: Node 22+. `npm run pnp` also needs Google Chrome and Ghostscript (`brew install ghostscript`); override their paths with `CHROME_PATH` and `GS_PATH`.

## Print and play

`npm run pnp` lays out every physical card (126) for Imprenta Soriano's poker deck:

1. A4 pages, 9 cards per sheet (3 × 3), crop marks in the margins.
2. Cards at 63 × 88 mm with 3 mm bleed per side (69 × 94 mm); text kept 3 mm inside the cut.
3. Odd pages are fronts, even pages are backs, mirrored for long-edge duplex.
4. Square corners: order the 3 mm rounded corners option instead.
5. CMYK, converted with Ghostscript.

Backs: Grimoire cards show their land, Kael, the Nemeses and the quick reference show Face B, and Threat cards share a plain back.

## Structure

```
docs/rulebook.md        the rules and design reference (components, rules, Nemeses, example game, card lists)
src/
├── content/            game data, bilingual (en/es), no rendering
│   ├── types.ts        Card, HalfGrimoire, Nemesis, Walker, Reference…
│   ├── grimoires/      the 5 half-grimoires: white, blue, black, red, green
│   ├── nemeses/        the 4 Nemeses: phase texts and their 15-card Threat decks
│   ├── kael.ts         the Walker
│   ├── reference.ts    the quick reference card
│   ├── lands.ts        land cards (Grimoire card backs)
│   └── index.ts        catalog: GRIMOIRES, NEMESES, ALL_CARDS, getCard(id)
├── i18n/               UI strings per locale + current locale
├── render/             HTML components: card.ts (Grimoire and Threat cards), faces.ts (4-state Kael, Nemesis and reference cards)
├── sheet/              builds the printable card sheet
├── pnp/                builds the print-and-play PDFs for the print shop
└── lib/                filesystem helpers
```

## Product

| Qty | Component |
|---|---|
| 5 × 12 | Half-grimoires: Dawnward Order, Arcane Tide, Grim Pact, Emberkin, Wildwood |
| 1 | Kael, the Walker |
| 4 | Nemeses: Vorthrax, Vaskara, Morwen, the Mirror Archmage |
| 4 × 15 | Threat decks |
| 1 | Quick reference |

## Changing content

1. Edit the card in `src/content/` with a unique `id`, both `en` and `es` texts, and an `emoji` as placeholder art.
2. Update its row in the card lists of `docs/rulebook.md` (section 18), and any rule it touches.
3. Run `npm run build`.
