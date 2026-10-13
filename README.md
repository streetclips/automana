# Palmwalker

A solo, in-hand dueling card game. This repo holds the complete game: the rules in `docs/rulebook.md` and the card data in `src/content/`, plus a live preview of every card and the print-and-play PDFs.

## Commands

| Command | Output |
|---|---|
| `npm run typecheck` | Type-checks everything in `src/` |
| `npm run preview` | Card preview at `http://localhost:4400`, reloaded on every save |
| `npm run pnp` | `dist/palmwalker-pnp-en.pdf` and `palmwalker-pnp-es.pdf`: print-and-play PDFs for [Imprenta Soriano](https://imprentasoriano.com/producto/baraja-de-cartas) |
| `npm run build` | `typecheck`, then `pnp` |
| `npm run art` | `art/{card id}.jpg`: AI illustrations for the cards with no image yet. `npm run art -- plains swamp` regenerates those cards |
| `npm run sim` | Balance simulation: win rate of every colour pair against every Nemesis, Normal and Heroic, in `dist/sim/` |
| `npm run sim:trace` | One simulated game, turn by turn, with the AI's hand and board |
| `npm run sim:test` | Rules self-test of the simulator |

Requirements: Node 22+. `npm run pnp` and `npm run build` also need Google Chrome and Ghostscript (`brew install ghostscript`); override their paths with `CHROME_PATH` and `GS_PATH`. `npm run art` needs `OPENROUTER_API_KEY`.

## Card preview

`npm run preview` serves the cards at `http://localhost:4400` (`PORT` changes it), rendered from `src/` on every request:

1. `cards` shows every card once, one section per component, with its id and number of copies under it: `dawn-squire ×2`.
2. `pnp` shows the A4 sheets of `npm run pnp`, fronts and backs, without Chrome or Ghostscript: colours are RGB, before the CMYK conversion.
3. `en` and `es` switch the language and keep the scroll position.
4. Saving reloads the page. A change in `src/content/` or the render code restarts the server; a CSS change or a new image in `art/` only reloads the page.
5. A render error shows its stack trace in the page, which reloads once you fix it.

## Print and play

`npm run pnp` lays out every physical card (126) for Imprenta Soriano's poker deck:

1. A4 pages, 9 cards per sheet (3 × 3), crop marks in the margins.
2. Cards at 63 × 88 mm with 3 mm bleed per side (69 × 94 mm); text kept 3 mm inside the cut.
3. Odd pages are fronts, even pages are backs, mirrored for long-edge duplex.
4. Square corners: order the 3 mm rounded corners option instead.
5. CMYK, converted with Ghostscript.

Backs: Grimoire cards show their land, Kael, the Nemeses and the quick reference show Face B, and Threat cards share a plain back.

## Card art

`npm run art` illustrates cards with [Ming Image 0.1 Design](https://openrouter.ai/inclusionai/ming-image-0.1-design) through OpenRouter, 4 at a time, about 15 to 30 s per image:

1. Every card describes its scene in its `art` field, for example `art: "a rocky island rising from a calm blue sea"`.
2. `src/art/generate.ts` wraps it in the shared style: `Art illustration in the old Magic: The Gathering style of {art}, like a classic {type} card. No border, frame or text.`
3. Images are 1088 × 960 JPEGs in `art/`, named by card id. Commit them: the model takes no seed, so a new run gives a different image.
4. The preview and the PDFs show `art/{id}.jpg` when it exists and the `emoji` otherwise.
5. About 1 image in 20 comes back with a painted parchment border: regenerate it with `npm run art -- {id}`.

## Balance simulator

`npm run sim` plays a seeded batch of games for each of the 80 configurations (10 colour pairs × 4 Nemeses × Normal/Heroic) on all CPU cores and reports the win rates.

```
npm run sim -- --games 1000 --seed 1                      # 80,000 games, a few minutes
npm run sim -- --games 200 --pairs W/U,R/G --nemeses morwen --modes heroic
npm run sim:trace -- --pair B/G --nemesis vaskara --heroic 1 --seed 1 --game 7 --explain 4
```

| Option | Default | Meaning |
|---|---|---|
| `--games` | 1000 | Games per configuration |
| `--seed` | 1 | Batch seed. Same seed and games, same results, whatever the number of workers |
| `--workers` | all cores | Worker threads |
| `--pairs`, `--nemeses`, `--modes` | all | Filters: `W/U`, `vorthrax`, `normal,heroic` |

Output: the tables on screen plus `dist/sim/sim-seed{seed}-g{games}.{md,csv,json}`. Game `n` of every configuration shares its shuffles with the same game of the other configurations (same Grimoire order for a pair, same Threat order for a Nemesis), so differences between cells come from the cards, not from the luck of the draw.

`sim:trace` options: `--pair`, `--nemesis`, `--heroic 1`, `--seed`, `--game`, and `--explain N` to list the best plans the AI scored in round N.

`npm run sim:tune -- --games 60 --rounds 2` re-tunes the AI's evaluation weights (`src/sim/ai/values.ts`) by paired win-rate comparisons; run it after big card changes and copy the accepted values into `W`.

### How the player AI decides

1. **Its own turn:** a depth-first search over the whole turn (land, spells and Kael before combat, attackers, tricks after the Nemesis's blocks, spells after combat). Each plan is scored by playing out the next Nemesis turn three times with different guesses for the hidden cards and evaluating the result: life on both sides, boards, hand, lands, Kael, the Omen, danger and lethal threats.
2. **The Nemesis turn:** every response window (before the Omen, against a Nemesis spell, before attacks, after blocks, at end of turn) and every block assignment is chosen by the same simulate-and-evaluate search.
3. **Fair play:** the AI never looks at hidden cards. It knows only what a player knows: the land side of its next draw, cards it scried or returned, and which Threats went to the bottom of the deck.
4. **Mulligan:** practically never. Every mulligan rule tested lost win rate: when every card is also a land, four cards beat the best three of four.
5. **Tuned:** the evaluation weights in `src/sim/ai/values.ts` were tuned by paired win-rate comparisons and validated on a separate seed.

### Rule interpretations

Where the rulebook is silent, the simulator assumes:

1. The hand keeps draw order: new cards go to the right, so "the leftmost card" (Mind Tide, Mind Theft, Rebound) is the oldest one. Discarding to five is your choice.
2. A creature returning from the Ruin (Grave Tithe, Uprising, Exhume, Cinder Rebirth) to a full Nemesis Table stays in the Ruin. Overflow only applies when a creature is executed.
3. Overflow damage counts static Nemesis bonuses (Heroic, Frenzy).
4. Damage is applied all at once: a Nemesis brought to 0 loses before its Phase 2 flip can trigger.
5. Auras are cast like sorceries. Cinder Hound's entry damage is mandatory (it can target itself).
6. Bend Fate cannot answer the Omen that is being executed; cast it before, at the start of the Nemesis turn.
7. A blocked attacker whose blocker leaves combat deals no damage, unless it has Trample.
8. Rising Tide puts the old Omen face-down right behind the returned creatures.
9. Lifelink gains the damage dealt, also on creatures; Deathtouch plus Trample needs only 1 damage on the blocker.
10. A pending Counterspell and Mirror Ward both stop the first spell; paying {2} does not save it from the Counterspell.

The simulator reads costs, power, toughness and keywords from `src/content/`. Card effects are coded in `src/sim/engine/`, and on start it checks every card text against the rule it implements: if a text changes, it stops and names the card to update.

## Structure

```
docs/rulebook.md        the rules and design reference (components, rules, Nemeses, example game, card lists)
art/                    card illustrations, one {card id}.jpg each
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
├── render/             HTML components: card.ts (Grimoire and Threat cards), faces.ts (4-state Kael, Nemesis and reference cards), art.ts (card illustrations), icons.ts (SVG mana symbols and type glyphs)
├── preview/            serves the live card preview: pages and web server
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
| 1 | Kael, the Walker |
| 4 | Nemeses: Vorthrax, Vaskara, Morwen, the Mirror Archmage |
| 4 × 15 | Threat decks |
| 1 | Quick reference |

## Changing content

1. Edit the card in `src/content/` with a unique `id`, both `en` and `es` texts, an `emoji` as placeholder art and an `art` scene for its illustration (`npm run art`).
2. Update its row in the card lists of `docs/rulebook.md` (section 18), and any rule it touches.
3. Check it in `npm run preview` and run `npm run typecheck`.
4. Run `npm run sim:test`. If you changed a rule or a number, update `src/sim/engine/` until it passes.
5. Run `npm run build` when you need new PDFs.
