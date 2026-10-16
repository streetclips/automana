import assert from 'node:assert/strict';
import { chooseAction } from '../ai';
import {
  applyAction,
  castBlocker,
  createScenario,
  getCardDef,
  registerCard,
  type CardDef,
  type GameState,
  type ScenarioSpec,
  type Target,
} from '../engine';
import { nemesisDrawStep } from '../engine/nemesis';
import './challenges';
import { nemesisAction } from './mind';

const TEST_CARDS: CardDef[] = [
  { id: 'zc_land', name: 'Test Land', types: ['land'], mana: ['W', 'U', 'B', 'R', 'G'] },
  {
    id: 'zc_blast',
    name: 'Test Blast',
    types: ['instant'],
    cost: '{1}',
    spell: { targets: [{ kind: 'any' }], effects: [{ kind: 'damage', amount: 3, to: 0 }] },
  },
  {
    id: 'zc_murder',
    name: 'Test Murder',
    types: ['instant'],
    cost: '{1}',
    spell: { targets: [{ kind: 'creature' }], effects: [{ kind: 'destroy', to: 0 }] },
  },
  {
    id: 'zc_shatter',
    name: 'Test Shatter',
    types: ['instant'],
    cost: '{1}',
    spell: { targets: [{ kind: 'permanent', types: ['artifact'] }], effects: [{ kind: 'destroy', to: 0 }] },
  },
];
for (const def of TEST_CARDS) registerCard(def);

let passed = 0;

function test(name: string, run: () => void): void {
  run();
  passed += 1;
  console.log(`ok - ${name}`);
}

function idsOf(s: GameState, def: string): string[] {
  return Object.values(s.cards)
    .filter((card) => card.def === def)
    .map((card) => card.id)
    .sort();
}

function idOf(s: GameState, def: string): string {
  const [id] = idsOf(s, def);
  assert.ok(id, `no ${def} in the game`);
  return id;
}

function step(s: GameState): GameState {
  const pending = s.pending;
  assert.ok(pending && pending.kind !== 'gameOver', 'the game is over');
  if (s.players[pending.player].nemesis) return applyAction(s, nemesisAction(s, pending.player));
  if (pending.kind === 'priority') return applyAction(s, { type: 'pass', player: pending.player });
  if (pending.kind === 'declareAttackers') return applyAction(s, { type: 'declareAttackers', player: 0, attackers: [] });
  if (pending.kind === 'declareBlockers') return applyAction(s, { type: 'declareBlockers', player: 0, blocks: [] });
  return applyAction(s, chooseAction(s, pending.player));
}

function playUntil(s: GameState, until: (state: GameState) => boolean): GameState {
  let state = s;
  for (let guard = 0; guard < 300 && !until(state); guard++) state = step(state);
  assert.ok(until(state), 'condition never reached');
  return state;
}

function settle(s: GameState): GameState {
  return playUntil(s, (state) => state.stack.length === 0 && state.pending?.kind === 'priority');
}

function cast(s: GameState, card: string, target: Target): GameState {
  return settle(applyAction(s, { type: 'cast', player: 0, card, targets: [target] }));
}

function scenario(spec: ScenarioSpec): GameState {
  const nemesis = spec.players[1] ?? {};
  return createScenario({ ...spec, players: [spec.players[0], { ...nemesis, nemesis: true }] });
}

const caster = { battlefield: ['zc_land', 'zc_land', 'zc_land'] };

test("a Stampede artifact put into a graveyard gives the player its Hero's Reward", () => {
  let s = scenario({ players: [{ ...caster, hand: ['zc_shatter'] }, { battlefield: ['ch_spring_draught'] }] });
  s = cast(s, idOf(s, 'zc_shatter'), { card: idOf(s, 'ch_spring_draught') });
  assert.equal(s.players[0].life, 25);
});

test('Blood Frenzy pumps the attacking Minotaurs and destroys them at end of combat', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{}, { hand: ['ch_blood_frenzy'], battlefield: ['ch_hornbound_whelp'], library: Array(5).fill('ch_hornbound_reaver') }],
  });
  s = playUntil(s, (state) => state.step === 'main2');
  assert.equal(s.players[0].life, 16);
  assert.ok(s.players[1].graveyard.includes(idOf(s, 'ch_hornbound_whelp')));
});

test("the Revel King can't leave while a Reveler is on the battlefield, and the player wins when it leaves", () => {
  let s = scenario({
    players: [{ ...caster, hand: ['zc_murder', 'zc_murder', 'zc_murder'] }, { battlefield: ['ch_revel_king', 'ch_drunken_throng'] }],
  });
  const [first, second, third] = idsOf(s, 'zc_murder') as [string, string, string];
  s = cast(s, first, { card: idOf(s, 'ch_revel_king') });
  assert.ok(s.players[1].battlefield.includes(idOf(s, 'ch_revel_king')));
  s = cast(s, second, { card: idOf(s, 'ch_drunken_throng') });
  s = applyAction(s, { type: 'cast', player: 0, card: third, targets: [{ card: idOf(s, 'ch_revel_king') }] });
  s = playUntil(s, (state) => state.pending?.kind === 'gameOver');
  assert.deepEqual(s.pending, { kind: 'gameOver', winner: 0, reason: 'challenge' });
});

test('the Revel King reveals one more card each turn while there are three or more Revelers', () => {
  const library = Array(4).fill('ch_kings_strike');
  const few = scenario({ activePlayer: 1, players: [{}, { battlefield: ['ch_revel_king', 'ch_drunken_throng', 'ch_drunken_throng'], library }] });
  nemesisDrawStep(few, 1);
  assert.equal(few.players[1].hand.length, 1);
  const party = scenario({ activePlayer: 1, players: [{}, { battlefield: ['ch_revel_king', 'ch_drunken_throng', 'ch_drunken_throng', 'ch_drunken_throng'], library }] });
  nemesisDrawStep(party, 1);
  assert.equal(party.players[1].hand.length, 2);
});

test('Frenzied Piper entering makes the Revel King attack this turn', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{}, { hand: ['ch_frenzied_piper'], battlefield: ['ch_revel_king'], library: Array(5).fill('ch_kings_strike') }],
  });
  s = playUntil(s, (state) => state.step === 'main2');
  assert.equal(s.players[0].life, 20 - (getCardDef('ch_revel_king').power ?? 0));
});

test('a Head that dies reveals two cards: Heads enter, the rest goes to the graveyard', () => {
  let s = scenario({
    players: [
      { ...caster, hand: ['zc_blast'] },
      { battlefield: ['ch_lesser_head', 'ch_brute_head'], library: ['ch_lesser_head', 'ch_weak_spot', 'ch_lesser_head'] },
    ],
  });
  const [dying] = s.players[1].battlefield;
  s = cast(s, idOf(s, 'zc_blast'), { card: dying as string });
  const heads = s.players[1].battlefield.map((id) => s.cards[id]?.def);
  assert.deepEqual(heads.sort(), ['ch_brute_head', 'ch_lesser_head']);
  assert.ok(s.players[1].graveyard.includes(idOf(s, 'ch_weak_spot')));
  assert.equal(s.players[1].library.length, 1);
  assert.equal(s.players[0].life, 22);
});

test('at the start of its combat each untapped Head deals 1 damage, and Heads never attack', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{}, { battlefield: ['ch_lesser_head', 'ch_brute_head', { card: 'ch_lesser_head', tapped: true }], library: Array(5).fill('ch_iron_scales') }],
  });
  s = playUntil(s, (state) => state.step === 'main2');
  assert.equal(s.players[0].life, 18);
  assert.equal(s.combat, null);
});

test("Dazing Gaze stops the player from casting spells until the Hydra's next turn", () => {
  let s = scenario({
    activePlayer: 1,
    players: [{ ...caster, hand: ['zc_blast'] }, { hand: ['ch_dazing_gaze'], battlefield: ['ch_brute_head'], library: Array(5).fill('ch_iron_scales') }],
  });
  s = playUntil(s, (state) => state.activePlayer === 0 && state.step === 'main1' && state.pending?.kind === 'priority');
  assert.deepEqual(castBlocker(s, 0, idOf(s, 'zc_blast')), { code: 'silenced' });
  s = playUntil(s, (state) => state.activePlayer === 1 && state.step === 'main1');
  assert.equal(s.players[0].silenced, false);
});

console.log(`\nall ${passed} passed`);
