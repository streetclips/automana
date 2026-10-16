import assert from 'node:assert/strict';
import { chooseAction } from '../ai';
import {
  applyAction,
  castBlocker,
  createGame,
  createScenario,
  getCardDef,
  registerCard,
  type CardDef,
  type GameState,
  type ScenarioSpec,
  type Target,
} from '../engine';
import { challengeDrawStep } from '../engine/challenge';
import { CHALLENGES } from './challenges';
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
    id: 'zc_unsummon',
    name: 'Test Unsummon',
    types: ['instant'],
    cost: '{1}',
    spell: { targets: [{ kind: 'creature' }], effects: [{ kind: 'bounce', to: 0 }] },
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

function scenario(kind: 'horde' | 'god' | 'hydra', spec: ScenarioSpec): GameState {
  const nemesis = spec.players[1] ?? {};
  return createScenario({ ...spec, players: [spec.players[0], { ...nemesis, challenge: kind }] });
}

const caster = { battlefield: ['zc_land', 'zc_land'] };

test('damage to the Horde mills that many cards, and its life is its library plus its creatures', () => {
  let s = scenario('horde', {
    players: [{ ...caster, hand: ['zc_blast'] }, { battlefield: ['ch_hornbound_whelp'], library: Array(5).fill('ch_hornbound_whelp') }],
  });
  assert.equal(s.players[1].life, 6);
  s = cast(s, idOf(s, 'zc_blast'), { player: 1 });
  assert.equal(s.players[1].library.length, 2);
  assert.equal(s.players[1].graveyard.length, 3);
  assert.equal(s.players[1].life, 3);
});

test("a Horde artifact milled from the library gives the player its Hero's Reward", () => {
  let s = scenario('horde', {
    players: [
      { ...caster, hand: ['zc_blast'] },
      { library: ['ch_spring_draught', 'ch_hornbound_whelp', 'ch_hornbound_whelp', 'ch_hornbound_whelp'] },
    ],
  });
  s = cast(s, idOf(s, 'zc_blast'), { player: 1 });
  assert.equal(s.players[0].life, 25);
});

test('the player wins when the Horde has no library and no creatures', () => {
  let s = scenario('horde', { players: [{ ...caster, hand: ['zc_blast'] }, { library: ['ch_hornbound_whelp'] }] });
  s = applyAction(s, { type: 'cast', player: 0, card: idOf(s, 'zc_blast'), targets: [{ player: 1 }] });
  s = playUntil(s, (state) => state.pending?.kind === 'gameOver');
  assert.deepEqual(s.pending, { kind: 'gameOver', winner: 0, reason: 'life' });
});

test("the player takes the Stampede's head-start turns before its first turn", () => {
  const stampede = CHALLENGES.find((deck) => deck.id === 'stampede');
  assert.ok(stampede);
  let s = createGame({
    seed: 3,
    players: [{ deck: Array(40).fill('zc_land') }, { deck: stampede.threats, nemesis: true, challenge: 'horde', headStart: stampede.headStart }],
  });
  s = playUntil(s, (state) => state.activePlayer === 1);
  assert.equal(s.turn, (stampede.headStart ?? 0) + 2);
});

test('the Horde reveals two cards and one more for each of its artifacts', () => {
  const s = scenario('horde', {
    players: [{}, { battlefield: ['ch_looted_idol'], library: Array(6).fill('ch_hornbound_whelp') }],
  });
  challengeDrawStep(s, 1, 'horde');
  assert.equal(s.players[1].hand.length, 3);
});

test('Blood Frenzy pumps the attacking Minotaurs and destroys them at end of combat', () => {
  let s = scenario('horde', {
    activePlayer: 1,
    players: [{}, { hand: ['ch_blood_frenzy'], battlefield: ['ch_hornbound_whelp'], library: Array(5).fill('ch_hornbound_reaver') }],
  });
  s = playUntil(s, (state) => state.step === 'main2');
  assert.equal(s.players[0].life, 16);
  assert.ok(s.players[1].graveyard.includes(idOf(s, 'ch_hornbound_whelp')));
});

test("a Challenge permanent that would go to its owner's hand goes to the graveyard", () => {
  let s = scenario('horde', { players: [{ ...caster, hand: ['zc_unsummon'] }, { battlefield: ['ch_hornbound_whelp'] }] });
  s = cast(s, idOf(s, 'zc_unsummon'), { card: idOf(s, 'ch_hornbound_whelp') });
  assert.deepEqual(s.players[1].graveyard, [idOf(s, 'ch_hornbound_whelp')]);
});

test("the Revel King can't leave while a Reveler is on the battlefield, and the player wins when it leaves", () => {
  let s = scenario('god', {
    players: [{ ...caster, battlefield: [...caster.battlefield, 'zc_land'], hand: ['zc_murder', 'zc_murder', 'zc_murder'] }, { battlefield: ['ch_revel_king', 'ch_drunken_throng'] }],
  });
  const [first, second, third] = idsOf(s, 'zc_murder') as [string, string, string];
  s = cast(s, first, { card: idOf(s, 'ch_revel_king') });
  assert.ok(s.players[1].battlefield.includes(idOf(s, 'ch_revel_king')));
  s = cast(s, second, { card: idOf(s, 'ch_drunken_throng') });
  s = applyAction(s, { type: 'cast', player: 0, card: third, targets: [{ card: idOf(s, 'ch_revel_king') }] });
  s = playUntil(s, (state) => state.pending?.kind === 'gameOver');
  assert.deepEqual(s.pending, { kind: 'gameOver', winner: 0, reason: 'challenge' });
});

test('damage to the Revel King player goes to a Reveler it can kill, not to the King', () => {
  let s = scenario('god', { players: [{ ...caster, hand: ['zc_blast'] }, { battlefield: ['ch_revel_king', 'ch_drunken_throng'] }] });
  s = cast(s, idOf(s, 'zc_blast'), { player: 1 });
  assert.ok(s.players[1].graveyard.includes(idOf(s, 'ch_drunken_throng')));
  assert.equal(s.cards[idOf(s, 'ch_revel_king')]?.damage, 0);
});

test('Frenzied Piper entering makes the Revel King attack this turn', () => {
  let s = scenario('god', {
    activePlayer: 1,
    players: [{}, { hand: ['ch_frenzied_piper'], battlefield: ['ch_revel_king'], library: Array(5).fill('ch_kings_strike') }],
  });
  s = playUntil(s, (state) => state.step === 'main2');
  assert.equal(s.players[0].life, 20 - (getCardDef('ch_revel_king').power ?? 0));
});

test('damage to the Hydra kills a Head, and the Head that leaves reveals two cards: Heads enter, sorceries go to the graveyard', () => {
  let s = scenario('hydra', {
    players: [
      { ...caster, hand: ['zc_blast'] },
      { battlefield: ['ch_lesser_head', 'ch_brute_head'], library: ['ch_lesser_head', 'ch_weak_spot', 'ch_lesser_head'] },
    ],
  });
  s = cast(s, idOf(s, 'zc_blast'), { player: 1 });
  const heads = s.players[1].battlefield.map((id) => s.cards[id]?.def);
  assert.deepEqual(heads.sort(), ['ch_brute_head', 'ch_lesser_head']);
  assert.ok(s.players[1].graveyard.includes(idOf(s, 'ch_weak_spot')));
  assert.equal(s.players[1].library.length, 1);
  assert.equal(s.players[0].life, 22);
});

test('on its turn each untapped Head deals 1 damage to the player, and each elite Head 2', () => {
  let s = scenario('hydra', {
    activePlayer: 1,
    players: [{}, { battlefield: ['ch_lesser_head', 'ch_brute_head', { card: 'ch_lesser_head', tapped: true }], library: Array(5).fill('ch_weak_spot') }],
  });
  s = playUntil(s, (state) => state.step === 'main2');
  assert.equal(s.players[0].life, 17);
});

test('the player wins at the end of a turn with no Heads on the battlefield', () => {
  let s = scenario('hydra', {
    players: [{ ...caster, hand: ['zc_blast'] }, { battlefield: ['ch_lesser_head'], library: ['ch_dazing_gaze', 'ch_dazing_gaze'] }],
  });
  s = cast(s, idOf(s, 'zc_blast'), { player: 1 });
  assert.equal(s.pending?.kind, 'priority');
  s = playUntil(s, (state) => state.pending?.kind === 'gameOver');
  assert.deepEqual(s.pending, { kind: 'gameOver', winner: 0, reason: 'challenge' });
  assert.equal(s.turn, 3);
});

test("Dazing Gaze stops the player from casting spells until the Hydra's next turn", () => {
  let s = scenario('hydra', {
    activePlayer: 1,
    players: [{ ...caster, hand: ['zc_blast'] }, { hand: ['ch_dazing_gaze'], battlefield: ['ch_brute_head'], library: Array(5).fill('ch_iron_scales') }],
  });
  s = playUntil(s, (state) => state.activePlayer === 0 && state.step === 'main1' && state.pending?.kind === 'priority');
  assert.deepEqual(castBlocker(s, 0, idOf(s, 'zc_blast')), { code: 'silenced' });
  s = playUntil(s, (state) => state.activePlayer === 1 && state.step === 'main1');
  assert.equal(s.players[0].silenced, false);
});

console.log(`\nall ${passed} passed`);
