import { EMBERKIN, VORTHRAX_THREATS, WILDWOOD } from "../content";
import { renderCard, land } from "../render/card";
import { nemesisFace, otherNemesis, threatDeckBack, walkerFace } from "../render/faces";
import { fan } from "../render/layout";
import { pips } from "../render/pips";
import { board, cardListRows, chip, landChip, page, status, turn } from "./components";

export function buildPages(): string[] {
  const pages: string[] = [];
  const coverFan = fan([renderCard("thicket-bear", "lg"), walkerFace("B", "lg"), nemesisFace("A", "lg"), renderCard("ember-bolt", "lg")], [-20, -7, 7, 20], 22);
  pages.push(page(`
<h1>PALMWALKER</h1>
<div class="sub">A SOLO DUELING CARD GAME YOU HOLD IN YOUR HANDS</div>
<div class="tagline">No table. No tokens. No opponent across the board.<br>Just your hands, your spells, and a Nemesis that wants your library to burn.</div>
<div class="fan">${coverFan}</div>
<div class="meta"><span>1 PLAYER</span><span>15–20 MIN</span><span>39 CARDS</span><span>AGES 12+</span></div>
<div class="ver">RULEBOOK · PROTOTYPE v0.1</div>
`, undefined, "cover"));
  pages.push(page(`
<h2>Welcome, Walker</h2>
<p class="lead">Palmwalker takes the heart of a classic dueling card game — lands, creatures, instants, combat, a planeswalker at your side —
and folds it into something you can play standing on a train. Everything happens in your two hands.</p>
<div class="cols">
<div>
<h3>The duel in one paragraph</h3>
<p>You are <b>Kael</b>, a wandering pyromancer. Each turn you draw, play a land, cast creatures and spells, and attack.
Your foe is a <b>Nemesis</b> — an automated boss with its own deck of Threats. It summons creatures, casts spells, attacks and blocks
following a few simple rules, so you never have to make decisions for it.</p>
<h3>Three ideas that make it fit in your hands</h3>
<ol>
<li><b>Your library is your life.</b> You start with 20 cards in your library: that is 20 life. Damage throws cards from your library into your graveyard.</li>
<li><b>Every card is also a land.</b> The back of each card is a Mountain or a Forest. Each turn you choose: cast it, or turn it into mana.</li>
<li><b>Position is state.</b> Cards are tapped by lowering them in the fan. Zones are parts of a packet, not places on a table.</li>
</ol>
</div>
<div>
<h3>Contents</h3>
<div class="toc" style="columns:1">
<div><span>Components</span><span>3</span></div>
<div><span>Anatomy of a card</span><span>4</span></div>
<div><span>Card types &amp; keywords</span><span>5</span></div>
<div><span>Kael, your Walker</span><span>6</span></div>
<div><span>The Nemesis</span><span>7</span></div>
<div><span>Holding the game</span><span>8</span></div>
<div><span>Life, zones &amp; physical moves</span><span>9</span></div>
<div><span>Setup</span><span>10</span></div>
<div><span>Turn structure</span><span>11</span></div>
<div><span>Combat &amp; the Nemesis mind</span><span>12</span></div>
<div><span>Example game</span><span>13–16</span></div>
<div><span>Card gallery</span><span>17</span></div>
<div><span>Modes, other Nemeses &amp; tuning</span><span>18</span></div>
<div><span>Card lists</span><span>19</span></div>
<div><span>Quick reference</span><span>20</span></div>
</div>
<div class="box">
<h3>Inspired by</h3>
<p class="mini">The in-hand tradition on BoardGameGeek: <b>Palm Island</b> (4-state cards, sideways resources),
<b>Handy Brawl</b> (an enemy that acts on its own, damage as card state), <b>Maiden's Quest</b> (in-hand deckbuilding),
<b>Galdor's Grip</b> and <b>Loot the Loop</b> (order and orientation as game state), and <b>The Hand of Destiny</b> (hero vs. waves and a boss).</p>
</div>
</div>
</div>
`, 2));
  pages.push(page(`
<h2>Components <small>39 CARDS</small></h2>
<table>
<tr><th>Qty</th><th>Component</th><th>What it does</th></tr>
<tr><td>12</td><td><b>Emberkin</b> half-grimoire (red)</td><td>Fast creatures and burn. Every back is a <b>Mountain</b> ${pips("{R}")}.</td></tr>
<tr><td>12</td><td><b>Wildwood</b> half-grimoire (green)</td><td>Big creatures and pump tricks. Every back is a <b>Forest</b> ${pips("{G}")}.</td></tr>
<tr><td>1</td><td><b>Kael</b>, Wandering Pyromancer</td><td>Your Walker. A 4-state card that tracks loyalty by rotating and flipping.</td></tr>
<tr><td>1</td><td><b>Vorthrax</b>, the Ash Tyrant</td><td>The Nemesis. Face A = Phase 1, Face B = Phase 2. Rotate it for Heroic mode.</td></tr>
<tr><td>12+3</td><td><b>Threat</b> deck</td><td>15 cards: Vorthrax's creatures and spells. It is also Vorthrax's life.</td></tr>
<tr><td>1</td><td>Quick reference card</td><td>Turn order and the Nemesis rules.</td></tr>
</table>
<div class="row center" style="gap:6mm; margin-top:4mm">
<div class="fig">${renderCard("reckless-goblin", "md")}<div class="cap">Emberkin card (front)</div></div>
<div class="fig">${land("Mountain", "md")}<div class="cap">…and its back</div></div>
<div class="fig">${renderCard("thicket-bear", "md")}<div class="cap">Wildwood card (front)</div></div>
</div>
<div class="row center" style="gap:4mm; margin-top:4mm; flex-wrap:nowrap">
<div class="fig">${land("Forest", "sm")}<div class="cap">Wildwood back</div></div>
<div class="fig">${renderCard("cinderclaw-brute", "sm")}<div class="cap">Threat creature</div></div>
<div class="fig">${renderCard("searing-breath", "sm")}<div class="cap">Threat spell</div></div>
<div class="box" style="width:58mm; margin:0">
<h3>Half-grimoires</h3>
<p class="mini">Like a pre-built pack, each colour comes as a 12-card half. Shuffle any two halves together and you have a 24-card Grimoire.
Future halves (white, blue, black…) mix and match with these: 5 colours give 10 different decks.</p>
<h3>Threat cards have no back</h3>
<p class="mini">The Threat deck uses a plain back. Face-down Threats are Vorthrax's life; face-up ones are the <b>Omen</b> (front) and the <b>Ruin</b> (back).</p>
</div>
</div>
`, 3));
  pages.push(page(`
<h2>Anatomy of a Card</h2>
<p>Palmwalker cards are read in a <b>fan</b>. When cards overlap, only their left edge shows — just like the corner index of a deck of
playing cards. That is why every card carries its key information in the <b>index strip</b> down its left side.</p>
<div style="position:relative; height:96mm; margin-top:6mm">
  <div style="position:absolute; left:58mm; top:4mm">${renderCard("cinder-hound", "lg")}</div>
  <div class="callout" data-n="1" style="left:4mm; top:6mm"><b>Cost</b>: the big number is the total mana; the symbols show its colours. The strip has the card's colour.</div>
  <div class="callout" data-n="2" style="left:4mm; top:32mm"><b>Type glyph</b>: ⚔ creature, ϟ instant, ✶ sorcery, ◈ aura, ▲ land, ✹ Threat.</div>
  <div class="callout" data-n="3" style="left:4mm; top:62mm"><b>Power / Toughness</b>: large at the foot of the strip, readable even when the card is buried in the fan.</div>
  <div class="callout" data-n="4" style="left:126mm; top:4mm"><b>Name</b>, over the artwork.</div>
  <div class="callout" data-n="5" style="left:126mm; top:24mm"><b>Full-bleed art</b> in cut-paper style.</div>
  <div class="callout" data-n="6" style="left:126mm; top:48mm"><b>Type line</b>: card type and creature type.</div>
  <div class="callout" data-n="7" style="left:126mm; top:68mm"><b>Rules text</b> on a glass panel. Italic text is flavour.</div>
  <div class="marker" style="left:56mm; top:6mm">1</div>
  <div class="marker" style="left:56mm; top:21mm">2</div>
  <div class="marker" style="left:56mm; top:74mm">3</div>
  <div class="marker" style="left:113mm; top:5mm">4</div>
  <div class="marker" style="left:113mm; top:28mm">5</div>
  <div class="marker" style="left:113mm; top:56mm">6</div>
  <div class="marker" style="left:113mm; top:70mm">7</div>
</div>
<div class="cols">
<div class="box">
<h3>Double-faced: spell or land?</h3>
<p class="mini">The back of every Grimoire card is a land. Once per turn you may <b>flip a card from your hand to its land side</b> and play it.
A land is permanent; the spell on its front is gone for good. Choosing which cards to sacrifice as lands is the first decision of every turn.</p>
</div>
<div class="box">
<h3>Mana</h3>
<p class="mini">Each land produces one mana of its colour: Mountain ${pips("{R}")}, Forest ${pips("{G}")}.
To use it, <b>lower</b> the land (tap it). Lands rise again at the start of your turn — so mana spent on your turn is <b>not</b> available during the Nemesis turn.</p>
</div>
</div>
`, 4));
  pages.push(page(`
<h2>Card Types &amp; Keywords</h2>
<div class="row center" style="gap:4mm">
<div class="fig">${renderCard("mossback-boar", "md")}<div class="cap"><b>Creature</b> — stays on the Table. Attacks and blocks.</div></div>
<div class="fig">${renderCard("ember-bolt", "md")}<div class="cap"><b>Instant</b> — cast it any time, even on the Nemesis turn.</div></div>
<div class="fig">${renderCard("volcanic-roar", "md")}<div class="cap"><b>Sorcery</b> — only in your main phase.</div></div>
</div>
<div class="row center" style="gap:4mm; margin-top:3mm">
<div class="fig">${renderCard("wild-strength", "md")}<div class="cap"><b>Aura</b> — tuck it behind one of your creatures.</div></div>
<div class="fig">${land("Forest", "md")}<div class="cap"><b>Land</b> — the back of every card.</div></div>
<div class="box" style="width:56mm">
<h3>Creature rules</h3>
<ol class="mini">
<li><b>Summoning sickness:</b> a creature can't attack or use ${pips("{T}")} abilities on the turn it enters, unless it has Haste. It <b>can</b> block.</li>
<li><b>Damage wears off</b> at the end of every turn. A creature dies only if it takes damage ≥ toughness in a single turn.</li>
<li><b>Limit:</b> 4 creatures per side, 5 lands.</li>
<li>An Aura goes to the graveyard with its creature.</li>
</ol>
</div>
</div>
<div class="box" style="margin-top:4mm">
<h3>Keywords</h3>
<div class="kw">
<div class="k">Flying</div><div>Can only be blocked by creatures with Flying or Reach.</div>
<div class="k">Reach</div><div>Can block creatures with Flying.</div>
<div class="k">Trample</div><div>Damage beyond what kills its blocker goes to the defending player or Nemesis.</div>
<div class="k">Haste</div><div>Ignores summoning sickness: can attack the turn it enters.</div>
<div class="k">Defender</div><div>Never attacks. Still blocks.</div>
</div>
</div>
`, 5));
  pages.push(page(`
<h2>Kael, your Walker</h2>
<p>Kael stands at the right end of your fan. His card has <b>four states</b> — one on each half of each face, Palm Island style.
The state that reads upright, facing you, is the active one. Each state lists the abilities you can use from it.</p>
<div class="row center" style="gap:10mm; margin:3mm 0 2mm">
<div class="fig">${walkerFace("A")}<div class="cap">Face A: state I upright, state II upside-down</div></div>
<div class="fig">${walkerFace("B")}<div class="cap">Face B: state III upright, state IV upside-down</div></div>
</div>
<div class="box" style="text-align:center; font-family:Copperplate,serif; color:#6b2d14; font-size:10pt">
I &nbsp;—<i>rotate 180°</i>→&nbsp; II &nbsp;—<i>flip over</i>→&nbsp; III &nbsp;—<i>rotate 180°</i>→&nbsp; IV
</div>
<div class="cols">
<div>
<h3>Using Kael</h3>
<ol>
<li>Once per turn, during one of <b>your main phases</b>, use one ability available in Kael's current state.</li>
<li><b>Charge</b> moves Kael 1 state forward (max IV). You may charge even if there is no creature to pump.</li>
<li><b>Discharge</b> moves Kael 2 states back (from III or IV).</li>
<li><b>Ultimate</b> needs state IV and returns Kael to I.</li>
</ol>
</div>
<div class="box">
<h3>The Walker's dilemma</h3>
<p class="mini">Charging is small but builds toward the Ultimate. Discharging removes a blocker now. Sitting at IV and waiting for the
right moment — for example, until Vorthrax loses its Ash Hide — can be the strongest play in the game. Kael can't be attacked.</p>
</div>
</div>
`, 6));
  pages.push(page(`
<h2>The Nemesis</h2>
<p>The Nemesis is your opponent. Its card sits at the left of your fan; its <b>Threat deck</b> sits behind it. It has no hand and no mana:
each turn it simply executes the face-up card on top of its deck, the <b>Omen</b>.</p>
<div class="row center" style="gap:10mm; margin:3mm 0">
<div class="fig">${nemesisFace("A")}<div class="cap">Face A — Phase 1 (rotate 180° for Heroic)</div></div>
<div class="fig">${nemesisFace("B")}<div class="cap">Face B — Phase 2</div></div>
</div>
<div class="cols">
<div>
<h3>The Threat deck is its life</h3>
<ol>
<li><b>Face-down</b> Threat cards = Vorthrax's life. At 0, you win.</li>
<li>The <b>Omen</b> is face-up on top. It shows what Vorthrax does next turn. It does not count as life.</li>
<li>The <b>Ruin</b> is face-up at the back: dead Threat creatures and cards destroyed by damage.</li>
<li><b>Damage to Vorthrax:</b> for each point, move the face-down card right behind the Omen to the Ruin.</li>
</ol>
</div>
<div>
<h3>Phases</h3>
<p>The moment the Threat deck has <b>7 or fewer</b> face-down cards, flip Vorthrax to Phase 2 — even in the middle of your turn.
<b>Rekindle</b> immediately returns the 3 rearmost Ruin cards face-down to the bottom of the Threat deck: a second health bar.</p>
<div class="box dark mini"><b>Phase 1</b> is armoured (Ash Hide) and patient. <b>Phase 2</b> loses the armour but its creatures gain Haste and its burn doubles.
Burst through the armour, then survive the fury.</div>
</div>
</div>
<div class="row center" style="gap:4mm">
${renderCard("ash-imp", "sm")}${renderCard("magma-sentinel", "sm")}${renderCard("scorch-fiend", "sm")}${renderCard("cinder-rebirth", "sm")}
</div>
`, 7));
  const leftFan = fan([threatDeckBack("sm", "THREAT<br>DECK<br><span style='font-size:.7em'>Omen on top</span>"), nemesisFace("A", "sm"), renderCard("cinderclaw-brute", "sm"), renderCard("thicket-bear", "sm"), walkerFace("A", "sm")], [-16, -8, 0, 8, 16], 9);
  pages.push(page(`
<h2>Holding the Game</h2>
<h3>Left hand — THE TABLE</h3>
<div class="row" style="align-items:center; gap:6mm; flex-wrap:nowrap">
<div class="fan" style="width:92mm; height:58mm; margin:0 0 0 8mm; flex:none">${leftFan}</div>
<div style="flex:1">
<p class="mini">A single fan, left to right:</p>
<ol class="mini">
<li><b>Threat deck</b> with the <b>Omen</b> face-up on top.</li>
<li><b>Vorthrax</b>, then its creatures (red-framed).</li>
<li>Your creatures, with Auras tucked behind them.</li>
<li><b>Kael</b> at the right end, with your <b>lands tucked behind him</b> so that only their top strips stick up.</li>
</ol>
<p class="mini">Only the left strip of each card shows — that is exactly where the index sits.</p>
</div>
</div>
<h3>Right hand — THE GRIMOIRE</h3>
<div class="row" style="align-items:center; gap:5mm; flex-wrap:nowrap">
<div class="exploded" style="flex:none">
<div class="layer">${renderCard("ember-bolt", "sm")}<div class="lbl">HAND<br><span style="font-size:7pt">spell side · fanned</span></div></div>
<div class="arrow">›</div>
<div class="layer">${land("Mountain", "sm")}<div class="lbl">LIBRARY = LIFE<br><span style="font-size:7pt">land side · squared</span></div></div>
<div class="arrow">›</div>
<div class="layer">${renderCard("kindle", "sm")}<div class="lbl">GRAVEYARD<br><span style="font-size:7pt">spell side · at the back</span></div></div>
</div>
<div class="box mini" style="flex:1">One packet, three layers from <b>front</b> (facing you) to <b>back</b>.
The library shows its <b>land side</b>; hand and graveyard show the <b>spell side</b>, so the boundaries between zones are always visible,
even when the packet is squared. (Yes — you can see the colour of your next draw. That's a feature.)</div>
</div>
<h3>Up and lowered</h3>
<div class="row" style="align-items:center; gap:8mm; flex-wrap:nowrap">
<div class="updown" style="flex:none">${renderCard("thicket-bear", "sm")}${renderCard("firebrand-raider", "sm", { extra: "low" })}</div>
<div style="flex:1">
<p><b>Raised</b> (aligned with the fan) = untapped. <b>Lowered</b> (slid down about 2 cm) = tapped.</p>
<p>A lowered <b>land</b> disappears behind Kael — so the mana symbols you can see are exactly the mana you have left.</p>
<p class="mini">Prefer the classic 90° turn? It works for small fans. Lowering is easier to hold.</p>
</div>
</div>
`, 8));
  pages.push(page(`
<h2>Life, Zones &amp; Physical Moves</h2>
<div class="box dark">
<h3>Your library is your life</h3>
<p>You begin with <b>20 cards in your library = 20 life</b>. Drawing a card spends 1 life. Damage mills cards into your graveyard.
Gaining life brings cards back from the graveyard. <b>When your library reaches 0, you lose.</b></p>
<p style="margin:0">Vorthrax works the same way: its face-down Threat cards are its life. <b>When it reaches 0, you win.</b></p>
</div>
<table>
<tr><th style="width:30%">When you…</th><th>Do this with your hands</th></tr>
<tr><td><b>Draw</b></td><td>Take the front card of your library, flip it to the spell side, add it to your hand fan. (−1 life)</td></tr>
<tr><td><b>Take N damage</b></td><td>N times: take the front library card, flip it to the spell side, slide it to the very back (graveyard).</td></tr>
<tr><td><b>Gain N life</b></td><td>N times: take the rearmost graveyard card, flip it to the land side, slide it between library and graveyard. (Up to the size of your graveyard.)</td></tr>
<tr><td><b>Play a land</b></td><td>Flip a hand card to its land side and tuck it behind Kael, top strip sticking up. Max 1 per turn.</td></tr>
<tr><td><b>Cast a spell</b></td><td>Lower lands for the cost. Creature → into the Table fan, left of Kael. Instant/sorcery → resolve, then to your graveyard.</td></tr>
<tr><td><b>A creature dies</b></td><td>Yours → back of your graveyard. Vorthrax's → back of the Threat deck (Ruin).</td></tr>
<tr><td><b>Deal N damage to Vorthrax</b></td><td>N times: take the face-down card right behind the Omen, flip it face-up, slide it into the Ruin.</td></tr>
<tr><td><b>Vorthrax casts a spell</b></td><td>Resolve it, then put it face-down at the bottom of the Threat deck (in front of the Ruin). It will come back.</td></tr>
<tr><td><b>Discard</b> (hand limit)</td><td>Put the card at the back of your graveyard. This is not damage.</td></tr>
</table>
<div class="cols">
<div class="box mini"><h3>Why library = life?</h3>Damage is never just a number: every point costs you a real card you might have drawn.
Healing recovers spent spells. And because drawing costs life, waiting is never free — the duel always moves forward.</div>
<div class="box mini"><h3>Counting</h3>Life is a count of cards. Count your library whenever you need to; with 20 cards or fewer it takes seconds.
Advanced players simply track it in their head: −1 per draw, −N per hit.</div>
</div>
`, 9));
  pages.push(page(`
<h2>Setup <small>ABOUT ONE MINUTE</small></h2>
<div class="flow">
<div class="step"><div class="num">1</div><div class="sbody"><b>Build your Grimoire.</b> Pick two half-grimoires (this box: Emberkin + Wildwood), shuffle the 24 cards together. Hold them land side facing you.</div></div>
<div class="step"><div class="num">2</div><div class="sbody"><b>Draw your opening hand.</b> Draw 4 cards. Your library now has 20 cards: <b>you have 20 life.</b></div></div>
<div class="step"><div class="num">3</div><div class="sbody"><b>Mulligan (optional, once).</b> Shuffle your hand back, draw 4 new cards, then put 1 of them into your graveyard. Your life stays 20.</div></div>
<div class="step"><div class="num">4</div><div class="sbody"><b>Kael.</b> Place Kael at state <b>I</b> (Face A, upright) — he starts your Table fan.</div></div>
<div class="step"><div class="num n">5</div><div class="sbody"><b>The Nemesis.</b> Place Vorthrax on Face A (Phase 1) at the left of the fan. Upright = Normal; rotated 180° = Heroic.</div></div>
<div class="step"><div class="num n">6</div><div class="sbody"><b>The Threat deck.</b> Shuffle the 15 Threat cards face-down, put them behind Vorthrax, and turn the top card face-up: that is the first <b>Omen</b>. Vorthrax has <b>14 life</b>.</div></div>
<div class="step"><div class="num">7</div><div class="sbody"><b>Begin.</b> You take the first turn and skip your draw on that turn.</div></div>
</div>
<div class="row center" style="margin-top:6mm; gap:5mm; align-items:flex-end">
<div class="fig">${renderCard("reckless-goblin", "sm")}</div>
<div class="fig">${renderCard("thicket-bear", "sm")}</div>
<div class="fig">${renderCard("surge-of-vigor", "sm")}</div>
<div class="fig">${renderCard("ancient-crashhorn", "sm")}</div>
<div class="box mini" style="width:60mm"><h3>A typical opening hand</h3>Four cards — and four potential lands.
Here only the Goblin is red, so turning it into a Mountain would mean losing your only one-drop. Decisions start before turn one.</div>
</div>
`, 10));
  pages.push(page(`
<h2>Turn Structure</h2>
<div class="cols">
<div>
<h3>Your turn</h3>
<div class="flow">
<div class="step"><div class="num">1</div><div class="sbody"><b>Untap.</b> Raise all your lowered creatures and lands.</div></div>
<div class="step"><div class="num">2</div><div class="sbody"><b>Draw.</b> Draw 1 card (−1 life). Skip it on turn 1.</div></div>
<div class="step"><div class="num">3</div><div class="sbody"><b>Main phase.</b> Play up to 1 land. Cast creatures, sorceries, auras and instants. Use Kael once.</div></div>
<div class="step"><div class="num">4</div><div class="sbody"><b>Combat.</b> Attack with any untapped creatures without summoning sickness. Vorthrax blocks by its rules.</div></div>
<div class="step"><div class="num">5</div><div class="sbody"><b>Second main.</b> Same as step 3 (if you didn't play a land or use Kael yet, you still can).</div></div>
<div class="step"><div class="num">6</div><div class="sbody"><b>End.</b> Discard down to 5 cards. Damage on creatures wears off.</div></div>
</div>
</div>
<div>
<h3>Nemesis turn</h3>
<div class="flow">
<div class="step"><div class="num n">1</div><div class="sbody"><b>Untap.</b> Raise all Nemesis creatures.</div></div>
<div class="step"><div class="num n">2</div><div class="sbody"><b>Execute the Omen.</b> A creature enters the Table (summoning sick unless it has Haste). A spell resolves and goes face-down to the bottom.</div></div>
<div class="step"><div class="num n">3</div><div class="sbody"><b>Reveal a new Omen.</b> Turn the next face-down card face-up (−1 Vorthrax life). Now you know next turn's threat.</div></div>
<div class="step"><div class="num n">4</div><div class="sbody"><b>Attack.</b> Its creatures attack by the Nemesis rules. You block and may cast instants.</div></div>
<div class="step"><div class="num n">5</div><div class="sbody"><b>End.</b> Resolve end-of-turn abilities (Smolder / Inferno). Damage wears off.</div></div>
</div>
</div>
</div>
<div class="cols" style="margin-top:3mm">
<div class="box mini"><h3>Instants &amp; responses</h3>You may cast instants at any moment, including during the Nemesis turn. When the Nemesis executes a spell,
its target is chosen first; then you may respond before it resolves. The Nemesis never responds to you.</div>
<div class="box mini"><h3>Overflow</h3>If the Omen is a creature but the Nemesis already has 4 creatures, the new creature instead deals damage equal to its power to you,
then goes face-down to the bottom of the Threat deck.</div>
</div>
`, 11));
  pages.push(page(`
<h2>Combat &amp; the Nemesis Mind</h2>
<div class="cols">
<div>
<h3>How combat works</h3>
<ol>
<li><b>Attack:</b> the attacker lowers its attacking creatures. Lowered creatures stay lowered until their controller's next untap — so <b>creatures that attack can't block on the next turn</b>.</li>
<li><b>Block:</b> each untapped defender may block one attacker. Each attacker can be blocked by at most one creature.</li>
<li><b>Tricks:</b> after blocks, you may cast instants.</li>
<li><b>Damage:</b> all at once. Each creature deals damage equal to its power. Unblocked attackers hit the player or Nemesis. Trample spills the excess.</li>
<li><b>Deaths:</b> creatures with damage ≥ toughness die.</li>
</ol>
<div class="box mini"><h3>Targets</h3>Nemesis effects that hit "your creature" choose your creature with the <b>highest power</b>; ties go to the highest toughness, then the leftmost.
If you have no creature, the damage hits you.</div>
</div>
<div>
<div class="box dark">
<h3>The Nemesis attacks…</h3>
<p class="mini">Each untapped Nemesis creature without Defender and without summoning sickness <b>attacks</b> — unless you have an untapped creature
that could block it, <b>kill it and survive</b>.</p>
<h3>The Nemesis blocks… (in this order)</h3>
<ol class="mini">
<li><b>Safe block.</b> Each untapped Nemesis creature that can block an attacker, kill it and survive, does so — choosing the highest-power such attacker.</li>
<li><b>Trade.</b> Each remaining blocker blocks the highest-power attacker it can kill, even if it dies.</li>
<li><b>Desperation.</b> If unblocked damage would reduce Vorthrax to 0, every remaining blocker blocks the highest-power unblocked attacker.</li>
<li><b>Ties:</b> the leftmost Nemesis creature chooses first.</li>
</ol>
</div>
<div class="box mini"><h3>Reading the Nemesis</h3>Because these rules are fixed, you can predict every block. The skill is in shaping the combat:
pump after blocks, kill the only safe blocker first, or attack with exactly the creature it can't handle.</div>
</div>
</div>
<h3>Example: a safe block, then a trick</h3>
${board("YOUR ATTACK · TURN 5 OF THE EXAMPLE GAME", 12, 8, "Phase 1", "IV", "Ember Wyrmling", [chip("Scorch Fiend", "4/3", "nem", undefined, "Trample")], [chip("Cinder Hound", "2/2", "you", true, "attacking"), chip("Firebrand Raider", "3/2", "you", true, "attacking")], [landChip("F"), landChip("M"), landChip("F")], 1)}
<p class="mini">Scorch Fiend can kill the Hound and survive (2 &lt; 3), but not the Raider (3 ≥ 3): <b>safe block on the Hound</b>. You answer with Battle Fury: the Hound becomes 5/2 and takes the Fiend with it.</p>
`, 12));
  const ex1 = `
<h2>Example Game <small>EMBERKIN + WILDWOOD vs. VORTHRAX</small></h2>
<p class="mini">Follow along with the cards if you like. Opening hand: <b>Reckless Goblin, Thicket Bear, Surge of Vigor, Ancient Crashhorn</b>.
First Omen: <b>Cinderclaw Brute</b>. You: 20 life · Vorthrax: 14 life.</p>
<div class="round">ROUND 1</div>
${status(20, 14, "Phase 1", "I", "Cinderclaw Brute")}
${turn("Turn 1 — You", "you", ["No draw on the first turn.", "Land: flip <b>Ancient Crashhorn</b> to its Forest side and tuck it behind Kael.", "Nothing to cast: the Goblin needs {R} and the Bear needs two mana.", "Kael: <b>Charge</b> (I → II). No creature to pump, but loyalty grows."], "A 5-mana creature in a deck with at most 5 lands is a dream for later. Lands now win games — and the Goblin and Bear are cheap.")}
${turn("Turn 1 — Vorthrax", "nem", ["Executes the Omen: <b>Cinderclaw Brute</b> (3/2) enters, summoning sick.", "Reveals the new Omen: <b>Ash Imp</b>. Vorthrax 14 → 13.", "No attack. <b>Smolder</b>: 1 damage — Ember Bolt is milled from your library. You 20 → 19."])}
${board("END OF ROUND 1", 19, 13, "Phase 1", "II", "Ash Imp<br>1/1 Flying", [chip("Cinderclaw Brute", "3/2", "nem", undefined, "sick")], [], [landChip("F")], 3)}
<div class="round">ROUND 2</div>
${status(19, 13, "Phase 1", "II", "Ash Imp")}
${turn("Turn 2 — You", "you", ["Draw <b>Cinder Hound</b> (19 → 18).", "The Omen warns that an Ash Imp (1/1 flyer) is coming. The Hound's 1 damage on entry will kill it — so you <b>hold the Hound</b>.", "Land: Reckless Goblin → Mountain. Cast <b>Thicket Bear</b> {1}{G}.", "Kael: Charge (II → III)."], "Reading the Omen one turn ahead tells you which card to keep. Holding the Hound turns it into a two-for-one next turn.")}
${turn("Turn 2 — Vorthrax", "nem", ["Executes <b>Ash Imp</b> (sick). New Omen: <b>Searing Breath</b>. 13 → 12.", "Attack check: could your Bear block the Brute, kill it <i>and survive</i>? It kills it but dies → <b>the Brute attacks</b>.", "You block with the Bear. Both die: Bear → your graveyard, Brute → Ruin.", "Smolder: you mill Reckless Goblin. 18 → 17."], "Your lands are still lowered from casting the Bear, so Surge of Vigor isn't castable. A 2-mana Bear for a 3-power Brute is a fine trade.")}
`;
  pages.push(page(ex1, 13));
  const ex2 = `
${board("END OF ROUND 2", 17, 12, "Phase 1", "III", "Searing Breath<br>2 dmg to your best creature", [chip("Ash Imp", "1/1", "nem", undefined, "Flying")], [], [landChip("F", true), landChip("M", true)], 2)}
<div class="round">ROUND 3</div>
${status(17, 12, "Phase 1", "III", "Searing Breath")}
${turn("Turn 3 — You", "you", ["Draw <b>Wild Strength</b> (17 → 16). Land: Wild Strength → Forest (3 lands).", "Cast <b>Cinder Hound</b> {1}{R}: its entry ping kills the Ash Imp → Ruin.", "Kael: Charge (III → IV).", "Leave <b>one Forest raised</b>: Searing Breath is coming, and you hold Surge of Vigor."], "Leaving mana up on purpose is the heart of instant-speed play. The Omen makes it a calculated choice, not a guess.")}
${turn("Turn 3 — Vorthrax", "nem", ["Executes <b>Searing Breath</b>: target = your highest-power creature, the Hound.", "You respond: <b>Surge of Vigor</b> {G}. The Hound becomes 5/5 and shrugs off 2 damage.", "Searing Breath goes face-down to the bottom of the Threat deck: 12 → 13. New Omen: <b>Scorch Fiend</b>: 13 → 12.", "No attackers. Smolder: you mill Thicket Bear. 16 → 15."])}
${board("END OF ROUND 3", 15, 12, "Phase 1", "IV", "Scorch Fiend<br>4/3 Trample", [], [chip("Cinder Hound", "2/2", "you")], [landChip("F", true), landChip("M", true), landChip("F", true)], 0)}
<div class="round">ROUND 4</div>
${status(15, 12, "Phase 1", "IV", "Scorch Fiend")}
${turn("Turn 4 — You", "you", ["Draw <b>Firebrand Raider</b> (15 → 14). It is your only card, so no land this turn.", "Cast the Raider {2}{R} (3/2 Haste).", "Attack with Hound and Raider. No blockers: 5 damage, <b>Ash Hide</b> prevents 2 → 3 damage.", "Magma Sentinel, Vorthrax's Herald and Rain of Cinders go to the Ruin. 12 → 9.", "Kael stays at IV: an Ultimate now would lose 2 of its 3 damage to Ash Hide."], "Ash Hide absorbs only the first 2 damage each turn. Hit it with everything at once — and save the Ultimate for when the armour is gone.")}
`;
  pages.push(page(ex2, 14));
  const ex3 = `
${turn("Turn 4 — Vorthrax", "nem", ["Executes <b>Scorch Fiend</b> (4/3 Trample), summoning sick. New Omen: <b>Ember Wyrmling</b>. 9 → 8.", "No attackers. Smolder: you mill Mossback Boar. 14 → 13."])}
${board("END OF ROUND 4", 13, 8, "Phase 1", "IV", "Ember Wyrmling<br>2/2 Flying", [chip("Scorch Fiend", "4/3", "nem", undefined, "Trample")], [chip("Cinder Hound", "2/2", "you", true), chip("Firebrand Raider", "3/2", "you", true)], [landChip("F", true), landChip("M", true), landChip("F", true)], 0)}
<div class="round">ROUND 5</div>
${status(13, 8, "Phase 1", "IV", "Ember Wyrmling")}
${turn("Turn 5 — You", "you", ["Draw <b>Battle Fury</b> (13 → 12). Attack with Hound (2/2) and Raider (3/2).", "Nemesis block, step 1 (safe block): Scorch Fiend can kill the Hound and survive, but not the Raider → <b>it blocks the Hound</b>.", "After blocks: <b>Battle Fury</b> {R} on the Hound → 5/2. Hound and Fiend kill each other.", "The Raider is unblocked: 3 damage − 2 (Ash Hide) = 1. Cinderclaw Brute is milled. 8 → 7.", "<b>PHASE 2!</b> Vorthrax flips. <b>Rekindle</b> returns the 3 rearmost Ruin cards (Cinderclaw Brute, Scorch Fiend, Rain of Cinders) face-down: 7 → 10. Ash Hide is gone.", "Second main phase: Kael <b>ULTIMATE</b> (IV → I) — 3 full damage. 10 → 7."], "Patience at IV paid off: the Ultimate landed the very turn the armour broke. All 3 damage counted.")}
${turn("Turn 5 — Vorthrax (Phase 2)", "nem", ["Executes <b>Ember Wyrmling</b> (2/2 Flying). Inferno gives it Haste. New Omen: <b>Magma Sentinel</b>. 7 → 6.", "Your Raider is lowered from attacking: nothing can block. The Wyrmling hits for 2 — Bloom of Life and Ashwing Drake are milled. 12 → 10.", "<b>Inferno</b>: 2 more damage — Kindle and Grovesinger Druid milled. 10 → 8."], "Phase 2 costs you 3–4 life per round. Damage also burned a Bloom of Life you'd have loved to draw. The race is on.")}
${board("END OF ROUND 5", 8, 6, "Phase 2", "I", "Magma Sentinel<br>1/4 Defender", [chip("Ember Wyrmling", "2/2", "nem", true, "Flying")], [chip("Firebrand Raider", "3/2", "you", true)], [landChip("F"), landChip("M", true), landChip("F")], 0)}
`;
  pages.push(page(ex3, 15));
  const ex4 = `
<div class="round">ROUND 6</div>
${status(8, 6, "Phase 2", "I", "Magma Sentinel")}
${turn("Turn 6 — You", "you", ["Draw <b>Spider of the Canopy</b> (8 → 7). Cast it {1}{G}: a 1/4 with Reach to stop the Wyrmling.", "Kael: Charge (I → II): Raider +1/+0 → 4/2.", "Attack with the Raider. The Wyrmling is lowered (it attacked), so there are no blockers: 4 damage. 6 → 2."])}
${turn("Turn 6 — Vorthrax", "nem", ["Executes <b>Magma Sentinel</b> (1/4 Defender). New Omen: <b>Scorch Fiend</b> — the one Rekindle brought back. 2 → 1.", "Attack check for the Wyrmling: your Spider would survive but can't kill it → <b>the Wyrmling attacks</b>. You block with the Spider: nobody dies.", "Inferno: Volcanic Roar and Pyre Titan milled. 7 → 5."], "Next turn a hasty Scorch Fiend (4 trample) plus Inferno (2) means 6 damage. After your draw you'll have 4 life. This is your last turn.")}
${board("END OF ROUND 6", 5, 1, "Phase 2", "II", "Scorch Fiend<br>4/3 Trample", [chip("Ember Wyrmling", "2/2", "nem", true, "Flying"), chip("Magma Sentinel", "1/4", "nem", undefined, "Defender")], [chip("Firebrand Raider", "3/2", "you", true), chip("Spider of the Canopy", "1/4", "you", undefined, "Reach")], [landChip("F", true), landChip("M", true), landChip("F")], 0)}
<div class="round">ROUND 7</div>
${status(5, 1, "Phase 2", "II", "Scorch Fiend")}
${turn("Turn 7 — You", "you", ["Draw <b>Elvish Grovekeeper</b> (5 → 4). Attack with the Raider (3/2) and the Spider (1/4).", "Nemesis blocks: step 1 — the Sentinel can't kill either. Step 2 — no trade possible. Step 3 — <b>desperation</b>: 4 unblocked damage would finish Vorthrax, so the Sentinel blocks the highest-power attacker, the Raider.", "The Spider is unblocked: 1 damage. Rain of Cinders, Vorthrax's last face-down card, goes to the Ruin. 1 → 0.", "<b>VICTORY</b> — with 4 cards left in your library."])}
<div class="box dark">
<h3>Debrief: five decisions that won the duel</h3>
<ol class="mini" style="margin:0">
<li><b>Crashhorn as a land</b> on turn 1: tempo over a dream card.</li>
<li><b>Holding the Hound</b> for the Ash Imp the Omen announced.</li>
<li><b>Leaving one Forest up</b> to save the Hound from Searing Breath.</li>
<li><b>Waiting at IV</b> until Ash Hide broke, then a full-damage Ultimate.</li>
<li><b>The Spider</b>: a blocker on their turn, the finishing blow on yours.</li>
</ol>
</div>
`;
  pages.push(page(ex4, 16));
  const gallery = [...EMBERKIN, ...WILDWOOD].map((c) => renderCard(c, "xs")).join("");
  pages.push(page(`
<h2>Card Gallery <small>THE 20 DIFFERENT GRIMOIRE CARDS</small></h2>
<div class="row center" style="gap:2.5mm; padding:0 2mm">${gallery}</div>
<p class="cap" style="margin-top:3mm">Top two rows: Emberkin (red). Bottom two rows: Wildwood (green). Reckless Goblin, Ember Bolt, Thicket Bear and Surge of Vigor come in two copies.</p>
`, 17));
  pages.push(page(`
<h2>Modes, Other Nemeses &amp; Tuning</h2>
<div class="cols">
<div>
<h3>Heroic mode</h3>
<p>Rotate the Nemesis card 180° during setup. Its Heroic half adds: <b>Nemesis creatures get +1/+0</b>. Every safe block suddenly becomes a trade.</p>
<h3>Solo puzzle</h3>
<p class="mini">Set the first 6 Threat cards in a known order and try to win in as few turns as possible. Share your record.</p>
</div>
<div>
<h3>The Gauntlet (campaign)</h3>
<ol class="mini">
<li>Face three Nemeses in a row with the same Grimoire.</li>
<li>After each victory, look at 3 random cards from a half-grimoire you aren't using and swap one of them into your Grimoire.</li>
<li>Your life resets between duels. Lose once and the Gauntlet ends.</li>
</ol>
</div>
</div>
<h3>Coming Nemeses</h3>
<div class="row" style="gap:5mm; flex-wrap:nowrap; align-items:center">
${otherNemesis("Morwen, the Lich Queen", "💀", "black", "<b>GRAVE TITHE</b> — At the end of each turn, if the Ruin holds 3+ creatures, return the highest-power one to the Table.", "<b>WITHERING</b> — Your creatures get −1/−1.")}
${otherNemesis("The Mirror Archmage", "🪞", "blue", "<b>REFRACTION</b> — The first spell you cast each turn costs {1} more.".replaceAll("{1}", pips("{1}")), "<b>MIRROR WARD</b> — The first spell you cast each turn is countered unless you pay {2}.".replaceAll("{2}", pips("{2}")))}
<div class="box" style="flex:1">
<p><b>Vorthrax</b> is aggro: it races you with haste and burn.</p>
<p><b>Morwen</b> is attrition: her dead creatures keep coming back, so removal alone won't win.</p>
<p style="margin:0"><b>The Mirror Archmage</b> is control: it taxes and counters your spells, rewarding cheap cards and bluffing with lands.</p>
</div>
</div>
<div class="box">
<h3>Designer notes: tuning knobs for playtesting</h3>
<table style="margin:1mm 0 0">
<tr><th>Knob</th><th>Default</th><th>Turn it up if…</th><th>Turn it down if…</th></tr>
<tr><td>Threat deck size</td><td>15 (14 life)</td><td>you win before round 5</td><td>you never reach Phase 2</td></tr>
<tr><td>Ash Hide</td><td>2 per turn</td><td>early aggro is too strong</td><td>Phase 1 feels like a wall</td></tr>
<tr><td>Smolder / Inferno</td><td>1 / 2</td><td>you win with 10+ life left</td><td>you lose before casting 4 spells</td></tr>
<tr><td>Opening hand</td><td>4</td><td>you often miss land drops</td><td>turn 1–2 feel scripted</td></tr>
<tr><td>Rekindle</td><td>3 cards</td><td>Phase 2 ends in one turn</td><td>Phase 2 drags on</td></tr>
</table>
</div>
`, 18));
  pages.push(page(`
<h2>Card Lists</h2>
<h3>Emberkin (red) — back: Mountain</h3>
<table class="lists"><tr><th>#</th><th>Name</th><th>Cost</th><th>Type</th><th>P/T</th><th>Text</th></tr>${cardListRows(EMBERKIN)}</table>
<h3>Wildwood (green) — back: Forest</h3>
<table class="lists"><tr><th>#</th><th>Name</th><th>Cost</th><th>Type</th><th>P/T</th><th>Text</th></tr>${cardListRows(WILDWOOD)}</table>
<h3>Vorthrax's Threat deck</h3>
<table class="lists"><tr><th>#</th><th>Name</th><th>Cost</th><th>Type</th><th>P/T</th><th>Text</th></tr>${cardListRows(VORTHRAX_THREATS)}</table>
`, 19));
  pages.push(page(`
<h2>Quick Reference</h2>
<div class="quickref cols">
<div>
<div class="box"><h3>Your turn</h3><ol>
<li>Untap (raise everything).</li><li>Draw 1 (−1 life; skip on turn 1).</li>
<li>Main: 1 land, spells, Kael once.</li><li>Combat.</li><li>Second main.</li><li>End: hand ≤ 5, damage wears off.</li></ol></div>
<div class="box"><h3>Nemesis turn</h3><ol>
<li>Untap.</li><li>Execute the Omen.</li><li>Reveal a new Omen (−1 life).</li><li>Attack (you block, instants allowed).</li><li>End-of-turn ability. Damage wears off.</li></ol></div>
<div class="box"><h3>Win &amp; lose</h3><ol>
<li>Vorthrax has 0 face-down Threat cards → <b>you win</b>.</li><li>Your library has 0 cards → <b>you lose</b>.</li></ol></div>
</div>
<div>
<div class="box dark"><h3>Nemesis mind</h3><ol>
<li><b>Attack</b> with every able creature, unless you could block it, kill it and survive.</li>
<li><b>Block:</b> safe block → trade → desperation (only if lethal).</li>
<li><b>Target</b> your highest-power creature (then toughness, then leftmost); none → you.</li>
<li><b>Overflow:</b> 5th creature hits you for its power instead.</li></ol></div>
<div class="box"><h3>Hands</h3><ol>
<li><b>Lowered</b> = tapped. <b>Raised</b> = untapped.</li>
<li><b>Damage N</b>: N library cards → graveyard.</li>
<li><b>Gain N</b>: N graveyard cards → library bottom.</li>
<li><b>Hit Vorthrax N</b>: N cards behind the Omen → Ruin.</li></ol></div>
<div class="box"><h3>Kael</h3><ol>
<li>Charge +1 · Discharge −2 (III–IV) · Ultimate (IV → I).</li>
<li>Once per turn, in a main phase.</li></ol></div>
</div>
</div>
`, 20));
  return pages;
}
