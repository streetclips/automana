import { challengeDrawStep } from './challenge';
import { applyDamage, targetLegality } from './effects';
import { randomInt } from './rng';
import {
  changeLife,
  creaturesOf,
  defOf,
  drawCards,
  getCard,
  getPower,
  getToughness,
  isCreatureDef,
  moveCard,
  newId,
  opponent,
} from './state';
import { isPlayerTarget } from './targets';
import type { CardId, GameState, PlayerId, StackItem, Target, ThreatEffect, Zone } from './types';

export const NEMESIS_CREATURE_LIMIT = 4;

export function isNemesis(s: GameState, player: PlayerId): boolean {
  return s.players[player].nemesis === true;
}

export function nemesisSeat(s: GameState): PlayerId | null {
  if (s.players[1].nemesis) return 1;
  return s.players[0].nemesis ? 0 : null;
}

export function arrangeThreatDeck(s: GameState, player: PlayerId): void {
  const ps = s.players[player];
  const tierOf = (id: CardId): number => defOf(s, id).threat?.tier ?? 3;
  ps.library = [1, 2, 3].flatMap((tier) => ps.library.filter((id) => tierOf(id) === tier));
  ps.nemesis = true;
  ps.kept = true;
  ps.bottomed = true;
  ps.overflows = 0;
}

export function nemesisDestination(
  s: GameState,
  id: CardId,
  from: Zone,
  to: Zone,
): { to: Zone; toBottom: boolean } | null {
  const card = s.cards[id];
  if (!card || !isNemesis(s, card.owner) || s.players[card.owner].challenge) return null;
  if (from === 'stack' && to === 'graveyard') return { to: 'library', toBottom: true };
  if (from === 'battlefield' && to === 'hand') return { to: 'library', toBottom: false };
  return null;
}

export function recursOnDeath(s: GameState, id: CardId, from: Zone, to: Zone): boolean {
  const card = s.cards[id];
  if (!card || from !== 'battlefield' || to !== 'graveyard' || card.zone !== 'graveyard') return false;
  return isNemesis(s, card.owner) && defOf(s, id).threat?.recur === true;
}

export function overflow(s: GameState, player: PlayerId, card: CardId): void {
  moveCard(s, card, 'library', { toBottom: true });
  const ps = s.players[player];
  ps.overflows = (ps.overflows ?? 0) + 1;
  applyDamage(s, [{ source: card, target: { player: opponent(player) }, amount: getPower(s, card) }], false);
}

function enterOrOverflow(s: GameState, player: PlayerId, card: CardId): boolean {
  if (creaturesOf(s, player).length >= NEMESIS_CREATURE_LIMIT) {
    overflow(s, player, card);
    return false;
  }
  moveCard(s, card, 'battlefield', { controller: player });
  return true;
}

export function nemesisDrawStep(s: GameState, player: PlayerId): void {
  const challenge = s.players[player].challenge;
  if (challenge) {
    challengeDrawStep(s, player, challenge);
    return;
  }
  const next = s.players[player].library[0];
  if (next === undefined) return;
  if (isCreatureDef(defOf(s, next)) && creaturesOf(s, player).length >= NEMESIS_CREATURE_LIMIT) {
    overflow(s, player, next);
    return;
  }
  drawCards(s, player, 1);
}

export function spellTax(s: GameState, player: PlayerId): number {
  if (isNemesis(s, player) || (s.players[player].spellsCastThisTurn ?? 0) > 0) return 0;
  const seat = opponent(player);
  if (!isNemesis(s, seat)) return 0;
  return creaturesOf(s, seat).reduce((tax, id) => Math.max(tax, defOf(s, id).threat?.tax ?? 0), 0);
}

export function afterCast(s: GameState, player: PlayerId, card: CardId): void {
  const ps = s.players[player];
  ps.spellsCastThisTurn = (ps.spellsCastThisTurn ?? 0) + 1;
  const seat = opponent(player);
  if (isNemesis(s, player) || !isNemesis(s, seat)) return;
  const reminder = s.players[seat].battlefield.find((id) => defOf(s, id).threat?.effect?.kind === 'counterNext');
  if (!reminder) return;
  const index = s.stack.findIndex((item) => item.kind === 'spell' && item.card === card);
  if (index < 0) return;
  s.stack.splice(index, 1);
  moveCard(s, card, 'graveyard');
  s.events.push({ t: 'counter', card, player });
  moveCard(s, reminder, 'library', { toBottom: true });
}

function weaken(s: GameState, card: CardId, amount: number): void {
  s.effects.push({ id: newId(s, 'e'), card, power: -amount, toughness: -amount, until: 'endOfTurn' });
  s.events.push({ t: 'pump', card, power: -amount, toughness: -amount });
}

function loseLife(s: GameState, player: PlayerId, amount: number): void {
  s.events.push({ t: 'loseLife', player, amount });
  changeLife(s, player, -amount);
}

function strongestFirst(s: GameState, ids: CardId[]): CardId[] {
  return [...ids].sort((a, b) => getPower(s, b) - getPower(s, a) || getToughness(s, b) - getToughness(s, a));
}

function randomDiscard(s: GameState, player: PlayerId): boolean {
  const hand = s.players[player].hand;
  if (hand.length === 0) return false;
  const card = hand[randomInt(s, hand.length)] as CardId;
  moveCard(s, card, 'graveyard');
  s.events.push({ t: 'discard', player, card });
  return true;
}

function runThreatEffect(s: GameState, effect: ThreatEffect, item: StackItem, target: Target | null): void {
  const player = item.controller;
  const foe = opponent(player);
  const source = item.kind === 'spell' ? item.card : item.source;
  switch (effect.kind) {
    case 'damageEach': {
      const assignments = creaturesOf(s, foe).map((id) => ({
        source,
        target: { card: id } as Target,
        amount: effect.creatures,
      }));
      if (effect.player > 0) assignments.push({ source, target: { player: foe }, amount: effect.player });
      applyDamage(s, assignments, false);
      return;
    }
    case 'shrinkTarget':
      if (target && !isPlayerTarget(target)) weaken(s, target.card, effect.amount);
      else loseLife(s, foe, effect.fallback);
      return;
    case 'reanimate': {
      const dead = s.players[player].graveyard.filter((id) => isCreatureDef(defOf(s, id)));
      const chosen = strongestFirst(s, dead).slice(0, effect.count);
      if (chosen.length === 0) {
        if (effect.damage) applyDamage(s, [{ source, target: { player: foe }, amount: effect.fallback }], false);
        else loseLife(s, foe, effect.fallback);
        return;
      }
      for (const card of chosen) {
        if (enterOrOverflow(s, player, card)) s.events.push({ t: 'return', player, card });
      }
      return;
    }
    case 'reveal': {
      const revealed = s.players[player].library.slice(0, effect.count);
      for (const card of revealed) {
        if (isCreatureDef(defOf(s, card))) enterOrOverflow(s, player, card);
        else moveCard(s, card, 'library', { toBottom: true });
      }
      return;
    }
    case 'shrinkAll':
      for (const card of [...creaturesOf(s, 0), ...creaturesOf(s, 1)]) weaken(s, card, effect.amount);
      return;
    case 'counterNext':
      moveCard(s, source, 'battlefield', { controller: player });
      return;
    case 'rebound':
      if (target && !isPlayerTarget(target)) {
        moveCard(s, target.card, 'hand');
        s.events.push({ t: 'bounce', card: target.card, player: getCard(s, target.card).owner });
      } else randomDiscard(s, foe);
      return;
    case 'randomDiscard':
      if (!randomDiscard(s, foe)) loseLife(s, foe, effect.fallback);
      return;
    case 'tapAll':
      for (const card of creaturesOf(s, foe)) getCard(s, card).tapped = true;
      return;
  }
}

export function resolveThreatSpell(s: GameState, item: StackItem): boolean {
  if (item.kind !== 'spell') return false;
  const def = defOf(s, item.card);
  const effect = def.threat?.effect;
  if (!effect) return false;
  const specs = def.spell?.targets ?? [];
  const legal = targetLegality(s, item, specs);
  if (specs.length > 0 && !legal.some(Boolean)) {
    s.events.push({ t: 'fizzle', item });
    moveCard(s, item.card, 'graveyard');
    return true;
  }
  s.events.push({ t: 'resolve', item });
  const target = specs.length > 0 && legal[0] ? (item.targets[0] ?? null) : null;
  runThreatEffect(s, effect, item, target);
  if (effect.kind !== 'counterNext') moveCard(s, item.card, 'graveyard');
  return true;
}

export function nemesisDiscard(s: GameState, player: PlayerId, amount: number): boolean {
  if (!isNemesis(s, player)) return false;
  if (s.players[player].challenge) return true;
  for (const card of s.players[player].library.slice(0, amount)) {
    moveCard(s, card, 'graveyard');
    s.events.push({ t: 'mill', card, player });
  }
  return true;
}
