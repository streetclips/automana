import {
  defOf,
  getCard,
  getLegalActions,
  getToughness,
  isPlayerTarget,
  triggeredAbility,
  type Action,
  type Effect,
  type GameState,
  type PlayerId,
  type Target,
} from '../engine';
import { creatureValue } from './evaluate';

function controllerOf(s: GameState, target: Target): PlayerId {
  return isPlayerTarget(target) ? target.player : getCard(s, target.card).controller;
}

function targetImpact(s: GameState, player: PlayerId, effect: Effect, targets: Target[]): number {
  const index = 'to' in effect && typeof effect.to === 'number' ? effect.to : null;
  const target = index === null ? undefined : targets[index];
  if (!target) return 0;
  const side = controllerOf(s, target) === player ? -1 : 1;
  if (isPlayerTarget(target)) return effect.kind === 'damage' ? side * effect.amount * 0.5 : 0;
  const value = creatureValue(s, target.card);
  const remaining = getToughness(s, target.card) - getCard(s, target.card).damage;
  switch (effect.kind) {
    case 'damage':
      return side * (effect.amount >= remaining ? value : effect.amount * 0.3);
    case 'destroy':
    case 'bounce':
    case 'exile':
      return side * value;
    case 'pump':
      if (effect.toughness < 0 && -effect.toughness >= remaining) return side * value;
      return -side * (effect.power + effect.toughness) * 0.5;
    case 'addCounters':
      return -side * effect.amount * 2.5;
    case 'cantBlock':
    case 'tap':
      return getCard(s, target.card).tapped ? 0 : side * value * 0.2;
    default:
      return 0;
  }
}

export function quickTargets(s: GameState, player: PlayerId): Action {
  const pending = s.pending;
  const trigger =
    pending?.kind === 'chooseTargets' ? s.triggers.find((candidate) => candidate.id === pending.trigger) : undefined;
  const effects = trigger ? (triggeredAbility(defOf(s, trigger.source), trigger.ability)?.effects ?? []) : [];
  let best: Action | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const action of getLegalActions(s)) {
    const targets = action.type === 'chooseTargets' ? action.targets : [];
    const score = effects.reduce((sum, effect) => sum + targetImpact(s, player, effect, targets), 0);
    if (score > bestScore) {
      best = action;
      bestScore = score;
    }
  }
  if (!best) throw new Error('no legal action available');
  return best;
}
