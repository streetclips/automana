# Palmwalker — Rulebook

A solo dueling card game you hold in your hands.

No table. No tokens. No opponent across the board. Just your hands, your spells, and a Nemesis that wants your library to burn.

| Players | Time | Box | Cards in one game | Ages |
|---|---|---|---|---|
| 1 | 15–20 min | 126 cards | 41 | 12+ |

This document is the game design reference. Card data (costs, texts in English and Spanish) lives in `src/content/`; if a card text here and in `src/content/` disagree, `src/content/` wins.

## 1. Welcome, Walker

Palmwalker takes the heart of a classic dueling card game (lands, creatures, instants, combat, a planeswalker at your side) and folds it into something you can play standing on a train. Everything happens in your two hands.

You are **Kael**, a wandering pyromancer. Each turn you draw, play a land, cast creatures and spells, and attack. Your foe is a **Nemesis**: an automated boss with its own deck of Threats. It summons creatures, casts spells, attacks and blocks following a few fixed rules, so you never make decisions for it.

Three ideas make it fit in your hands:

1. **Your library is your life.** You start with 20 cards in your library: that is 20 life. Damage throws cards from your library into your graveyard.
2. **Every card is also a land.** The back of each Grimoire card is a land of its colour. Each turn you choose: cast it, or turn it into mana.
3. **Position is state.** Cards are tapped by lowering them in the fan. Zones are parts of a packet, not places on a table.

Inspired by the in-hand tradition on BoardGameGeek:

1. **Palm Island**: 4-state cards, sideways resources.
2. **Handy Brawl**: an enemy that acts on its own, damage as card state.
3. **Maiden's Quest**: in-hand deckbuilding.
4. **Galdor's Grip** and **Loot the Loop**: order and orientation as game state.
5. **The Hand of Destiny**: hero vs. waves and a boss.

## 2. Components (126 cards)

| Qty | Component | What it does |
|---|---|---|
| 12 | **Dawnward Order** half-grimoire (white) | Durable defence, life as recovery. Back: **Plains** {W}. |
| 12 | **Arcane Tide** half-grimoire (blue) | Control the future: Scry, bend the Omen, Freeze, bounce. Back: **Island** {U}. |
| 12 | **Grim Pact** half-grimoire (black) | Pay life for power: Deathtouch, extra draws, Reanimate. Back: **Swamp** {B}. |
| 12 | **Emberkin** half-grimoire (red) | Speed and burn: Haste, direct damage. Back: **Mountain** {R}. |
| 12 | **Wildwood** half-grimoire (green) | Big bodies: Trample, pump, a mana creature. Back: **Forest** {G}. |
| 1 | **Kael**, Wandering Pyromancer | Your Walker, for every colour pair. A 4-state card that tracks loyalty by rotating and flipping. |
| 4 | **Nemesis** cards | Vorthrax, Vaskara, Morwen and the Mirror Archmage. Face A = Phase 1, Face B = Phase 2. Rotate for Heroic. |
| 4 × 15 | **Threat** decks | One per Nemesis: its creatures and spells. It is also the Nemesis's life. |
| 1 | Quick reference card | Turn order, the Nemesis mind and the physical moves. |

A single game uses 41 cards: 24 Grimoire cards (two halves) + 15 Threats + Kael + one Nemesis.

Replay space: 10 colour pairs × 4 Nemeses × Normal/Heroic = 80 configurations.

**Half-grimoires.** Each colour is a 12-card half. Shuffle any two halves together and you have a 24-card Grimoire.

**Threat cards have a plain back.** Face-down Threats are the Nemesis's life; face-up ones are the **Omen** (front) and the **Ruin** (back).

## 3. Anatomy of a card

Cards are read in a **fan**. When cards overlap, only their left edge shows, like the corner index of a deck of playing cards. That is why every card carries its key information in the **index strip** down its left side.

```
┌───┬──────────────────────┐
│ ● │ [ Cinder Hound     ] │  1. Cost: ● = coloured mana; number = generic mana. {1}{R} = cost 2.
│ 1 │ ┌──────────────────┐ │     The frame has the card's colour; Threats have a dark strip.
│ ⚔ │ │                  │ │  2. Type glyph: ⚔ creature, ϟ instant, ✶ sorcery,
│   │ │      (art)       │ │     ◈ aura, ▲ land, ✹ Threat.
│   │ │                  │ │  3. Power/Toughness at the foot of the strip.
│   │ └──────────────────┘ │  4. Name bar, above the art.
│   │ [ Creature — Hound ] │  5. Type line, below the art.
│   │ ┌──────────────────┐ │  6. Rules text; italic text is flavour.
│   │ │ Rules text       │ │  7. Collection symbol and number: ◆ = Emberkin,
│   │ │ Flavour (italic) │ │     card 5 of its 12.
│   │ │           ◆ 5/12 │ │
│2/2│ └──────────────────┘ │
└───┴──────────────────────┘
```

**Collection and number.** Every Grimoire and Threat card shows, at the bottom right of its text box, the symbol of its half-grimoire or Threat deck and its number in it. Copies of a card have consecutive numbers: the two Reckless Goblins are 1/12 and 2/12. After a game, sort the cards by symbol and lay each pile out by number: a gap is a missing card, and the card lists in section 18 name it. Each Nemesis card shows the symbol of its Threat deck next to its face label; Kael and the quick reference have none.

**Double-faced: spell or land?** Once per turn you may flip a card from your hand to its land side and play it. A land is permanent; the spell on its front is gone for good. Choosing which cards to sacrifice as lands is the first decision of every turn.

**Mana.** Each land produces one mana of its colour: Plains {W}, Island {U}, Swamp {B}, Mountain {R}, Forest {G}. To use it, **lower** the land (tap it). Lands rise again at the start of your turn, so mana spent on your turn is not available during the Nemesis turn.

## 4. Card types

| Type | Rule |
|---|---|
| **Creature** | Stays on the Table. Attacks and blocks. |
| **Instant** | Cast it any time, even on the Nemesis turn. |
| **Sorcery** | Only in your main phase. |
| **Aura** | Tuck it behind a creature. Most Auras go behind your own creatures; **Pacify** Auras go behind a Nemesis creature. An Aura goes to your graveyard when its creature leaves the Table. |
| **Land** | The back of every Grimoire card. |
| **Threat** | Nemesis cards: creatures or spells. They have no cost. |

Creature rules:

1. **Summoning sickness:** a creature can't attack or use {T} abilities on the turn it enters, unless it has Haste. It **can** block.
2. **Damage wears off** at the end of every turn. A creature dies only if it takes damage ≥ toughness in a single turn.
3. **Limit:** 4 creatures per side, 5 lands.

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
| Freeze / Congelar | Lower a Nemesis creature and turn it upside down. At its next untap it turns upright instead of rising. | Upside-down = frozen for one extra turn. |
| Counter reminder / Recordatorio de contraconjuro | A Nemesis Counterspell stays in the Table fan, turned sideways, until it counters your next spell. Then it goes face-down to the bottom of the Threat deck. | Sideways card = pending effect. |
| Nemesis lifelink | When a Nemesis creature with Lifelink deals damage, return that many cards from the Ruin face-down to the bottom of the Threat deck. | Symmetric with yours. |

## 6. Kael, your Walker

Kael stands at the right end of your fan. His card has **four states**, one on each half of each face, Palm Island style. The state that reads upright, facing you, is the active one. Each state lists the abilities you can use from it.

```
I ──rotate 180°──▶ II ──flip over──▶ III ──rotate 180°──▶ IV
```

| State | Abilities |
|---|---|
| I (Face A, upright) | Charge |
| II (Face A, upside-down) | Charge |
| III (Face B, upright) | Charge, Discharge |
| IV (Face B, upside-down) | Discharge, Ultimate |

| Ability | Effect |
|---|---|
| **Charge** (+1 state) | A creature you control gets +1/+0 until end of turn. |
| **Discharge** (−2 states) | Kael deals 2 damage to a creature. |
| **Ultimate** (go to I) | Kael deals 3 damage to the Nemesis. Your creatures get +1/+0 until end of turn. |

Using Kael:

1. Once per turn, during one of **your main phases**, use one ability available in Kael's current state.
2. **Charge** moves Kael 1 state forward (max IV). You may charge even if there is no creature to pump.
3. **Discharge** moves Kael 2 states back (from III or IV).
4. **Ultimate** needs state IV and returns Kael to I.
5. Kael can't be attacked.

**The Walker's dilemma.** Charging is small but builds toward the Ultimate. Discharging removes a blocker now. Sitting at IV and waiting for the right moment (for example, until Vorthrax loses its Ash Hide) can be the strongest play in the game.

## 7. The Nemesis

The Nemesis is your opponent. Its card sits at the left of your fan; its **Threat deck** sits behind it. It has no hand and no mana: each turn it executes the face-up card on top of its deck, the **Omen**.

The Threat deck is its life:

1. **Face-down** Threat cards = the Nemesis's life. At 0, you win.
2. The **Omen** is face-up on top. It shows what the Nemesis does next turn. It does not count as life.
3. The **Ruin** is face-up at the back: dead Threat creatures and cards destroyed by damage.
4. **Damage to the Nemesis:** for each point, move the face-down card right behind the Omen to the Ruin.

Phases:

1. Every Nemesis starts on Face A, **Phase 1**, with 15 Threat cards: 14 life after the first Omen is revealed.
2. The moment the Threat deck has **7 or fewer** face-down cards, flip the Nemesis to Face B, **Phase 2**, even in the middle of your turn. Resolve its flip effect immediately.
3. Phase 2 replaces the Phase 1 abilities, unless Face B says they stay active.
4. **Heroic:** rotate the Nemesis 180° during setup. Its Heroic half adds: Nemesis creatures get +1/+0.

All Nemeses share the same attack, block and target rules (section 12).

## 8. The four Nemeses

| Nemesis (EN / ES) | Colour | Archetype | Difficulty |
|---|---|---|---|
| Vorthrax, the Ash Tyrant / Vorthrax, el Tirano de Ceniza | Red | Aggro: haste and burn | ★★ |
| Vaskara, the Brood Mother / Vaskara, la Madre Enjambre | Green | Swarm: many bodies per turn | ★★ |
| Morwen, the Lich Queen / Morwen, la Reina Liche | Black | Attrition: dead things return | ★★★ |
| The Mirror Archmage / El Archimago Espejo | Blue | Control: taxes and counters | ★★★ |

### 8.1 Vorthrax, the Ash Tyrant (red, aggro)

1. **Phase 1 — ASH HIDE:** prevent the first 2 damage dealt to Vorthrax each turn. **SMOLDER:** at the end of each Nemesis turn, Vorthrax deals 1 damage to you.
2. **Flip — REKINDLE:** return the 3 rearmost Ruin cards face-down to the bottom. A second health bar.
3. **Phase 2 — INFERNO:** Nemesis creatures have Haste. At the end of each Nemesis turn, Vorthrax deals 2 damage to you. Ash Hide is gone.
4. **Tension:** Phase 1 is armoured and patient; Phase 2 loses the armour but its burn doubles. Burst through the armour, then survive the fury.

### 8.2 Vaskara, the Brood Mother (green, swarm)

1. **Phase 1 — BROOD:** at the end of each Nemesis turn, if Vaskara has 2 or fewer creatures, she also executes the new Omen and reveals another.
2. **Flip — HATCHING:** execute the Omen immediately and reveal another.
3. **Phase 2 — FRENZY:** Nemesis creatures get +1/+0 and have Trample. Brood stays active.
4. **Tension:** she floods the Table fast (Overflow damage matters), but every extra reveal costs her life. Sweepers and big blockers shine.

### 8.3 Morwen, the Lich Queen (black, attrition)

1. **Phase 1 — GRAVE TITHE:** at the end of each Nemesis turn, if the Ruin holds 3 or more creatures, return the highest-power one to the Table.
2. **Flip — UPRISING:** return the 2 highest-power creatures from the Ruin to the Table.
3. **Phase 2 — WITHERING:** your creatures get −1/−1.
4. **Tension:** killing her creatures feeds her. Pacify, Freeze and bounce lock them away without sending them to the Ruin; direct damage to Morwen wins the race.

### 8.4 The Mirror Archmage (blue, control)

1. **Phase 1 — REFRACTION:** the first spell you cast each turn costs {1} more. **MIND TIDE:** at the end of each Nemesis turn, if you have 3 or more cards in hand, discard the leftmost one.
2. **Flip — REFLECTION:** return your highest-power creature to your hand, then return the 2 rearmost Ruin cards face-down to the bottom.
3. **Phase 2 — MIRROR WARD:** the first spell you cast each turn is countered unless you pay {2}. Mind Tide now triggers at 2 or more cards in hand.
4. **Tension:** cheap creatures and lands-as-bluff beat him. Holding a full hand is punished.

## 9. Holding the game

```
LEFT HAND — THE TABLE (one fan, left → right)
┌────────────┬─────────┬───────────────────┬────────────────────┬──────────────────────┐
│Threat deck │ Nemesis │ Nemesis creatures │ Your creatures     │ Kael, with your lands│
│Omen on top │         │                   │ (Auras behind them)│ tucked behind him    │
└────────────┴─────────┴───────────────────┴────────────────────┴──────────────────────┘

RIGHT HAND — THE GRIMOIRE (one packet, front → back)
┌──────────────────────┐   ┌─────────────────────┐   ┌──────────────────────┐
│ HAND                 │ › │ LIBRARY = LIFE      │ › │ GRAVEYARD            │
│ spell side · fanned  │   │ land side · squared │   │ spell side · at back │
└──────────────────────┘   └─────────────────────┘   └──────────────────────┘
```

1. Only the left strip of each Table card shows: that is exactly where the index sits.
2. Lands tucked behind Kael show only their top strip.
3. The library shows its land side; hand and graveyard show the spell side, so the boundaries between zones are always visible, even when the packet is squared. (Yes, you can see the colour of your next draw. That's a feature.)

**Up and lowered.** Raised (aligned with the fan) = untapped. Lowered (slid down about 2 cm) = tapped. A lowered land disappears behind Kael, so the mana symbols you can see are exactly the mana you have left. The classic 90° turn also works for small fans; lowering is easier to hold.

**Other orientations.** Upside-down Nemesis creature = frozen. Sideways Threat card = pending Counterspell.

## 10. Life, zones and physical moves

You begin with **20 cards in your library = 20 life**. Drawing a card spends 1 life. Damage mills cards into your graveyard. Gaining life brings cards back from the graveyard. **When your library reaches 0, you lose.** The Nemesis works the same way: its face-down Threat cards are its life. **When it reaches 0, you win.**

| When you… | Do this with your hands |
|---|---|
| **Draw** | Take the front card of your library, flip it to the spell side, add it to your hand fan. (−1 life) |
| **Take N damage** | N times: take the front library card, flip it to the spell side, slide it to the very back (graveyard). |
| **Lose N life** | Same as taking N damage. |
| **Gain N life** | N times: take the rearmost graveyard card, flip it to the land side, slide it between library and graveyard. (Up to the size of your graveyard.) |
| **Scry N** | Look at the spell side of the front N library cards; slide any of them to the library bottom, in any order. |
| **Play a land** | Flip a hand card to its land side and tuck it behind Kael, top strip sticking up. Max 1 per turn. |
| **Cast a spell** | Lower lands for the cost. Creature → into the Table fan, left of Kael. Instant/sorcery → resolve, then to your graveyard. |
| **A creature dies** | Yours → back of your graveyard. The Nemesis's → back of the Threat deck (Ruin). |
| **Deal N damage to the Nemesis** | N times: take the face-down card right behind the Omen, flip it face-up, slide it into the Ruin. |
| **The Nemesis gains N life** | N times: take the rearmost Ruin card, turn it face-down, put it at the bottom of the Threat deck (in front of the Ruin). |
| **The Nemesis casts a spell** | Resolve it, then put it face-down at the bottom of the Threat deck (in front of the Ruin). It will come back. |
| **Discard** | Put the card at the back of your graveyard. This is not damage. |

**Why library = life?** Damage is never just a number: every point costs you a real card you might have drawn. Healing recovers spent spells. And because drawing costs life, waiting is never free: the duel always moves forward.

**Counting.** Life is a count of cards. Count your library whenever you need to; with 20 cards or fewer it takes seconds. Advanced players track it in their head: −1 per draw, −N per hit.

**Black fills its own graveyard.** Every damage point mills you, so Reanimate and Crypt Lord always have targets. Reanimate + Ancient Crashhorn (B/G) and Reanimate + Pyre Titan (B/R) are the intended combo payoffs.

## 11. Setup (about one minute)

1. **Build your Grimoire.** Pick any two of the five half-grimoires and shuffle the 24 cards together. Hold them land side facing you.
2. **Draw your opening hand.** Draw 4 cards. Your library now has 20 cards: **you have 20 life.**
3. **Mulligan (optional, once).** Shuffle your hand back, draw 4 new cards, then put 1 of them into your graveyard. Your life stays 20.
4. **Kael.** Place Kael at state **I** (Face A, upright). He starts your Table fan.
5. **The Nemesis.** Choose a Nemesis and place it on Face A (Phase 1) at the left of the fan. Upright = Normal; rotated 180° = Heroic.
6. **The Threat deck.** Shuffle its 15 Threat cards face-down, put them behind the Nemesis, and turn the top card face-up: that is the first **Omen**. The Nemesis has **14 life**.
7. **Begin.** You take the first turn and skip your draw on that turn.

**A typical opening hand.** Four cards, and four potential lands. With Reckless Goblin, Thicket Bear, Surge of Vigor and Ancient Crashhorn, only the Goblin is red, so turning it into a Mountain would mean losing your only one-drop. Decisions start before turn one.

## 12. Turn structure

### 12.1 Your turn

1. **Untap.** Raise all your lowered creatures and lands.
2. **Draw.** Draw 1 card (−1 life). Skip it on turn 1.
3. **Main phase.** Play up to 1 land. Cast creatures, sorceries, Auras and instants. Use Kael once.
4. **Combat.** Attack with any untapped creatures without summoning sickness. The Nemesis blocks by its rules.
5. **Second main.** Same as step 3 (if you didn't play a land or use Kael yet, you still can).
6. **End.** Discard down to 5 cards. Damage on creatures wears off.

### 12.2 Nemesis turn

1. **Untap.** Raise all Nemesis creatures. Frozen creatures turn upright instead and stay lowered.
2. **Execute the Omen.** A creature enters the Table (summoning sick unless it has Haste). A spell resolves and goes face-down to the bottom.
3. **Reveal a new Omen.** Turn the next face-down card face-up (−1 Nemesis life). Now you know next turn's threat.
4. **Attack.** Its creatures attack by the Nemesis rules. You block and may cast instants.
5. **End.** Resolve the end-of-turn abilities on the Nemesis card. Damage wears off.

**Instants and responses.** You may cast instants at any moment, including during the Nemesis turn. When the Nemesis executes a spell, its target is chosen first; then you may respond before it resolves. The Nemesis never responds to you.

**Overflow.** If the Omen is a creature but the Nemesis already has 4 creatures, the new creature instead deals damage equal to its power to you, then goes face-down to the bottom of the Threat deck.

## 13. Combat and the Nemesis mind

### 13.1 How combat works

1. **Attack:** the attacker lowers its attacking creatures (not those with Vigilance). Lowered creatures stay lowered until their controller's next untap, so **creatures that attack can't block on the next turn**.
2. **Block:** each untapped defender may block one attacker. Each attacker can be blocked by at most one creature.
3. **Tricks:** after blocks, you may cast instants.
4. **Damage:** all at once. Each creature deals damage equal to its power. Unblocked attackers hit the player or Nemesis. Trample spills the excess.
5. **Deaths:** creatures with damage ≥ toughness die.

**Targets.** Nemesis effects that hit "your creature" choose your creature with the **highest power**; ties go to the highest toughness, then the leftmost. If you have no creature, the effect says what happens instead (usually damage to you).

### 13.2 The Nemesis attacks…

Each untapped Nemesis creature without Defender, without Pacify and without summoning sickness **attacks**, unless you have an untapped creature that could block it, **kill it and survive**.

### 13.3 The Nemesis blocks… (in this order)

1. **Safe block.** Each untapped Nemesis creature that can block an attacker, kill it and survive, does so, choosing the highest-power such attacker.
2. **Trade.** Each remaining blocker blocks the highest-power attacker it can kill, even if it dies.
3. **Desperation.** If unblocked damage would reduce the Nemesis to 0, every remaining blocker blocks the highest-power unblocked attacker.
4. **Ties:** the leftmost Nemesis creature chooses first.

**Reading the Nemesis.** Because these rules are fixed, you can predict every block. The skill is in shaping the combat: pump after blocks, kill the only safe blocker first, or attack with exactly the creature it can't handle.

**Example: a safe block, then a trick.** You attack with Cinder Hound (2/2) and Firebrand Raider (3/2). Vorthrax's Scorch Fiend (4/3) can kill the Hound and survive (2 < 3), but not the Raider (3 ≥ 3): **safe block on the Hound**. You answer with Battle Fury: the Hound becomes 5/2 and takes the Fiend with it.

## 14. Example game: Emberkin + Wildwood vs. Vorthrax

Opening hand: **Reckless Goblin, Thicket Bear, Surge of Vigor, Ancient Crashhorn**. First Omen: **Cinderclaw Brute**. You: 20 life · Vorthrax: 14 life.

### Round 1

**You.**

1. No draw on the first turn.
2. Land: flip **Ancient Crashhorn** to its Forest side and tuck it behind Kael.
3. Nothing to cast: the Goblin needs {R} and the Bear needs two mana.
4. Kael: **Charge** (I → II). No creature to pump, but loyalty grows.

> Why? A 5-mana creature in a deck with at most 5 lands is a dream for later. Lands now win games, and the Goblin and Bear are cheap.

**Vorthrax.**

1. Executes the Omen: **Cinderclaw Brute** (3/2) enters, summoning sick.
2. Reveals the new Omen: **Ash Imp**. Vorthrax 14 → 13.
3. No attack. **Smolder**: 1 damage, Ember Bolt is milled. You 20 → 19.

*End of round 1: You 19 · Vorthrax 13 · Kael II · Omen: Ash Imp (1/1 Flying).*

### Round 2

**You.**

1. Draw **Cinder Hound** (19 → 18).
2. The Omen warns that an Ash Imp (1/1 flyer) is coming. The Hound's 1 damage on entry will kill it, so you **hold the Hound**.
3. Land: Reckless Goblin → Mountain. Cast **Thicket Bear** {1}{G}.
4. Kael: Charge (II → III).

> Why? Reading the Omen one turn ahead tells you which card to keep. Holding the Hound turns it into a two-for-one next turn.

**Vorthrax.**

1. Executes **Ash Imp** (sick). New Omen: **Searing Breath**. 13 → 12.
2. Attack check: could your Bear block the Brute, kill it *and survive*? It kills it but dies → **the Brute attacks**.
3. You block with the Bear. Both die: Bear → your graveyard, Brute → Ruin.
4. Smolder: you mill Reckless Goblin. 18 → 17.

> Why? Your lands are still lowered from casting the Bear, so Surge of Vigor isn't castable. A 2-mana Bear for a 3-power Brute is a fine trade.

*End of round 2: You 17 · Vorthrax 12 · Kael III · Omen: Searing Breath.*

### Round 3

**You.**

1. Draw **Wild Strength** (17 → 16). Land: Wild Strength → Forest (3 lands).
2. Cast **Cinder Hound** {1}{R}: its entry ping kills the Ash Imp → Ruin.
3. Kael: Charge (III → IV).
4. Leave **one Forest raised**: Searing Breath is coming, and you hold Surge of Vigor.

> Why? Leaving mana up on purpose is the heart of instant-speed play. The Omen makes it a calculated choice, not a guess.

**Vorthrax.**

1. Executes **Searing Breath**: target = your highest-power creature, the Hound.
2. You respond: **Surge of Vigor** {G}. The Hound becomes 5/5 and shrugs off 2 damage.
3. Searing Breath goes face-down to the bottom of the Threat deck: 12 → 13. New Omen: **Scorch Fiend**: 13 → 12.
4. No attackers. Smolder: you mill Thicket Bear. 16 → 15.

*End of round 3: You 15 · Vorthrax 12 · Kael IV · Omen: Scorch Fiend (4/3 Trample).*

### Round 4

**You.**

1. Draw **Firebrand Raider** (15 → 14). It is your only card, so no land this turn.
2. Cast the Raider {2}{R} (3/2 Haste).
3. Attack with Hound and Raider. No blockers: 5 damage, **Ash Hide** prevents 2 → 3 damage.
4. Magma Sentinel, Vorthrax's Herald and Rain of Cinders go to the Ruin. 12 → 9.
5. Kael stays at IV: an Ultimate now would lose 2 of its 3 damage to Ash Hide.

> Why? Ash Hide absorbs only the first 2 damage each turn. Hit it with everything at once, and save the Ultimate for when the armour is gone.

**Vorthrax.**

1. Executes **Scorch Fiend** (4/3 Trample), summoning sick. New Omen: **Ember Wyrmling**. 9 → 8.
2. No attackers. Smolder: you mill Mossback Boar. 14 → 13.

*End of round 4: You 13 · Vorthrax 8 · Kael IV · Omen: Ember Wyrmling (2/2 Flying).*

### Round 5

**You.**

1. Draw **Battle Fury** (13 → 12). Attack with Hound (2/2) and Raider (3/2).
2. Nemesis block, step 1 (safe block): Scorch Fiend can kill the Hound and survive, but not the Raider → **it blocks the Hound**.
3. After blocks: **Battle Fury** {R} on the Hound → 5/2. Hound and Fiend kill each other.
4. The Raider is unblocked: 3 damage − 2 (Ash Hide) = 1. Cinderclaw Brute is milled. 8 → 7.
5. **Phase 2!** Vorthrax flips. **Rekindle** returns the 3 rearmost Ruin cards (Cinderclaw Brute, Scorch Fiend, Rain of Cinders) face-down: 7 → 10. Ash Hide is gone.
6. Second main phase: Kael **Ultimate** (IV → I), 3 full damage. 10 → 7.

> Why? Patience at IV paid off: the Ultimate landed the very turn the armour broke. All 3 damage counted.

**Vorthrax (Phase 2).**

1. Executes **Ember Wyrmling** (2/2 Flying). Inferno gives it Haste. New Omen: **Magma Sentinel**. 7 → 6.
2. Your Raider is lowered from attacking: nothing can block. The Wyrmling hits for 2: Bloom of Life and Ashwing Drake are milled. 12 → 10.
3. **Inferno**: 2 more damage, Kindle and Grovesinger Druid milled. 10 → 8.

> Why? Phase 2 costs you 3–4 life per round. Damage also burned a Bloom of Life you'd have loved to draw. The race is on.

*End of round 5: You 8 · Vorthrax 6 · Kael I · Omen: Magma Sentinel (1/4 Defender).*

### Round 6

**You.**

1. Draw **Spider of the Canopy** (8 → 7). Cast it {1}{G}: a 1/4 with Reach to stop the Wyrmling.
2. Kael: Charge (I → II): Raider +1/+0 → 4/2.
3. Attack with the Raider. The Wyrmling is lowered (it attacked), so there are no blockers: 4 damage. 6 → 2.

**Vorthrax.**

1. Executes **Magma Sentinel** (1/4 Defender). New Omen: **Scorch Fiend**, the one Rekindle brought back. 2 → 1.
2. Attack check for the Wyrmling: your Spider would survive but can't kill it → **the Wyrmling attacks**. You block with the Spider: nobody dies.
3. Inferno: Volcanic Roar and Pyre Titan milled. 7 → 5.

> Why? Next turn a hasty Scorch Fiend (4 trample) plus Inferno (2) means 6 damage. After your draw you'll have 4 life. This is your last turn.

*End of round 6: You 5 · Vorthrax 1 · Kael II · Omen: Scorch Fiend.*

### Round 7

**You.**

1. Draw **Elvish Grovekeeper** (5 → 4). Attack with the Raider (3/2) and the Spider (1/4).
2. Nemesis blocks: step 1, the Sentinel can't kill either. Step 2, no trade possible. Step 3, **desperation**: 4 unblocked damage would finish Vorthrax, so the Sentinel blocks the highest-power attacker, the Raider.
3. The Spider is unblocked: 1 damage. Rain of Cinders, Vorthrax's last face-down card, goes to the Ruin. 1 → 0.
4. **Victory**, with 4 cards left in your library.

**Debrief: five decisions that won the duel.**

1. **Crashhorn as a land** on turn 1: tempo over a dream card.
2. **Holding the Hound** for the Ash Imp the Omen announced.
3. **Leaving one Forest up** to save the Hound from Searing Breath.
4. **Waiting at IV** until Ash Hide broke, then a full-damage Ultimate.
5. **The Spider**: a blocker on their turn, the finishing blow on yours.

## 15. Modes

1. **Heroic.** Rotate the Nemesis card 180° during setup. Its Heroic half adds: Nemesis creatures get +1/+0. Every safe block suddenly becomes a trade.
2. **Solo puzzle.** Set the first 6 Threat cards in a known order and try to win in as few turns as possible. Share your record.
3. **The Gauntlet (campaign).**
   1. Face three Nemeses in a row with the same Grimoire.
   2. After each victory, look at 3 random cards from a half-grimoire you aren't using and swap one of them into your Grimoire.
   3. Your life resets between duels. Lose once and the Gauntlet ends.

## 16. Matchups and colour pairs

| Nemesis | What beats it | Recommended pairs |
|---|---|---|
| Vorthrax | Lifelink and sturdy blockers survive the burn race | W/G, W/R |
| Vaskara | Sweepers (Volcanic Roar, Shield Formation for trades) and big trample | R/G, R/W |
| Morwen | Lock instead of kill (Pacify, Freeze, bounce) plus direct damage | W/U, U/R |
| Mirror Archmage | Cheap threats, many 1-drops, few big spells | W/B, R/B |

Five showcase pairs:

1. **R/G — Brute force:** haste, pump, trample.
2. **W/B — Life as a resource:** lifelink refills what black's pacts spend.
3. **U/R — Arcane tempo:** flyers, burn, and Bend Fate to dodge the worst Omens.
4. **B/G — Cycle of life:** damage fills your graveyard, Reanimate brings back Crashhorn.
5. **W/U — Control fate:** Pacify, Freeze, and flyers that never need to trade.

## 17. Designer notes

### 17.1 Tuning knobs for playtesting

| Knob | Default | Turn it up if… | Turn it down if… |
|---|---|---|---|
| Threat deck size | 15 (14 life) | you win before round 5 | you never reach Phase 2 |
| Opening hand | 4 | you often miss land drops | turns 1–2 feel scripted |
| Ash Hide (Vorthrax) | 2 per turn | early aggro is too strong | Phase 1 feels like a wall |
| Smolder / Inferno (Vorthrax) | 1 / 2 | you win with 10+ life left | you lose before casting 4 spells |
| Rekindle (Vorthrax) | 3 cards | Phase 2 ends in one turn | Phase 2 drags on |
| Brood threshold (Vaskara) | 2 creatures | — | she self-mills to death before round 6 (then raise her Threat deck to 17) |
| Wandering Skeleton (Morwen) | 3 copies | — | killing them feels pointless (cut to 2) |
| Mirror Ward (Archmage) | {2} | — | blue or green decks can't function in Phase 2 (drop to {1}) |
| Bend Fate | 2 copies | — | the Omen loses all tension (cut to 1) |
| Reanimate targets | any creature | — | B/G turn-3 Crashhorn is routine (restrict to cost 4 or less) |

### 17.2 Decisions

1. Kael is the only Walker, for every colour pair. Colour-specific Walkers are out of scope.
2. Banish into Light keeps the +1 life drawback and costs {1}{W}. At {2}{W} it was strictly worse than Assassinate; now it is cheap removal with a price, and the key anti-Morwen tool because the creature never reaches the Ruin.
3. Morwen's Grave Tithe ends in Phase 2. Phase 1 punishes you for killing her creatures, Phase 2 (Withering) for having creatures; Uprising already gives the undead burst at the flip. Keeping Grave Tithe active would push her well past ★★★.

Open questions: none.

## 18. Card lists

### 18.1 Dawnward Order / Orden del Alba (white) — back: Plains / Llanura — symbol: rising sun

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Dawn Squire | Escudera del Alba | {W} | Creature — Human Soldier | 1/2 | **Vigilance** |
| 2 | 3–4 | Luminous Aegis | Égida Luminosa | {W} | Instant | — | Prevent all damage that would be dealt to a creature you control this turn. |
| 1 | 5 | Dawn Cleric | Clérigo del Alba | {1}{W} | Creature — Human Cleric | 1/3 | **Lifelink** |
| 1 | 6 | Serene Judgment | Juicio Sereno | {1}{W} | Aura | — | **Pacify**: tuck behind a Nemesis creature. It can't attack or block. |
| 1 | 7 | Prayer of Restoration | Plegaria de Restauración | {1}{W} | Sorcery | — | Gain 3 life. You may put one of those cards into your hand instead of your library. |
| 1 | 8 | Sky Griffin | Grifo Celeste | {2}{W} | Creature — Griffin | 2/2 | **Flying**, **Vigilance** |
| 1 | 9 | Sworn Paladin | Paladín Juramentado | {2}{W} | Creature — Human Knight | 3/2 | **Vigilance** |
| 1 | 10 | Shield Formation | Formación de Escudos | {2}{W} | Instant | — | Creatures you control get +1/+1 until end of turn. |
| 1 | 11 | Banish into Light | Exiliar en Luz | {1}{W} | Instant | — | Put an attacking Nemesis creature face-down at the bottom of the Threat deck. (The Nemesis gains 1 life and that creature will return later.) |
| 1 | 12 | Vigil Angel | Ángel de la Vigilia | {4}{W} | Creature — Angel | 4/4 | **Flying**, **Lifelink** |

### 18.2 Arcane Tide / Marea Arcana (blue) — back: Island / Isla — symbol: waves

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Tide Apprentice | Aprendiz de las Mareas | {U} | Creature — Human Wizard | 1/1 | When Tide Apprentice enters, **Scry** 2. |
| 2 | 3–4 | Bend Fate | Desviar el Destino | {U} | Instant | — | You may put the Omen face-down at the bottom of the Threat deck; if you do, reveal a new Omen. **Scry** 1. |
| 1 | 5 | Mist Hawk | Halcón de Bruma | {1}{U} | Creature — Bird | 2/1 | **Flying** |
| 1 | 6 | Deep Freeze | Congelar | {1}{U} | Instant | — | **Freeze** a Nemesis creature. |
| 1 | 7 | Return to the Tide | Devolver a la Marea | {1}{U} | Instant | — | Put a Nemesis creature on top of the Threat deck as the new Omen. The old Omen goes face-down right behind it. |
| 1 | 8 | Watchful Siren | Sirena Vigía | {2}{U} | Creature — Siren | 2/3 | **Flying** |
| 1 | 9 | Learned Archivist | Archivista Ilustrado | {2}{U} | Creature — Human Wizard | 2/2 | {T}: **Scry** 1. |
| 1 | 10 | Arcane Study | Lectura Arcana | {2}{U} | Sorcery | — | **Scry** 2, then draw 2 cards. |
| 1 | 11 | Cloud Djinn | Djinn de las Nubes | {3}{U} | Creature — Djinn | 4/3 | **Flying** |
| 1 | 12 | Rising Tide | Marea Creciente | {4}{U} | Sorcery | — | Put every Nemesis creature on top of the Threat deck in any order; the top one becomes the Omen. |

### 18.3 Grim Pact / Pacto Sombrío (black) — back: Swamp / Pantano — symbol: crescent moon

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Crypt Rat | Rata de Cripta | {B} | Creature — Rat | 1/1 | **Deathtouch** |
| 2 | 3–4 | Lethal Whisper | Susurro Letal | {B} | Instant | — | A Nemesis creature gets −2/−2 until end of turn. |
| 1 | 5 | Blood Acolyte | Acólito Sangriento | {1}{B} | Creature — Human Cleric | 2/2 | When Blood Acolyte enters, you lose 1 life and it deals 1 damage to the Nemesis. |
| 1 | 6 | Forbidden Pact | Pacto Prohibido | {1}{B} | Sorcery | — | Draw 2 cards. |
| 1 | 7 | Assassinate | Asesinar | {2}{B} | Instant | — | Destroy a Nemesis creature. |
| 1 | 8 | Reanimate | Reanimar | {2}{B} | Sorcery | — | Put a creature card from your graveyard onto the Table. |
| 1 | 9 | Hungry Ghoul | Necrófago Hambriento | {2}{B} | Creature — Zombie | 3/2 | When Hungry Ghoul dies, return a card from your graveyard to your hand. |
| 1 | 10 | Drain Essence | Drenar Esencia | {2}{B} | Sorcery | — | Drain Essence deals 2 damage to the Nemesis and you gain 2 life. |
| 1 | 11 | Night Specter | Espectro Nocturno | {3}{B} | Creature — Specter | 3/3 | **Flying** |
| 1 | 12 | Crypt Lord | Señor de la Cripta | {4}{B} | Creature — Vampire | 4/5 | When Crypt Lord enters, put a creature card with cost 2 or less from your graveyard onto the Table. |

### 18.4 Emberkin / Clan Ascua (red) — back: Mountain / Montaña — symbol: double axe

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Reckless Goblin | Trasgo Temerario | {R} | Creature — Goblin | 2/1 | **Haste** |
| 2 | 3–4 | Ember Bolt | Descarga de Ascuas | {R} | Instant | — | Ember Bolt deals 3 damage to a creature or to the Nemesis. |
| 1 | 5 | Cinder Hound | Sabueso de Ceniza | {1}{R} | Creature — Hound | 2/2 | When Cinder Hound enters, it deals 1 damage to a creature. |
| 1 | 6 | Firebrand Raider | Saqueador Incendiario | {2}{R} | Creature — Human Warrior | 3/2 | **Haste** |
| 1 | 7 | Battle Fury | Furia de Batalla | {R} | Instant | — | A creature gets +3/+0 until end of turn. |
| 1 | 8 | Molten Blade | Hoja Fundida | {1}{R} | Aura | — | Tuck behind a creature you control. It gets +2/+0 and has **Trample**. |
| 1 | 9 | Kindle | Prender | {R} | Sorcery | — | Kindle deals 2 damage to a creature or to the Nemesis. |
| 1 | 10 | Volcanic Roar | Rugido Volcánico | {2}{R} | Sorcery | — | Volcanic Roar deals 2 damage to each Nemesis creature. |
| 1 | 11 | Ashwing Drake | Draco Alaceniza | {3}{R} | Creature — Drake | 3/3 | **Flying** |
| 1 | 12 | Pyre Titan | Titán de la Pira | {4}{R} | Creature — Giant | 5/4 | **Trample**. When Pyre Titan enters, it deals 2 damage to the Nemesis. |

### 18.5 Wildwood / Monteverde (green) — back: Forest / Bosque — symbol: leaf

| # | No. | EN | ES | Cost | Type | P/T | Text |
|---|---|---|---|---|---|---|---|
| 2 | 1–2 | Thicket Bear | Oso de la Espesura | {1}{G} | Creature — Bear | 2/2 | — |
| 2 | 3–4 | Surge of Vigor | Oleada de Vigor | {G} | Instant | — | A creature gets +3/+3 until end of turn. |
| 1 | 5 | Elvish Grovekeeper | Guardabosques Élfico | {G} | Creature — Elf Druid | 1/1 | {T}: Add {G}. |
| 1 | 6 | Wild Strength | Fuerza Salvaje | {1}{G} | Aura | — | Tuck behind a creature you control. It gets +2/+2 and has **Trample**. |
| 1 | 7 | Spider of the Canopy | Araña del Dosel | {1}{G} | Creature — Spider | 1/4 | **Reach** |
| 1 | 8 | Ironbark Wall | Muro de Corteza Férrea | {1}{G} | Creature — Plant Wall | 0/5 | **Defender** |
| 1 | 9 | Bloom of Life | Floración Vital | {1}{G} | Sorcery | — | Gain 4 life. |
| 1 | 10 | Mossback Boar | Jabalí Lomomusgo | {2}{G} | Creature — Boar | 3/3 | **Trample** |
| 1 | 11 | Grovesinger Druid | Druida Cantoarboleda | {2}{G} | Creature — Elf Druid | 2/3 | When Grovesinger Druid enters, gain 2 life. |
| 1 | 12 | Ancient Crashhorn | Cuernochoque Ancestral | {4}{G} | Creature — Beast | 6/6 | **Trample** |

### 18.6 Vorthrax's Threat deck — symbol: dragon eye

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 2 | 1–2 | Ash Imp | Diablillo de Ceniza | Creature — Imp | 1/1 | **Flying** |
| 2 | 3–4 | Cinderclaw Brute | Bruto Garrascua | Creature — Demon | 3/2 | — |
| 2 | 5–6 | Magma Sentinel | Centinela de Magma | Creature — Elemental | 1/4 | **Defender** |
| 1 | 7 | Ember Wyrmling | Dragoncillo de Ascuas | Creature — Dragon | 2/2 | **Flying** |
| 1 | 8 | Scorch Fiend | Demonio Abrasador | Creature — Demon | 4/3 | **Trample** |
| 1 | 9 | Vorthrax's Herald | Heraldo de Vorthrax | Creature — Cultist | 3/3 | When it enters, it deals 1 damage to you. |
| 1 | 10 | Lava Behemoth | Behemot de Lava | Creature — Elemental | 5/5 | — |
| 2 | 11–12 | Searing Breath | Aliento Abrasador | Spell | — | Deal 2 damage to your highest-power creature. If you have none, deal 2 damage to you. |
| 1 | 13 | Rain of Cinders | Lluvia de Pavesas | Spell | — | Deal 1 damage to each of your creatures and 1 damage to you. |
| 1 | 14 | Tyrant's Roar | Rugido del Tirano | Spell | — | Nemesis creatures get +1/+0 until end of turn. |
| 1 | 15 | Cinder Rebirth | Renacer de Ceniza | Spell | — | Return the highest-power creature from the Ruin to the Table. If there is none, deal 2 damage to you. |

### 18.7 Vaskara's Threat deck — symbol: honeycomb

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 4 | 1–4 | Ravenous Larva | Larva Voraz | Creature — Insect | 1/1 | — |
| 2 | 5–6 | Armored Drone | Zángano Acorazado | Creature — Insect | 2/2 | — |
| 2 | 7–8 | Darting Wasp | Avispa Lanzadera | Creature — Insect | 2/1 | **Flying** |
| 1 | 9 | Shieldbreaker Beetle | Escarabajo Rompeescudos | Creature — Insect | 3/3 | **Trample** |
| 1 | 10 | Mantis Queen | Mantis Reina | Creature — Insect | 4/4 | When it enters, other Nemesis creatures get +1/+0 until end of turn. |
| 2 | 11–12 | Pheromones | Feromonas | Spell | — | Nemesis creatures get +1/+1 until end of turn. |
| 2 | 13–14 | Egg Laying | Puesta de Huevos | Spell | — | Reveal the next face-down card. If it is a creature, execute it. Otherwise put it face-down at the bottom. |
| 1 | 15 | Insect Plague | Plaga de Insectos | Spell | — | Deal 1 damage to each of your creatures. |

### 18.8 Morwen's Threat deck — symbol: crown

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 3 | 1–3 | Wandering Skeleton | Esqueleto Errante | Creature — Skeleton | 2/1 | When it dies, put it face-down at the bottom of the Threat deck (Morwen gains 1 life). |
| 2 | 4–5 | Rotting Zombie | Zombi Putrefacto | Creature — Zombie | 2/3 | — |
| 2 | 6–7 | Vampire Bat | Murciélago Vampiro | Creature — Bat | 1/2 | **Flying**, **Lifelink** |
| 1 | 8 | Morwen's Ghoul | Necrófago de Morwen | Creature — Zombie | 3/2 | **Deathtouch** |
| 1 | 9 | Deathless Knight | Caballero Sin Muerte | Creature — Zombie Knight | 4/4 | — |
| 1 | 10 | Crypt Horror | Horror de la Cripta | Creature — Horror | 5/4 | When it enters, you lose 1 life. |
| 2 | 11–12 | Withering Touch | Toque Marchito | Spell | — | Your highest-power creature gets −2/−2 until end of turn. If you have none, you lose 2 life. |
| 1 | 13 | Exhume | Exhumar | Spell | — | Return the highest-power creature from the Ruin to the Table. If there is none, you lose 2 life. |
| 1 | 14 | Soul Drain | Drenar Alma | Spell | — | You lose 2 life. Return 2 Ruin cards face-down to the bottom of the Threat deck. |
| 1 | 15 | Plague | Plaga | Spell | — | All creatures (both sides) get −1/−1 until end of turn. |

### 18.9 The Mirror Archmage's Threat deck — symbol: wizard hat

| # | No. | EN | ES | Type | P/T | Text |
|---|---|---|---|---|---|---|
| 2 | 1–2 | Fragile Illusion | Ilusión Frágil | Creature — Illusion | 3/1 | **Flying** |
| 2 | 3–4 | Water Elemental | Elemental de Agua | Creature — Elemental | 2/4 | — |
| 2 | 5–6 | Crystal Golem | Gólem de Cristal | Creature — Golem | 1/4 | **Defender** |
| 1 | 7 | Guardian Sphinx | Esfinge Guardiana | Creature — Sphinx | 3/3 | **Flying** |
| 1 | 8 | Mirror Djinn | Djinn del Espejo | Creature — Djinn | 4/2 | **Flying** |
| 1 | 9 | Tide Serpent | Serpiente de la Marea | Creature — Serpent | 4/5 | — |
| 2 | 10–11 | Counterspell | Contraconjuro | Spell | — | **Counter reminder**: the next spell you cast is countered. |
| 2 | 12–13 | Rebound | Rebote | Spell | — | Return your highest-power creature to your hand. If you have none, discard the leftmost card of your hand. |
| 1 | 14 | Mind Theft | Robo de Mente | Spell | — | Discard the leftmost card of your hand. If you can't, you lose 2 life. |
| 1 | 15 | Mass Illusion | Ilusión Masiva | Spell | — | Lower all your creatures. |

## 19. Quick reference

The reference card, in four halves:

| Your turn | Nemesis turn |
|---|---|
| 1. Untap: raise everything. | 1. Untap. |
| 2. Draw 1 (−1 life). Skip it on turn 1. | 2. Execute the Omen. |
| 3. Main: 1 land, spells, Kael once. | 3. Reveal a new Omen (−1 life). |
| 4. Combat. | 4. Attack: you block, instants allowed. |
| 5. Second main. | 5. End-of-turn abilities. Damage wears off. |
| 6. End: hand ≤ 5. Damage wears off. | 7 or fewer face-down cards → Phase 2. |

| Nemesis mind | In your hands |
|---|---|
| **Attack** with every able creature, unless you could block it, kill it and survive. | **Lowered** = tapped. **Upside-down** = frozen. |
| **Block:** safe block → trade → desperation (only if lethal). | **Damage N:** N library cards → graveyard. |
| **Target** your highest-power creature (then toughness, then leftmost). None → you. | **Gain N:** N graveyard cards → library bottom. |
| **Overflow:** a 5th creature hits you for its power instead. | **Hit the Nemesis N:** N cards behind the Omen → Ruin. |
| | **Sideways Threat** = Counterspell waiting. |

Win and lose:

1. The Nemesis has 0 face-down Threat cards → **you win**.
2. Your library has 0 cards → **you lose**.
