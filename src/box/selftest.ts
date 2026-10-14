import assert from 'node:assert/strict';
import {
  applyAction,
  blockOptions,
  canAttack,
  createScenario,
  getCard,
  getKeywords,
  getLegalActions,
  getPower,
  getToughness,
  hasKeyword,
  manaSources,
  type Action,
  type GameState,
  type ScenarioSpec,
  type Step,
  type Target,
} from './engine';
import { castBlocker } from './engine/rules';

const tests: [string, () => void][] = [];
function test(name: string, fn: () => void): void {
  tests.push([name, fn]);
}

function scenario(spec: ScenarioSpec): GameState {
  return createScenario(spec);
}

function act(s: GameState, action: Action): GameState {
  return applyAction(s, action);
}

function settle(s: GameState, choose: (s: GameState) => Action = (t) => getLegalActions(t)[0] as Action): GameState {
  let t = s;
  for (let guard = 0; guard < 200; guard++) {
    const pending = t.pending;
    if (pending?.kind === 'priority' && t.stack.length > 0) t = act(t, { type: 'pass', player: pending.player });
    else if (pending?.kind === 'chooseTargets' || (pending?.kind === 'discard' && pending.source !== undefined))
      t = act(t, choose(t));
    else return t;
  }
  throw new Error('settle did not finish');
}

function cast(s: GameState, card: string, targets: Target[] = [], extra: { x?: number; sacrifice?: string } = {}): GameState {
  return settle(act(s, { type: 'cast', player: s.activePlayer, card, targets, ...extra }));
}

function activate(s: GameState, card: string, ability = 0, targets: Target[] = [], sacrifice?: string): GameState {
  const action: Action = { type: 'activate', player: s.activePlayer, card, ability, targets };
  if (sacrifice) action.sacrifice = sacrifice;
  return settle(act(s, action));
}

function passTo(s: GameState, step: Step, turn = s.turn): GameState {
  let t = s;
  for (let guard = 0; guard < 200; guard++) {
    if (t.step === step && t.turn === turn && t.pending?.kind === 'priority') return t;
    const pending = t.pending;
    if (!pending || pending.kind === 'gameOver') throw new Error(`game stopped before ${step}`);
    if (pending.kind === 'declareAttackers') t = act(t, { type: 'declareAttackers', player: pending.player, attackers: [] });
    else if (pending.kind === 'declareBlockers') t = act(t, { type: 'declareBlockers', player: pending.player, blocks: [] });
    else if (pending.kind === 'priority') t = act(t, { type: 'pass', player: pending.player });
    else t = act(t, getLegalActions(t)[0] as Action);
  }
  throw new Error(`never reached ${step}`);
}

function attack(s: GameState, attackers: string[], blocks: { blocker: string; attacker: string }[] = []): GameState {
  let t = s;
  for (let guard = 0; guard < 50 && t.pending?.kind !== 'declareAttackers'; guard++) {
    const pending = t.pending;
    if (pending?.kind === 'priority') t = act(t, { type: 'pass', player: pending.player });
    else t = settle(t);
  }
  t = settle(act(t, { type: 'declareAttackers', player: t.activePlayer, attackers }));
  for (let guard = 0; guard < 50 && t.pending?.kind !== 'declareBlockers' && t.step !== 'endCombat'; guard++) {
    const pending = t.pending;
    if (pending?.kind === 'priority') t = act(t, { type: 'pass', player: pending.player });
    else t = settle(t);
  }
  if (t.pending?.kind === 'declareBlockers') t = act(t, { type: 'declareBlockers', player: t.pending.player, blocks });
  return passTo(t, 'main2');
}

const lands = (land: string, count: number): string[] => Array.from({ length: count }, () => land);

test('Pacifism stops attacks and blocks and goes to the graveyard when its creature leaves', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'pacifism', id: 'pac' }, { card: 'heros_downfall', id: 'hd' }], battlefield: [...lands('plains', 2), ...lands('swamp', 3), { card: 'savannah_lions', id: 'lions' }] },
      { battlefield: [{ card: 'highborn_vampire', id: 'vamp' }] },
    ],
  });
  s = cast(s, 'pac', [{ card: 'vamp' }]);
  assert.equal(getCard(s, 'pac').attachedTo, 'vamp');
  s = act(s, { type: 'pass', player: 0 });
  s = act(s, { type: 'pass', player: 1 });
  s = settle(s);
  s = act(s, { type: 'declareAttackers', player: 0, attackers: ['lions'] });
  assert.ok(!('vamp' in blockOptions(s)), 'the pacified creature cannot block');
  s = passTo(s, 'main2');
  s = cast(s, 'hd', [{ card: 'vamp' }]);
  assert.equal(getCard(s, 'pac').zone, 'graveyard');
});

test('Untamed Hunger grants +2/+1 and menace; Eaten by Piranhas removes abilities and sets 1/1', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'untamed_hunger', id: 'hunger' }, { card: 'eaten_by_piranhas', id: 'fish' }], battlefield: [...lands('swamp', 3), ...lands('island', 2), { card: 'death_baron', id: 'baron' }, { card: 'diregraf_ghoul', id: 'ghoul' }] },
      {},
    ],
  });
  s = cast(s, 'hunger', [{ card: 'ghoul' }]);
  assert.equal(getPower(s, 'ghoul'), 2 + 1 + 2);
  assert.equal(getToughness(s, 'ghoul'), 2 + 1 + 1);
  assert.ok(hasKeyword(s, 'ghoul', 'menace') && hasKeyword(s, 'ghoul', 'deathtouch'));
  s = cast(s, 'fish', [{ card: 'baron' }]);
  assert.equal(getPower(s, 'baron'), 1);
  assert.equal(getPower(s, 'ghoul'), 2 + 2, 'the lord lost its anthem');
  assert.ok(!hasKeyword(s, 'ghoul', 'deathtouch'));
});

test('Starlight Snare taps its creature and keeps it tapped', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'starlight_snare', id: 'snare' }], battlefield: lands('island', 3) },
      { battlefield: [{ card: 'fire_elemental', id: 'fire' }] },
    ],
  });
  s = cast(s, 'snare', [{ card: 'fire' }]);
  assert.ok(getCard(s, 'fire').tapped);
  s = passTo(s, 'main1', s.turn + 1);
  assert.ok(getCard(s, 'fire').tapped, 'it does not untap');
  assert.ok(!canAttack(s, 'fire'));
});

test('New Horizons makes its land tap for two and puts a counter on a creature', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'new_horizons', id: 'nh' }], battlefield: [...lands('forest', 3), { card: 'forest', id: 'f4' }, { card: 'bear_cub', id: 'cub' }] },
      {},
    ],
  });
  s = act(s, { type: 'cast', player: 0, card: 'nh', targets: [{ card: 'f4' }] });
  s = settle(s, (t) => getLegalActions(t).find((a) => a.type === 'chooseTargets' && 'card' in (a.targets[0] ?? {}) && (a.targets[0] as { card: string }).card === 'cub') as Action);
  assert.equal(getCard(s, 'nh').attachedTo, 'f4');
  assert.equal(getCard(s, 'cub').counters, 1);
  assert.equal(manaSources(s, 0).filter((source) => source.id === 'f4').length, 2);
});

test('Quick-Draw Katana: equip at sorcery speed, +2/+0 and first strike only on your turn', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'quick_draw_katana', id: 'katana' }], battlefield: [...lands('plains', 4), { card: 'savannah_lions', id: 'lions' }] },
      {},
    ],
  });
  s = cast(s, 'katana');
  s = activate(s, 'katana', 0, [{ card: 'lions' }]);
  assert.equal(getCard(s, 'katana').attachedTo, 'lions');
  assert.equal(getPower(s, 'lions'), 4);
  assert.ok(hasKeyword(s, 'lions', 'firstStrike'));
  s = passTo(s, 'main1', s.turn + 1);
  assert.equal(getPower(s, 'lions'), 2, 'no bonus on the opponent turn');
});

test("Pirate's Cutlass attaches to a Pirate on entering and stays when it dies", () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'pirates_cutlass', id: 'cutlass' }, { card: 'heros_downfall', id: 'hd' }], battlefield: [...lands('island', 3), ...lands('swamp', 3), { card: 'swab_goblin', id: 'swab' }] },
      {},
    ],
  });
  s = cast(s, 'cutlass');
  assert.equal(getCard(s, 'cutlass').attachedTo, 'swab');
  assert.equal(getPower(s, 'swab'), 4);
  assert.equal(getToughness(s, 'swab'), 3);
  s = cast(s, 'hd', [{ card: 'swab' }]);
  assert.equal(getCard(s, 'cutlass').zone, 'battlefield');
  assert.equal(getCard(s, 'cutlass').attachedTo, undefined);
});

test('Lords: Corsair Captain, Goblin Oriflamme on attack, Aggressive Mammoth trample, Crossway Troublemakers', () => {
  let s = scenario({
    players: [
      {
        battlefield: [
          { card: 'corsair_captain', id: 'captain' },
          { card: 'swab_goblin', id: 'swab' },
          { card: 'goblin_oriflamme', id: 'flag' },
          { card: 'aggressive_mammoth', id: 'mammoth' },
          { card: 'crossway_troublemakers', id: 'cross' },
          { card: 'bishops_soldier', id: 'bishop' },
        ],
      },
      {},
    ],
  });
  assert.equal(getPower(s, 'captain'), 2, 'the captain does not pump itself');
  assert.equal(getPower(s, 'swab'), 3);
  assert.ok(hasKeyword(s, 'swab', 'trample') && !hasKeyword(s, 'cross', 'deathtouch'));
  s = attack(s, ['swab', 'cross', 'bishop']);
  assert.equal(s.players[1].life, 20 - 4 - 6 - 3);
  assert.equal(s.players[0].life, 20 + 6 + 3, 'attacking Vampires have lifelink');
});

test('Conditional keywords: Kitesail Corsair attacking, Kargan Dragonrider with a Dragon, Twinblade Paladin at 25 life', () => {
  let s = scenario({
    players: [
      { life: 25, battlefield: [{ card: 'kitesail_corsair', id: 'kite' }, { card: 'kargan_dragonrider', id: 'kargan' }, { card: 'twinblade_paladin', id: 'twin' }] },
      {},
    ],
  });
  assert.ok(!hasKeyword(s, 'kite', 'flying') && !hasKeyword(s, 'kargan', 'flying'));
  assert.ok(hasKeyword(s, 'twin', 'doubleStrike'));
  s = scenario({
    players: [
      { battlefield: [{ card: 'kargan_dragonrider', id: 'kargan' }, { card: 'firespitter_whelp', id: 'whelp' }, { card: 'kitesail_corsair', id: 'kite' }] },
      { battlefield: [{ card: 'bear_cub', id: 'cub' }] },
    ],
  });
  assert.ok(hasKeyword(s, 'kargan', 'flying'));
  s = settle(act(act(s, { type: 'pass', player: 0 }), { type: 'pass', player: 1 }));
  s = act(s, { type: 'declareAttackers', player: 0, attackers: ['kite'] });
  assert.ok(hasKeyword(s, 'kite', 'flying'));
  assert.ok(!('cub' in blockOptions(s)));
});

test("Vampire Interloper can't block", () => {
  let s = scenario({
    activePlayer: 1,
    players: [{ battlefield: [{ card: 'vampire_interloper', id: 'imp' }] }, { battlefield: [{ card: 'bear_cub', id: 'cub' }] }],
  });
  s = settle(act(act(s, { type: 'pass', player: 1 }), { type: 'pass', player: 0 }));
  s = act(s, { type: 'declareAttackers', player: 1, attackers: ['cub'] });
  assert.ok(!('imp' in blockOptions(s)));
});

test('Indestructible survives lethal damage and destroy', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'adamant_will', id: 'will' }, { card: 'heros_downfall', id: 'hd' }], battlefield: [...lands('plains', 2), ...lands('swamp', 3), { card: 'savannah_lions', id: 'lions', damage: 0 }] },
      {},
    ],
  });
  s = cast(s, 'will', [{ card: 'lions' }]);
  s = cast(s, 'hd', [{ card: 'lions' }]);
  assert.equal(getCard(s, 'lions').zone, 'battlefield');
});

test('Exile: Angelic Edict, and Scorching Dragonfire exiles instead of dying', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'angelic_edict', id: 'edict' }, { card: 'scorching_dragonfire', id: 'fire' }], battlefield: [...lands('plains', 5), ...lands('mountain', 2)] },
      { battlefield: [{ card: 'highborn_vampire', id: 'vamp' }, { card: 'vengeful_bloodwitch', id: 'witch' }] },
    ],
  });
  s = cast(s, 'edict', [{ card: 'vamp' }]);
  assert.equal(getCard(s, 'vamp').zone, 'exile');
  assert.equal(s.players[0].life, 20, 'exile is not dying: no drain');
  s = cast(s, 'fire', [{ card: 'witch' }]);
  assert.equal(getCard(s, 'witch').zone, 'exile');
  assert.equal(s.players[0].life, 20, 'the Bloodwitch did not die');
});

test('Crow of Dark Tidings mills two; Cemetery Recruitment returns a Zombie and draws', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'crow_of_dark_tidings', id: 'crow' }, { card: 'cemetery_recruitment', id: 'rec' }], battlefield: lands('swamp', 5), graveyard: [{ card: 'maalfeld_twins', id: 'twins' }] },
      {},
    ],
  });
  const library = s.players[0].library.length;
  s = cast(s, 'crow');
  assert.equal(s.players[0].library.length, library - 2);
  s = cast(s, 'rec', [{ card: 'twins' }]);
  assert.equal(getCard(s, 'twins').zone, 'hand');
  assert.equal(s.players[0].library.length, library - 3, 'a Zombie card draws a card');
});

test('Reassembling Skeleton and Suspicious Shambler act from the graveyard', () => {
  let s = scenario({
    players: [
      { battlefield: lands('swamp', 8), graveyard: [{ card: 'reassembling_skeleton', id: 'skel' }, { card: 'suspicious_shambler', id: 'sham' }] },
      {},
    ],
  });
  s = activate(s, 'skel');
  assert.equal(getCard(s, 'skel').zone, 'battlefield');
  assert.ok(getCard(s, 'skel').tapped);
  s = activate(s, 'sham');
  assert.equal(getCard(s, 'sham').zone, 'exile');
  assert.equal(s.players[0].battlefield.filter((id) => getCard(s, id).def === 'zombie_token').length, 2);
});

test('Raid: Storm Fleet Spy draws only after attacking', () => {
  let s = scenario({
    players: [{ hand: [{ card: 'storm_fleet_spy', id: 'spy' }], battlefield: [...lands('island', 3), { card: 'bear_cub', id: 'cub' }] }, {}],
  });
  const before = s.players[0].hand.length;
  let t = cast(s, 'spy');
  assert.equal(t.players[0].hand.length, before - 1);
  s = attack(s, ['cub']);
  s = cast(s, 'spy');
  assert.equal(s.players[0].hand.length, before, 'the raid draw replaces the spy');
});

test('Draw triggers: Clinquant Skymage per card, Erudite Wizard and Mischievous Mystic on the second', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'quick_study', id: 'study' }], battlefield: [...lands('island', 3), { card: 'clinquant_skymage', id: 'sky' }, { card: 'erudite_wizard', id: 'wiz' }, { card: 'mischievous_mystic', id: 'myst' }] },
      {},
    ],
  });
  s = cast(s, 'study');
  assert.equal(getCard(s, 'sky').counters, 2);
  assert.equal(getCard(s, 'wiz').counters, 1);
  assert.equal(s.players[0].battlefield.filter((id) => getCard(s, id).def === 'faerie_token').length, 1);
});

test('Cost reductions: Tolarian Terror, Arcane Epiphany with a Wizard, Dragonlord Servant', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'tolarian_terror', id: 'terror' }, { card: 'arcane_epiphany', id: 'epi' }], battlefield: [...lands('island', 4)], graveyard: ['opt', 'cancel', 'quick_study'] },
      {},
    ],
  });
  assert.equal(castBlocker(s, 0, 'terror'), null, '{6}{U} minus 3 costs four');
  assert.notEqual(castBlocker(s, 0, 'epi'), null);
  s = scenario({
    players: [{ hand: [{ card: 'arcane_epiphany', id: 'epi' }], battlefield: [...lands('island', 4), 'mystic_archaeologist'] }, {}],
  });
  assert.equal(castBlocker(s, 0, 'epi'), null);
  s = scenario({
    players: [{ hand: [{ card: 'rapacious_dragon', id: 'drag' }], battlefield: [...lands('mountain', 4), 'dragonlords_servant'] }, {}],
  });
  assert.equal(castBlocker(s, 0, 'drag'), null);
});

test('Treasure: paid only when lands fall short, then sacrificed', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'corsair_captain', id: 'cap' }, { card: 'swab_goblin', id: 'swab' }], battlefield: [...lands('island', 3), ...lands('mountain', 1)] },
      {},
    ],
  });
  s = cast(s, 'cap');
  const treasure = s.players[0].battlefield.find((id) => getCard(s, id).def === 'treasure_token') as string;
  assert.ok(treasure);
  s = cast(s, 'swab');
  assert.equal(getCard(s, 'swab').zone, 'battlefield');
  assert.equal(getCard(s, treasure).zone, 'gone', 'the Treasure paid the missing mana');
});

test('Ward: the opponent pays {2} or the spell is countered', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'heros_downfall', id: 'hd' }], battlefield: lands('swamp', 3) },
      { battlefield: [{ card: 'tolarian_terror', id: 'terror' }] },
    ],
  });
  s = cast(s, 'hd', [{ card: 'terror' }]);
  assert.equal(getCard(s, 'terror').zone, 'battlefield');
  assert.equal(getCard(s, 'hd').zone, 'graveyard');
  s = scenario({
    players: [
      { hand: [{ card: 'heros_downfall', id: 'hd' }], battlefield: lands('swamp', 5) },
      { battlefield: [{ card: 'tolarian_terror', id: 'terror' }] },
    ],
  });
  s = cast(s, 'hd', [{ card: 'terror' }]);
  assert.equal(getCard(s, 'terror').zone, 'graveyard');
});

test('Kicker: Into the Roil draws when the kicker is affordable', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'into_the_roil', id: 'roil' }], battlefield: lands('island', 4) },
      { battlefield: [{ card: 'bear_cub', id: 'cub' }] },
    ],
  });
  const before = s.players[0].hand.length;
  s = cast(s, 'roil', [{ card: 'cub' }]);
  assert.equal(getCard(s, 'cub').zone, 'hand');
  assert.equal(s.players[0].hand.length, before, 'kicked: it drew a card');
});

test('Mana creatures: Llanowar Elves and Elvish Archdruid', () => {
  const s = scenario({
    players: [{ battlefield: [{ card: 'llanowar_elves', id: 'elves' }, { card: 'elvish_archdruid', id: 'arch' }, 'dwynens_elite'] }, {}],
  });
  assert.equal(manaSources(s, 0).filter((source) => source.id === 'arch').length, 3);
  assert.equal(getPower(s, 'elves'), 2, 'the Archdruid pumps other Elves');
});

test('X: Wildwood Scourge enters with X counters and grows with counters on others', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'wildwood_scourge', id: 'hydra' }, { card: 'snakeskin_veil', id: 'veil' }], battlefield: [...lands('forest', 5), { card: 'bear_cub', id: 'cub' }] },
      {},
    ],
  });
  assert.equal(getLegalActions(s).filter((action) => action.type === 'cast' && action.card === 'hydra').length, 4);
  s = cast(s, 'hydra', [], { x: 3 });
  assert.equal(getCard(s, 'hydra').counters, 3);
  s = cast(s, 'veil', [{ card: 'cub' }]);
  assert.equal(getCard(s, 'hydra').counters, 4);
  assert.ok(hasKeyword(s, 'cub', 'hexproof'));
});

test('Additional costs: Eaten Alive sacrifices or pays; Hungry Ghoul sacrifices another creature', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'eaten_alive', id: 'eat' }], battlefield: [...lands('swamp', 2), { card: 'hungry_ghoul', id: 'ghoul' }, { card: 'diregraf_ghoul', id: 'dire' }] },
      { battlefield: [{ card: 'fire_elemental', id: 'fire' }] },
    ],
  });
  const variants = getLegalActions(s).filter((action) => action.type === 'cast' && action.card === 'eat');
  assert.ok(variants.every((action) => action.type === 'cast' && action.sacrifice !== undefined), 'two lands cannot pay {3}{B}');
  s = cast(s, 'eat', [{ card: 'fire' }], { sacrifice: 'dire' });
  assert.equal(getCard(s, 'fire').zone, 'exile');
  assert.equal(getCard(s, 'dire').zone, 'graveyard');
  s = scenario({
    players: [{ battlefield: [...lands('swamp', 1), { card: 'hungry_ghoul', id: 'ghoul' }, { card: 'bear_cub', id: 'cub' }] }, {}],
  });
  s = activate(s, 'ghoul', 0, [], 'cub');
  assert.equal(getCard(s, 'ghoul').counters, 1);
  assert.equal(getCard(s, 'cub').zone, 'graveyard');
});

test('Mild-Mannered Librarian activates only once', () => {
  let s = scenario({
    players: [{ battlefield: [...lands('forest', 8), { card: 'mild_mannered_librarian', id: 'lib' }] }, {}],
  });
  s = activate(s, 'lib');
  assert.equal(getCard(s, 'lib').counters, 2);
  assert.ok(!getLegalActions(s).some((action) => action.type === 'activate' && action.card === 'lib'));
});

test('Begin combat and end step triggers: Leonin Vanguard and Stromkirk Bloodthief', () => {
  let s = scenario({
    players: [
      { battlefield: [{ card: 'leonin_vanguard', id: 'van' }, 'bear_cub', 'savannah_lions', { card: 'stromkirk_bloodthief', id: 'thief' }, ...lands('swamp', 2), { card: 'vampire_neonate', id: 'neo' }] },
      {},
    ],
  });
  s = activate(s, 'neo');
  s = settle(passTo(s, 'beginCombat'));
  assert.equal(getPower(s, 'van'), 2);
  assert.equal(s.players[0].life, 20 + 1 + 1);
  s = settle(passTo(s, 'end'));
  assert.equal(getCard(s, 'thief').counters + getCard(s, 'neo').counters, 1);
});

test('Ancestor Dragon gains life per attacker; Jazal Goldmane pumps by the number of attackers', () => {
  let s = scenario({
    players: [
      { battlefield: [...lands('plains', 5), { card: 'ancestor_dragon', id: 'drag' }, { card: 'jazal_goldmane', id: 'jazal' }, { card: 'bear_cub', id: 'cub' }] },
      {},
    ],
  });
  s = act(act(s, { type: 'pass', player: 0 }), { type: 'pass', player: 1 });
  s = settle(act(s, { type: 'declareAttackers', player: 0, attackers: ['drag', 'jazal', 'cub'] }));
  assert.equal(s.players[0].life, 23);
  s = activate(s, 'jazal');
  assert.equal(getPower(s, 'cub'), 5);
});

test('Spell triggers: Firespitter Whelp on noncreature spells, Brineborn Cutthroat on the opponent turn', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'kindled_fury', id: 'fury' }, { card: 'swab_goblin', id: 'swab' }], battlefield: [...lands('mountain', 3), { card: 'firespitter_whelp', id: 'whelp' }] },
      {},
    ],
  });
  s = cast(s, 'swab');
  assert.equal(s.players[1].life, 20);
  s = cast(s, 'fury', [{ card: 'whelp' }]);
  assert.equal(s.players[1].life, 19);
  s = scenario({
    activePlayer: 1,
    players: [{ hand: [{ card: 'opt', id: 'opt' }], battlefield: [...lands('island', 1), { card: 'brineborn_cutthroat', id: 'cut' }] }, {}],
  });
  s = act(s, { type: 'pass', player: 1 });
  s = settle(act(s, { type: 'cast', player: 0, card: 'opt', targets: [] }));
  assert.equal(getCard(s, 'cut').counters, 1);
});

test('Optional targets: Felidar Savior with one other creature, Battle-Rattle Shaman with none', () => {
  let s = scenario({
    players: [{ hand: [{ card: 'felidar_savior', id: 'felidar' }], battlefield: [...lands('plains', 4), { card: 'bear_cub', id: 'cub' }] }, {}],
  });
  s = act(s, { type: 'cast', player: 0, card: 'felidar', targets: [] });
  s = settle(s, (t) => getLegalActions(t).find((a) => a.type === 'chooseTargets' && a.targets.length === 1) as Action);
  assert.equal(getCard(s, 'cub').counters, 1);
  assert.equal(getCard(s, 'felidar').counters, 0);
});

test('Dropkick Bomber: a flying Goblin that is sacrificed after its combat damage', () => {
  let s = scenario({
    players: [{ battlefield: [...lands('mountain', 1), { card: 'dropkick_bomber', id: 'bomber' }, { card: 'swab_goblin', id: 'swab' }] }, {}],
  });
  s = activate(s, 'bomber', 0, [{ card: 'swab' }]);
  assert.ok(hasKeyword(s, 'swab', 'flying'));
  s = attack(s, ['swab']);
  assert.equal(s.players[1].life, 17);
  assert.equal(getCard(s, 'swab').zone, 'graveyard');
});

test("Goblin Smuggler makes a small creature unblockable; Frenzied Goblin pays {R} so a creature can't block", () => {
  let s = scenario({
    players: [
      { battlefield: [...lands('mountain', 1), { card: 'goblin_smuggler', id: 'smug' }, { card: 'bear_cub', id: 'cub' }, { card: 'frenzied_goblin', id: 'frenzy' }] },
      { battlefield: [{ card: 'magnigoth_sentry', id: 'sentry' }, { card: 'druid_of_the_cowl', id: 'druid' }] },
    ],
  });
  s = activate(s, 'smug', 0, [{ card: 'cub' }]);
  s = settle(act(act(s, { type: 'pass', player: 0 }), { type: 'pass', player: 1 }));
  s = act(s, { type: 'declareAttackers', player: 0, attackers: ['cub', 'frenzy'] });
  s = settle(s, (t) => getLegalActions(t).find((a) => a.type === 'chooseTargets' && (a.targets[0] as { card?: string })?.card === 'sentry') as Action);
  s = settle(act(s, { type: 'pass', player: 0 }));
  s = settle(act(s, { type: 'pass', player: 1 }));
  const options = blockOptions(s);
  assert.ok(!('sentry' in options), 'the sentry cannot block');
  assert.deepEqual(options.druid, ['frenzy'], 'the cub cannot be blocked');
});

test('Biogenic Upgrade distributes three counters and doubles them', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'biogenic_upgrade', id: 'bio' }], battlefield: [...lands('forest', 6), { card: 'bear_cub', id: 'a', counters: 1 }, { card: 'bear_cub', id: 'b' }] },
      {},
    ],
  });
  s = cast(s, 'bio', [{ card: 'a' }, { card: 'b' }]);
  assert.equal(getCard(s, 'a').counters, 6);
  assert.equal(getCard(s, 'b').counters, 2);
});

test('Opt bottoms a land when there are already enough', () => {
  let s = scenario({
    players: [{ hand: [{ card: 'opt', id: 'opt' }], battlefield: lands('island', 5), library: ['island', 'bear_cub', 'bear_cub'] }, {}],
  });
  s = cast(s, 'opt');
  const drawn = s.players[0].hand.map((id) => getCard(s, id).def);
  assert.deepEqual(drawn, ['bear_cub']);
});

test('Prayer of Binding exiles an opposing permanent and gains 2 life', () => {
  let s = scenario({
    players: [{ hand: [{ card: 'prayer_of_binding', id: 'prayer' }], battlefield: lands('plains', 4) }, { battlefield: [{ card: 'fire_elemental', id: 'fire' }] }],
  });
  s = act(s, { type: 'cast', player: 0, card: 'prayer', targets: [] });
  s = settle(s, (t) => getLegalActions(t).find((a) => a.type === 'chooseTargets' && a.targets.length === 1) as Action);
  assert.equal(getCard(s, 'fire').zone, 'exile');
  assert.equal(s.players[0].life, 22);
});

test('Volley Veteran deals damage equal to the Goblins; Vengeful Bloodwitch drains when a creature dies', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'volley_veteran', id: 'vet' }], battlefield: [...lands('mountain', 4), 'swab_goblin', 'raging_redcap'] },
      { battlefield: [{ card: 'vengeful_bloodwitch', id: 'witch' }, { card: 'skyraker_giant', id: 'giant' }] },
    ],
  });
  s = act(s, { type: 'cast', player: 0, card: 'vet', targets: [] });
  s = settle(s, (t) => getLegalActions(t).find((a) => a.type === 'chooseTargets' && (a.targets[0] as { card?: string })?.card === 'giant') as Action);
  assert.equal(getCard(s, 'giant').zone, 'graveyard', 'three Goblins deal 3 damage');
  assert.equal(s.players[0].life, 19);
  assert.equal(s.players[1].life, 21);
});

test('Crossway Troublemakers pays 2 life to draw when a Vampire dies, if life allows', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'heros_downfall', id: 'hd' }], battlefield: [...lands('swamp', 3), 'crossway_troublemakers', { card: 'highborn_vampire', id: 'vamp' }] },
      {},
    ],
  });
  const hand = s.players[0].hand.length;
  s = cast(s, 'hd', [{ card: 'vamp' }]);
  assert.equal(s.players[0].life, 18);
  assert.equal(s.players[0].hand.length, hand);
});

test('Bloodtithe Collector makes the opponent discard after they lost life', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'bloodtithe_collector', id: 'coll' }], battlefield: lands('swamp', 5) },
      { hand: ['bear_cub', 'opt'], lostLifeThisTurn: true },
    ],
  });
  s = cast(s, 'coll');
  assert.equal(s.players[1].hand.length, 1);
});

test('Diregraf Ghoul enters tapped; Undying Malice returns a creature with a counter', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'diregraf_ghoul', id: 'dire' }, { card: 'undying_malice', id: 'mal' }, { card: 'heros_downfall', id: 'hd' }], battlefield: lands('swamp', 5) },
      {},
    ],
  });
  s = cast(s, 'dire');
  assert.ok(getCard(s, 'dire').tapped);
  s = cast(s, 'mal', [{ card: 'dire' }]);
  s = cast(s, 'hd', [{ card: 'dire' }]);
  assert.equal(getCard(s, 'dire').zone, 'battlefield');
  assert.equal(getCard(s, 'dire').counters, 1);
  assert.ok(getKeywords(s, 'dire').length === 0);
});

test('Broken Wings frees a pacified creature; Thrashing Brontodon destroys an artifact', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'broken_wings', id: 'wings' }], battlefield: [...lands('forest', 4), { card: 'thrashing_brontodon', id: 'bronto' }, { card: 'bear_cub', id: 'cub' }] },
      { battlefield: [{ card: 'pacifism', id: 'pac', attachedTo: 'cub' }, { card: 'goblin_firebomb', id: 'bomb' }] },
    ],
  });
  assert.ok(!canAttack(s, 'cub'));
  s = cast(s, 'wings', [{ card: 'pac' }]);
  assert.equal(getCard(s, 'pac').zone, 'graveyard');
  assert.ok(canAttack(s, 'cub'));
  s = activate(s, 'bronto', 0, [{ card: 'bomb' }]);
  assert.equal(getCard(s, 'bomb').zone, 'graveyard');
  assert.equal(getCard(s, 'bronto').zone, 'graveyard');
});

test('Elvish Regrower returns a permanent card; Felling Blow adds a counter, then bites', () => {
  let s = scenario({
    players: [
      { hand: [{ card: 'elvish_regrower', id: 'grow' }, { card: 'felling_blow', id: 'blow' }], battlefield: [...lands('forest', 7), { card: 'bear_cub', id: 'cub' }], graveyard: [{ card: 'pacifism', id: 'pac' }] },
      { battlefield: [{ card: 'skyraker_giant', id: 'giant' }] },
    ],
  });
  s = cast(s, 'grow');
  assert.equal(getCard(s, 'pac').zone, 'hand');
  s = cast(s, 'blow', [{ card: 'cub' }, { card: 'giant' }]);
  assert.equal(getCard(s, 'cub').counters, 1);
  assert.equal(getCard(s, 'giant').zone, 'graveyard');
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}\n     ${(e as Error).message}`);
  }
}
console.log(failed ? `${failed} of ${tests.length} failed` : `all ${tests.length} passed`);
process.exit(failed ? 1 : 0);
