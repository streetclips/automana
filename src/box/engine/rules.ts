import { parseCost } from './mana';
import { getCardDef } from './registry';
import {
  canAfford,
  creaturesOf,
  defOf,
  getCard,
  hasFlashDef,
  isInstantDef,
  isLandDef,
  isReadyToTap,
  spellCost,
} from './state';
import type { Refusal } from './refusals';
import { targetsError } from './targets';
import { COLORS, type CardId, type GameState, type ManaCost, type PlayerId, type Target, type TargetSpec } from './types';

export function hasPriority(s: GameState, player: PlayerId): boolean {
  return s.pending?.kind === 'priority' && s.pending.player === player;
}

export function isMainPhase(s: GameState): boolean {
  return s.step === 'main1' || s.step === 'main2';
}

export function canActAtSorcerySpeed(s: GameState, player: PlayerId): boolean {
  return hasPriority(s, player) && s.activePlayer === player && isMainPhase(s) && s.stack.length === 0;
}

export function landPlayError(s: GameState, player: PlayerId, cardId: CardId): Refusal | null {
  const card = s.cards[cardId];
  if (!card || card.zone !== 'hand' || card.owner !== player) return { code: 'notInHand' };
  if (!isLandDef(getCardDef(card.def))) return { code: 'notALand' };
  if (!canActAtSorcerySpeed(s, player)) return { code: 'landTiming' };
  const ps = s.players[player];
  if (ps.landsPlayedThisTurn >= 1 + ps.extraLandsThisTurn) {
    return { code: ps.extraLandsThisTurn > 0 ? 'allLandsPlayed' : 'landPlayed' };
  }
  return null;
}

export function addCost(a: ManaCost, b: ManaCost): ManaCost {
  const sum: ManaCost = { ...a, generic: a.generic + b.generic };
  for (const color of COLORS) sum[color] = a[color] + b[color];
  return sum;
}

export function castCost(s: GameState, player: PlayerId, cardId: CardId, x = 0, sacrificing = false): ManaCost {
  const def = defOf(s, cardId);
  const cost = spellCost(s, player, cardId, x);
  if (def.sacrificeCreatureOr && !sacrificing) return addCost(cost, parseCost(def.sacrificeCreatureOr));
  return cost;
}

export function castTargets(s: GameState, cardId: CardId): { specs: TargetSpec[]; min: number } {
  const def = defOf(s, cardId);
  if (def.enchant) return { specs: [def.enchant], min: 1 };
  const specs = def.spell?.targets ?? [];
  return { specs, min: def.spell?.minTargets ?? specs.length };
}

export function sacrificeOptions(s: GameState, player: PlayerId, except?: CardId): CardId[] {
  return creaturesOf(s, player).filter((id) => id !== except);
}

function timingError(s: GameState, player: PlayerId, cardId: CardId): Refusal | null {
  const card = s.cards[cardId];
  if (!card || card.zone !== 'hand' || card.owner !== player) return { code: 'notInHand' };
  const def = getCardDef(card.def);
  if (isLandDef(def)) return { code: 'landsAreNotCast' };
  if (!hasPriority(s, player)) return { code: 'noPriority' };
  if (!isInstantDef(def) && !hasFlashDef(def) && !canActAtSorcerySpeed(s, player)) {
    return { code: 'sorceryTiming' };
  }
  return null;
}

export function castBlocker(s: GameState, player: PlayerId, cardId: CardId): Refusal | null {
  const timing = timingError(s, player, cardId);
  if (timing) return timing;
  const def = defOf(s, cardId);
  const x = def.xCounters ? 1 : 0;
  if (canAfford(s, player, castCost(s, player, cardId, x))) return null;
  if (def.sacrificeCreatureOr && sacrificeOptions(s, player).length > 0 && canAfford(s, player, castCost(s, player, cardId, x, true)))
    return null;
  return { code: 'notEnoughMana' };
}

export function castError(
  s: GameState,
  player: PlayerId,
  cardId: CardId,
  targets: Target[],
  x = 0,
  sacrifice?: CardId,
): Refusal | null {
  const timing = timingError(s, player, cardId);
  if (timing) return timing;
  const def = defOf(s, cardId);
  if (def.xCounters ? !Number.isInteger(x) || x < 1 : x !== 0) return { code: 'invalidX' };
  if (sacrifice !== undefined && (!def.sacrificeCreatureOr || !sacrificeOptions(s, player).includes(sacrifice)))
    return { code: 'invalidSacrifice' };
  if (!canAfford(s, player, castCost(s, player, cardId, x, sacrifice !== undefined))) return { code: 'notEnoughMana' };
  const { specs, min } = castTargets(s, cardId);
  return targetsError(s, player, specs, targets, cardId, min);
}

export function activationBlocker(
  s: GameState,
  player: PlayerId,
  cardId: CardId,
  abilityIndex: number,
): Refusal | null {
  const card = s.cards[cardId];
  const ability = card ? getCardDef(card.def).activated?.[abilityIndex] : undefined;
  if (!card) return { code: 'notYourPermanent' };
  if (ability?.fromGraveyard) {
    if (card.zone !== 'graveyard' || card.owner !== player) return { code: 'notYourPermanent' };
  } else if (card.zone !== 'battlefield' || card.controller !== player) return { code: 'notYourPermanent' };
  if (!ability) return { code: 'noSuchAbility' };
  if (!hasPriority(s, player)) return { code: 'noPriority' };
  if (ability.sorcery && !canActAtSorcerySpeed(s, player)) return { code: 'sorceryTiming' };
  if (ability.once && card.spent) return { code: 'abilityUsed' };
  if (ability.tap) {
    if (getCard(s, cardId).tapped) return { code: 'tapped' };
    if (!isReadyToTap(s, cardId)) return { code: 'summoningSick' };
  }
  if (ability.sacrificeAnother && sacrificeOptions(s, player, cardId).length === 0) return { code: 'invalidSacrifice' };
  if (!canAfford(s, player, parseCost(ability.cost), ability.tap ? cardId : undefined)) {
    return { code: 'notEnoughMana' };
  }
  return null;
}

export function activateError(
  s: GameState,
  player: PlayerId,
  cardId: CardId,
  abilityIndex: number,
  targets: Target[],
  sacrifice?: CardId,
): Refusal | null {
  const blocker = activationBlocker(s, player, cardId, abilityIndex);
  if (blocker) return blocker;
  const ability = defOf(s, cardId).activated?.[abilityIndex];
  if (ability?.sacrificeAnother) {
    if (sacrifice === undefined || !sacrificeOptions(s, player, cardId).includes(sacrifice))
      return { code: 'invalidSacrifice' };
  } else if (sacrifice !== undefined) return { code: 'invalidSacrifice' };
  return targetsError(s, player, ability?.targets ?? [], targets, cardId, ability?.minTargets);
}
