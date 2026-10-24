# Nemesis mode on the Magic engine

The box pilot asks one question before anything is bought or printed: do Automana's Nemeses give a fair fight to normal Magic decks? `src/box/engine` is mana-duel's Magic engine; this document describes the Nemesis seat added on top of it, as implemented.

There are seven Nemeses. Four are Automana's (Vorthrax, Vaskara, Morwen and the Mirror Archmage); three are inspired by the Challenge Decks Wizards printed for the Theros block (the Stampede, the Revel King and the Hydra). All seven play by the same rules; a deck's character comes from its cards' text.

## Seats

1. **Seat 0, the player**, plays normal Magic with the engine: 20 life, a 7-card hand, London mulligan and one land per turn. The player always takes the first turn and skips that draw.
2. **Seat 1, the Nemesis**, is opted in with `PlayerSetup.nemesis`. It has 20 life on a counter, no hand of its own, no lands, no mana and no mulligan, and its cards have no cost.

## The Nemesis rules

1. **Setup:** its deck is shuffled into its library. The Revel King starts with the King and 2 Drunken Throngs on the battlefield, the Hydra with 2 Lesser Heads (`NemesisDeck.battlefield`).
2. **Its turn:** untap; at the draw step it reveals its top card into its hand, and casts it for free in its main phase. It reveals more only when a card says so, such as War Drums. A card revealed at another time is cast as soon as it has priority on its own turn with an empty stack.
3. **Creatures** enter summoning sick unless they have haste. There is no creature limit.
4. **Its spells** go on the stack, the player may respond, and they go to its graveyard.
5. **Empty library:** when it must reveal a card and its library is empty, its graveyard is shuffled into a new library.
6. **Life:** damage and life loss lower its life, and it gains life normally (lifelink). At 0 the player wins. A card may give another way to win: the Revel King.
7. **Draw and discard:** effects that would make it draw or discard do nothing.
8. **Zones:** its permanent that would return to a hand goes on top of its library instead. Exile works normally.

## The Nemesis mind

It never responds and never activates abilities. `src/box/nemesis/mind.ts`:

1. **Card text first:** a creature whose text says it attacks attacks; a creature whose text says it attacks only when a card says so never attacks otherwise.
2. **Attack:** every other creature with power above 0 that can attack does, unless the player has an untapped creature that could block it alone, kill it and survive. The check accounts for flying, reach and skulk, menace (no single blocker qualifies), first and double strike, deathtouch, indestructible and damage already marked.
3. **Blocks,** each attacker blocked by at most one creature except a menace attacker in desperation:
   1. **Safe block:** each blocker, oldest first, takes the strongest attacker it can kill and survive.
   2. **Trade:** each remaining blocker takes the strongest attacker it can kill.
   3. **Desperation:** if the damage still unblocked (trample excess included) would reduce the Nemesis to 0, every remaining blocker takes the strongest attacker it can block, in pairs against menace.
4. **Ordering:** "strongest" means highest power, then toughness, then the oldest.
5. **Targets:** the player's strongest creature it can target, skipping hexproof and ward; otherwise the player.
6. **Other choices** its cards leave to "you" are made by fixed rules in the player's favour (see Decisions and deviations).

## Card text that carries a deck's theme

1. **More reveals:** War Drums (Stampede, Revel King) and the Stampede's artifacts reveal one more card each Nemesis turn while on the battlefield. The Revel King does too, while there are three or more Revelers.
2. **The Revel King** can't block and attacks only when a card says so (Frenzied Piper, King's Scorn). It can't leave the battlefield while a Reveler is there, and when it leaves, the player wins. Revelers also attack only when a card says so (Reckless Rush, Panic Dance), and Crazed Nymph only with five or more Revelers.
3. **Heads** have no power, so they never attack, but they block. **Bite:** at the start of the Nemesis's combat, an untapped Head deals 1 damage to the player. **Regrow:** when a Head dies, the Nemesis reveals its top 2 cards: Heads enter the battlefield, the rest go to its graveyard.
4. **Hero's Rewards:** a Head or Reveler that leaves the battlefield, or a Stampede artifact put into a graveyard from anywhere, gives the player life or a card.
5. **Rules for the turn:** Blood Frenzy, Hunt the Weak, Venom Horns and Unbroken Charge pump the Minotaurs that attack this turn; Storm of Judgment, Encore and Tear Apart deal damage at the start of combat; Reckless Rush makes the Revelers attack with haste.

## Player cards against the Nemesis

1. Damage and life loss lower its life, from combat or spells.
2. Returning a Nemesis permanent to its owner's hand puts it on top of its library.
3. "An opponent discards N cards" does nothing.
4. The Nemesis turn is "an opponent's turn" for the player's cards.

## The seven decks

Creature sizes sit in the range of Magic creatures; a Nemesis's strength comes from its abilities. Data: `src/box/nemesis/threats.ts` (Automana) and `src/box/nemesis/challenges.ts` (Challenge decks).

| Nemesis | Cards | Deck |
|---|---:|---|
| Vorthrax | 20 | 3 Ash Imp 1/3 flying, Magma Sentinel 1/2 defender, Rain of Cinders, Tyrant's Roar, 2 Searing Breath, 3 Cinderclaw Brute 3/3, 2 Ember Wyrmling 2/3 flying, 2 Vorthrax's Herald 3/4, 2 Scorch Fiend 4/4 trample, Lava Behemoth 4/6, Inferno Charger 3/3 haste, Cinder Rebirth |
| Vaskara | 20 | 3 Ravenous Larva 2/4 lifelink, 2 Pheromones, Insect Plague, 4 Armored Drone 2/4, 3 Darting Wasp 2/3 flying, 2 Shieldbreaker Beetle 2/5 trample, 2 Mantis Queen 3/6, 2 Egg Laying, Brood |
| Morwen | 20 | 4 Wandering Skeleton 2/3, Rotting Zombie 2/5, Plague, 3 Vampire Bat 1/4 flying lifelink, 2 Withering Touch, Soul Drain, Exhume, 2 Morwen's Ghoul 3/4 deathtouch, 2 Deathless Knight 3/6 lifelink, 2 Crypt Horror 4/6 lifelink, Uprising |
| Mirror Archmage | 20 | 3 Fragile Illusion 3/1 flying, Crystal Golem 1/4 defender, 2 Counterspell, 3 Water Elemental 3/4, 2 Rebound, Mind Theft, Mass Illusion, 2 Guardian Sphinx 3/3 flying, 2 Mirror Djinn 4/2 flying, 2 Tide Serpent 4/5, Refraction Golem 1/4 defender |
| The Stampede | 43 | 5 Hornbound Raider 3/2, 6 Hornbound Whelp 2/2, 5 Hornbound Reaver 2/3 and 4 Frenzied Charger 4/1, all with haste; 4 Warlord's Chosen 5/4; all of them attack each turn. 10 sorceries (2 each of Blood Frenzy, Hunt the Weak, Storm of Judgment, Venom Horns, Unbroken Charge), 7 artifacts (War Altar, Skull Totem, 2 Looted Idol, 2 Spring Draught, Healing Balm), 2 War Drums |
| The Revel King | 3 + 43 | Starts with the Revel King 3/5 and 2 Drunken Throngs 1/1. Library: 2 Crazed Nymph 4/2, 6 Frenzied Piper 2/1, 2 Wildband Centaur 4/2, 2 Drunken Throng, Viper Dancers 2/2 deathtouch, Howling Maenads 3/1 first strike, 7 Reckless Rush, 2 Wild Smashing, 4 Encore, 2 Tear Apart, 3 King's Scorn, 5 King's Strike, 2 Fire Dance, 2 Panic Dance, 2 War Drums |
| The Hydra | 2 + 36 | Starts with 2 Lesser Heads 0/2. Library: 3 Lesser Head, the elite Frenzy Head, Screaming Head and Fang Head 0/4, 5 Dazing Gaze, 5 Bait the Beast, 2 Iron Scales, 3 Tangled Necks, 4 Toxic Breath, 2 Weak Spot, 5 Swallowed Whole, 2 Divided Fury, 2 All-Heads Lunge |

## Tuning

Targets: 52–58% for the player against Vorthrax and Vaskara, 42–48% against Morwen and the Mirror Archmage, 45–55% against the Challenge decks.

1. **The common rules made the Automana Nemeses much harder.** Without tiers a 6- or 7-power creature could come on the first turn, and without the creature limit nothing stopped a board from growing. With the old sizes the player won 14.7% against Vorthrax, 21.6% against Vaskara, 16.0% against Morwen and 30.4% against the Archmage (seed 1, 10 games per pair and Nemesis).
2. **Power is the knob for them.** −1 power on every creature moved them by 7 to 23 points, −2 by 24 to 55. The tuned decks take −2 power on every Vorthrax creature and −1 more on its six biggest; −1 on every Vaskara and Morwen creature and −1 more on their biggest (Mantis Queen, Shieldbreaker Beetle, Darting Wasp; Crypt Horror, Deathless Knight, Vampire Bat); −1 on every Archmage creature.
3. **The Revel King was all about its extra reveal.** With the King revealing one more card from its first turn, the player won about 20%; without it and with 2 War Drums, 88%. Each War Drums moved the rate by 3 to 4 points. The middle came from the King's own text: one more reveal only with three or more Revelers, with the printed normal setup of 2 Throngs and 2 War Drums.
4. **Revelers and Heads needed their printed passivity back.** With the common attack rule the King, which can't die while a Reveler stays, attacked every turn: 9.3 damage per game. "Attacks only when a card says so" on the King and the Revelers, and "can't block" on the King, restore the original, where they only attacked on a card's orders.
5. **Cutting damage spells doesn't help against a reveal deck.** As before, fewer King's Strikes, Encores, Reckless Rushes, Divided Furies or All-Heads Lunges lowered the player's rate or left it within noise: each spell cut makes the next reveal more likely a creature, and Reckless Rush sends the Revelers into the player's blockers. Fewer Heads helped the player: the Hydra lost its 2 Brute Heads, starts with 2 Lesser Heads (the printed easy setup) and its elite Heads bite for 1.
6. **Result** over seeds 1, 3, 5 and 7 (10 games per pair and Nemesis on each, 1,800 games per Nemesis, 0 errors; ±2.3 points). Seed 1 drove the tuning; Morwen and the Hydra took their last step on seeds 1 and 3.

| Nemesis | Target | Seed 1 | Seed 3 | Seed 5 | Seed 7 | All | Rounds |
|---|---:|---:|---:|---:|---:|---:|---:|
| Vorthrax | 52–58% | 55.6% | 55.3% | 53.6% | 56.7% | 55.3% | 8.0 |
| Vaskara | 52–58% | 57.6% | 55.1% | 55.1% | 54.4% | 55.6% | 8.3 |
| Morwen | 42–48% | 45.8% | 45.1% | 48.2% | 45.1% | 46.1% | 8.9 |
| Mirror Archmage | 42–48% | 46.2% | 45.1% | 44.2% | 43.6% | 44.8% | 8.9 |
| The Stampede | 45–55% | 46.7% | 48.4% | 43.3% | 47.8% | 46.6% | 7.2 |
| The Revel King | 45–55% | 54.2% | 57.1% | 51.8% | 54.4% | 54.4% | 7.0 |
| The Hydra | 45–55% | 48.9% | 43.6% | 47.3% | 50.7% | 47.6% | 7.4 |

Earlier passes, with tiers, the Omen, the creature limit and per-deck rules, are in the git history; their numbers don't carry over.

## The player's AI

1. **Blocks:** when it plans an attack, it predicts the Nemesis's blocks with the Nemesis rules, which are public and deterministic. Any spell or trigger it weighs during its own attack, such as Frenzied Goblin's, is scored after those blocks and the combat.
2. **Combat tricks:** every attack and every block it weighs includes its best instant or ability once blockers are declared, on the creatures in that combat. It attacks into a blocker when a pump saves its creature, and blocks a bigger attacker when a trick kills it.
3. **The Nemesis turn:** it scores its attacks, its spells after combat and its answers on the Nemesis turn after playing out the rest of that Nemesis turn (`src/box/ai/forecast.ts`): the next reveal resolves, the Nemesis attacks by its rules, and the player answers with its instants and blocks: blocks that kill and survive, trades into stronger creatures, and chump blocks only against lethal damage.
4. **Set-ups before combat:** when it can cast a sorcery or activate an ability that pumps, taps, or stops a creature from blocking or being blocked (Joraga Invocation, Goblin Smuggler, Dropkick Bomber), it plans the whole attack after each option before choosing one.
5. **Permanents:** an artifact or enchantment on the battlefield is worth more than the same card in hand, so it casts Goblin Oriflamme, Quick-Draw Katana or Carnelian Orb of Dragonkind when it has mana to spare.
6. **Lands:** it plays the land that lets it cast its most expensive spell this turn, then the one whose colour its hand needs most.
7. **Hidden order:** it decides on a copy of the game where the Nemesis library is re-shuffled from a fixed order, so the real order never changes its decisions. It plays the Nemesis turn out with that one guess. Selftests check both.
8. **Waiting Counterspell:** it feeds the Counterspell its cheapest castable spell in its main phase. Without this rule, the AI never cast again once a Counterspell waited.

What it still doesn't do:

1. Cast card-neutral spells for their quality: Opt, and Cemetery Recruitment on a non-Zombie, stay in hand.
2. Look past the next Nemesis combat, or plan its own turn as a whole: it chooses one action at a time.
3. Use tricks in the blocks it imagines for the Nemesis turn.

## Decisions and deviations

1. **A targeted Nemesis spell picks its target on cast.** If the target becomes illegal in response (hexproof, bounce, death), the spell fizzles and goes to its graveyard without its fallback.
2. **Creature cards are cast as spells,** so the player's counterspells can counter them.
3. **Counterspell's reminder** waits on the Nemesis battlefield as a non-creature card. It counters the player's next spell as it is cast, then goes to the graveyard. Cast triggers such as prowess still happen.
4. **Random discards:** Mind Theft, and Rebound when the player has no creature, discard a random card (seeded).
5. **Mantis Queen's +1/+0 also reaches the Queen.** It is summoning sick, so this changes nothing.
6. **Ward is untested here.** Targeting skips any creature with a `ward` keyword, but this branch has no ward yet; the Beginner Box merge brings it.
7. **The Challenge decks' "you choose"** becomes fixed rules in the player's favour: Toxic Breath destroys the tapped creatures unless they are worth more than 5 life and the player has more than 10; Bait the Beast sacrifices the player's weakest creature if it is small or life is low; Weak Spot destroys a plain Head; Tangled Necks and Divided Fury tap the Heads that hit hardest; Wild Smashing sacrifices a noncreature artifact or enchantment only at 6 life or less; Swallowed Whole exiles the player's weakest creature; War Altar sacrifices the strongest Minotaurs; Healing Balm returns the player's strongest creature card and the Stampede's weakest.
8. **"Each player" means the player** in the Nemesis's own cards.
9. **Hunt the Weak's "must be blocked if able" is not modelled;** its first strike is.
10. **No Hero cards.** The Theros originals let the player start with up to two or three Hero cards on the battlefield; here the contents make up for them.

## Print and play

`npm run pnp` writes `dist/automana-box-pnp-en.pdf` and `-es.pdf`: 208 cards on 24 A4 sheets (63 × 88 mm like Magic cards, 3 mm bleed, odd pages fronts, even pages backs mirrored for long-edge duplex, CMYK). The README has the layout and the print shop order.

1. **One rules card** for all seven Nemeses (`src/content/box-reference.ts`): setup and starting cards, the Nemesis turn, its mind, and how the player's cards work against it, with Bite and Regrow.
2. **The 4 Automana decks**, 20 cards each, with the Threat back. Sizes come from `src/box/nemesis/threats.ts`; names, texts and art scenes from `src/content/threats.ts`.
3. **The 3 Challenge decks** after them: the Stampede (43 cards), the Revel King (46, its 3 starting cards included) and the Hydra (38, its 2 starting Heads included). Their names, texts and art scenes are in `src/content/challenges.ts`, their sizes and copies come from `src/box/nemesis/challenges.ts`.
4. **No tier mark:** every Threat shows the Threat burst where a Magic card shows its mana cost.
5. **Wording for Magic:** "the battlefield", the official Spanish keywords (*Vuela*, *Arrolla*), a random discard for Rebound and Mind Theft, "tap" for Mass Illusion, and the graveyard for Egg Laying, Brood, Wandering Skeleton, Soul Drain, Exhume, Uprising and Cinder Rebirth.

`npm run rulebook` writes the A5 rulebook, `dist/automana-rulebook-en.pdf` and `-es.pdf`. It states the mind's rules for play at the table:

1. **Its row:** its creatures stand in the order they arrive, the oldest at the left; "oldest first" means from the left of the row.
2. **One blocker per attacker,** never two on one attacker, except a menace attacker in desperation.
3. **Desperation** blocks with every free creature it can, not just with enough to survive.
4. **The attack check** looks at each of its creatures alone, so one of your creatures can keep several of them home.
5. **Ties** between your attackers or your creatures as targets, after power and toughness, are the player's choice. The engine takes the oldest; the two only differ for creatures with different abilities.

Its combat examples are played on the engine as it is built (`src/box/nemesis/examples.ts`): a change to the mind that makes a page wrong stops the build.

## Tools

| Command | What it does |
|---|---|
| `npm run box -- --games 100 --seed 1 [--decks a,b] [--nemeses vorthrax,morwen] [--workers N]` | Games per deck × Nemesis in worker threads, against all 7 Nemeses unless `--nemeses` names some (`vorthrax`, `vaskara`, `morwen`, `mirror-archmage`, `stampede`, `revel`, `hydra`). Prints the win-rate table and the metrics per Nemesis, and writes `dist/box/box-seed<S>-g<N>.{md,json}`. Every game has its own seed, so results don't depend on the worker count. |
| `npm run box:trace -- <seed> <deck> <nemesis>` | The log of one game. |
| `npm run pnp` | The print-and-play PDFs. |
| `npm run rulebook` | The A5 rulebook PDFs. Stops if an example no longer matches the Nemesis mind or a page overflows. |
| `npm run box:test:nemesis` | The Nemesis rules as 26 scenario tests, on Threats pinned to fixed sizes so tuning never breaks them; 6 of them check the player's AI. |
| `npm run box:test:challenges` | The Challenge deck cards as 8 scenario tests. |
| `BOX_THREAT_SIZES=vorthrax=1/2,nm_ash_imp=0/-1 npm run box` | Adds power/toughness to every creature of the named Nemeses or to named Threats, to probe sizes without editing the deck lists. |
| `BOX_THREAT_COPIES=nm_ash_imp=2,nm_tyrants_roar=2 npm run box` | Sets the copies of named Threats in their decks. |
| `BOX_CHALLENGE='{"revel":{"copies":{"ch_war_drums":3},"sizes":{"ch_revel_king":[4,5]}}}' npm run box` | The same for the Challenge decks, as JSON per Nemesis: `copies`, `sizes` and `battlefield`. |

The player decks are the 45 pairs of Beginner Box decks (`src/box/nemesis/decks.ts`).
