# Nemesis mode on the Magic engine

The box pilot asks one question before anything is bought or printed: do Palmwalker's Nemeses give a fair fight to normal Magic decks? `src/box/engine` is mana-duel's Magic engine; this document describes the Nemesis seat added on top of it, as implemented.

## Seats

1. **Seat 0, the player**, plays normal Magic with the engine: 20 life, a 7-card hand, London mulligan and one land per turn. The player always takes the first turn and skips that draw.
2. **Seat 1, the Nemesis**, is opted in with `PlayerSetup.nemesis`. Its library is a 20-card Threat deck. It has no hand of its own, no lands, no mana and no mulligan, and its Threats have no cost.

## The Threat deck

1. Each Threat has a tier, 1 to 3. At setup the deck is shuffled, then split by tier: tier 1 on top, tier 3 at the bottom, each tier still in random order.
2. The top card is the **Omen**: face-up and public.
3. **Life = face-down cards**, the library minus the Omen, so 19 at the start. `players[1].life` is kept in sync on every pass of state-based actions, so the engine's checks and the AI's evaluation keep working.
4. Damage or life loss N moves the card right behind the Omen to the graveyard (the **Ruin**), N times. Life gain N moves the latest N Ruin cards face-down to the bottom. With no face-down card left, the player wins.

## The Nemesis turn

1. **Untap.**
2. **Draw step:** the Nemesis takes the Omen into its hand, and the next card becomes the new Omen (life −1).
3. **Main phase:** it casts the card for free.
   - A creature enters summoning sick, unless it has haste.
   - A spell goes on the stack with the target chosen by the targeting rule, and the player may respond.
   - A Nemesis spell that resolves or is countered goes face-down to the bottom, not to the Ruin.
4. **Combat**, by the attack rule.
5. **Creature limit:** the Nemesis controls at most 4 creatures.
   - **Overflow:** a fifth creature deals damage equal to its power to the player and goes face-down to the bottom. This applies to the Omen at the draw step and to creatures that Brood, Egg Laying, Exhume, Cinder Rebirth or Uprising would put onto the battlefield.

## The Nemesis mind

It never responds and never activates abilities. `src/box/nemesis/mind.ts`:

1. **Attack:** every creature that can attack does, unless the player has an untapped creature that could block it alone, kill it and survive. The check accounts for flying, reach and skulk, menace (no single blocker qualifies), first and double strike, deathtouch, indestructible and damage already marked.
2. **Blocks,** each attacker blocked by at most one creature except a menace attacker in desperation:
   1. **Safe block:** each blocker, oldest first, takes the strongest attacker it can kill and survive.
   2. **Trade:** each remaining blocker takes the strongest attacker it can kill.
   3. **Desperation:** if the damage still unblocked (trample excess included) would reduce the Nemesis to 0, every remaining blocker takes the strongest attacker it can block, in pairs against menace.
3. **Ordering:** "strongest" means highest power, then toughness, then the oldest.
4. **Targets:** the player's strongest creature it can target, skipping hexproof and ward; otherwise the player.

## Player cards against the Nemesis

1. Returning a Nemesis creature to its owner's hand puts it on top as the new Omen; the old Omen goes face-down right behind it (+1 life).
2. "An opponent discards N cards" sends N cards from behind the Omen to the Ruin.
3. Exile removes a creature from the game; it never reaches the Ruin.
4. The Nemesis turn is "an opponent's turn" for the player's cards.

## Threat decks at Magic scale

Creatures keep their Palmwalker names, effects and quantities. Their sizes sit in the range of Magic creatures, so a Nemesis's strength comes from its abilities, not from oversized bodies: Vorthrax and Morwen at Palmwalker's power and toughness − 4, Vaskara at Palmwalker's power and toughness − 3, the Mirror Archmage at power − 1 and toughness − 5. Spells keep their numbers. Data: `src/box/nemesis/threats.ts`. Each tier lists the cards in it and how many of each.

| Nemesis | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Vorthrax | 3 Ash Imp 3/2 flying, Magma Sentinel 3/5 defender, Rain of Cinders, Tyrant's Roar | 2 Searing Breath, 3 Cinderclaw Brute 6/3, 2 Ember Wyrmling 5/3 flying | 2 Vorthrax's Herald 6/4, 2 Scorch Fiend 7/4 trample, Lava Behemoth 7/6, Inferno Charger 6/3 haste, Cinder Rebirth |
| Vaskara | 3 Ravenous Larva 3/3 lifelink, 2 Pheromones, Insect Plague | 4 Armored Drone 4/4, 3 Darting Wasp 4/3 flying | 2 Shieldbreaker Beetle 4/5 trample, 2 Mantis Queen 5/6, 2 Egg Laying, Brood |
| Morwen | 4 Wandering Skeleton 3/2, Rotting Zombie 3/4, Plague | 3 Vampire Bat 3/3 flying lifelink, 2 Withering Touch, Soul Drain, Exhume | 2 Morwen's Ghoul 4/3 deathtouch, 2 Deathless Knight 5/5 lifelink, 2 Crypt Horror 6/5 lifelink, Uprising |
| Mirror Archmage | 3 Fragile Illusion 4/1 flying, Crystal Golem 2/4 defender, 2 Counterspell | 3 Water Elemental 4/4, 2 Rebound, Mind Theft, Mass Illusion | 2 Guardian Sphinx 4/3 flying, 2 Mirror Djinn 5/2 flying, 2 Tide Serpent 5/5, Refraction Golem 2/4 defender |

## Tuning

1. **Method.** A grid of power and toughness changes per Nemesis, 20 games per pair and Nemesis, then a check with 100 games per pair and Nemesis on a fresh seed: 18,000 games, seed 3, 0 errors, 152 games/s.
2. **Knobs.** Power is the coarse one: one point moves the player's win rate by 25 to 35 points. Toughness is the fine one: 3 to 5 points per point of toughness, and Morwen stops responding beyond +4.
3. **The Archmage needed its tiers changed.** With no attacker in tier 1 it never pressured the player: even at +3/+4 the player won 54%. Its Fragile Illusions moved to tier 1, and Rebound, Mind Theft and Mass Illusion to tier 2.
4. **Result** (seed 3, 100 games per pair and Nemesis):

| Nemesis | Target | Player wins | Rounds | Player life (wins) | Nemesis life (losses) |
|---|---:|---:|---:|---:|---:|
| Vorthrax | 52–58% | 57.5% | 7.4 | 9.5 | 8.1 |
| Vaskara | 52–58% | 53.9% | 8.1 | 11.1 | 11.9 |
| Morwen | 42–48% | 48.7% | 7.2 | 8.3 | 10.8 |
| Mirror Archmage | 42–48% | 47.5% | 7.9 | 9.2 | 8.8 |
| All | 45–55% | 51.9% | 7.6 | 9.6 | 9.9 |

5. **The deck decides a lot.** The 45 pairs run from 30.0% (Wizards + Goblins) to 77.2% (Cats + Healing), and 17 of them fall more than 10 points from the average. Average over the 9 pairs of each deck: Healing 64.7%, Elves 62.2%, Cats 58.6%, Primal 55.4%, Wizards 51.7%, Undead 48.6%, Inferno 48.5%, Vampires 47.5%, Pirates 44.8%, Goblins 37.3%. Other Threat shapes don't narrow the spread: +2/+0 and +2/+1 on Vorthrax, Vaskara and Morwen give a standard deviation across pairs of 13.9 and 15.1 points, against 12.9 for the tuned sizes on the same seed.
6. **New sizes and a stronger AI need a new pass.** The creatures moved to Magic sizes (see Threat decks at Magic scale) and the player's AI got stronger (see below). On the same seed and games the player wins 58.3%: Vorthrax 63.6%, Vaskara 59.7%, Morwen 62.2%, Mirror Archmage 47.7%, so only the Archmage stays on target. Games last longer, 9.7 rounds against 7.6. The pairs run from 33.3% (Pirates + Goblins) to 82.5% (Cats + Healing), with a standard deviation of 11.7 points, and 18 of them fall more than 10 points from the average. Average over the 9 pairs of each deck: Healing 70.0%, Wizards 66.2%, Cats 65.2%, Elves 60.7%, Primal 59.0%, Inferno 57.0%, Undead 56.0%, Vampires 54.0%, Pirates 53.3%, Goblins 41.8%. The batch ran at 19 games/s with 10 workers, against 152 before.

## The player's AI

1. **Blocks:** when it plans an attack, it predicts the Nemesis's blocks with the Nemesis rules, which are public and deterministic. Any spell or trigger it weighs during its own attack, such as Frenzied Goblin's, is scored after those blocks and the combat.
2. **Combat tricks:** every attack and every block it weighs includes its best instant or ability once blockers are declared, on the creatures in that combat. It attacks into a blocker when a pump saves its creature, and blocks a bigger attacker when a trick kills it.
3. **The Omen:** it scores its attacks, its spells after combat and its answers on the Nemesis turn after playing out the rest of that Nemesis turn (`src/box/ai/forecast.ts`): the Omen resolves, the Nemesis attacks by its rules, and the player answers with its instants and blocks: blocks that kill and survive, trades into stronger creatures, and chump blocks only against lethal damage. So it keeps a blocker home before Inferno Charger and flashes creatures in on the Nemesis turn.
4. **Set-ups before combat:** when it can cast a sorcery or activate an ability that pumps, taps, or stops a creature from blocking or being blocked (Joraga Invocation, Goblin Smuggler, Dropkick Bomber), it plans the whole attack after each option before choosing one.
5. **Permanents:** an artifact or enchantment on the battlefield is worth more than the same card in hand, so it casts Goblin Oriflamme, Quick-Draw Katana or Carnelian Orb of Dragonkind when it has mana to spare.
6. **Lands:** it plays the land that lets it cast its most expensive spell this turn, then the one whose colour its hand needs most.
7. **Hidden order:** it decides on a copy of the game where the face-down Threats are re-shuffled from a fixed order within each tier, so the real order never changes its decisions but the tiers it knows from the setup still hold. A selftest checks this. With no Omen (`BOX_OMEN=0`), it plays the Nemesis turn out with three different guesses for the top Threat and averages them.
8. **Waiting Counterspell:** it feeds the Counterspell its cheapest castable spell in its main phase. Without this rule, the AI never cast again once a Counterspell waited. In a 224-game run against mana-duel's decks, the Mirror Archmage then won 80% of its games; with the rule it won 5%.

Each rule from 1 to 6 raised the player's win rate in paired games on seed 11 (7,200 games, 40 per pair and Nemesis):

| Rule | Player wins | Change |
|---|---:|---:|
| None (the AI tuned against) | 51.1% | — |
| Lands and permanents | 51.8% | +0.7 ± 0.5 |
| Combat tricks | 53.7% | +1.9 ± 0.6 |
| The Omen, with blocks only | 55.4% | +1.8 ± 0.9 |
| The Omen, with instants on the Nemesis turn | 56.8% | +1.5 ± 0.5 |
| Spells and triggers scored after the Nemesis blocks | 57.4% | +0.7 ± 0.4 |
| Set-ups before combat | 58.7% | +1.3 ± 0.3 |

What it still doesn't do:

1. Cast card-neutral spells for their quality: Opt, and Cemetery Recruitment on a non-Zombie, stay in hand.
2. Look past the next Nemesis combat, or plan its own turn as a whole: it chooses one action at a time.
3. Use tricks in the blocks it imagines for the Nemesis turn.

## Decisions and deviations

1. **Tiers are per card definition,** so all copies of a Threat share one tier.
2. **The new Omen is revealed when the old one is taken,** at the draw step. So the player knows the next Omen while responding to the current one. "The next face-down cards" are always the ones behind the visible Omen: for damage, discard, Brood and Egg Laying.
3. **A targeted Nemesis spell picks its target on cast.** If the target becomes illegal in response (hexproof, bounce, death), the spell fizzles and goes to the bottom without its fallback.
4. **Creature Threats are cast as spells,** so the player's counterspells can counter them. A countered Threat goes face-down to the bottom.
5. **Counterspell's reminder** waits on the Nemesis battlefield as a non-creature card. It counters the player's next spell as it is cast, then goes face-down to the bottom. Cast triggers such as prowess still happen.
6. **Random discards:** Mind Theft, and Rebound when the player has no creature, discard a random card (seeded).
7. **Overflow damage is the creature's damage,** so an overflowing lifelink creature gains the Nemesis life.
8. **Mantis Queen's +1/+0 also reaches the Queen.** It is summoning sick, so this changes nothing.
9. **Ward is untested here.** Targeting skips any creature with a `ward` keyword, but this branch has no ward yet; the Beginner Box merge brings it.

## Challenge decks

Wizards printed three self-running Challenge Decks for the Theros block (2013–2014). `src/box/nemesis/challenges.ts` copies their card stats, texts and quantities under new names, as three more Nemeses, so their win rates give a reference for ours. `src/box/engine/challenge.ts` holds their rules; the Palmwalker rules above (tiers, the creature limit, Threats going to the bottom) don't apply to them.

| Nemesis | Original | Deck | Win for the player |
|---|---|---|---|
| `stampede` | Battle the Horde | 60 cards: 43 Minotaurs with haste that attack each turn, 10 sorceries, 7 artifacts | The Horde has no library and no creatures |
| `revel` | Defeat a God | The Revel King (a 6/5 God, 5/5 here) and 2 Drunken Throngs start on the battlefield; 57 cards: 30 Revelers, 23 sorceries, 4 enchantments | The Revel King leaves the battlefield, which it can't do while a Reveler is there |
| `hydra` | Face the Hydra | 3 Lesser Heads (0/3) start on the battlefield; 57 cards: 15 Heads, 6 of them elite (0/6, 0/8), 42 sorceries | No Head on the battlefield at the end of a turn |

1. **Their turn:** at the draw step the Nemesis reveals its top cards and casts them for free, in order: the Stampede 2, plus 1 per artifact; the Revel King 2; the Hydra 1. It casts cards revealed at other times at once.
2. **The Stampede has no life:** damage or life loss N mills its top N cards. Its `life` is kept equal to its library plus its creatures, so it reaches 0 exactly when the player wins.
3. **Attacking creatures:** the player attacks the Revel King's and the Hydra's creatures by attacking the Nemesis. Damage to these two Nemeses, from combat or spells, goes to their creatures: each chunk, largest first, goes to the creature it can kill with the most toughness left, otherwise to the one closest to dying. The Revel King only takes damage when no Reveler is left.
4. **The Hydra's damage:** at the start of its combat, each untapped Head deals 1 combat damage to the player, and each elite Head 2. A Head that leaves the battlefield reveals the Hydra's top two cards: Heads enter, sorceries go to the graveyard.
5. **Attacks:** these Nemeses attack only with the creatures their cards force to attack; they never block.
6. **Hero's Rewards:** a Head or Reveler that leaves the battlefield, or a Stampede artifact put into a graveyard from anywhere (milled included), gives the player life or a card.
7. **Zones:** a permanent of these Nemeses that would go to a hand or to exile goes to the graveyard instead. Effects that would make them draw, discard or gain life do nothing.
8. **The player's AI** plays the Nemesis turn out with one guess of its hidden library instead of three, since these decks don't keep tiers. That made the long Hydra games 7 times faster: one went from 149 s to 21 s.

### Adapted for Palmwalker

No Hero cards are used. The cards keep their printed texts and copies, and all but one their stats; the setup changes instead, so the decks keep their character and land in the 45–55% band:

| Nemesis | Creature limit | Player head start | Other setup |
|---|---:|---:|---|
| The Stampede | 5 | 4 turns before its first (printed: 3) | — |
| The Revel King | 6: the King and 5 Revelers, so Panic Dance and Crazed Nymph still work | 3 turns before its first (printed: 1) | 2 Drunken Throngs, the printed normal setup; the King is 5/5 (printed: 6/5) |
| The Hydra | none: its Heads never attack and are what the player must clear | 3 turns before its first (printed: 1) | 3 Lesser Heads, the printed normal setup |

1. **Creature limit:** a creature the Nemesis reveals while its creatures on the battlefield plus those waiting to be cast already reach the limit overflows: it deals damage equal to its power to the player and goes to the bottom of the library, as in the Palmwalker Nemeses. Encore and Healing Balm stop returning creatures at the limit.
2. **Why head starts:** the printed decks hit from the Nemesis's first turn, when the player has one land and no Hero. With the printed setup and the limit the player won 28.3% against the Stampede, 1.7% against the Revel King and 11.7% against the Hydra (seed 1, 4 games per pair and Nemesis). In 45 probe games with the printed easy setups, the Revel King itself did 9.8 damage per game, because each of the 16 Frenzied Pipers makes it attack, and the Hydra's Heads did 15.4 of its 24.9. Cutting copies of the damage spells didn't help: the Revel King went from 7.8% to 5.6% without 3 King's Strikes and 3 Reckless Rushes, and the Hydra from 32.2% to 24.1% with Tangled Necks and Regrowths in place of 2 Divided Furies and 2 All-Heads Lunges. Each head-start turn moved the rates by 15 to 25 points.
3. **The Revel King's last points:** with 2 Throngs the player won 44.6% over seeds 1, 3 and 5, and with 1 Throng 58.6%. Copies barely moved it: 13 Frenzied Pipers instead of 16 gave 43.6%, 9 Reckless Rushes 44.7%, and one fewer Rush and King's Strike 40.8%, because Rush sends the Revelers into the player's blockers, where they die and pay their Hero's Rewards. One point of power off the King gave 49.4%.
4. **Tuning knob:** `BOX_CHALLENGE` takes JSON per Nemesis with `creatureLimit`, `headStart` (extra player turns before the Nemesis's first, on top of the first one), `battlefield` and `copies` (card id → count), for example `BOX_CHALLENGE='{"revel":{"headStart":3}}' npm run box -- --nemeses revel`.


Result over seeds 1, 3 and 5, 0 errors (10 games per pair and Nemesis on each seed, 6 on seed 1 for the Stampede and the Hydra: 1,170 to 1,350 games per Nemesis, ±2.9 points):

| Nemesis | Seed 1 | Seed 3 | Seed 5 | All | Rounds |
|---|---:|---:|---:|---:|---:|
| The Stampede | 46.7% | 48.4% | 50.0% | 48.6% | 8.5 |
| The Revel King | 47.3% | 51.8% | 49.1% | 49.4% | 6.4 |
| The Hydra | 52.2% | 50.0% | 54.2% | 52.1% | 7.7 |

The deck decides even more than against the Palmwalker Nemeses: on seed 3 the standard deviation across the 45 pairs is 19.7 points against the Stampede, 17.4 against the Revel King and 20.7 against the Hydra, against 11.7 for the Palmwalker Nemeses. The Hydra games are the slowest, at about 2 games/s on 10 workers.

Deviations from the printed rules:

1. **No Hero cards.** The originals let the player start with up to two (Hydra) or three Hero cards on the battlefield. Without them the player has no head start, so these win rates understate the player.
2. **"You make all choices for the Nemesis"** becomes fixed rules in the player's favour: Toxic Breath destroys the tapped creatures unless they are worth more than 5 life and the player has more than 10; Bait the Beast sacrifices the player's weakest creature if it is small or life is low; Weak Spot destroys a plain Head; Tangled Necks and Divided Fury tap the Heads that hit hardest; Wild Smashing sacrifices a noncreature artifact or enchantment only at 6 life or less; Swallowed Whole exiles the player's weakest creature; War Altar sacrifices the strongest Minotaurs; Healing Balm returns the player's strongest creature card and the Stampede's weakest.
3. **Attack targets are chosen after blocks,** by the rule in 3 above, not when attackers are declared.
4. **"Each player" means the player** in the Nemesis's own cards: Toxic Breath, Divided Fury and All-Heads Lunge don't also damage the Hydra.
5. **Hunt the Weak's "must be blocked if able" is not modelled;** its first strike is.
6. **Setup:** see Adapted for Palmwalker above.

## Print and play

`npm run pnp:box` writes `dist/palmwalker-box-pnp-en.pdf` and `-es.pdf`: 81 cards on 9 A4 sheets, in the same format as Palmwalker's PnP (63 × 88 mm like Magic cards, 3 mm bleed, odd pages fronts, even pages backs mirrored for long-edge duplex, CMYK).

1. **A quick reference** for the box mode: setup, the Nemesis turn, its mind, and how your cards work against it.
2. **The 4 Threat decks**, 20 cards each, with the plain Threat back. The tuned sizes and tiers come from `src/box/nemesis/threats.ts`, the names, art and flavour from Palmwalker's content (`src/pnp/box.ts`).
3. **Tier mark:** the roman numeral at the right of the name bar (I, II or III), where a Magic card shows its mana cost. Collector numbers follow the tiers, so cards 1 to 6 or 7 of each deck are tier I.
4. **Wording for Magic:** "the battlefield" for Palmwalker's Table, the official Spanish keywords (*Vuela*, *Arrolla*), a random discard for Rebound and Mind Theft, and "tap" for Mass Illusion.

## Tools

| Command | What it does |
|---|---|
| `npm run box -- --games 100 --seed 1 [--decks a,b] [--nemeses vorthrax,morwen] [--workers N]` | Games per deck × Nemesis in worker threads, against all 7 Nemeses unless `--nemeses` names some (`vorthrax`, `vaskara`, `morwen`, `mirror-archmage`, `stampede`, `revel`, `hydra`). Prints the win-rate table and the metrics per Nemesis, and writes `dist/box/box-seed<S>-g<N>.{md,json}`. Every game has its own seed, so results don't depend on the worker count. |
| `npm run box:trace -- <seed> <deck> <nemesis>` | The log of one game. |
| `npm run pnp:box` | The print-and-play PDFs of the box mode. |
| `npm run box:test:challenges` | The Challenge deck rules as 15 scenario tests. |
| `npm run box:test:nemesis` | The rules above as 25 scenario tests, on Threats pinned to fixed sizes so tuning never breaks them; 6 of them check the player's AI. |
| `BOX_THREAT_SIZES=vorthrax=1/2,morwen=0/-1 npm run box` | Adds power/toughness to every creature of the named Nemeses, to probe sizes without editing the deck lists. |
| `BOX_OMEN=0 npm run box` | No Omen: each Nemesis turn reveals the top Threat and executes it. Every face-down Threat is life (20 at the start), and damage, discards, Brood and Egg Laying take the top cards. |

The player decks are the 45 pairs of Beginner Box decks (`src/box/nemesis/decks.ts`).
