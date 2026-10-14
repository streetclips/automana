# Palmwalker — Rulebook

A solo dueling card game you hold in your hands.

No table. No tokens. No opponent across the board. Just your hands, your spells, and a Nemesis that wants your library to burn.

| Players | Time | Box | Cards in one game | Ages |
|---|---|---|---|---|
| 1 | 15–20 min | 141 cards | 44 | 12+ |

This document is the game design reference. Card data (costs, texts in English and Spanish) lives in `src/content/`; if a card text here and in `src/content/` disagree, `src/content/` wins.

## 1. Welcome, Walker

Palmwalker takes the heart of a classic dueling card game (creatures, instants, combat) and folds it into something you can play standing on a train. Everything happens in your two hands.

You are a **Walker**, a wandering mage with a book of spells. Each turn you draw, cast creatures and spells with 3 mana, and attack. Your foe is a **Nemesis**: an automated boss with its own deck of Threats. It summons creatures, casts spells, attacks and blocks following a few fixed rules, so you never make decisions for it.

Three ideas make it fit in your hands:

1. **Your library is your life.** You start with 20 cards in your library: that is 20 life. Damage throws cards from your library into your graveyard.
2. **You see the Nemesis coming.** The face-up card on top of its Threat deck, the **Omen**, shows its next move a full turn ahead.
3. **Position is state.** Cards are tapped by lowering them in the fan. Zones are parts of a packet, not places on a table.

Inspired by the in-hand tradition on BoardGameGeek:

1. **Palm Island**: 4-state cards, sideways resources.
2. **Handy Brawl**: an enemy that acts on its own, damage as card state.
3. **Maiden's Quest**: in-hand deckbuilding.
4. **Galdor's Grip** and **Loot the Loop**: order and orientation as game state.
5. **The Hand of Destiny**: hero vs. waves and a boss.

## 2. Components (141 cards)

| Qty | Component | What it does |
|---|---|---|
| 12 | **Dawnward Order** half-grimoire (white) | Durable defence, life as recovery. |
| 12 | **Arcane Tide** half-grimoire (blue) | Control the future: Scry, bend the Omen, bounce, stop an attacker's damage. |
| 12 | **Grim Pact** half-grimoire (black) | Pay life for power: Deathtouch, extra draws, Reanimate. |
| 12 | **Emberkin** half-grimoire (red) | Speed and burn: Haste, direct damage. |
| 12 | **Wildwood** half-grimoire (green) | Big bodies: Trample, pump, a mana creature. |
| 4 × 20 | **Threat** decks | One per Nemesis: Vorthrax, Vaskara, Morwen and the Mirror Archmage. Its creatures and spells. It is also the Nemesis's life. |
| 1 | Quick reference card | Turn order, the Nemesis mind and the physical moves. |

A single game uses 44 cards: 24 Grimoire cards (two halves) + 20 Threats.

Replay space: 10 colour pairs × 4 Nemeses = 40 configurations.

**Half-grimoires.** Each colour is a 12-card half. Shuffle any two halves together and you have a 24-card Grimoire. Every Grimoire card has the same back, so your library keeps its next card secret.

**Threat cards have a plain back.** Face-down Threats are the Nemesis's life; face-up ones are the **Omen** (front) and the **Ruin** (back).

## 3. Anatomy of a card

Cards follow the classic layout of a dueling card.

```
┌────────────────────────────┐
│ [ Cinder Hound        (2) ]│  1. Name bar, with the cost at its right: the mana
│ ┌────────────────────────┐ │     it takes, 1 to 3. Threats show a Threat mark.
│ │                        │ │  2. Art. The frame has the card's colour;
│ │         (art)          │ │     Threats have a dark one.
│ │                        │ │  3. Type line.
│ └────────────────────────┘ │  4. Rules text; italic text is flavour.
│ [ Creature — Hound        ]│  5. Collection symbol and number: ◆ = Emberkin,
│ ┌────────────────────────┐ │     card 5 of its 12.
│ │ Rules text             │ │  6. Power/Toughness, at the bottom right.
│ │ Flavour (italic)       │ │
│ │ ◆ 5/12          [ 2/2 ]│ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

**Collection and number.** Every Grimoire and Threat card shows, at the bottom left of its text box, the symbol of its half-grimoire or Threat deck and its number in it. Copies of a card have consecutive numbers: the two Reckless Goblins are 1/12 and 2/12. After a game, sort the cards by symbol and lay each pile out by number: a gap is a missing card, and the card lists in section 17 name it. The quick reference has no symbol.

**Mana.** At the start of each of your turns you have 3 mana. Casting a spell spends its cost. Mana you don't spend on your turn stays until the start of your next turn, so you can keep some for instants on the Nemesis turn. It never piles up: every turn of yours starts again at 3. Mana has no colour and nothing to tap: count it in your head.

## 4. Card types

| Type | Rule |
|---|---|
| **Creature** | Stays on the Table. Attacks and blocks. |
| **Instant** | Cast it any time, even on the Nemesis turn. |
| **Sorcery** | Only in your main phase. |
| **Aura** | Tuck it behind a creature. Most Auras go behind your own creatures; **Pacify** Auras go behind a Nemesis creature. An Aura goes to your graveyard when its creature leaves the Table. |
| **Threat** | Nemesis cards: creatures or spells. They have no cost. |

Creature rules:

1. **Summoning sickness:** a creature can't attack or use {T} abilities on the turn it enters, unless it has Haste. It **can** block.
2. **Damage wears off** at the end of every turn. A creature dies only if it takes damage ≥ toughness in a single turn.
3. **Limit:** 4 creatures per side.

## 5. Keywords and actions

No keyword needs counters or tokens.

### 5.1 Keywords

| Keyword (EN / ES) | Rule | In your hands |
|---|---|---|
| Flying / Volar | Can only be blocked by creatures with Flying or Reach. | — |
| Reach / Alcance | Can block creatures with Flying. | — |
| Trample / Arrollar | Damage beyond what kills its blocker goes to the defending player or Nemesis. | — |
| Haste / Prisa | Ignores summoning sickness: can attack the turn it enters. | — |
| Defender / Defensor | Never attacks. Still blocks. | — |
| Vigilance / Vigilancia | Attacking doesn't lower this creature. | It simply stays raised. |
| Lifelink / Vínculo vital | Damage dealt by this creature also makes its controller gain that much life. | You: graveyard → library. Nemesis: Ruin → face-down bottom. |
| Deathtouch / Toque mortal | Any damage this creature deals to a creature is lethal. | — |

### 5.2 Actions and states

| Action (EN / ES) | Rule | In your hands |
|---|---|---|
| Scry N / Adivinar N | Look at the top N library cards; put any of them at the bottom in any order. | Peek at their spell side, then slide them between library and graveyard. |
| Pacify / Pacificar | An Aura you tuck behind a Nemesis creature: it can't attack or block. | The Aura sticks up behind the enemy card; it goes to your graveyard if the creature leaves. |
| Counter reminder / Recordatorio de contraconjuro | A Nemesis Counterspell stays in the Table fan, turned sideways, until it counters your next spell. Then it goes face-down to the bottom of the Threat deck. | Sideways card = pending effect. |
| Nemesis lifelink | When a Nemesis creature with Lifelink deals damage, return that many cards from the Ruin face-down to the bottom of the Threat deck. | Symmetric with yours. |

## 6. The Nemesis

The Nemesis is your opponent. It has no card of its own: it is its **Threat deck**, at the left of your fan. It has no hand and no mana: each turn it executes the face-up card on top of its deck, the **Omen**.

The Threat deck is its life:

1. **Face-down** Threat cards = the Nemesis's life. At 0, you win.
2. The **Omen** is face-up on top. It shows what the Nemesis does next turn. It does not count as life.
3. The **Ruin** is face-up at the back: dead Threat creatures and cards destroyed by damage.
4. **Damage to the Nemesis:** for each point, move the face-down card right behind the Omen to the Ruin.

Every Threat deck has 20 cards: 19 life once the first Omen is revealed. A Nemesis spell goes face-down to the bottom after it resolves, so it costs the Nemesis no life and will come back.

All Nemeses share the same attack, block and target rules (section 12). Each one's character lives in its deck and in one **signature Threat**.

## 7. The four Nemeses

| Nemesis (EN / ES) | Colour | Archetype | Signature Threat | Difficulty |
|---|---|---|---|---|
| Vorthrax, the Ash Tyrant / Vorthrax, el Tirano de Ceniza | Red | Aggro: big attackers and burn | Inferno Charger | ★★ |
| Vaskara, the Brood Mother / Vaskara, la Madre Enjambre | Green | Swarm: many bodies at once | Brood | ★★ |
| Morwen, the Lich Queen / Morwen, la Reina Liche | Black | Attrition: dead things return | Uprising | ★★★ |
| The Mirror Archmage / El Archimago Espejo | Blue | Control: counters, bounce and discard | Refraction Golem | ★★★ |

There is no Heroic mode: the Nemesis you choose is the difficulty you choose. You win about 56% of games against a ★★ Nemesis and about 45% against a ★★★ one (section 15).

### 7.1 Vorthrax, the Ash Tyrant (red, aggro)

1. **Deck:** 15 creatures (Ash Imps and Ember Wyrmlings in the air, Cinderclaw Brutes, Scorch Fiends with Trample, Vorthrax's Heralds, a Magma Sentinel and the 7/10 Lava Behemoth) and 5 spells (Searing Breath, Rain of Cinders, Tyrant's Roar, Cinder Rebirth).
2. **Signature — Inferno Charger:** a 6/7 with Haste. It attacks the turn it enters, so its Omen is your only warning.
3. **Tension:** every creature of his hits harder than yours, and his burn picks off your best blocker. Trade early, keep a blocker for the Charger's turn, and race.

### 7.2 Vaskara, the Brood Mother (green, swarm)

1. **Deck:** 14 insects (Ravenous Larvae with Lifelink, Armored Drones, flying Darting Wasps, Shieldbreaker Beetles with Trample, Mantis Queens) and 6 spells (Pheromones, Egg Laying, Insect Plague, Brood).
2. **Signature — Brood:** reveals the next 2 face-down cards, executes the creatures and puts the rest face-down at the bottom. Egg Laying does the same with one card.
3. **Tension:** she floods the Table fast, and a fifth creature overflows onto you (section 11.2). But every creature she reveals leaves her face-down pile: the swarm costs her life.

### 7.3 Morwen, the Lich Queen (black, attrition)

1. **Deck:** 14 undead (Wandering Skeletons that return face-down when they die, a Rotting Zombie, flying Vampire Bats, Morwen's Ghouls with Deathtouch, Deathless Knights and Crypt Horrors, with Lifelink on the Bats, Knights and Horrors) and 6 spells (Withering Touch, Exhume, Soul Drain, Plague, Uprising).
2. **Signature — Uprising:** returns the 2 highest-power creatures from the Ruin to the Table. If the Ruin has none, you lose 2 life.
3. **Tension:** killing her creatures feeds her Ruin, and Lifelink and Soul Drain give her life back. Pacify, bounce and Banish into Light lock creatures away without sending them to the Ruin; direct damage to Morwen wins the race.

### 7.4 The Mirror Archmage (blue, control)

1. **Deck:** 14 creatures (flying Fragile Illusions, Guardian Sphinxes and Mirror Djinns, Water Elementals, Tide Serpents, a Crystal Golem, the Refraction Golem) and 6 spells (Counterspell, Rebound, Mind Theft, Mass Illusion).
2. **Signature — Refraction Golem:** a 3/9 Defender. While it is on the Table, the first spell you cast each turn costs 1 more.
3. **Tension:** Counterspell eats your next spell, Rebound and Mind Theft empty your hand. When a Counterspell waits, feed it a cheap spell first, and kill the Golem to get your mana back.

## 8. Holding the game

```
LEFT HAND — THE TABLE (one fan, left → right)
┌──────────────┬───────────────────┬─────────────────────┐
│ Threat deck  │ Nemesis creatures │ Your creatures      │
│ Omen on top  │                   │ (Auras behind them) │
└──────────────┴───────────────────┴─────────────────────┘

RIGHT HAND — THE GRIMOIRE (one packet, front → back)
┌──────────────────────┐   ┌─────────────────────┐   ┌──────────────────────┐
│ HAND                 │ › │ LIBRARY = LIFE      │ › │ GRAVEYARD            │
│ spell side · fanned  │   │ back side · squared │   │ spell side · at back │
└──────────────────────┘   └─────────────────────┘   └──────────────────────┘
```

The library shows its backs; hand and graveyard show the spell side, so the boundaries between zones are always visible, even when the packet is squared.

**Up and lowered.** Raised (aligned with the fan) = untapped. Lowered (slid down about 2 cm) = tapped. The classic 90° turn also works for small fans; lowering is easier to hold.

**Other orientations.** Sideways Threat card = pending Counterspell.

## 9. Life, zones and physical moves

You begin with **20 cards in your library = 20 life**. Drawing a card spends 1 life. Damage mills cards into your graveyard. Gaining life brings cards back from the graveyard. **When your library reaches 0, you lose.** The Nemesis works the same way: its face-down Threat cards are its life. **When it reaches 0, you win.**

| When you… | Do this with your hands |
|---|---|
| **Draw** | Take the front card of your library, flip it to the spell side, add it to your hand fan. (−1 life) |
| **Take N damage** | N times: take the front library card, flip it to the spell side, slide it to the very back (graveyard). |
| **Lose N life** | Same as taking N damage. |
| **Gain N life** | N times: take the rearmost graveyard card, flip it to its back, slide it between library and graveyard. (Up to the size of your graveyard.) |
| **Scry N** | Look at the spell side of the front N library cards; slide any of them to the library bottom, in any order. |
| **Cast a spell** | Spend its cost from your mana. Creature → into the Table fan, at its right end. Instant/sorcery → resolve, then to your graveyard. |
| **A creature dies** | Yours → back of your graveyard. The Nemesis's → back of the Threat deck (Ruin). |
| **Deal N damage to the Nemesis** | N times: take the face-down card right behind the Omen, flip it face-up, slide it into the Ruin. |
| **The Nemesis gains N life** | N times: take the rearmost Ruin card, turn it face-down, put it at the bottom of the Threat deck (in front of the Ruin). |
| **The Nemesis casts a spell** | Resolve it, then put it face-down at the bottom of the Threat deck (in front of the Ruin). It will come back. |
| **Discard** | Put the card at the back of your graveyard. This is not damage. |

**Why library = life?** Damage is never just a number: every point costs you a real card you might have drawn. Healing recovers spent spells. And because drawing costs life, waiting is never free: the duel always moves forward.

**Counting.** Life is a count of cards. Count your library whenever you need to; with 20 cards or fewer it takes seconds. Advanced players track it in their head: −1 per draw, −N per hit.

**Black fills its own graveyard.** Every damage point mills you, so Reanimate and Crypt Lord always have targets: a creature that damage threw away before you could draw it comes back.

## 10. Setup (about one minute)

1. **Build your Grimoire.** Pick any two of the five half-grimoires and shuffle the 24 cards together. Hold them with their backs facing you.
2. **Draw your opening hand.** Draw 4 cards. Your library now has 20 cards: **you have 20 life.** You always keep this hand.
3. **The Nemesis.** Choose a Nemesis, shuffle its 20 Threat cards face-down at the left of your fan, and turn the top card face-up: that is the first **Omen**. The Nemesis has **19 life**.
4. **Begin.** You take the first turn and skip your draw on that turn.

**A typical opening hand.** Reckless Goblin, Thicket Bear, Surge of Vigor and Mossback Boar. Your 3 mana buys the Goblin and the Bear, or the Boar alone, or the Goblin with Surge of Vigor kept for the Nemesis turn. Decisions start on turn one.

## 11. Turn structure

### 11.1 Your turn

1. **Untap.** Raise all your lowered creatures. Your mana goes back to 3.
2. **Draw.** Draw 1 card (−1 life). Skip it on turn 1.
3. **Main phase.** Cast creatures, sorceries, Auras and instants.
4. **Combat.** Attack with any untapped creatures without summoning sickness. The Nemesis blocks by its rules.
5. **Second main.** Same as step 3.
6. **End.** Damage on creatures wears off.

### 11.2 Nemesis turn

1. **Untap.** Raise all Nemesis creatures.
2. **Execute the Omen.** A creature enters the Table (summoning sick unless it has Haste). A spell resolves and goes face-down to the bottom.
3. **Reveal a new Omen.** Turn the next face-down card face-up (−1 Nemesis life). Now you know next turn's threat.
4. **Attack.** Its creatures attack by the Nemesis rules. You block and may cast instants.
5. **End.** Damage wears off.

**Instants and responses.** You may cast instants at any moment, also on the Nemesis turn: before it executes the Omen, in response to a Nemesis spell, before it attacks, after blocks and at the end of its turn. They are paid from the mana you kept on your turn. When the Nemesis executes a spell, its target is chosen first; then you may respond before it resolves. The Nemesis never responds to you.

**Overflow.** If the Omen is a creature but the Nemesis already has 4 creatures, the new creature instead deals damage equal to its power to you, then goes face-down to the bottom of the Threat deck.

## 12. Combat and the Nemesis mind

### 12.1 How combat works

1. **Attack:** the attacker lowers its attacking creatures (not those with Vigilance). Lowered creatures stay lowered until their controller's next untap, so **creatures that attack can't block on the next turn**.
2. **Block:** each untapped defender may block one attacker. Each attacker can be blocked by at most one creature.
3. **Tricks:** after blocks, you may cast instants.
4. **Damage:** all at once. Each creature deals damage equal to its power. Unblocked attackers hit the player or Nemesis. Trample spills the excess.
5. **Deaths:** creatures with damage ≥ toughness die.

**Targets.** Nemesis effects that hit "your creature" choose your creature with the **highest power**; ties go to the highest toughness, then the leftmost. If you have no creature, the effect says what happens instead (usually damage to you).

### 12.2 The Nemesis attacks…

Each untapped Nemesis creature without Defender, without Pacify and without summoning sickness **attacks**, unless you have an untapped creature that could block it, **kill it and survive**.

### 12.3 The Nemesis blocks… (in this order)

1. **Safe block.** Each untapped Nemesis creature that can block an attacker, kill it and survive, does so, choosing the highest-power such attacker.
2. **Trade.** Each remaining blocker blocks the highest-power attacker it can kill, even if it dies.
3. **Desperation.** If unblocked damage would reduce the Nemesis to 0, every remaining blocker blocks the highest-power unblocked attacker.
4. **Ties:** the leftmost Nemesis creature chooses first. Between attackers of equal power it takes the one with the highest toughness, then the leftmost.

**Reading the Nemesis.** Because these rules are fixed, you can predict every block. The skill is in shaping the combat: pump after blocks, kill the only safe blocker first, or attack with exactly the creature it can't handle. Its creatures are bigger than yours, so few of your attacks trade evenly: flyers, removal, tricks and direct damage win the race.

**Example: a safe block, then a trick.** You attack with Cinder Hound (2/2) and Firebrand Raider (3/2). Vorthrax's Ash Imp (3/6) can kill either of them and survive, so it makes a **safe block on the stronger one, the Raider**. You answer with Battle Fury: the Raider becomes 6/2 and takes the Imp with it, and the unblocked Hound hits Vorthrax for 2.

## 13. Example game: Emberkin + Wildwood vs. Vorthrax

Opening hand: **Elvish Grovekeeper, Thicket Bear, Reckless Goblin, Surge of Vigor**. First Omen: **Scorch Fiend**. You: 20 life · Vorthrax: 19 life.

### Round 1

**You.**

1. No draw on the first turn. You have 3 mana.
2. Cast **Reckless Goblin** (1). It has Haste: attack. Vorthrax has no creature to block. Vorthrax 19 → 17.
3. Second main: cast **Thicket Bear** (2). Mana left: 0.

**Vorthrax.**

1. Executes the Omen: **Scorch Fiend** (7/8 Trample) enters, summoning sick.
2. Reveals the new Omen: **Rain of Cinders**. Vorthrax 17 → 16.

*End of round 1: You 20 · Vorthrax 16 · Omen: Rain of Cinders.*

### Round 2

**You.**

1. Draw **Mossback Boar** (20 → 19).
2. Cast the **Boar** (3). No attack: the untapped Fiend would make a safe block on anything you send.

**Vorthrax.**

1. Executes **Rain of Cinders**: 1 damage to each of your creatures and to you. The Goblin dies; the Bear and the Boar survive. You 19 → 18.
2. Rain of Cinders goes face-down to the bottom (Vorthrax 16 → 17), and the new Omen, **Searing Breath**, takes that life back (17 → 16).
3. Attack check: can any of your creatures block the Fiend, kill it *and survive*? No → **the Fiend attacks**. You don't block: 7 damage. You 18 → 11.

> Why not block with the Bear? The Fiend has Trample, so a chump block would save almost nothing and lose the Bear.

*End of round 2: You 11 · Vorthrax 16 · Omen: Searing Breath.*

### Round 3

**You.**

1. Draw **Ember Bolt** (11 → 10).
2. The Fiend attacked, so it is still lowered and can't block. Attack with the **Boar** only: Vorthrax 16 → 13.
3. Cast nothing: keep all 3 mana for the Nemesis turn, and keep the Bear home.

> Why? Neither Surge of Vigor nor Ember Bolt kills a 7/8 alone. Together, behind a blocker, they do, and only on the Nemesis turn does the Fiend walk into your Bear.

**Vorthrax.**

1. Executes **Searing Breath**: 2 damage to your highest-power creature, the Boar (3/3), which survives. The spell goes to the bottom (13 → 14).
2. Reveals the new Omen: **Inferno Charger**. 14 → 13.
3. The Fiend attacks. **You block with the Bear**, then cast **Surge of Vigor** on it (5/5) and **Ember Bolt** on the Fiend (3 damage).
4. Damage: the Bolt's 3 and the Bear's 5 make 8 → the Fiend dies (Ruin). The Fiend deals 7: 5 kill the Bear, and 2 trample over to you. You 10 → 8.

*End of round 3: You 8 · Vorthrax 13 · Omen: Inferno Charger.*

### Round 4

**You.**

1. Draw **Pyre Titan** (8 → 7).
2. Vorthrax has no creature: attack with the Boar. 13 → 10.
3. Second main: cast **Elvish Grovekeeper** (1). The Titan (3) waits.

> Why? The Omen is **Inferno Charger**, 6/7 with Haste: it attacks the turn it enters, and the Boar will be lowered. The Grovekeeper is the cheapest blocker, and the Titan's 2 damage to Vorthrax will count just as much next turn.

**Vorthrax.**

1. Executes **Inferno Charger**: it enters and, with Haste, can attack at once.
2. Reveals the new Omen: **Lava Behemoth**. 10 → 9.
3. The Charger attacks; the Grovekeeper blocks and dies.

*End of round 4: You 7 · Vorthrax 9 · Omen: Lava Behemoth.*

### Round 5

**You.**

1. Draw **Surge of Vigor** (7 → 6).
2. The Charger is lowered from its attack: the Boar attacks again. 9 → 6.
3. Second main: cast **Pyre Titan** (3). It deals 2 damage to Vorthrax as it enters. 6 → 4.

**Vorthrax.**

1. Executes **Lava Behemoth** (7/10), summoning sick.
2. Reveals the new Omen: **Ember Wyrmling**. 4 → 3.
3. The Charger attacks. At 6 life its 6 damage would kill you: **the Titan blocks** and dies.

*End of round 5: You 6 · Vorthrax 3 · Omen: Ember Wyrmling.*

### Round 6

**You.**

1. Draw **Firebrand Raider** (6 → 5).
2. Cast the **Raider** (3). It has Haste: attack with the Boar and the Raider.
3. The Charger is lowered. The Behemoth can kill either attacker and survive: both have 3 power, so it makes its safe block on the tougher one, the Boar. Desperation adds nothing: it has no other blocker.
4. The unblocked Raider deals 3. Vorthrax 3 → 0.

**Victory in round 6, with 5 life.** Three blockers died to buy it, and the key turn was the Nemesis's own: the Bear, Surge of Vigor and Ember Bolt took down its Fiend.

## 14. Modes

1. **Solo puzzle.** Set the first 6 Threat cards in a known order and try to win in as few turns as possible. Share your record.
2. **The Gauntlet (campaign).**
   1. Face three Nemeses in a row with the same Grimoire.
   2. After each victory, look at 3 random cards from a half-grimoire you aren't using and swap one of them into your Grimoire.
   3. Your life resets between duels. Lose once and the Gauntlet ends.

## 15. Matchups and colour pairs

Win rates of the balance simulator, 1,000 games per colour pair and Nemesis:

| Nemesis | You win | What works | Best pairs |
|---|---:|---|---|
| Vorthrax | 56% | Deathtouch and destroy effects; trade early, keep a blocker for Inferno Charger | U/B 64%, W/B 63%, B/R 62% |
| Vaskara | 56% | Removal for each creature as it comes, blockers with high toughness | U/B 65%, B/G 63%, W/B 60% |
| Morwen | 45% | Lock instead of kill (Pacify, bounce, Banish into Light) plus direct damage | U/B 57%, W/B 56%, W/U 53% |
| Mirror Archmage | 45% | Cheap spells first, then the big ones; kill the Refraction Golem | W/R 52%, U/B 52%, B/R 52% |

Every colour pair wins between 42.3% and 59.5% of its games, 50.6% on average. Black is the strongest half (56.4% over its pairs): Deathtouch and destroy effects ignore how big the Nemesis's creatures are. Green is the weakest (46.5%): its big bodies are still smaller than theirs.

Five showcase pairs:

1. **R/G — Brute force (43%):** haste, pump and trample against bigger bodies; the hardest pair.
2. **W/B — Life as a resource (58%):** lifelink refills what black's pacts spend.
3. **U/R — Arcane tempo (50%):** flyers, burn, and Bend Fate to dodge the worst Omens.
4. **B/G — Cycle of life (54%):** damage fills your graveyard, Reanimate brings creatures back.
5. **W/U — Control fate (51%):** Pacify, Deep Freeze, and flyers that never need to trade.

## 16. Designer notes

### 16.1 Tuning knobs for playtesting

| Knob | Default | Turn it up if… | Turn it down if… |
|---|---|---|---|
| Threat deck size | 20 (19 life) | you win before round 5 | games drag past round 9 |
| Mana per round | 3 | you often hold cards you can't afford | you empty your hand by round 3 |
| Opening hand | 4 | turns 1–2 feel empty | turns 1–2 feel scripted |
| Threat creature size | the stats in section 17 | you win more than 55% of games | you win less than 45% of games |
| Wandering Skeleton (Morwen) | 4 copies | — | killing them feels pointless (cut to 3) |
| Bend Fate | 2 copies | — | the Omen loses all tension (cut to 1) |
| Vigil Angel | 2/3 | — | an early Angel decides games: cast in rounds 1–2, it wins 65% of them |

### 16.2 Decisions

1. **No Walker card.** Kael and his four states were the most fiddly decision of every turn. The player is an unnamed Walker.
2. **No Nemesis card.** No phases, flip or passive abilities to remember: the Nemesis is its Threat deck, and each one keeps its signature as one Threat (Inferno Charger, Brood, Uprising, Refraction Golem).
3. **No lands and no colours of mana.** Every card is a spell, paid from 3 mana per round. Costs run from 1 to 3; the former 4- and 5-cost cards cost 3 and were trimmed so none decides a game alone, and the 5-cost ones are still the best 3-cost card of their half.
4. **No Heroic mode.** Choosing the Nemesis is choosing the difficulty.
5. **No mulligan, no hand limit, no frozen state.** With fixed mana every hand is playable. Deep Freeze prevents a creature's damage for the turn instead of freezing it.
6. **The challenge moved into the Threats.** Without those rules the player won 98% of games, so Threat decks grew to 20 cards and every Nemesis creature gained 5 toughness and 1 to 3 power.
7. **Banish into Light** keeps the +1 life drawback and costs 2: cheap removal with a price, and a key anti-Morwen tool because the creature never reaches the Ruin.

Open questions: none.

## 17. Card lists

### 17.1 Dawnward Order / Orden del Alba (white) — symbol: rising sun

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Dawn Squire | Escudera del Alba | 1 | Creature — Human Soldier | 1/2 | **Vigilance** |
| 2 | 3–4 | Luminous Aegis | Égida Luminosa | 1 | Instant | — | Prevent all damage that would be dealt to a creature you control this turn. |
| 1 | 5 | Dawn Cleric | Clérigo del Alba | 2 | Creature — Human Cleric | 1/3 | **Lifelink** |
| 1 | 6 | Serene Judgment | Juicio Sereno | 2 | Aura | — | **Pacify**: tuck behind a Nemesis creature. It can't attack or block. |
| 1 | 7 | Prayer of Restoration | Plegaria de Restauración | 2 | Sorcery | — | Gain 3 life. You may put one of those cards into your hand instead of your library. |
| 1 | 8 | Sky Griffin | Grifo Celeste | 3 | Creature — Griffin | 2/2 | **Flying**, **Vigilance** |
| 1 | 9 | Sworn Paladin | Paladín Juramentado | 3 | Creature — Human Knight | 3/2 | **Vigilance** |
| 1 | 10 | Shield Formation | Formación de Escudos | 3 | Instant | — | Creatures you control get +1/+1 until end of turn. |
| 1 | 11 | Banish into Light | Exiliar en Luz | 2 | Instant | — | Put an attacking Nemesis creature face-down at the bottom of the Threat deck. (The Nemesis gains 1 life and that creature will return later.) |
| 1 | 12 | Vigil Angel | Ángel de la Vigilia | 3 | Creature — Angel | 2/3 | **Flying**, **Lifelink** |

### 17.2 Arcane Tide / Marea Arcana (blue) — symbol: waves

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Tide Apprentice | Aprendiz de las Mareas | 1 | Creature — Human Wizard | 1/1 | When Tide Apprentice enters, **Scry** 2. |
| 2 | 3–4 | Bend Fate | Desviar el Destino | 1 | Instant | — | You may put the Omen face-down at the bottom of the Threat deck; if you do, reveal a new Omen. **Scry** 1. |
| 1 | 5 | Mist Hawk | Halcón de Bruma | 2 | Creature — Bird | 2/1 | **Flying** |
| 1 | 6 | Deep Freeze | Congelar | 2 | Instant | — | Prevent all damage that would be dealt by a Nemesis creature this turn. |
| 1 | 7 | Return to the Tide | Devolver a la Marea | 2 | Instant | — | Put a Nemesis creature on top of the Threat deck as the new Omen. The old Omen goes face-down right behind it. |
| 1 | 8 | Watchful Siren | Sirena Vigía | 3 | Creature — Siren | 2/3 | **Flying** |
| 1 | 9 | Learned Archivist | Archivista Ilustrado | 3 | Creature — Human Wizard | 2/2 | {T}: **Scry** 1. |
| 1 | 10 | Arcane Study | Lectura Arcana | 3 | Sorcery | — | **Scry** 2, then draw 2 cards. |
| 1 | 11 | Cloud Djinn | Djinn de las Nubes | 3 | Creature — Djinn | 2/3 | **Flying**, **Vigilance** |
| 1 | 12 | Rising Tide | Marea Creciente | 3 | Sorcery | — | Put every Nemesis creature on top of the Threat deck in any order; the top one becomes the Omen. |

### 17.3 Grim Pact / Pacto Sombrío (black) — symbol: crescent moon

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Crypt Rat | Rata de Cripta | 1 | Creature — Rat | 1/1 | **Deathtouch** |
| 2 | 3–4 | Lethal Whisper | Susurro Letal | 1 | Instant | — | A Nemesis creature gets −2/−2 until end of turn. |
| 1 | 5 | Blood Acolyte | Acólito Sangriento | 2 | Creature — Human Cleric | 2/2 | When Blood Acolyte enters, you lose 1 life and it deals 1 damage to the Nemesis. |
| 1 | 6 | Forbidden Pact | Pacto Prohibido | 2 | Sorcery | — | Draw 2 cards. |
| 1 | 7 | Assassinate | Asesinar | 3 | Instant | — | Destroy a Nemesis creature. |
| 1 | 8 | Reanimate | Reanimar | 3 | Sorcery | — | Put a creature card from your graveyard onto the Table. |
| 1 | 9 | Hungry Ghoul | Necrófago Hambriento | 3 | Creature — Zombie | 3/2 | When Hungry Ghoul dies, return a card from your graveyard to your hand. |
| 1 | 10 | Drain Essence | Drenar Esencia | 3 | Sorcery | — | Drain Essence deals 2 damage to the Nemesis and you gain 2 life. |
| 1 | 11 | Night Specter | Espectro Nocturno | 3 | Creature — Specter | 2/2 | **Flying** |
| 1 | 12 | Crypt Lord | Señor de la Cripta | 3 | Creature — Vampire | 3/3 | When Crypt Lord enters, put a creature card with cost 2 or less from your graveyard onto the Table. |

### 17.4 Emberkin / Clan Ascua (red) — symbol: double axe

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Reckless Goblin | Trasgo Temerario | 1 | Creature — Goblin | 2/1 | **Haste** |
| 2 | 3–4 | Ember Bolt | Descarga de Ascuas | 1 | Instant | — | Ember Bolt deals 3 damage to a creature or to the Nemesis. |
| 1 | 5 | Cinder Hound | Sabueso de Ceniza | 2 | Creature — Hound | 2/2 | When Cinder Hound enters, it deals 1 damage to a creature. |
| 1 | 6 | Firebrand Raider | Saqueador Incendiario | 3 | Creature — Human Warrior | 3/2 | **Haste** |
| 1 | 7 | Battle Fury | Furia de Batalla | 1 | Instant | — | A creature gets +3/+0 until end of turn. |
| 1 | 8 | Molten Blade | Hoja Fundida | 2 | Aura | — | Tuck behind a creature you control. It gets +2/+0 and has **Trample**. |
| 1 | 9 | Kindle | Prender | 1 | Sorcery | — | Kindle deals 2 damage to a creature or to the Nemesis. |
| 1 | 10 | Volcanic Roar | Rugido Volcánico | 3 | Sorcery | — | Volcanic Roar deals 2 damage to each Nemesis creature. |
| 1 | 11 | Ashwing Drake | Draco Alaceniza | 3 | Creature — Drake | 2/3 | **Flying** |
| 1 | 12 | Pyre Titan | Titán de la Pira | 3 | Creature — Giant | 3/3 | **Trample**. When Pyre Titan enters, it deals 2 damage to the Nemesis. |

### 17.5 Wildwood / Monteverde (green) — symbol: leaf

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Thicket Bear | Oso de la Espesura | 2 | Creature — Bear | 2/2 | — |
| 2 | 3–4 | Surge of Vigor | Oleada de Vigor | 1 | Instant | — | A creature gets +3/+3 until end of turn. |
| 1 | 5 | Elvish Grovekeeper | Guardabosques Élfico | 1 | Creature — Elf Druid | 1/1 | {T}: Add one mana. |
| 1 | 6 | Wild Strength | Fuerza Salvaje | 2 | Aura | — | Tuck behind a creature you control. It gets +2/+2 and has **Trample**. |
| 1 | 7 | Spider of the Canopy | Araña del Dosel | 2 | Creature — Spider | 1/4 | **Reach** |
| 1 | 8 | Ironbark Wall | Muro de Corteza Férrea | 2 | Creature — Plant Wall | 0/5 | **Defender** |
| 1 | 9 | Bloom of Life | Floración Vital | 2 | Sorcery | — | Gain 4 life. |
| 1 | 10 | Mossback Boar | Jabalí Lomomusgo | 3 | Creature — Boar | 3/3 | **Trample** |
| 1 | 11 | Grovesinger Druid | Druida Cantoarboleda | 3 | Creature — Elf Druid | 2/3 | When Grovesinger Druid enters, gain 2 life. |
| 1 | 12 | Ancient Crashhorn | Cuernochoque Ancestral | 3 | Creature — Beast | 3/5 | **Trample** |

### 17.6 Vorthrax's Threat deck — symbol: dragon eye

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 3 | 1–3 | Ash Imp | Diablillo de Ceniza | Creature — Imp | 3/6 | **Flying** |
| 3 | 4–6 | Cinderclaw Brute | Bruto Garrascua | Creature — Demon | 6/7 | — |
| 1 | 7 | Magma Sentinel | Centinela de Magma | Creature — Elemental | 3/9 | **Defender** |
| 2 | 8–9 | Ember Wyrmling | Dragoncillo de Ascuas | Creature — Dragon | 5/7 | **Flying** |
| 2 | 10–11 | Scorch Fiend | Demonio Abrasador | Creature — Demon | 7/8 | **Trample** |
| 2 | 12–13 | Vorthrax's Herald | Heraldo de Vorthrax | Creature — Cultist | 6/8 | When it enters, it deals 1 damage to you. |
| 1 | 14 | Lava Behemoth | Behemot de Lava | Creature — Elemental | 7/10 | — |
| 1 | 15 | Inferno Charger | Corcel del Infierno | Creature — Elemental | 6/7 | **Haste** |
| 2 | 16–17 | Searing Breath | Aliento Abrasador | Spell | — | Deal 2 damage to your highest-power creature. If you have none, deal 2 damage to you. |
| 1 | 18 | Rain of Cinders | Lluvia de Pavesas | Spell | — | Deal 1 damage to each of your creatures and 1 damage to you. |
| 1 | 19 | Tyrant's Roar | Rugido del Tirano | Spell | — | Nemesis creatures get +1/+0 until end of turn. |
| 1 | 20 | Cinder Rebirth | Renacer de Ceniza | Spell | — | Return the highest-power creature from the Ruin to the Table. If there is none, deal 2 damage to you. |

### 17.7 Vaskara's Threat deck — symbol: honeycomb

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 3 | 1–3 | Ravenous Larva | Larva Voraz | Creature — Insect | 3/6 | **Lifelink** |
| 4 | 4–7 | Armored Drone | Zángano Acorazado | Creature — Insect | 4/7 | — |
| 3 | 8–10 | Darting Wasp | Avispa Lanzadera | Creature — Insect | 4/6 | **Flying** |
| 2 | 11–12 | Shieldbreaker Beetle | Escarabajo Rompeescudos | Creature — Insect | 4/8 | **Trample** |
| 2 | 13–14 | Mantis Queen | Mantis Reina | Creature — Insect | 5/9 | When it enters, other Nemesis creatures get +1/+0 until end of turn. |
| 2 | 15–16 | Pheromones | Feromonas | Spell | — | Nemesis creatures get +1/+1 until end of turn. |
| 2 | 17–18 | Egg Laying | Puesta de Huevos | Spell | — | Reveal the next face-down card. If it is a creature, execute it. Otherwise put it face-down at the bottom. |
| 1 | 19 | Insect Plague | Plaga de Insectos | Spell | — | Deal 1 damage to each of your creatures. |
| 1 | 20 | Brood | Nidada | Spell | — | Reveal the next 2 face-down cards. Execute the creatures and put the rest face-down at the bottom. |

### 17.8 Morwen's Threat deck — symbol: crown

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 4 | 1–4 | Wandering Skeleton | Esqueleto Errante | Creature — Skeleton | 3/6 | When it dies, put it face-down at the bottom of the Threat deck (Morwen gains 1 life). |
| 1 | 5 | Rotting Zombie | Zombi Putrefacto | Creature — Zombie | 3/8 | — |
| 3 | 6–8 | Vampire Bat | Murciélago Vampiro | Creature — Bat | 3/7 | **Flying**, **Lifelink** |
| 2 | 9–10 | Morwen's Ghoul | Necrófago de Morwen | Creature — Zombie | 4/7 | **Deathtouch** |
| 2 | 11–12 | Deathless Knight | Caballero Sin Muerte | Creature — Zombie Knight | 5/9 | **Lifelink** |
| 2 | 13–14 | Crypt Horror | Horror de la Cripta | Creature — Horror | 6/9 | **Lifelink**. When it enters, you lose 1 life. |
| 2 | 15–16 | Withering Touch | Toque Marchito | Spell | — | Your highest-power creature gets −2/−2 until end of turn. If you have none, you lose 2 life. |
| 1 | 17 | Exhume | Exhumar | Spell | — | Return the highest-power creature from the Ruin to the Table. If there is none, you lose 2 life. |
| 1 | 18 | Soul Drain | Drenar Alma | Spell | — | You lose 2 life. Return 2 Ruin cards face-down to the bottom of the Threat deck. |
| 1 | 19 | Plague | Plaga | Spell | — | All creatures (both sides) get −1/−1 until end of turn. |
| 1 | 20 | Uprising | Levantamiento | Spell | — | Return the 2 highest-power creatures from the Ruin to the Table. If there are none, you lose 2 life. |

### 17.9 The Mirror Archmage's Threat deck — symbol: wizard hat

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 3 | 1–3 | Fragile Illusion | Ilusión Frágil | Creature — Illusion | 5/6 | **Flying** |
| 3 | 4–6 | Water Elemental | Elemental de Agua | Creature — Elemental | 5/9 | — |
| 1 | 7 | Crystal Golem | Gólem de Cristal | Creature — Golem | 3/9 | **Defender** |
| 2 | 8–9 | Guardian Sphinx | Esfinge Guardiana | Creature — Sphinx | 5/8 | **Flying** |
| 2 | 10–11 | Mirror Djinn | Djinn del Espejo | Creature — Djinn | 6/7 | **Flying** |
| 2 | 12–13 | Tide Serpent | Serpiente de la Marea | Creature — Serpent | 6/10 | — |
| 1 | 14 | Refraction Golem | Gólem de Refracción | Creature — Golem | 3/9 | **Defender**. The first spell you cast each turn costs 1 more. |
| 2 | 15–16 | Counterspell | Contraconjuro | Spell | — | **Counter reminder**: the next spell you cast is countered. |
| 2 | 17–18 | Rebound | Rebote | Spell | — | Return your highest-power creature to your hand. If you have none, discard the leftmost card of your hand. |
| 1 | 19 | Mind Theft | Robo de Mente | Spell | — | Discard the leftmost card of your hand. If you can't, you lose 2 life. |
| 1 | 20 | Mass Illusion | Ilusión Masiva | Spell | — | Lower all your creatures. |

## 18. Quick reference

The reference card, in four halves:

| Your turn | Nemesis turn |
|---|---|
| 1. Untap: raise everything. Mana back to 3. | 1. Untap. |
| 2. Draw 1 (−1 life). Skip it on turn 1. | 2. Execute the Omen. |
| 3. Main: cast spells. | 3. Reveal a new Omen (−1 life). |
| 4. Combat. | 4. Attack: you block. |
| 5. Second main. | 5. End: damage wears off. |
| 6. End: damage wears off. | Instants any time, with the mana you kept. |

| Nemesis mind | In your hands |
|---|---|
| **Attack** with every able creature, unless you could block it, kill it and survive. | **Lowered** = tapped. |
| **Block:** safe block → trade → desperation (only if lethal). | **Damage N:** N library cards → graveyard. |
| **Target** your highest-power creature (then toughness, then leftmost). None → you. | **Gain N:** N graveyard cards → library bottom. |
| **Overflow:** a 5th creature hits you for its power instead. | **Hit the Nemesis N:** N cards behind the Omen → Ruin. |
| | **Sideways Threat** = Counterspell waiting. |

Win and lose:

1. The Nemesis has 0 face-down Threat cards → **you win**.
2. Your library has 0 cards → **you lose**.
