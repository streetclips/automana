import assert from 'node:assert/strict';
import { chooseAction } from '../ai';
import {
  applyAction,
  castBlocker,
  cloneState,
  createGame,
  createScenario,
  getCard,
  getCardDef,
  registerCard,
  type Action,
  type CardDef,
  type GameState,
  type ScenarioSpec,
} from '../engine';
import { nemesisDrawStep } from '../engine/nemesis';
import { hideFaceDownThreats, nemesisAction, nemesisAttackers, nemesisBlocks, nemesisTargets } from './mind';
import { NEMESES, getNemesis } from './threats';

const TEST_CARDS: CardDef[] = [
  { id: 'zz_land', name: 'Test Land', types: ['land'], mana: ['W', 'U', 'B', 'R', 'G'] },
  { id: 'zz_bear', name: 'Test Bear', types: ['creature'], cost: '{1}', power: 2, toughness: 2 },
  { id: 'zz_knight', name: 'Test Knight', types: ['creature'], cost: '{1}', power: 4, toughness: 4 },
  { id: 'zz_giant', name: 'Test Giant', types: ['creature'], cost: '{1}', power: 5, toughness: 5 },
  {
    id: 'zz_shield',
    name: 'Test Shield',
    types: ['creature'],
    cost: '{1}',
    power: 4,
    toughness: 4,
    keywords: ['hexproof'],
  },
  {
    id: 'zz_lancer',
    name: 'Test Lancer',
    types: ['creature'],
    cost: '{1}',
    power: 3,
    toughness: 3,
    keywords: ['firstStrike'],
  },
  {
    id: 'zz_viper',
    name: 'Test Viper',
    types: ['creature'],
    cost: '{1}',
    power: 1,
    toughness: 1,
    keywords: ['deathtouch'],
  },
  {
    id: 'zz_bolt',
    name: 'Test Bolt',
    types: ['instant'],
    cost: '{1}',
    spell: { targets: [{ kind: 'any' }], effects: [{ kind: 'damage', amount: 2, to: 0 }] },
  },
  {
    id: 'zz_unsummon',
    name: 'Test Unsummon',
    types: ['instant'],
    cost: '{1}',
    spell: { targets: [{ kind: 'creature', controller: 'opponent' }], effects: [{ kind: 'bounce', to: 0 }] },
  },
  {
    id: 'zz_mind_rot',
    name: 'Test Mind Rot',
    types: ['sorcery'],
    cost: '{1}',
    spell: { targets: [], effects: [{ kind: 'discard', amount: 2, who: 'opponent' }] },
  },
  {
    id: 'zz_opt',
    name: 'Test Opt',
    types: ['instant'],
    cost: '{1}',
    spell: { targets: [], effects: [{ kind: 'draw', amount: 1 }] },
  },
];
for (const def of TEST_CARDS) registerCard(def);

let passed = 0;
const PINNED_THREATS: Record<string, [number, number]> = {
  nm_ash_imp: [1, 2],
  nm_magma_sentinel: [1, 5],
  nm_cinderclaw_brute: [4, 3],
  nm_lava_behemoth: [5, 6],
  nm_scorch_fiend: [5, 4],
  nm_armored_drone: [2, 3],
  nm_darting_wasp: [2, 2],
  nm_ravenous_larva: [1, 2],
  nm_wandering_skeleton: [1, 2],
  nm_water_elemental: [3, 5],
  nm_refraction_golem: [1, 5],
  nm_inferno_charger: [5, 7],
};

for (const [id, [power, toughness]] of Object.entries(PINNED_THREATS))
  registerCard({ ...getCardDef(id), id: id.replace('nm_', 'zt_'), power, toughness });

function test(name: string, run: () => void): void {
  run();
  passed += 1;
  console.log(`ok - ${name}`);
}

function scenario(spec: ScenarioSpec): GameState {
  const nemesis = spec.players[1] ?? {};
  return createScenario({ ...spec, players: [spec.players[0], { ...nemesis, nemesis: true }] });
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

function act(s: GameState, action: Action): GameState {
  return applyAction(s, action);
}

function passAll(s: GameState, until: (state: GameState) => boolean): GameState {
  let state = s;
  for (let guard = 0; guard < 200 && !until(state); guard++) {
    const pending = state.pending;
    assert.ok(pending && pending.kind !== 'gameOver', 'the game ended early');
    if (pending.kind === 'priority') state = act(state, { type: 'pass', player: pending.player });
    else if (state.players[pending.player].nemesis) state = act(state, nemesisAction(state, pending.player));
    else if (pending.kind === 'declareAttackers') state = act(state, { type: 'declareAttackers', player: 0, attackers: [] });
    else if (pending.kind === 'declareBlockers') state = act(state, { type: 'declareBlockers', player: 0, blocks: [] });
    else state = act(state, chooseAction(state, pending.player));
  }
  assert.ok(until(state), 'condition never reached');
  return state;
}

function resolveStack(s: GameState): GameState {
  return passAll(s, (state) => state.stack.length === 0 && state.pending?.kind === 'priority');
}

test('the Nemesis has 20 life and a Threat deck in tiers from the top', () => {
  const nemesis = getNemesis('vorthrax');
  const s = createGame({ seed: 7, players: [{ deck: Array.from({ length: 40 }, () => 'zz_land') }, { deck: nemesis.threats, nemesis: true }] });
  assert.equal(s.players[1].library.length, 20);
  assert.equal(s.players[1].life, 20);
  assert.equal(s.players[1].hand.length, 0);
  const tiers = s.players[1].library.map((id) => getCardDef(getCard(s, id).def).threat?.tier ?? 0);
  assert.deepEqual(tiers, [...tiers].sort((a, b) => a - b));
  assert.equal(s.startingPlayer, 0);
  for (const deck of NEMESES) assert.equal(deck.threats.length, 20, deck.id);
});

test('the player takes the first turn and skips that draw', () => {
  const nemesis = getNemesis('morwen');
  let s = createGame({ seed: 3, players: [{ deck: Array.from({ length: 40 }, () => 'zz_land') }, { deck: nemesis.threats, nemesis: true }] });
  assert.equal(s.pending?.kind, 'mulligan');
  s = act(s, { type: 'keep', player: 0 });
  assert.equal(s.turn, 1);
  assert.equal(s.activePlayer, 0);
  assert.equal(s.players[0].hand.length, 7);
  assert.equal(s.players[1].hand.length, 0);
});

test('damage lowers the Nemesis life and leaves its Threat deck alone', () => {
  let s = scenario({
    players: [{ hand: ['zz_bolt'], battlefield: ['zz_land'] }, { library: ['zt_ash_imp', 'zt_cinderclaw_brute', 'zt_lava_behemoth', 'zt_scorch_fiend'] }],
  });
  const library = [...s.players[1].library];
  s = act(s, { type: 'cast', player: 0, card: idOf(s, 'zz_bolt'), targets: [{ player: 1 }] });
  s = resolveStack(s);
  assert.equal(s.players[1].life, 18);
  assert.deepEqual(s.players[1].library, library);
  assert.deepEqual(s.players[1].graveyard, []);
});

test('Nemesis spells go face-down to the bottom after resolving', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{ battlefield: ['zz_bear'] }, { hand: ['nm_searing_breath'], library: ['zt_ash_imp', 'zt_cinderclaw_brute'] }],
  });
  const breath = idOf(s, 'nm_searing_breath');
  s = act(s, nemesisAction(s, 1));
  assert.equal(s.stack.length, 1);
  s = resolveStack(s);
  assert.equal(s.players[1].library.at(-1), breath);
  assert.equal(s.players[1].life, 20);
  assert.equal(s.players[0].battlefield.includes(idOf(s, 'zz_bear')), false);
});

test('overflow: a fifth creature hits the player for its power and goes to the bottom', () => {
  const s = scenario({
    activePlayer: 1,
    players: [{}, { battlefield: ['zt_ash_imp', 'zt_ash_imp', 'zt_ash_imp', 'zt_magma_sentinel'], library: ['zt_lava_behemoth', 'zt_ash_imp', 'zt_cinderclaw_brute'] }],
  });
  const behemoth = idOf(s, 'zt_lava_behemoth');
  const t = cloneState(s);
  nemesisDrawStep(t, 1);
  assert.equal(t.players[0].life, 20 - (getCardDef('zt_lava_behemoth').power ?? 0));
  assert.equal(t.players[1].library.at(-1), behemoth);
  assert.equal(t.players[1].hand.length, 0);
  assert.equal(t.players[1].overflows, 1);
});

test('attack rule: stay home only when a blocker could kill and survive', () => {
  const base = { activePlayer: 1 as const, players: [{}, { battlefield: ['zt_cinderclaw_brute'] }] as ScenarioSpec['players'] };
  const brute = (s: GameState): string => idOf(s, 'zt_cinderclaw_brute');
  let s = scenario({ ...base, players: [{ battlefield: ['zz_bear'] }, base.players[1]] });
  assert.deepEqual(nemesisAttackers(s, 1), [brute(s)]);
  s = scenario({ ...base, players: [{ battlefield: ['zz_giant'] }, base.players[1]] });
  assert.deepEqual(nemesisAttackers(s, 1), []);
  s = scenario({ ...base, players: [{ battlefield: [{ card: 'zz_giant', tapped: true }] }, base.players[1]] });
  assert.deepEqual(nemesisAttackers(s, 1), [brute(s)]);
  s = scenario({ ...base, players: [{ battlefield: ['zz_viper'] }, base.players[1]] });
  assert.deepEqual(nemesisAttackers(s, 1), [brute(s)]);
  s = scenario({ ...base, players: [{ battlefield: ['zz_lancer'] }, base.players[1]] });
  assert.deepEqual(nemesisAttackers(s, 1), []);
  s = scenario({ activePlayer: 1, players: [{ battlefield: ['zz_giant'] }, { battlefield: ['zt_ash_imp'] }] });
  assert.deepEqual(nemesisAttackers(s, 1), [idOf(s, 'zt_ash_imp')]);
});

function attackWith(spec: ScenarioSpec, attackers: string[]): GameState {
  let s = scenario(spec);
  s = passAll(s, (state) => state.pending?.kind === 'declareAttackers');
  s = act(s, { type: 'declareAttackers', player: 0, attackers: attackers.map((def) => idOf(s, def)) });
  return passAll(s, (state) => state.pending?.kind === 'declareBlockers');
}

test('safe block takes the attacker it can kill and survive', () => {
  const s = attackWith(
    { players: [{ battlefield: ['zz_bear', 'zz_giant'] }, { battlefield: ['zt_water_elemental'] }] },
    ['zz_bear', 'zz_giant'],
  );
  assert.deepEqual(nemesisBlocks(s, 1), [{ blocker: idOf(s, 'zt_water_elemental'), attacker: idOf(s, 'zz_bear') }]);
});

test('trade blocks the strongest attacker it can kill even if it dies', () => {
  const s = attackWith(
    { players: [{ battlefield: ['zz_knight', 'zz_giant'] }, { battlefield: ['zt_cinderclaw_brute'] }] },
    ['zz_knight', 'zz_giant'],
  );
  assert.deepEqual(nemesisBlocks(s, 1), [{ blocker: idOf(s, 'zt_cinderclaw_brute'), attacker: idOf(s, 'zz_knight') }]);
});

test('desperation chump-blocks only when the damage would be lethal', () => {
  const lethal = attackWith({ players: [{ battlefield: ['zz_giant'] }, { life: 4, battlefield: ['zt_ash_imp'] }] }, ['zz_giant']);
  assert.deepEqual(nemesisBlocks(lethal, 1), [{ blocker: idOf(lethal, 'zt_ash_imp'), attacker: idOf(lethal, 'zz_giant') }]);
  const safe = attackWith({ players: [{ battlefield: ['zz_giant'] }, { battlefield: ['zt_ash_imp'] }] }, ['zz_giant']);
  assert.deepEqual(nemesisBlocks(safe, 1), []);
});

test('Nemesis targets: the strongest creature it can target, else the player', () => {
  let s = scenario({ activePlayer: 1, players: [{ battlefield: ['zz_bear', 'zz_knight', 'zz_shield'] }, {}] });
  assert.deepEqual(nemesisTargets(s, 1, [{ kind: 'any' }]), [{ card: idOf(s, 'zz_knight') }]);
  s = scenario({ activePlayer: 1, players: [{ battlefield: ['zz_shield'] }, {}] });
  assert.deepEqual(nemesisTargets(s, 1, [{ kind: 'any' }]), [{ player: 0 }]);
  s = scenario({ activePlayer: 1, players: [{ battlefield: ['zz_bear', 'tolarian_terror'] }, {}] });
  assert.deepEqual(nemesisTargets(s, 1, [{ kind: 'any' }]), [{ card: idOf(s, 'zz_bear') }]);
});

test('bouncing a Nemesis creature puts it on top of its Threat deck', () => {
  let s = scenario({
    players: [{ hand: ['zz_unsummon'], battlefield: ['zz_land'] }, { battlefield: ['zt_lava_behemoth'], library: ['zt_ash_imp', 'zt_cinderclaw_brute'] }],
  });
  const behemoth = idOf(s, 'zt_lava_behemoth');
  const [top] = s.players[1].library;
  s = act(s, { type: 'cast', player: 0, card: idOf(s, 'zz_unsummon'), targets: [{ card: behemoth }] });
  s = resolveStack(s);
  assert.equal(s.players[1].library[0], behemoth);
  assert.equal(s.players[1].library[1], top);
  assert.equal(s.players[1].life, 20);
});

test('making the Nemesis discard sends its top Threats to the Ruin', () => {
  let s = scenario({
    players: [{ hand: ['zz_mind_rot'], battlefield: ['zz_land'] }, { library: ['zt_ash_imp', 'zt_cinderclaw_brute', 'zt_scorch_fiend', 'zt_lava_behemoth'] }],
  });
  const [first, second, third, fourth] = s.players[1].library;
  s = act(s, { type: 'cast', player: 0, card: idOf(s, 'zz_mind_rot'), targets: [] });
  s = resolveStack(s);
  assert.deepEqual(s.players[1].library, [third, fourth]);
  assert.deepEqual(s.players[1].graveyard, [first, second]);
  assert.equal(s.players[1].life, 20);
});

test('Counterspell waits for the next spell, counters it, then goes to the bottom', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{ hand: ['zz_opt', 'zz_opt'], battlefield: ['zz_land', 'zz_land'], library: ['zz_land', 'zz_land', 'zz_land'] }, { hand: ['nm_counterspell'], library: ['zt_ash_imp', 'zt_cinderclaw_brute'] }],
  });
  const counter = idOf(s, 'nm_counterspell');
  s = act(s, nemesisAction(s, 1));
  s = resolveStack(s);
  assert.equal(getCard(s, counter).zone, 'battlefield');
  s = act(s, { type: 'pass', player: 1 });
  const [first, second] = idsOf(s, 'zz_opt');
  s = act(s, { type: 'cast', player: 0, card: first as string, targets: [] });
  assert.equal(getCard(s, first as string).zone, 'graveyard');
  assert.equal(s.players[1].library.at(-1), counter);
  s = resolveStack(s);
  const handBefore = s.players[0].hand.length;
  s = act(s, { type: 'cast', player: 0, card: second as string, targets: [] });
  s = resolveStack(s);
  assert.equal(s.players[0].hand.length, handBefore);
  assert.equal(getCard(s, second as string).zone, 'graveyard');
});

test('Refraction Golem: the first spell each turn costs 1 more', () => {
  let s = scenario({
    players: [{ hand: ['zz_opt', 'zz_opt'], battlefield: ['zz_land'] }, { battlefield: ['zt_refraction_golem'] }],
  });
  const [first] = idsOf(s, 'zz_opt');
  assert.equal(castBlocker(s, 0, first as string)?.code, 'notEnoughMana');
  s = scenario({
    players: [{ hand: ['zz_opt', 'zz_opt'], battlefield: ['zz_land', 'zz_land', 'zz_land'] }, { battlefield: ['zt_refraction_golem'] }],
  });
  const [a, b] = idsOf(s, 'zz_opt');
  s = act(s, { type: 'cast', player: 0, card: a as string, targets: [] });
  const untapped = s.players[0].battlefield.filter((id) => !getCard(s, id).tapped && getCard(s, id).def === 'zz_land');
  assert.equal(untapped.length, 1);
  s = resolveStack(s);
  assert.equal(castBlocker(s, 0, b as string), null);
});

test('Brood executes the creatures it reveals and sends the rest to the bottom', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{}, { hand: ['nm_brood'], library: ['zt_armored_drone', 'nm_pheromones', 'zt_darting_wasp', 'zt_ash_imp'] }],
  });
  const drone = idOf(s, 'zt_armored_drone');
  const pheromones = idOf(s, 'nm_pheromones');
  const brood = idOf(s, 'nm_brood');
  s = act(s, nemesisAction(s, 1));
  s = resolveStack(s);
  assert.equal(getCard(s, drone).zone, 'battlefield');
  assert.deepEqual(s.players[1].library.slice(-2), [pheromones, brood]);
  assert.equal(s.players[1].library[0], idOf(s, 'zt_darting_wasp'));
});

test('Egg Laying executes one creature, or sends a spell to the bottom', () => {
  let s = scenario({ activePlayer: 1, players: [{}, { hand: ['nm_egg_laying'], library: ['nm_insect_plague', 'zt_ash_imp', 'zt_armored_drone'] }] });
  const plague = idOf(s, 'nm_insect_plague');
  s = act(s, nemesisAction(s, 1));
  s = resolveStack(s);
  assert.equal(s.players[1].battlefield.length, 0);
  assert.equal(s.players[1].library.at(-2), plague);
});

test('Uprising returns the two strongest creatures from the Ruin; Exhume with an empty Ruin costs 2 life', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{}, { hand: ['nm_uprising'], graveyard: ['zt_ash_imp', 'zt_scorch_fiend', 'zt_cinderclaw_brute'], library: ['zt_ash_imp', 'zt_ash_imp'] }],
  });
  s = act(s, nemesisAction(s, 1));
  s = resolveStack(s);
  const back = s.players[1].battlefield.map((id) => getCard(s, id).def).sort();
  assert.deepEqual(back, ['zt_cinderclaw_brute', 'zt_scorch_fiend']);
  s = scenario({ activePlayer: 1, players: [{}, { hand: ['nm_exhume'], library: ['zt_ash_imp', 'zt_ash_imp'] }] });
  s = act(s, nemesisAction(s, 1));
  s = resolveStack(s);
  assert.equal(s.players[0].life, 18);
});

test('Nemesis lifelink gains it life', () => {
  let s = scenario({
    activePlayer: 1,
    players: [{}, { life: 10, battlefield: ['zt_ravenous_larva'], library: ['zt_ash_imp', 'zt_ash_imp'] }],
  });
  s = passAll(s, (state) => state.pending?.kind === 'declareAttackers');
  s = act(s, nemesisAction(s, 1));
  s = passAll(s, (state) => state.step === 'main2');
  assert.equal(s.players[0].life, 19);
  assert.equal(s.players[1].life, 11);
});

test('Wandering Skeleton goes to the bottom of its Threat deck when it dies', () => {
  let s = scenario({
    players: [{ hand: ['zz_bolt'], battlefield: ['zz_land'] }, { battlefield: ['zt_wandering_skeleton'], library: ['zt_ash_imp', 'zt_ash_imp'] }],
  });
  const skeleton = idOf(s, 'zt_wandering_skeleton');
  s = act(s, { type: 'cast', player: 0, card: idOf(s, 'zz_bolt'), targets: [{ card: skeleton }] });
  s = resolveStack(s);
  assert.equal(s.players[1].library.at(-1), skeleton);
  assert.equal(s.players[1].graveyard.length, 0);
  assert.equal(s.players[1].life, 20);
});

function chosenDef(s: GameState, action: Action): string | undefined {
  return action.type === 'cast' || action.type === 'playLand' ? s.cards[action.card]?.def : undefined;
}

test('the AI plays the land that lets it cast a spell this turn', () => {
  const s = scenario({
    players: [{ hand: ['plains', 'mountain', 'swab_goblin', 'moment_of_triumph', 'jazal_goldmane'], battlefield: ['plains'] }, {}],
  });
  assert.equal(chosenDef(s, chooseAction(s, 0)), 'mountain');
});

test('the AI casts an enchantment when it has mana to spare', () => {
  const s = scenario({ step: 'main2', players: [{ hand: ['goblin_oriflamme'], battlefield: ['zz_land', 'zz_land'] }, {}] });
  assert.equal(chosenDef(s, chooseAction(s, 0)), 'goblin_oriflamme');
});

test('the AI attacks into a safe block when a trick in hand wins the fight', () => {
  let s = scenario({
    players: [
      { hand: ['giant_growth'], battlefield: ['zz_land', 'zz_bear'] },
      { battlefield: ['zt_water_elemental'], library: Array.from({ length: 12 }, () => 'zt_ash_imp') },
    ],
  });
  s = passAll(s, (state) => state.pending?.kind === 'declareAttackers');
  assert.deepEqual(chooseAction(s, 0), { type: 'declareAttackers', player: 0, attackers: [idOf(s, 'zz_bear')] });
});

test('the AI keeps a blocker home when the next Threat could attack for lethal damage', () => {
  const library = (threat: string): string[] => Array.from({ length: 6 }, () => threat);
  let s = scenario({ players: [{ life: 4, battlefield: ['zz_knight'] }, { library: library('zt_inferno_charger') }] });
  s = passAll(s, (state) => state.pending?.kind === 'declareAttackers');
  assert.deepEqual(chooseAction(s, 0), { type: 'declareAttackers', player: 0, attackers: [] });
  s = scenario({ players: [{ life: 4, battlefield: ['zz_knight'] }, { library: library('zt_cinderclaw_brute') }] });
  s = passAll(s, (state) => state.pending?.kind === 'declareAttackers');
  assert.deepEqual(chooseAction(s, 0), { type: 'declareAttackers', player: 0, attackers: [idOf(s, 'zz_knight')] });
});

test('the AI sees the same Threat deck whatever its order', () => {
  const s = scenario({
    step: 'main2',
    players: [
      { hand: ['zz_bear', 'zz_knight'], battlefield: ['zz_land', 'zz_giant'] },
      { library: ['zt_inferno_charger', 'zt_ash_imp', 'nm_searing_breath', 'zt_cinderclaw_brute', 'zt_lava_behemoth'] },
    ],
  });
  const reversed = cloneState(s);
  reversed.players[1].library.reverse();
  assert.deepEqual(hideFaceDownThreats(s).players[1].library, hideFaceDownThreats(reversed).players[1].library);
  assert.deepEqual(chooseAction(s, 0), chooseAction(reversed, 0));
});

test('the AI decides the same whatever the order of the Threat deck', () => {
  const nemesis = getNemesis('vaskara');
  const s = createGame({ seed: 11, players: [{ deck: 'cats+goblins' }, { deck: nemesis.threats, nemesis: true }] });
  const shuffled = cloneState(s);
  shuffled.players[1].library.reverse();
  assert.deepEqual(chooseAction(s, 0), chooseAction(shuffled, 0));
});

console.log(`\nall ${passed} passed`);
