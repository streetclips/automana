import { getCardDef } from './registry';
import type { Refusal } from './refusals';
import {
  defOf,
  getPower,
  hasKeyword,
  hasSubtype,
  isCreature,
  isCreatureDef,
  isLandDef,
  isPermanentDef,
} from './state';
import type { CardId, GameState, PermanentKind, PlayerId, Target, TargetSpec } from './types';

export function isPlayerTarget(target: Target): target is { player: PlayerId } {
  return 'player' in target;
}

export function targetKey(target: Target): string {
  return isPlayerTarget(target) ? `p${target.player}` : target.card;
}

export function sameTarget(a: Target, b: Target): boolean {
  return targetKey(a) === targetKey(b);
}

export function isSpellOnStack(s: GameState, id: CardId): boolean {
  return s.cards[id]?.zone === 'stack' && s.stack.some((item) => item.kind === 'spell' && item.card === id);
}

function matchesKind(s: GameState, id: CardId, kind: PermanentKind): boolean {
  const def = defOf(s, id);
  switch (kind) {
    case 'artifact':
      return def.types.includes('artifact');
    case 'enchantment':
      return def.types.includes('enchantment');
    case 'creature':
      return isCreatureDef(def);
    case 'flyingCreature':
      return isCreatureDef(def) && hasKeyword(s, id, 'flying');
    case 'land':
      return isLandDef(def);
    case 'nonland':
      return !isLandDef(def);
  }
}

function inCombat(s: GameState, id: CardId, combat: 'attacking' | 'attackingOrBlocking'): boolean {
  if (s.combat?.attackers.includes(id)) return true;
  return combat === 'attackingOrBlocking' && (s.combat?.blocks.some((block) => block.blocker === id) ?? false);
}

export function isLegalTarget(
  s: GameState,
  controller: PlayerId,
  spec: TargetSpec,
  target: Target,
  source?: CardId,
): boolean {
  if (isPlayerTarget(target)) {
    if (target.player !== 0 && target.player !== 1) return false;
    if (spec.kind !== 'any' && spec.kind !== 'player') return false;
    if (spec.kind === 'player' && spec.controller === 'you') return target.player === controller;
    if (spec.kind === 'player' && spec.controller === 'opponent') return target.player !== controller;
    return true;
  }
  if (spec.kind === 'spell') return isSpellOnStack(s, target.card);
  const card = s.cards[target.card];
  if (!card) return false;
  if (spec.kind === 'graveyard') {
    if (card.zone !== 'graveyard' || card.owner !== controller) return false;
    const def = getCardDef(card.def);
    if (spec.cards === 'creature' ? !isCreatureDef(def) : !isPermanentDef(def)) return false;
    return !spec.subtype || hasSubtype(def, spec.subtype);
  }
  if (card.zone !== 'battlefield' || spec.kind === 'player') return false;
  if (card.controller !== controller && hasKeyword(s, target.card, 'hexproof')) return false;
  if (spec.kind === 'any') return isCreature(s, target.card);
  if (spec.controller === 'you' && card.controller !== controller) return false;
  if (spec.controller === 'opponent' && card.controller === controller) return false;
  if (spec.kind === 'permanent') return !spec.types?.length || spec.types.some((kind) => matchesKind(s, target.card, kind));
  if (!isCreature(s, target.card)) return false;
  if (spec.tapped && !card.tapped) return false;
  if (spec.other && target.card === source) return false;
  if (spec.subtype && !hasSubtype(defOf(s, target.card), spec.subtype)) return false;
  if (spec.combat && !inCombat(s, target.card, spec.combat)) return false;
  if (spec.maxPower !== undefined && getPower(s, target.card) > spec.maxPower) return false;
  return true;
}

export function legalTargets(s: GameState, controller: PlayerId, spec: TargetSpec, source?: CardId): Target[] {
  const candidates: Target[] = [{ player: controller }, { player: controller === 0 ? 1 : 0 }];
  for (const id of [...s.players[0].battlefield, ...s.players[1].battlefield]) candidates.push({ card: id });
  for (const item of [...s.stack].reverse()) if (item.kind === 'spell') candidates.push({ card: item.card });
  if (spec.kind === 'graveyard') for (const id of s.players[controller].graveyard) candidates.push({ card: id });
  return candidates.filter((target) => isLegalTarget(s, controller, spec, target, source));
}

export function targetCombos(
  s: GameState,
  controller: PlayerId,
  specs: TargetSpec[],
  source?: CardId,
  minTargets = specs.length,
): Target[][] {
  if (specs.length === 0) return [[]];
  const options = specs.map((spec) => legalTargets(s, controller, spec, source));
  const combos: Target[][] = [];
  const walk = (index: number, chosen: Target[]): void => {
    if (index >= minTargets) combos.push([...chosen]);
    if (index === specs.length) return;
    for (const target of options[index] ?? []) {
      if (chosen.some((other) => sameTarget(other, target))) continue;
      chosen.push(target);
      walk(index + 1, chosen);
      chosen.pop();
    }
  };
  walk(0, []);
  return combos;
}

export function targetsError(
  s: GameState,
  controller: PlayerId,
  specs: TargetSpec[],
  targets: Target[],
  source?: CardId,
  minTargets = specs.length,
): Refusal | null {
  if (!Array.isArray(targets)) return { code: 'targetsNotList' };
  if (targets.length < minTargets || targets.length > specs.length)
    return { code: 'targetCount', given: targets.length, expected: specs.length };
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i] as Target;
    if (!target || typeof target !== 'object') return { code: 'targetMalformed', index: i };
    if (!isLegalTarget(s, controller, specs[i] as TargetSpec, target, source))
      return { code: 'illegalTarget', index: i, target: targetKey(target) };
    for (let j = 0; j < i; j++) {
      if (sameTarget(targets[j] as Target, target)) return { code: 'sameTargetTwice' };
    }
  }
  return null;
}
