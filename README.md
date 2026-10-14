# Palmwalker

A solo, in-hand dueling card game. This repo holds the complete game: the rules in `docs/rulebook.md` and the card data in `src/content/`, plus a live preview of every card, a browser version to playtest it and the print-and-play PDFs.

## Commands

| Command | Output |
|---|---|
| `npm run typecheck` | Type-checks everything in `src/` |
| `npm run preview` | Card preview at `http://localhost:4400`, reloaded on every save |
| `npm run play` | Play a game in the browser at `http://localhost:4401`, in Spanish or English, on the simulator's rules engine |
| `npm run pnp` | `dist/palmwalker-pnp-en.pdf` and `palmwalker-pnp-es.pdf`: print-and-play PDFs for [Imprenta Soriano](https://imprentasoriano.com/producto/baraja-de-cartas) |
| `npm run build` | `typecheck`, then `pnp` |
| `npm run art` | `art/{card id}.jpg`: AI illustrations for the cards with no image yet. `npm run art -- brood uprising` regenerates those cards |
| `npm run sim` | Balance simulation: win rate of every colour pair against every Nemesis, in `dist/sim/` |
| `npm run sim:trace` | One simulated game, turn by turn, with the AI's hand and board |
| `npm run sim:test` | Rules self-test of the simulator |

Requirements: Node 22+. `npm run pnp` and `npm run build` also need Google Chrome and Ghostscript (`brew install ghostscript`); override their paths with `CHROME_PATH` and `GS_PATH`. `npm run art` needs `OPENROUTER_API_KEY`.

## Card preview

`npm run preview` serves the cards at `http://localhost:4400` (`PORT` changes it), rendered from `src/` on every request:

1. `cards` shows every card once, one section per component: the quick reference, the two backs, the five half-grimoires and the four Threat decks, with each card's id and number of copies under it: `dawn-squire ×2`.
2. `pnp` shows the A4 sheets of `npm run pnp`, fronts and backs, without Chrome or Ghostscript: colours are RGB, before the CMYK conversion.
3. `en` and `es` switch the language and keep the scroll position.
4. Saving reloads the page. A change in `src/content/` or the render code restarts the server; a CSS change or a new image in `art/` only reloads the page.
5. A render error shows its stack trace in the page, which reloads once you fix it.

## Play in the browser

`npm run play` serves the game at `http://localhost:4401` (`PORT` changes it), in Spanish at `/es` (the default) or English at `/en`; **EN · ES** in the header switches language and keeps the game. You take the seat of the simulator's AI: the rules engine of `npm run sim` runs the game and asks you every decision.

1. **New game:** pick a colour pair, a Nemesis and a seed (blank = random). The same seed gives the same shuffles: **Restart** replays it from the first decision.
2. **In your hands:** the page lays the cards out the way you hold them (rulebook, section 8). The left hand is the Table, one fan from left to right: the Ruin, the face-down Threats and the Omen, the Nemesis's creatures and yours. Only the index strip of each card shows, and position is state: a lowered card is tapped and a sideways Threat is a waiting Counterspell. The right hand is the Grimoire, one packet from front to back: your hand fanned, the library on the common Palmwalker back (its count is your life), and the graveyard.
3. **Your turn:** glowing cards have actions. Click one for its menu: cast it, on a target if it needs one. The bar between your hands says what the game is waiting for; `Enter` presses its orange button.
4. **Nemesis turn:** it plays by itself and stops only when you must block or can answer with an instant. **Pass until my turn** skips its remaining windows. Steps with nothing to decide are skipped, on your turn too.
5. **Animations:** after each decision the events play one at a time, each with a caption: cards fly between zones (library to hand when you draw, library to graveyard when you take damage, Threat deck to Ruin when the Nemesis does), attackers lower and lunge towards the other side of the fan, damaged creatures shake, and life changes float over both counters. Click or press `Enter` to skip; the **Animation** button switches between normal, fast and off.
6. **Reading the game:** hover a card to zoom it in the side panel, with its current state: keywords, damage, attack, block. On the strips, a number pairs each attacker (orange) with its blocker (blue), red is damage, `Zz` is summoning sickness, and a coloured power/toughness differs from the printed one. Beside the fan, both sides' life, the Omen, the Ruin and your mana: how much is left of the 3 you get each round. Chips mark the effects in play, such as Refraction Golem's tax. The log under the zoom lists every event, in yellow the ones since your last decision. Click the graveyard or the Ruin to see all their cards.
7. **Undo:** `Z` or **Undo** takes back your last decision, as many times as you like.
8. **Saved:** the browser keeps the game as its seed plus your decisions, so a reload or a server restart resumes it. After a rule or card change the game replays on the new rules and continues from the first decision that no longer fits.

The engine pays each spell from your mana, tapping Elvish Grovekeeper only when the mana runs out, and follows the simulator's [rule interpretations](#rule-interpretations).

The interface texts of both languages live in `src/play/strings.ts`, and card names come from `src/content/`. The engine logs in English; the page rewrites each log line in the chosen language with the patterns in `src/play/strings.ts`, so a new log line in `src/sim/engine/` needs its pattern there, or it shows in English.

## Print and play

`npm run pnp` lays out every physical card (141) for Imprenta Soriano's poker deck:

1. A4 pages, 9 cards per sheet (3 × 3), crop marks in the margins.
2. Cards at 63 × 88 mm with 3 mm bleed per side (69 × 94 mm); text kept 3 mm inside the cut.
3. Odd pages are fronts, even pages are backs, mirrored for long-edge duplex.
4. Square corners: order the 3 mm rounded corners option instead.
5. CMYK, converted with Ghostscript.
6. No blurred shadows: some PDF viewers draw them as solid dark patches over the card.
7. Each cell is frame black underneath, so the hairline gaps the CMYK conversion leaves at the frame edge print black, not white.

Backs: Grimoire cards share the Palmwalker back, a gold compass rose drawn in SVG; the quick reference shows its Face B; Threat cards share a plain back.

### Ordering at Imprenta Soriano

Upload the PDF to [Baraja de Cartas](https://imprentasoriano.com/producto/baraja-de-cartas) and fill in the form like this:

| Option | Value |
|---|---|
| ¿Quieres que la montemos nosotros? | No (ya están montadas) |
| Cantidad de páginas | 32 per deck: 16 sheets, front and back |
| Numero de cartas por hoja | 9 |
| Grosor del papel | Especial para barajar cartas (300 g, Black Core) |
| Cortar | Sí |
| Cantos redondeados | Sí, 3 mm |

1. Black Core card is made for shuffling and is opaque: the face of the top card does not show through its back.
2. Take 3 mm corners: the cards have square corners, and the shop advises 4 mm only when the rounding is printed.
3. Several decks: multiply the pages by the number of decks and write the number of decks in the Mostrador field.
4. The English and Spanish PDFs have the same cut, so they can go in one order without the 15 € fee for each extra cut.
5. One deck of the previous version, 28 pages, cost 34.30 € with these options on 13 October 2026, shipping not included. The shop does not say whether VAT is included.

## Card art

`npm run art` illustrates cards with [Gemini 3.1 Flash Lite Image](https://openrouter.ai/google/gemini-3.1-flash-lite-image) through OpenRouter, 4 at a time, about 10 s per image:

1. Every card describes its scene in its `art` field, for example `art: "a swarm of insect hatchlings bursting out of a cluster of glowing eggs in a dark hive chamber"`.
2. `src/art/generate.ts` wraps it in the shared style: `Art illustration in the old Magic: The Gathering style of {art}, like a classic {type} card. Match the painting style, palette and level of detail of the reference images, which are other cards of the same set. No border, frame or text.`
3. The illustrations of the first 3 other cards of its half-grimoire or Threat deck go with the prompt as style references.
4. Images are 1152 × 928 JPEGs in `art/`, named by card id. Commit them: the model takes no seed, so a new run gives a different image. The older ones are 1088 × 960, from Ming Image 0.1 Design, which OpenRouter no longer serves; the card frame crops both sizes to fit.
5. Each image cost $0.034 on 14 October 2026: $0.0336 for the image and less than $0.001 for the prompt and its 3 references. The script prints the cost of every image and the total.
6. The preview and the PDFs show `art/{id}.jpg` when it exists and a plain glow in the card's colour otherwise.
7. Look at every new image and regenerate any with a border, text or the wrong scene: `npm run art -- {id}`.

## Balance simulator

`npm run sim` plays a seeded batch of games for each of the 40 configurations (10 colour pairs × 4 Nemeses) on all CPU cores and reports the win rates.

```
npm run sim -- --games 1000 --seed 1                      # 40,000 games, about half a minute
npm run sim -- --games 200 --pairs W/U,R/G --nemeses morwen
npm run sim:trace -- --pair B/G --nemesis vaskara --seed 1 --game 7 --explain 4
```

| Option | Default | Meaning |
|---|---|---|
| `--games` | 1000 | Games per configuration |
| `--seed` | 1 | Batch seed. Same seed and games, same results, whatever the number of workers |
| `--workers` | all cores | Worker threads |
| `--pairs`, `--nemeses` | all | Filters: `W/U`, `vorthrax` |

Output: the tables on screen plus `dist/sim/sim-seed{seed}-g{games}.{md,csv,json}`. Game `n` of every configuration shares its shuffles with the same game of the other configurations (same Grimoire order for a pair, same Threat order for a Nemesis), so differences between cells come from the cards, not from the luck of the draw.

`sim:trace` options: `--pair`, `--nemesis`, `--seed`, `--game`, and `--explain N` to list the best plans the AI scored in round N.

`npm run sim:tune -- --games 60 --rounds 2` re-tunes the AI's evaluation weights (`src/sim/ai/values.ts`) by paired win-rate comparisons; run it after big card changes and copy the accepted values into `W`.

### How the player AI decides

1. **Its own turn:** a depth-first search over the whole turn (spells before combat, attackers, tricks after the Nemesis's blocks, spells after combat). Each plan is scored by playing out the next Nemesis turn three times with different guesses for the hidden cards and evaluating the result: life on both sides, boards, hand, the mana kept for the Nemesis turn, the Omen, danger and lethal threats.
2. **The Nemesis turn:** every response window (before the Omen, against a Nemesis spell, before attacks, after blocks, at end of turn) and every block assignment is chosen by the same simulate-and-evaluate search.
3. **Fair play:** the AI never looks at hidden cards. It knows only what a player knows: cards it scried or returned, and which Threats went to the bottom of the deck.
4. **Tuned:** the evaluation weights in `src/sim/ai/values.ts` were tuned for the current rules by paired win-rate comparisons and validated on a separate seed. On seed 77, never used for tuning, it wins 50.6% of 40,000 games.

### Rule interpretations

Where the rulebook is silent, the simulator assumes:

1. The hand keeps draw order: new cards go to the right, so "the leftmost card" (Mind Theft, Rebound) is the oldest one.
2. A creature returning from the Ruin (Uprising, Exhume, Cinder Rebirth) to a full Nemesis Table stays in the Ruin. Overflow only applies when a creature is executed, Brood and Egg Laying included.
3. Brood takes both cards before executing either. If that leaves no face-down card, you win; otherwise its creatures enter front to back.
4. Auras are cast like sorceries. Cinder Hound's entry damage is mandatory (it can target itself).
5. Bend Fate cannot answer the Omen that is being executed; cast it before, at the start of the Nemesis turn.
6. A blocked attacker whose blocker leaves combat deals no damage, unless it has Trample.
7. Rising Tide puts the old Omen face-down right behind the returned creatures.
8. Lifelink gains the damage dealt, also on creatures; Deathtouch plus Trample needs only 1 damage on the blocker.
9. A countered spell is still paid, and it still counts as your first spell of the turn for Refraction Golem's tax.

The simulator reads costs, power, toughness and keywords from `src/content/`. Card effects are coded in `src/sim/engine/`, and on start it checks every card text against the rule it implements: if a text changes, it stops and names the card to update.

## Structure

```
docs/rulebook.md        the rules and design reference (components, rules, Nemeses, example game, card lists)
art/                    card illustrations, one {card id}.jpg each
src/
├── content/            game data, bilingual (en/es), no rendering
│   ├── types.ts        Card, HalfGrimoire, Nemesis, Reference…
│   ├── grimoires/      the 5 half-grimoires: white, blue, black, red, green
│   ├── nemeses/        the 4 Nemeses and their 20-card Threat decks
│   ├── reference.ts    the quick reference card
│   └── index.ts        catalog: GRIMOIRES, NEMESES, ALL_CARDS, getCard(id)
├── i18n/               UI strings per locale + current locale
├── render/             HTML components: card.ts (Grimoire and Threat cards and their backs), faces.ts (the 4-state reference card), art.ts (card illustrations), icons.ts (SVG tap and Threat symbols, type glyphs, collection symbols and the Grimoire back's compass rose)
├── preview/            serves the live card preview: pages and web server
├── play/               the game in the browser: the rules engine with you as the player, the view of both hands, its animations and web server
├── pnp/                builds the print-and-play PDFs for the print shop
├── art/                generates the card illustrations with OpenRouter
├── sim/                balance simulator
│   ├── engine/         rules engine: card rules and text checks, state, turn flow, combat, the Nemesis mind
│   ├── ai/             player AI: turn planner, response and block search, evaluation, card values
│   ├── batch/          seeded batches on worker threads, reports, weight tuner
│   ├── trace.ts        one game, turn by turn
│   └── selftest.ts     rules scenarios
└── lib/                filesystem helpers
```

## Product

| Qty | Component |
|---|---|
| 5 × 12 | Half-grimoires: Dawnward Order, Arcane Tide, Grim Pact, Emberkin, Wildwood |
| 4 × 20 | Threat decks: Vorthrax, Vaskara, Morwen, the Mirror Archmage |
| 1 | Quick reference |

## Changing content

1. Edit the card in `src/content/` with a unique `id`, both `en` and `es` texts and an `art` scene for its illustration (`npm run art`).
2. Update its row in the card lists of `docs/rulebook.md` (section 17), and any rule it touches. Card numbers follow the order of `src/content/`: adding, moving or removing a card, or changing its `qty`, renumbers its collection, so update the `No.` column too.
3. Check it in `npm run preview` and run `npm run typecheck`.
4. Run `npm run sim:test`. If you changed a rule or a number, update `src/sim/engine/` until it passes.
5. Run `npm run build` when you need new PDFs.
