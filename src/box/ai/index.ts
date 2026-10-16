import {
  applyAction,
  canAttack,
  getCardDef,
  getLegalActions,
  isLand,
  type Action,
  type CardDef,
  type Effect,
  type GameState,
  type PlayerId,
} from '../engine';
import { feedCounter, hideFaceDownThreats } from '../nemesis/mind';
import { chooseAttackers, chooseBlocks, planAttack } from './combat';
import { evaluateAhead } from './forecast';
import { chooseCardsToBottom, chooseCardsToDiscard, chooseLand, shouldKeep } from './heuristics';
import { actionValue, bestAction, repeatedActionValue, rollout } from './rollout';

export { chooseAttackers, chooseBlocks } from './combat';
export { rollout } from './rollout';

const MIN_GAIN = 0.5;
const EXTRA_LAND_VALUE = 2;

function hasReadyAttacker(s: GameState, player: PlayerId): boolean {
  return s.players[player].battlefield.some((id) => canAttack(s, id));
}

function helpsThisCombat(def: CardDef): boolean {
  if ((def.keywords ?? []).includes('haste')) return true;
  return (def.triggers ?? []).some(
    (trigger) =>
      trigger.on === 'enters' &&
      trigger.effects.some(
        (effect) =>
          effect.kind === 'pumpTeam' ||
          (effect.kind === 'createTokens' && (getCardDef(effect.token).keywords ?? []).includes('haste')),
      ),
  );
}

function growsWithNewCreatures(s: GameState, player: PlayerId): boolean {
  return s.players[player].battlefield.some((id) => {
    const def = getCardDef(s.cards[id]?.def ?? '');
    return (
      (def.keywords ?? []).includes('evolve') || (def.triggers ?? []).some((trigger) => trigger.on === 'allyEnters')
    );
  });
}

function waitsForCombat(s: GameState, action: Action): boolean {
  if (action.type !== 'cast') return false;
  const def = getCardDef(s.cards[action.card]?.def ?? '');
  return def.types.includes('creature') && !helpsThisCombat(def) && !growsWithNewCreatures(s, action.player);
}

function extraLandValue(s: GameState, action: Action): number {
  if (action.type !== 'cast') return 0;
  const effects = getCardDef(s.cards[action.card]?.def ?? '').spell?.effects ?? [];
  if (!effects.some((effect) => effect.kind === 'extraLands')) return 0;
  const ps = s.players[action.player];
  const lands = ps.hand.filter((id) => id !== action.card && isLand(s, id)).length;
  const playsLeft = Math.max(0, 1 + ps.extraLandsThisTurn - ps.landsPlayedThisTurn);
  return lands > playsLeft ? EXTRA_LAND_VALUE : 0;
}

const ATTACK_SETUPS: ReadonlySet<Effect['kind']> = new Set(['pump', 'pumpTeam', 'unblockable', 'cantBlock', 'tap']);

function setsUpAttack(s: GameState, action: Action): boolean {
  if (action.type === 'activate') {
    const effects = getCardDef(s.cards[action.card]?.def ?? '').activated?.[action.ability]?.effects ?? [];
    return effects.some((effect) => ATTACK_SETUPS.has(effect.kind));
  }
  if (action.type !== 'cast') return false;
  const def = getCardDef(s.cards[action.card]?.def ?? '');
  return def.types.includes('sorcery') && (def.spell?.effects ?? []).some((effect) => ATTACK_SETUPS.has(effect.kind));
}

function plannedValue(s: GameState, action: Action, player: PlayerId): number {
  const next = rollout(applyAction(s, action), 0, s);
  const pending = next.pending;
  if (pending?.kind !== 'declareAttackers' || pending.player !== player) return evaluateAhead(next, player);
  return planAttack(next, player).value;
}

function choosePriorityAction(s: GameState, player: PlayerId): Action {
  const pass: Action = { type: 'pass', player };
  const legal = getLegalActions(s);
  const lands = legal.filter((action) => action.type === 'playLand');
  if (lands.length > 0) return chooseLand(s, player, lands);
  const fed = feedCounter(s, player, legal);
  if (fed) return fed;

  const top = s.stack.at(-1);
  if (top && top.controller === player) return pass;

  let candidates = legal.filter((action) => action.type === 'cast' || action.type === 'activate');
  const beforeCombat = s.step === 'main1' && s.activePlayer === player && hasReadyAttacker(s, player);
  if (beforeCombat) candidates = candidates.filter((action) => !waitsForCombat(s, action));
  if (candidates.length === 0) return pass;

  const planned = beforeCombat && candidates.some((action) => setsUpAttack(s, action));
  let best: Action = pass;
  let bestValue = (planned ? plannedValue(s, pass, player) : actionValue(s, pass, player)) + MIN_GAIN;
  for (const action of candidates) {
    const value = planned
      ? plannedValue(s, action, player) + extraLandValue(s, action)
      : action.type === 'activate'
        ? repeatedActionValue(s, action, player)
        : actionValue(s, action, player) + extraLandValue(s, action);
    if (value > bestValue) {
      best = action;
      bestValue = value;
    }
  }
  return best;
}

export function chooseAction(state: GameState, player: PlayerId): Action {
  const s = hideFaceDownThreats(state);
  const pending = s.pending;
  if (!pending || pending.kind === 'gameOver') throw new Error('the game is not waiting for a decision');
  if (pending.player !== player) throw new Error(`player ${player} is not the one deciding`);
  switch (pending.kind) {
    case 'mulligan':
      return shouldKeep(s, player) ? { type: 'keep', player } : { type: 'mulligan', player };
    case 'bottom':
      return { type: 'bottom', player, cards: chooseCardsToBottom(s, player, pending.count) };
    case 'discard':
      return { type: 'discard', player, cards: chooseCardsToDiscard(s, player, pending.count) };
    case 'declareAttackers':
      return { type: 'declareAttackers', player, attackers: chooseAttackers(s, player) };
    case 'declareBlockers':
      return { type: 'declareBlockers', player, blocks: chooseBlocks(s, player) };
    case 'chooseTargets':
      return bestAction(s, player, getLegalActions(s));
    case 'priority':
      return choosePriorityAction(s, player);
  }
}
