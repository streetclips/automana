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

Creatures keep their Palmwalker names, effects and quantities. Their sizes were tuned against the 45 pairs of Beginner Box decks (see Tuning): Vorthrax, Vaskara and Morwen at Palmwalker's power − 1 and Palmwalker's toughness, the Mirror Archmage at power − 2 and toughness − 3. Spells keep their numbers. Data: `src/box/nemesis/threats.ts`. Each tier lists the cards in it and how many of each.

| Nemesis | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Vorthrax | 3 Ash Imp 2/6 flying, Magma Sentinel 2/9 defender, Rain of Cinders, Tyrant's Roar | 2 Searing Breath, 3 Cinderclaw Brute 5/7, 2 Ember Wyrmling 4/7 flying | 2 Vorthrax's Herald 5/8, 2 Scorch Fiend 6/8 trample, Lava Behemoth 6/10, Inferno Charger 5/7 haste, Cinder Rebirth |
| Vaskara | 3 Ravenous Larva 2/6 lifelink, 2 Pheromones, Insect Plague | 4 Armored Drone 3/7, 3 Darting Wasp 3/6 flying | 2 Shieldbreaker Beetle 3/8 trample, 2 Mantis Queen 4/9, 2 Egg Laying, Brood |
| Morwen | 4 Wandering Skeleton 2/6, Rotting Zombie 2/8, Plague | 3 Vampire Bat 2/7 flying lifelink, 2 Withering Touch, Soul Drain, Exhume | 2 Morwen's Ghoul 3/7 deathtouch, 2 Deathless Knight 4/9 lifelink, 2 Crypt Horror 5/9 lifelink, Uprising |
| Mirror Archmage | 3 Fragile Illusion 3/3 flying, Crystal Golem 1/6 defender, 2 Counterspell | 3 Water Elemental 3/6, 2 Rebound, Mind Theft, Mass Illusion | 2 Guardian Sphinx 3/5 flying, 2 Mirror Djinn 4/4 flying, 2 Tide Serpent 4/7, Refraction Golem 1/6 defender |

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

## The player's AI

1. **Blocks:** when it plans an attack, it predicts the Nemesis's blocks with the Nemesis rules, which are public and deterministic.
2. **Hidden order:** it decides on a copy of the game where the face-down Threats are re-shuffled from a fixed order, so the real order never changes its decisions. A selftest checks this.
3. **Waiting Counterspell:** it feeds the Counterspell its cheapest castable spell in its main phase. Without this rule, the AI never cast again once a Counterspell waited. In a 224-game run against mana-duel's decks, the Mirror Archmage then won 80% of its games; with the rule it won 5%.

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

## Tools

| Command | What it does |
|---|---|
| `npm run box -- --games 100 --seed 1 [--decks a,b] [--nemeses vorthrax,morwen] [--workers N]` | Games per deck × Nemesis in worker threads. Prints the win-rate table and the metrics per Nemesis, and writes `dist/box/box-seed<S>-g<N>.{md,json}`. Every game has its own seed, so results don't depend on the worker count. |
| `npm run box:trace -- <seed> <deck> <nemesis>` | The log of one game. |
| `npm run box:test:nemesis` | The rules above as 20 scenario tests, on Threats pinned to fixed sizes so tuning never breaks them. |
| `BOX_THREAT_SIZES=vorthrax=1/2,morwen=0/-1 npm run box` | Adds power/toughness to every creature of the named Nemeses, to probe sizes without editing the deck lists. |

The player decks are the 45 pairs of Beginner Box decks (`src/box/nemesis/decks.ts`).
