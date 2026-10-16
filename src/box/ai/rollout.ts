import {
  applyAction,
  getLegalActions,
  isCreature,
  isPlayerTarget,
  priorityActions,
  tryApplyAction,
  type Action,
  type GameState,
  type PlayerId,
  type Step,
} from '../engine';
import { nemesisBlocks } from '../nemesis/mind';
import { evaluate } from './evaluate';
import { evaluateAhead } from './forecast';
import { chooseCardsToDiscard } from './heuristics';
import { quickTargets } from './targets';

const MAX_ROLLOUT_ACTIONS = 80;
const COMBAT_STEPS: ReadonlySet<Step> = new Set([
  'beginCombat',
  'declareAttackers',
  'declareBlockers',
  'firstStrikeDamage',
  'combatDamage',
  'endCombat',
]);

export function rollout(start: GameState, depth = 0, from: Pick<GameState, 'turn' | 'step'> = start): GameState {
  let s = start;
  const { turn, step } = from;
  for (let i = 0; i < MAX_ROLLOUT_ACTIONS; i++) {
    const pending = s.pending;
    if (!pending || pending.kind === 'gameOver') return s;
    if (pending.kind === 'priority') {
      const moved = s.step !== step || s.turn !== turn;
      if (s.stack.length === 0 && moved && !COMBAT_STEPS.has(s.step)) return s;
      s = applyAction(s, { type: 'pass', player: pending.player });
      continue;
    }
    if (pending.kind === 'chooseTargets') {
      s = applyAction(
        s,
        depth >= 1 ? quickTargets(s, pending.player) : bestAction(s, pending.player, getLegalActions(s), depth + 1),
      );
      continue;
    }
    if (pending.kind === 'discard' && pending.source !== undefined) {
      s = applyAction(s, {
        type: 'discard',
        player: pending.player,
        cards: chooseCardsToDiscard(s, pending.player, pending.count),
      });
      continue;
    }
    return s;
  }
  return s;
}

function settledValue(end: GameState, player: PlayerId): number {
  const pending = end.pending;
  if (pending?.kind !== 'declareBlockers' || !end.players[pending.player].nemesis) return evaluateAhead(end, player);
  const blocks = nemesisBlocks(end, pending.player);
  return combatValue(applyAction(end, { type: 'declareBlockers', player: pending.player, blocks }), player);
}

export function actionValue(s: GameState, action: Action, player: PlayerId, depth = 0): number {
  const end = rollout(applyAction(s, action), depth, s);
  return depth === 0 ? settledValue(end, player) : evaluate(end, player);
}

export function bestAction(s: GameState, player: PlayerId, actions: Action[], depth = 0): Action {
  let best: Action | undefined;
  let bestValue = Number.NEGATIVE_INFINITY;
  for (const action of actions) {
    const value = actionValue(s, action, player, depth);
    if (value > bestValue) {
      best = action;
      bestValue = value;
    }
  }
  if (!best) throw new Error('bestAction needs at least one action');
  return best;
}

function combatTricks(s: GameState, player: PlayerId): Action[] {
  const combat = s.combat;
  if (!combat) return [];
  const fighters = new Set([...combat.attackers, ...combat.blocks.map((block) => block.blocker)]);
  return priorityActions(s, player).filter(
    (action) =>
      (action.type === 'activate' || (action.type === 'cast' && !isCreature(s, action.card))) &&
      action.targets.every((target) => !isPlayerTarget(target) && fighters.has(target.card)),
  );
}

export function combatValue(blocked: GameState, player: PlayerId): number {
  let s = blocked;
  while (
    s.pending?.kind === 'priority' &&
    s.pending.player !== player &&
    s.stack.length === 0 &&
    s.step === 'declareBlockers'
  ) {
    s = applyAction(s, { type: 'pass', player: s.pending.player });
  }
  let best = evaluateAhead(rollout(s, 1), player);
  const pending = s.pending;
  if (pending?.kind !== 'priority' || pending.player !== player || s.step !== 'declareBlockers' || s.stack.length > 0) {
    return best;
  }
  for (const trick of combatTricks(s, player)) {
    best = Math.max(best, evaluateAhead(rollout(applyAction(s, trick), 1), player));
  }
  return best;
}

export function settleStack(start: GameState): GameState {
  let s = start;
  for (let i = 0; i < MAX_ROLLOUT_ACTIONS; i++) {
    const pending = s.pending;
    if (pending?.kind !== 'priority' || s.stack.length === 0) return s;
    s = applyAction(s, { type: 'pass', player: pending.player });
  }
  return s;
}

export function repeatedActionValue(s: GameState, action: Action, player: PlayerId, maxRepeats = 5): number {
  let state = s;
  let best = Number.NEGATIVE_INFINITY;
  for (let repeat = 0; repeat < maxRepeats; repeat++) {
    const result = tryApplyAction(state, action);
    if (!result.ok) break;
    state = settleStack(result.state);
    best = Math.max(best, evaluateAhead(rollout(state, 0, s), player));
    const pending = state.pending;
    if (pending?.kind === 'priority' && pending.player !== player && state.stack.length === 0) {
      const passed = tryApplyAction(state, { type: 'pass', player: pending.player });
      if (!passed.ok) break;
      state = passed.state;
    }
  }
  return best;
}
