# Palmwalker

Seven Nemesis decks to play solo against the decks of the Magic: The Gathering Foundations Beginner Box. You shuffle two box decks together and fight a Nemesis that plays itself: it reveals a card each turn, attacks and blocks by a few fixed rules, and has 20 life on a counter. This repo holds the rules engine and its balance simulator, the card data, a live preview of every card and the print-and-play PDFs.

| Nemesis | Cards | Player win rate |
|---|---|---|
| Vorthrax, the Ash Tyrant | 20 | 55.3% |
| Vaskara, the Brood Mother | 20 | 55.6% |
| Morwen, the Lich Queen | 20 | 46.1% |
| The Mirror Archmage | 20 | 44.8% |
| The Stampede | 43 | 46.6% |
| The Revel King | 46 | 54.4% |
| The Hydra | 38 | 47.6% |

Win rates over the 45 box deck pairs, 1,800 games per Nemesis. The rules, the decks and how they were tuned are in `docs/box-nemesis.md`; the box decks in the engine in `docs/box.md`.

## Commands

| Command | Output |
|---|---|
| `npm run typecheck` | Type-checks everything in `src/` |
| `npm run box -- --games 100 --seed 1` | Win rates of every box deck pair against every Nemesis, in `dist/box/`; `--nemeses revel,hydra` and `--decks` filter |
| `npm run box:trace -- 1 cats+healing revel` | One game, turn by turn |
| `npm run box:test`, `box:test:nemesis`, `box:test:challenges` | Scenario tests: box cards (38), Nemesis rules (26), Challenge deck cards (8) |
| `npm run box:cards` | Engine card texts compared with Scryfall's oracle |
| `npm run preview` | Card preview at `http://localhost:4400`, reloaded on every save |
| `npm run pnp` | `dist/palmwalker-box-pnp-en.pdf` and `-es.pdf`: print-and-play PDFs for [Imprenta Soriano](https://imprentasoriano.com/producto/baraja-de-cartas) |
| `npm run build` | `typecheck`, then `pnp` |
| `npm run art` | `art/{card id}.jpg`: AI illustrations for the cards with an art scene and no image yet. `npm run art -- nm_brood nm_uprising` regenerates those cards |

Requirements: Node 22+. `npm run pnp` and `npm run build` also need Google Chrome and Ghostscript (`brew install ghostscript`); override their paths with `CHROME_PATH` and `GS_PATH`. `npm run art` needs `OPENROUTER_API_KEY`.

## Card preview

`npm run preview` serves the cards at `http://localhost:4400` (`PORT` changes it), rendered from `src/` on every request:

1. `cards` shows every card once, one section per component: the rules card, the back and the seven Nemesis decks, with each card's id and number of copies under it: `nm_ash_imp ×2`.
2. `pnp` shows the A4 sheets of `npm run pnp`, fronts and backs, without Chrome or Ghostscript: colours are RGB, before the CMYK conversion.
3. `en` and `es` switch the language and keep the scroll position.
4. Saving reloads the page. A change in `src/content/` or the render code restarts the server; a CSS change or a new image in `art/` only reloads the page.
5. A render error shows its stack trace in the page, which reloads once you fix it.

## Print and play

`npm run pnp` lays out every physical card (208: the rules card and the seven decks) for Imprenta Soriano's poker deck:

1. A4 pages, 9 cards per sheet (3 × 3), crop marks in the margins: 24 sheets, 48 pages.
2. Cards at 63 × 88 mm with 3 mm bleed per side (69 × 94 mm); text kept 3 mm inside the cut.
3. Odd pages are fronts, even pages are backs, mirrored for long-edge duplex.
4. Square corners: order the 3 mm rounded corners option instead.
5. CMYK, converted with Ghostscript.
6. No blurred shadows: some PDF viewers draw them as solid dark patches over the card.
7. Each cell is frame black underneath, so the hairline gaps the CMYK conversion leaves at the frame edge print black, not white.

Every card shares the plain Threat back; the rules card shows its Face B.

### Ordering at Imprenta Soriano

Upload the PDF to [Baraja de Cartas](https://imprentasoriano.com/producto/baraja-de-cartas) and fill in the form like this:

| Option | Value |
|---|---|
| ¿Quieres que la montemos nosotros? | No (ya están montadas) |
| Cantidad de páginas | 48 per set: 24 sheets, front and back |
| Numero de cartas por hoja | 9 |
| Grosor del papel | Especial para barajar cartas (300 g, Black Core) |
| Cortar | Sí |
| Cantos redondeados | Sí, 3 mm |

1. Black Core card is made for shuffling and is opaque: the face of the top card does not show through its back.
2. Take 3 mm corners: the cards have square corners, and the shop advises 4 mm only when the rounding is printed.
3. Several sets: multiply the pages by the number of sets and write the number of sets in the Mostrador field.
4. The English and Spanish PDFs have the same cut, so they can go in one order without the 15 € fee for each extra cut.
5. One set, 48 pages, cut, cost 33.27 € on Black Core card and 34.68 € on the 310 g embossed card on 16 October 2026, shipping not included. The form has no rounded corners option; ask for them in Mostrador. The shop does not say whether VAT is included.

## Card art

`npm run art` illustrates cards with [Gemini 3.1 Flash Lite Image](https://openrouter.ai/google/gemini-3.1-flash-lite-image) through OpenRouter, 4 at a time, about 10 s per image:

1. A card with an illustration describes its scene in its `art` field, for example `art: "a swarm of insect hatchlings bursting out of a cluster of glowing eggs in a dark hive chamber"`. The 43 cards of the four Palmwalker decks have one; the Challenge deck cards have none yet.
2. `src/art/generate.ts` wraps it in the shared style: `Art illustration in the old Magic: The Gathering style of {art}, like a classic {type} card. Match the painting style, palette and level of detail of the reference images, which are other cards of the same set. No border, frame or text.`
3. The illustrations of the first 3 other cards of its Nemesis deck go with the prompt as style references.
4. Images are 1152 × 928 JPEGs in `art/`, named by card id. Commit them: the model takes no seed, so a new run gives a different image. The older ones are 1088 × 960, from Ming Image 0.1 Design, which OpenRouter no longer serves; the card frame crops both sizes to fit.
5. Each image cost $0.034 on 14 October 2026: $0.0336 for the image and less than $0.001 for the prompt and its 3 references. The script prints the cost of every image and the total.
6. The preview and the PDFs show `art/{id}.jpg` when it exists and a plain glow otherwise.
7. Look at every new image and regenerate any with a border, text or the wrong scene: `npm run art -- {id}`.

## Structure

```
docs/box.md             the Beginner Box decks in the engine and their approximations
docs/box-nemesis.md     the Nemesis seat: rules, mind, the seven decks, tuning, the player's AI
art/                    card illustrations, one {card id}.jpg each
src/
├── box/                Magic engine and AI (from mana-duel), the 10 box decks, the Nemesis seat and its simulator
│   ├── engine/         rules engine, the Nemesis turn and the Challenge card effects
│   ├── ai/             player AI
│   └── nemesis/        the seven Nemesis decks, the Nemesis mind, the simulator and its tests
├── content/            printed card data, bilingual (en/es), no rendering
│   ├── threats.ts      names, texts and art scenes of the four Palmwalker decks
│   ├── challenges.ts   names and texts of the three Challenge decks
│   ├── box-reference.ts the rules card
│   └── index.ts        catalog: PRINTED_CARDS, DECK_NAMES, getPrintedCard(id)
├── i18n/               UI strings per locale + current locale
├── render/             HTML components: card.ts (cards and their back), faces.ts (the two-face rules card), art.ts (illustrations), icons.ts (Threat burst and collection symbols)
├── preview/            serves the live card preview: pages and web server
├── pnp/                builds the print-and-play PDFs: box.ts (the deck), imposition.ts (A4 sheets), pdf.ts (Chrome and Ghostscript)
├── art/                generates the card illustrations with OpenRouter
└── lib/                filesystem helpers
```

## Changing content

1. Rules and sizes live in the engine: `src/box/nemesis/threats.ts` and `src/box/nemesis/challenges.ts`. Printed names and texts live in `src/content/`, keyed by the same card id, in both `en` and `es`.
2. Check it in `npm run preview` and run `npm run typecheck`.
3. Run the three `box:test` suites, then `npm run box -- --nemeses {id}` to check the win rate against its target in `docs/box-nemesis.md`.
4. Run `npm run build` when you need new PDFs.
