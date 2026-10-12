# Palmwalker

A solo, in-hand dueling card game. This repo holds the game content and the tools that turn it into a rulebook (EN/ES), a narrated guide video (ES) and an interactive card lab.

## Commands

| Command | Output |
|---|---|
| `npm run typecheck` | Type-checks everything in `src/` |
| `npm run rulebook` | `dist/rulebook/palmwalker-rulebook-en.pdf` and `palmwalker-reglamento-es.pdf` (pass `en` or `es` to build one) |
| `npm run lab` | `dist/lab/index.html`, the card design lab |
| `npm run video:preview` | A few video frames in `dist/video/preview/` |
| `npm run video` | `dist/video/palmwalker-guia-es.mp4` (about 3 minutes to render) |
| `npm run build` | All of the above |

Requirements: Node 22+, macOS `say` (voice `Mónica`, override with `PALMWALKER_VOICE`), `ffmpeg`/`ffprobe`, and Chrome. Chrome is found in this order: `PALMWALKER_CHROME`, Playwright's `chrome-headless-shell`, then `/Applications/Google Chrome.app`.

## Structure

```
src/
├── content/            game data, bilingual (en/es), no rendering
│   ├── types.ts        Card, Color, CardType…
│   ├── grimoires/      half-grimoires (red.ts, green.ts…)
│   ├── nemeses/        Threat decks
│   ├── lands.ts        land cards (card backs)
│   ├── previews.ts     expansion preview cards (W/U/B)
│   └── index.ts        catalog: getCard(id), findCardByName(name, locale)
├── i18n/               UI strings per locale + current locale
├── render/             HTML/SVG components shared by every output
│   ├── card.ts/.css    the card component; skin "palm" is the production design
│   ├── faces.ts/.css   Walker and Nemesis 4-state cards
│   └── pips.ts, layout.ts
├── rulebook/           pages.en.ts, pages.es.ts, components, PDF build
├── video/              narration script, board renderer, intro scenes, ffmpeg pipeline
├── lab/                browser card lab (bundled with esbuild)
└── lib/                Chrome and filesystem helpers
docs/expansion-design.md  design of the 5-colour, 4-Nemesis expansion
```

## Card design

Production cards use skin `palm`:

- a placeholder emoji as art, on a gradient of the card's colour,
- a slim colour strip on the left with total mana, mana symbols, type glyph and power/toughness (readable in a fan),
- rules text on a dark glass panel.

Cards are sized in `em`, so the same component scales through `size-*` classes: millimetres in the PDF, pixels in the video and the lab.

## Adding content

1. Add the card to the right file in `src/content/` with a unique `id`, both `en` and `es` texts, and an `emoji` as placeholder art.
2. Reference it from pages or the video by `id` (`renderCard("ember-bolt", "md")`) or by localized name in the video script.
3. Run `npm run typecheck`, then rebuild the output you need.
