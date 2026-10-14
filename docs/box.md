# Foundations Beginner Box in the simulator

`src/box` simulates the ten fixed decks of the Magic: The Gathering Foundations Beginner Box: Cats, Vampires, Healing, Pirates, Wizards, Undead, Goblins, Inferno, Elves and Primal. Each deck has 20 cards: 7 basic lands, Uncharted Haven and 12 spells; Inferno and Primal have 8 basic lands and 11 spells. A player shuffles two decks together into a 40-card deck, so there are 45 pairs (`PAIRS`, `pairDeck('cats', 'goblins')` or the deck id `cats+goblins`).

The engine and the AI are a copy of mana-duel's (`src/engine`, `src/ai`). The box needed these mechanics on top of it:

| Mechanic | Cards |
|---|---|
| Auras: cast on a target, attached, to the graveyard when their permanent leaves | Pacifism, Untamed Hunger, Eaten by Piranhas, Starlight Snare, New Horizons |
| Equipment: equip at sorcery speed, stays when its creature leaves | Quick-Draw Katana, Pirate's Cutlass |
| Artifacts and enchantments as permanents, and targets for removal | Goblin Oriflamme, Prayer of Binding, Carnelian Orb of Dragonkind, Goblin Firebomb, Broken Wings, Thrashing Brontodon |
| Static abilities: lords, attacking-only bonuses, conditional keywords, "can't block" | Corsair Captain, Death Baron, Dropkick Bomber, Elvish Archdruid, Crossway Troublemakers, Aggressive Mammoth, Kitesail Corsair, Kargan Dragonrider, Twinblade Paladin, Vampire Interloper |
| Indestructible, ward {2}, exile, "exile it instead if it would die" | Adamant Will, Offer Immortality, Tolarian Terror, Angelic Edict, Eaten Alive, Elspeth's Smite, Scorching Dragonfire, Fiery Annihilation |
| Graveyard: mill, return a card to hand, abilities that act from the graveyard | Crow of Dark Tidings, Cemetery Recruitment, Elvish Regrower, Reassembling Skeleton, Suspicious Shambler |
| New triggers: beginning of combat, end step, "one or more creatures attack", each draw, the second draw of a turn, counters on another creature, any spell or noncreature-or-Dragon spell | Leonin Vanguard, Battle-Rattle Shaman, Stromkirk Bloodthief, Ancestor Dragon, Clinquant Skymage, Erudite Wizard, Mischievous Mystic, Wildwood Scourge, Brineborn Cutthroat, Firespitter Whelp |
| Conditions: raid, an opponent lost life, three creatures, another Elf, the opponent's turn | Skyship Buccaneer, Storm Fleet Spy, Bloodtithe Collector, Dwynen's Elite |
| Costs: cost reductions, {X}, kicker, sacrifice a creature or pay, sacrifice another creature, activate only once | Tolarian Terror, Arcane Epiphany, Dragonlord's Servant, Wildwood Scourge, Into the Roil, Eaten Alive, Hungry Ghoul, Mild-Mannered Librarian |
| Mana: Treasure tokens, mana creatures, one mana per Elf, a land that taps for two | Corsair Captain, Rapacious Dragon, Seize the Spoils, Llanowar Elves, Druid of the Cowl, Elvish Archdruid, New Horizons |
| Optional targets ("up to"), counters split among targets, scry, "can't be blocked", "can't block this turn", sacrifice after combat damage | Felidar Savior, Prayer of Binding, Battle-Rattle Shaman, Biogenic Upgrade, Opt, Goblin Smuggler, Frenzied Goblin, Dropkick Bomber |

## Approximations

The engine plays every card, but these differ from the printed text. The last column says which way each one moves the player's win rate.

| Card | What the engine does instead | Bias |
|---|---|---|
| Uncharted Haven | Taps for one mana of any color, not of one color chosen as it enters. | Slightly up: better fixing. |
| Deadly Plot | Only the "destroy target creature" mode; the Zombie-reanimation mode is missing. | Slightly down. |
| Prayer of Binding | The exile is permanent: the permanent doesn't return if Prayer leaves the battlefield. | None against the Nemesis, which can't remove enchantments. |
| Incinerating Blast | Always draws a card, then discards one, instead of "you may discard a card; if you do, draw a card". | Slightly up. |
| Seize the Spoils | Discards a card after drawing two, as the last step of the spell, instead of as an additional cost. | Slightly up. |
| Joraga Invocation | No "must be blocked this turn if able". | Slightly down. |
| Fiery Annihilation | Doesn't exile an Equipment attached to the creature. | None against the Nemesis, which has no Equipment. |
| Carnelian Orb of Dragonkind | No haste for a Dragon paid with its mana. | Slightly down. |
| Undying Malice | Grants undying: the creature returns untapped, and not if it already had a +1/+1 counter. | Small, either way. |
| Eaten by Piranhas | The creature keeps its colors and creature types. | None. |
| Mild-Mannered Librarian | Doesn't become a Werewolf; it gets its counters and draws. | None. |
| Elvish Archdruid | A payment that uses part of its mana wastes the rest. | Slightly down. |
| New Horizons | Its two mana can be of different colors. | Slightly up. |

Choices the engine makes on its own, because it has no "you may" decisions:

1. Crossway Troublemakers pays 2 life to draw a card only when its controller has 8 or more life.
2. Frenzied Goblin always pays {R} when it can.
3. Into the Roil is kicked whenever the kicker is affordable.
4. Ward {2} is paid whenever its cost is affordable; otherwise the spell or ability is countered.
5. Scry (Opt) puts a land on the bottom when its player already has 5 or more lands between battlefield and hand, and keeps everything else on top.

## Commands

| Command | What it does |
|---|---|
| `npm run box:cards` | Renders each card's English rules text with the engine and compares it with the Scryfall oracle text, cached in `dist/box/oracle.json`. 84 of 119 cards match line by line; the rest differ in wording or in the approximations above. |
| `npm run box:test` | 38 scenario tests, one or more per mechanic above. |
| `npx tsx src/box/smoke.ts 450` | AI-vs-AI games, each seat with a random pair of box decks, with the engine invariants checked after every action. |

The relic machinery that mana-duel uses for its Expedition is still in the engine (the `relic` card type and the command zone), but no card uses it.
