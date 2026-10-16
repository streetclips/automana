import { applyDamage, sourceHasKeyword, type DamageAssignment, type EffectContext } from './effects';
import {
  changeLife,
  creaturesOf,
  defOf,
  getCard,
  getPower,
  getToughness,
  hasKeyword,
  hasSubtype,
  isCreatureDef,
  moveCard,
  newId,
  onBattlefield,
  opponent,
  queueTriggers,
} from './state';
import { isPlayerTarget } from './targets';
import type {
  CardId,
  CardType,
  ChallengeEffect,
  ChallengeKind,
  GameState,
  Keyword,
  PlayerId,
  TurnRule,
  Zone,
} from './types';

const REVEALS: Record<ChallengeKind, number> = { horde: 2, god: 2, hydra: 1 };
const ELITE_HEAD_DAMAGE = 2;
const HIDE_TURNS = 2;

export function challengeOf(s: GameState, player: PlayerId): ChallengeKind | undefined {
  return s.players[player].challenge;
}

function seatOf(s: GameState, id: CardId): ChallengeKind | undefined {
  const card = s.cards[id];
  return card ? s.players[card.owner].challenge : undefined;
}

export function arrangeChallenge(
  s: GameState,
  player: PlayerId,
  kind: ChallengeKind,
  options: { headStart?: number } = {},
): void {
  const ps = s.players[player];
  ps.nemesis = true;
  ps.challenge = kind;
  ps.kept = true;
  ps.bottomed = true;
  ps.turnRules = [];
  if (options.headStart) s.players[opponent(player)].extraTurns = options.headStart;
}

function bodyValue(s: GameState, id: CardId): number {
  return Math.max(0, getPower(s, id)) * 1.5 + getToughness(s, id) + (defOf(s, id).keywords?.length ?? 0);
}

function byValue(s: GameState, ids: CardId[]): CardId[] {
  return [...ids].sort((a, b) => bodyValue(s, a) - bodyValue(s, b));
}

function revelers(s: GameState): CardId[] {
  return [...creaturesOf(s, 0), ...creaturesOf(s, 1)].filter((id) => hasSubtype(defOf(s, id), 'Reveler'));
}

function heads(s: GameState, player: PlayerId): CardId[] {
  return creaturesOf(s, player).filter((id) => hasSubtype(defOf(s, id), 'Head'));
}

function isElite(s: GameState, id: CardId): boolean {
  return defOf(s, id).challenge?.elite === true;
}

export function subtypeCount(s: GameState, subtype: string): number {
  let count = 0;
  for (const ps of s.players) {
    for (const id of ps.battlefield) if (hasSubtype(defOf(s, id), subtype) && isCreatureDef(defOf(s, id))) count += 1;
  }
  return count;
}

export function revealCards(s: GameState, player: PlayerId, count: number): void {
  const ps = s.players[player];
  for (const card of ps.library.slice(0, count)) {
    moveCard(s, card, 'hand');
    s.events.push({ t: 'draw', player, card });
  }
}

export function challengeDrawStep(s: GameState, player: PlayerId, kind: ChallengeKind): void {
  const extra = s.players[player].battlefield.reduce((sum, id) => sum + (defOf(s, id).challenge?.reveals ?? 0), 0);
  revealCards(s, player, REVEALS[kind] + extra);
}

export function syncChallengeLife(s: GameState): void {
  for (const ps of s.players) {
    if (ps.challenge === 'horde') ps.life = ps.library.length + creaturesOf(s, ps.id).length;
  }
}

function mill(s: GameState, player: PlayerId, amount: number): void {
  for (const card of s.players[player].library.slice(0, amount)) {
    moveCard(s, card, 'graveyard');
    s.events.push({ t: 'mill', card, player });
  }
}

export function challengeLifeChange(s: GameState, player: PlayerId, delta: number): boolean {
  const kind = challengeOf(s, player);
  if (!kind) return false;
  if (delta >= 0) return true;
  if (kind === 'horde') {
    s.players[player].lostLifeThisTurn = true;
    mill(s, player, -delta);
    syncChallengeLife(s);
    return true;
  }
  const source = receiversOf(s, player)[0];
  if (source) applyDamage(s, [{ source, target: { player }, amount: -delta }], false);
  return true;
}

function receiversOf(s: GameState, player: PlayerId): CardId[] {
  const creatures = creaturesOf(s, player);
  if (challengeOf(s, player) === 'god') {
    const anchors = creatures.filter((id) => defOf(s, id).challenge?.anchor);
    return [...creatures.filter((id) => !defOf(s, id).challenge?.anchor), ...anchors];
  }
  return creatures;
}

export function redirectDamage(s: GameState, assignments: DamageAssignment[]): DamageAssignment[] {
  const redirected = (assignment: DamageAssignment): boolean => {
    if (!isPlayerTarget(assignment.target)) return false;
    const kind = challengeOf(s, assignment.target.player);
    return kind === 'god' || kind === 'hydra';
  };
  if (!assignments.some(redirected)) return assignments;
  const planned = new Map<CardId, number>();
  const remaining = (id: CardId, deathtouch: boolean): number => {
    if (hasKeyword(s, id, 'indestructible')) return Number.POSITIVE_INFINITY;
    const left = getToughness(s, id) - getCard(s, id).damage - (planned.get(id) ?? 0);
    return deathtouch && left > 0 && (planned.get(id) ?? 0) === 0 ? 1 : left;
  };
  const kept = assignments.filter((assignment) => !redirected(assignment));
  const chunks = assignments.filter(redirected).sort((a, b) => b.amount - a.amount);
  for (const chunk of chunks) {
    const seat = (chunk.target as { player: PlayerId }).player;
    const deathtouch = sourceHasKeyword(s, chunk.source, 'deathtouch');
    const alive = receiversOf(s, seat).filter((id) => onBattlefield(s, id) && remaining(id, false) > 0);
    const open = alive.filter((id) => !defOf(s, id).challenge?.anchor || alive.every((other) => other === id));
    const killable = open.filter((id) => remaining(id, deathtouch) <= chunk.amount);
    const pick =
      killable.sort((a, b) => remaining(b, deathtouch) - remaining(a, deathtouch))[0] ??
      open.sort((a, b) => remaining(a, deathtouch) - remaining(b, deathtouch))[0];
    if (!pick) continue;
    planned.set(pick, (planned.get(pick) ?? 0) + chunk.amount);
    kept.push({ ...chunk, target: { card: pick } });
  }
  return kept;
}

export function challengeDestination(s: GameState, id: CardId, from: Zone, to: Zone): Zone | null {
  if (!seatOf(s, id) || from !== 'battlefield') return null;
  return to === 'hand' || to === 'exile' ? 'graveyard' : null;
}

export function cantLeave(s: GameState, id: CardId): boolean {
  return defOf(s, id).challenge?.anchor === true && seatOf(s, id) === 'god' && revelers(s).length > 0;
}

function regrow(s: GameState, player: PlayerId): void {
  for (const card of s.players[player].library.slice(0, 2)) {
    if (hasSubtype(defOf(s, card), 'Head')) moveCard(s, card, 'battlefield', { controller: player });
    else moveCard(s, card, 'graveyard');
  }
}

export function afterChallengeMove(s: GameState, id: CardId, from: Zone, to: Zone): void {
  const kind = seatOf(s, id);
  if (!kind) return;
  const owner = getCard(s, id).owner;
  if (to === 'graveyard') queueTriggers(s, id, 'graveyard', owner);
  if (from !== 'battlefield' || to === 'battlefield') return;
  if (defOf(s, id).challenge?.anchor) s.players[owner].defeated = true;
  if (kind !== 'hydra' || !hasSubtype(defOf(s, id), 'Head')) return;
  const swallowed = s.players[owner].swallowed ?? [];
  s.players[owner].swallowed = [];
  for (const card of swallowed) {
    if (s.cards[card]?.zone === 'exile') moveCard(s, card, 'battlefield', { controller: getCard(s, card).owner });
  }
  regrow(s, owner);
}

function addRule(s: GameState, player: PlayerId, rule: TurnRule, source: CardId): void {
  const ps = s.players[player];
  ps.turnRules = [...(ps.turnRules ?? []), { ...rule, source }];
}

function pump(s: GameState, card: CardId, power: number, keywords: Keyword[], destroy = false): void {
  s.effects.push({ id: newId(s, 'e'), card, power, toughness: 0, keywords, until: 'endOfTurn' });
  if (destroy) s.effects.push({ id: newId(s, 'e'), card, power: 0, toughness: 0, destroyAtEndOfCombat: true, until: 'endOfTurn' });
  s.events.push({ t: 'pump', card, power, toughness: 0, keywords });
}

function damagePlayer(s: GameState, source: CardId, player: PlayerId, amount: number): void {
  applyDamage(s, [{ source, target: { player }, amount }], false);
}

function sacrifice(s: GameState, id: CardId): void {
  s.events.push({ t: 'sacrifice', card: id, player: getCard(s, id).controller });
  moveCard(s, id, 'graveyard');
}

function permanentsOfType(s: GameState, player: PlayerId, types: CardType[]): CardId[] {
  return s.players[player].battlefield.filter((id) => types.some((type) => defOf(s, id).types.includes(type)));
}

function freeze(s: GameState, ids: CardId[]): void {
  for (const id of ids) {
    const card = getCard(s, id);
    card.tapped = true;
    card.frozen = true;
  }
}

function headDamage(s: GameState, id: CardId): number {
  return isElite(s, id) ? ELITE_HEAD_DAMAGE : 1;
}

export function runChallengeEffect(s: GameState, effect: ChallengeEffect, ctx: EffectContext): void {
  const seat = ctx.controller;
  const foe = opponent(seat);
  switch (effect.kind) {
    case 'turnRule':
      addRule(s, seat, effect.rule, ctx.source);
      return;
    case 'revealCast':
      revealCards(s, seat, effect.count);
      return;
    case 'sacrificeOwn': {
      const own = creaturesOf(s, seat).filter((id) => hasSubtype(defOf(s, id), effect.subtype));
      for (const id of byValue(s, own).reverse().slice(0, effect.count)) sacrifice(s, id);
      return;
    }
    case 'returnCreatures': {
      const value = (id: CardId): number => (defOf(s, id).power ?? 0) * 1.5 + (defOf(s, id).toughness ?? 0);
      for (const player of [foe, seat] as const) {
        const dead = s.players[player].graveyard.filter((id) => isCreatureDef(defOf(s, id)));
        const ranked = [...dead].sort((a, b) => value(b) - value(a));
        const pick = player === foe ? ranked[0] : ranked.at(-1);
        if (!pick) continue;
        moveCard(s, pick, 'battlefield', { controller: player });
        s.events.push({ t: 'return', player, card: pick });
      }
      return;
    }
    case 'damagePlayer':
      damagePlayer(s, ctx.source, foe, effect.perHead ? heads(s, seat).length : effect.amount);
      return;
    case 'sacrificeOrDamage': {
      const options = permanentsOfType(s, foe, effect.types).filter((id) => !isCreatureDef(defOf(s, id)));
      const pick = options[0];
      if (pick && s.players[foe].life <= effect.amount * 2) sacrifice(s, pick);
      else damagePlayer(s, ctx.source, foe, effect.amount);
      return;
    }
    case 'returnNamed': {
      const found = s.players[seat].graveyard.filter((id) => getCard(s, id).def === effect.card).slice(0, effect.count);
      for (const card of found) moveCard(s, card, 'battlefield', { controller: seat });
      return;
    }
    case 'silence':
      s.players[foe].silenced = true;
      return;
    case 'distract': {
      const fodder = byValue(s, creaturesOf(s, foe))[0];
      const target = heads(s, seat)
        .filter((id) => !getCard(s, id).tapped)
        .sort((a, b) => headDamage(s, b) - headDamage(s, a))[0];
      const cheap = fodder !== undefined && bodyValue(s, fodder) <= effect.life;
      if (fodder !== undefined && (cheap || s.players[foe].life <= effect.life)) {
        sacrifice(s, fodder);
        if (target) getCard(s, target).tapped = true;
      } else {
        s.events.push({ t: 'loseLife', player: foe, amount: effect.life });
        changeLife(s, foe, -effect.life);
      }
      return;
    }
    case 'regrow': {
      const dead = s.players[seat].graveyard.filter((id) => getCard(s, id).def === effect.card);
      if (dead.length >= effect.count) {
        for (const card of dead.slice(0, effect.count)) moveCard(s, card, 'battlefield', { controller: seat });
        return;
      }
      for (const card of [...s.players[seat].library]) {
        if (hasSubtype(defOf(s, card), 'Head')) {
          moveCard(s, card, 'battlefield', { controller: seat });
          return;
        }
        moveCard(s, card, 'graveyard');
      }
      return;
    }
    case 'hide':
      for (const id of heads(s, seat)) {
        s.effects.push({
          id: newId(s, 'e'),
          card: id,
          power: 0,
          toughness: 0,
          keywords: ['indestructible'],
          until: 'endOfTurn',
          expires: s.turn + HIDE_TURNS,
        });
      }
      return;
    case 'tangle': {
      const all = heads(s, seat);
      if (all.length >= effect.heads) freeze(s, untappedByDamage(s, all).slice(0, 2));
      else revealCards(s, seat, 1);
      return;
    }
    case 'freezeHeads':
      freeze(s, untappedByDamage(s, heads(s, seat)).slice(0, effect.count));
      return;
    case 'breath': {
      const tapped = creaturesOf(s, foe).filter((id) => getCard(s, id).tapped);
      const worth = tapped.reduce((sum, id) => sum + bodyValue(s, id), 0);
      if (tapped.length > 0 && worth > effect.amount && s.players[foe].life > effect.amount * 2) {
        damagePlayer(s, ctx.source, foe, effect.amount);
      } else {
        for (const id of tapped) if (!hasKeyword(s, id, 'indestructible')) moveCard(s, id, 'graveyard');
      }
      return;
    }
    case 'weakSpot': {
      const all = heads(s, seat);
      const plain = all.filter((id) => !isElite(s, id));
      const pick = byValue(s, plain.length > 0 ? plain : all)[0];
      if (!pick || hasKeyword(s, pick, 'indestructible')) return;
      const elite = isElite(s, pick);
      moveCard(s, pick, 'graveyard');
      if (elite) s.players[seat].extraTurns = (s.players[seat].extraTurns ?? 0) + 1;
      return;
    }
    case 'swallow': {
      const victim = byValue(s, creaturesOf(s, foe))[0];
      if (!victim) return;
      moveCard(s, victim, 'exile');
      s.players[seat].swallowed = [...(s.players[seat].swallowed ?? []), victim];
      return;
    }
  }
}

function untappedByDamage(s: GameState, ids: CardId[]): CardId[] {
  return ids
    .filter((id) => !getCard(s, id).tapped)
    .sort((a, b) => headDamage(s, b) - headDamage(s, a) || bodyValue(s, b) - bodyValue(s, a));
}

function rulesOf(s: GameState, player: PlayerId): TurnRule[] {
  return s.players[player].turnRules ?? [];
}

function forcedBy(s: GameState, player: PlayerId, id: CardId): boolean {
  const def = defOf(s, id);
  const must = def.challenge?.mustAttack;
  if (must === true || (typeof must === 'number' && revelers(s).length >= must)) return true;
  const panic = s.players[player].battlefield.some((other) => {
    const threshold = defOf(s, other).challenge?.panic;
    return threshold !== undefined && revelers(s).length >= threshold;
  });
  if (panic && hasSubtype(def, 'Reveler')) return true;
  return rulesOf(s, player).some((rule) => rule.kind === 'mustAttack' && hasSubtype(def, rule.subtype));
}

export function forcedAttackers(s: GameState, player: PlayerId, eligible: CardId[]): CardId[] {
  return eligible.filter((id) => forcedBy(s, player, id));
}

export function challengeBeginCombat(s: GameState): void {
  const seat = s.activePlayer;
  const kind = challengeOf(s, seat);
  if (!kind) return;
  const foe = opponent(seat);
  if (kind === 'hydra') {
    const assignments = heads(s, seat)
      .filter((id) => !getCard(s, id).tapped)
      .map((id) => ({ source: id, target: { player: foe } as const, amount: headDamage(s, id) }));
    applyDamage(s, assignments, true);
  }
  for (const rule of rulesOf(s, seat)) {
    switch (rule.kind) {
      case 'combatDamage': {
        const all = [...creaturesOf(s, 0), ...creaturesOf(s, 1)];
        const source = rule.source;
        if (source) applyDamage(s, all.map((id) => ({ source, target: { card: id }, amount: rule.creatures })), false);
        break;
      }
      case 'revelerDamage': {
        const party = revelers(s).filter((id) => getCard(s, id).controller === seat);
        const assignments: DamageAssignment[] = [];
        for (const reveler of party) {
          assignments.push({ source: reveler, target: { player: foe }, amount: 1 });
          if (rule.creatures) {
            for (const id of creaturesOf(s, foe)) assignments.push({ source: reveler, target: { card: id }, amount: 1 });
          }
        }
        applyDamage(s, assignments, false);
        break;
      }
      case 'mustAttack':
        if (!rule.haste && !rule.keywords?.length) break;
        for (const id of creaturesOf(s, seat).filter((card) => hasSubtype(defOf(s, card), rule.subtype))) {
          pump(s, id, 0, [...(rule.haste ? (['haste'] as const) : []), ...(rule.keywords ?? [])]);
        }
        break;
      case 'attackers':
        break;
    }
  }
}

export function challengeAttacks(s: GameState, attackers: CardId[]): void {
  const seat = s.activePlayer;
  if (!challengeOf(s, seat) || attackers.length === 0) return;
  for (const rule of rulesOf(s, seat)) {
    if (rule.kind !== 'attackers') continue;
    for (const id of attackers.filter((card) => hasSubtype(defOf(s, card), rule.subtype))) {
      pump(s, id, rule.power, rule.keywords, rule.destroy);
    }
  }
  const flames = s.players[seat].battlefield.reduce((sum, id) => sum + (defOf(s, id).challenge?.flame ?? 0), 0);
  const party = attackers.filter((id) => hasSubtype(defOf(s, id), 'Reveler')).length;
  const source = s.players[seat].battlefield.find((id) => defOf(s, id).challenge?.flame);
  if (source && flames * party > 0) damagePlayer(s, source, opponent(seat), flames * party);
}

export function challengeEndCombat(s: GameState): void {
  const doomed = s.effects.filter((effect) => effect.destroyAtEndOfCombat).map((effect) => effect.card);
  for (const id of new Set(doomed)) {
    if (onBattlefield(s, id) && !hasKeyword(s, id, 'indestructible')) moveCard(s, id, 'graveyard');
  }
}

export function challengeUntap(s: GameState, player: PlayerId): void {
  if (!challengeOf(s, player)) return;
  s.players[opponent(player)].silenced = false;
  s.players[player].swallowed = [];
}

export function challengeCleanup(s: GameState): void {
  for (const ps of s.players) {
    if (!ps.challenge) continue;
    ps.turnRules = [];
    if (ps.challenge === 'hydra' && heads(s, ps.id).length === 0) ps.defeated = true;
  }
}
