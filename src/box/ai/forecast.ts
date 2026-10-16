import {
  applyAction,
  blockOptions,
  blocksError,
  defOf,
  getCost,
  hasKeyword,
  isCreature,
  manaValue,
  opponent,
  priorityActions,
  type Action,
  type Block,
  type CardId,
  type GameState,
  type PlayerId,
  type Step,
} from '../engine';
import { duel, nemesisAction, strongestFirst, unblockedDamage } from '../nemesis/mind';
import { creatureValue, evaluate } from './evaluate';
import { chooseCardsToDiscard } from './heuristics';
import { rollout } from './rollout';
import { quickTargets } from './targets';

const MAX_FORECAST_ACTIONS = 200;
const MIN_GAIN = 0.5;
const NEMESIS_PRECOMBAT: ReadonlySet<Step> = new Set([
  'untap',
  'upkeep',
  'draw',
  'main1',
  'beginCombat',
  'declareAttackers',
  'declareBlockers',
]);

function needsForecast(s: GameState, player: PlayerId): boolean {
  if (!s.players[opponent(player)].nemesis || s.pending?.kind === 'gameOver') return false;
  if (s.activePlayer === player) return s.step === 'main2' || s.step === 'end' || s.step === 'cleanup';
  return NEMESIS_PRECOMBAT.has(s.step);
}

function deployOrPass(s: GameState, player: PlayerId): Action {
  const pass: Action = { type: 'pass', player };
  if (s.activePlayer !== player || s.step !== 'main2' || s.stack.length > 0) return pass;
  const creatures = priorityActions(s, player).filter(
    (action): action is Extract<Action, { type: 'cast' }> =>
      action.type === 'cast' && isCreature(s, action.card) && action.sacrifice === undefined,
  );
  const cost = (action: Extract<Action, { type: 'cast' }>): number => manaValue(getCost(defOf(s, action.card).id));
  return creatures.sort((a, b) => cost(b) - cost(a))[0] ?? pass;
}

function forecastBlocks(s: GameState, player: PlayerId): Block[] {
  const combat = s.combat;
  if (!combat) return [];
  const options = blockOptions(s);
  const cheapest = Object.keys(options).sort((a, b) => creatureValue(s, a) - creatureValue(s, b));
  const attackers = strongestFirst(s, combat.attackers.filter((id) => s.cards[id]?.zone === 'battlefield'));
  const blocks: Block[] = [];
  const used = new Set<CardId>();
  const open = (attacker: CardId): boolean =>
    !hasKeyword(s, attacker, 'menace') && !blocks.some((block) => block.attacker === attacker);
  const pick = (attacker: CardId, fits: (blocker: CardId) => boolean): CardId | undefined =>
    cheapest.find((blocker) => !used.has(blocker) && options[blocker]?.includes(attacker) && fits(blocker));
  const assign = (blocker: CardId | undefined, attacker: CardId): void => {
    if (blocker === undefined) return;
    blocks.push({ blocker, attacker });
    used.add(blocker);
  };
  for (const attacker of attackers.filter(open)) {
    assign(
      pick(attacker, (blocker) => {
        const outcome = duel(s, attacker, blocker);
        return outcome.attackerDies && !outcome.blockerDies;
      }),
      attacker,
    );
  }
  for (const attacker of attackers.filter(open)) {
    const worth = creatureValue(s, attacker);
    const trades = (blocker: CardId): boolean =>
      duel(s, attacker, blocker).attackerDies && creatureValue(s, blocker) <= worth;
    assign(pick(attacker, trades), attacker);
  }
  for (const attacker of attackers) {
    if (unblockedDamage(s, attackers, blocks) < s.players[player].life) break;
    if (open(attacker)) assign(pick(attacker, () => true), attacker);
  }
  return blocksError(s, blocks) ? [] : blocks;
}

function respondOrPass(s: GameState, player: PlayerId): Action {
  const pass: Action = { type: 'pass', player };
  if (s.stack.at(-1)?.controller === player || (s.stack.length === 0 && !s.combat)) return pass;
  const responses = priorityActions(s, player).filter((action) => action.type === 'cast' || action.type === 'activate');
  if (responses.length === 0) return pass;
  const value = (action: Action): number => evaluate(rollout(applyAction(s, action), 1, s), player);
  let best: Action = pass;
  let bestValue = value(pass) + MIN_GAIN;
  for (const action of responses) {
    const candidate = value(action);
    if (candidate > bestValue) {
      best = action;
      bestValue = candidate;
    }
  }
  return best;
}

export function forecast(start: GameState, player: PlayerId): GameState {
  let s = start;
  for (let i = 0; i < MAX_FORECAST_ACTIONS; i++) {
    const pending = s.pending;
    if (!pending || pending.kind === 'gameOver') return s;
    if (s.activePlayer !== player && !NEMESIS_PRECOMBAT.has(s.step)) return s;
    const actor = pending.player;
    if (s.players[actor].nemesis) {
      s = applyAction(s, nemesisAction(s, actor));
      continue;
    }
    switch (pending.kind) {
      case 'priority':
        s = applyAction(s, s.activePlayer === actor ? deployOrPass(s, actor) : respondOrPass(s, actor));
        break;
      case 'declareBlockers':
        s = applyAction(s, { type: 'declareBlockers', player: actor, blocks: forecastBlocks(s, actor) });
        break;
      case 'chooseTargets':
        s = applyAction(s, quickTargets(s, actor));
        break;
      case 'discard':
        s = applyAction(s, { type: 'discard', player: actor, cards: chooseCardsToDiscard(s, actor, pending.count) });
        break;
      default:
        return s;
    }
  }
  return s;
}

export function evaluateAhead(s: GameState, player: PlayerId): number {
  if (!needsForecast(s, player)) return evaluate(s, player);
  return evaluate(forecast(s, player), player);
}
