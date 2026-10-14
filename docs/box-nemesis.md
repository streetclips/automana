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

Creatures keep their Palmwalker names, effects and quantities, at power − 2 (minimum 1) and toughness − 4 (minimum 1). Spells keep their numbers. Data: `src/box/nemesis/threats.ts`. Each tier lists the cards in it and how many of each.

| Nemesis | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Vorthrax | 3 Ash Imp 1/2 flying, Magma Sentinel 1/5 defender, Rain of Cinders, Tyrant's Roar | 2 Searing Breath, 3 Cinderclaw Brute 4/3, 2 Ember Wyrmling 3/3 flying | 2 Vorthrax's Herald 4/4, 2 Scorch Fiend 5/4 trample, Lava Behemoth 5/6, Inferno Charger 4/3 haste, Cinder Rebirth |
| Vaskara | 3 Ravenous Larva 1/2 lifelink, 2 Pheromones, Insect Plague | 4 Armored Drone 2/3, 3 Darting Wasp 2/2 flying | 2 Shieldbreaker Beetle 2/4 trample, 2 Mantis Queen 3/5, 2 Egg Laying, Brood |
| Morwen | 4 Wandering Skeleton 1/2, Rotting Zombie 1/4, Plague | 3 Vampire Bat 1/3 flying lifelink, 2 Withering Touch, Soul Drain, Exhume | 2 Morwen's Ghoul 2/3 deathtouch, 2 Deathless Knight 3/5 lifelink, 2 Crypt Horror 4/5 lifelink, Uprising |
| Mirror Archmage | Crystal Golem 1/5 defender, Mind Theft, Mass Illusion, 2 Counterspell, 2 Rebound | 3 Fragile Illusion 3/2 flying, 3 Water Elemental 3/5 | 2 Guardian Sphinx 3/4 flying, 2 Mirror Djinn 4/3 flying, 2 Tide Serpent 4/6, Refraction Golem 1/5 defender |

## The player's AI

1. **Blocks:** when it plans an attack, it predicts the Nemesis's blocks with the Nemesis rules, which are public and deterministic.
2. **Hidden order:** it decides on a copy of the game where the face-down Threats are re-shuffled from a fixed order, so the real order never changes its decisions. A selftest checks this.
3. **Waiting Counterspell:** it feeds the Counterspell its cheapest castable spell in its main phase. Without this rule, the AI never cast again once a Counterspell waited. In a 224-game run against mana-duel's decks, the Mirror Archmage then won 80% of its games; with the rule it won 5%.

## Decisions and deviations

1. **Archmage tiers are 7/6/7,** not 6/7/7. A tier belongs to a card definition, and both Rebounds share one, so both are tier 1.
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
| `npm run box:test:nemesis` | The rules above as 20 scenario tests. |

Until the Beginner Box decks are merged, the player decks are mana-duel's 14 (`src/box/nemesis/decks.ts`).
