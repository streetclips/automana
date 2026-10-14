import { parseCost } from './mana';
import { nemesisDiscard, resolveThreatSpell } from './nemesis';
import { getCardDef } from './registry';
import { shuffleInPlace } from './rng';
import {
  canAfford,
  changeLife,
  countOf,
  createToken,
  creaturesOf,
  defOf,
  drawCards,
  findPayment,
  getCard,
  getKeywords,
  getPower,
  hasKeyword,
  hasSubtype,
  isCreature,
  isCreatureDef,
  isLandDef,
  isPermanentDef,
  moveCard,
  newId,
  onBattlefield,
  opponent,
  payWith,
  queueTriggers,
  triggerSources,
  triggeredAbility,
} from './state';
import { isLegalTarget, isPlayerTarget } from './targets';
import type {
  CardId,
  ContinuousEffect,
  Effect,
  EffectCondition,
  EffectTarget,
  GameEvent,
  GameState,
  Keyword,
  PlayerId,
  StackItem,
  Target,
  TargetSpec,
  Who,
} from './types';

export interface DamageAssignment {
  source: CardId;
  target: Target;
  amount: number;
}

export function sourceHasKeyword(s: GameState, source: CardId, keyword: Keyword): boolean {
  const card = s.cards[source];
  if (!card) return false;
  const def = getCardDef(card.def);
  if (!isCreatureDef(def)) return false;
  const keywords = card.zone === 'battlefield' ? getKeywords(s, source) : (def.keywords ?? []);
  return keywords.includes(keyword);
}

export function applyDamage(s: GameState, assignments: DamageAssignment[], combat: boolean): void {
  const lifelinkGains = new Map<PlayerId, number>();
  for (const assignment of assignments) {
    const { source, target, amount } = assignment;
    if (amount <= 0) continue;
    if (isPlayerTarget(target)) {
      s.events.push({ t: 'damage', source, target, amount, combat });
      s.players[target.player].damagedThisTurn = true;
      changeLife(s, target.player, -amount);
    } else {
      const card = s.cards[target.card];
      if (!card || card.zone !== 'battlefield') continue;
      card.damage += amount;
      if (sourceHasKeyword(s, source, 'deathtouch')) card.deathtouchDamage = true;
      s.events.push({ t: 'damage', source, target, amount, combat });
    }
    if (sourceHasKeyword(s, source, 'lifelink')) {
      const controller = getCard(s, source).controller;
      lifelinkGains.set(controller, (lifelinkGains.get(controller) ?? 0) + amount);
    }
  }
  for (const [player, amount] of lifelinkGains) changeLife(s, player, amount);
}

export interface EffectContext {
  controller: PlayerId;
  source: CardId;
  targets: Target[];
  targetLegal: boolean[];
  kicked?: boolean;
}

function resolveEffectTarget(s: GameState, ctx: EffectContext, ref: EffectTarget): Target | null {
  if (ref === 'self') return onBattlefield(s, ctx.source) ? { card: ctx.source } : null;
  if (ref === 'opponent') return { player: opponent(ctx.controller) };
  if (ref === 'attached') {
    const attached = s.cards[ctx.source]?.attachedTo;
    return attached && onBattlefield(s, attached) ? { card: attached } : null;
  }
  const target = ctx.targets[ref];
  if (!target || !ctx.targetLegal[ref]) return null;
  return target;
}

function resolvePermanentTarget(s: GameState, ctx: EffectContext, ref: EffectTarget): CardId | null {
  const target = resolveEffectTarget(s, ctx, ref);
  if (!target || isPlayerTarget(target) || !onBattlefield(s, target.card)) return null;
  return target.card;
}

function resolveCreatureTarget(s: GameState, ctx: EffectContext, ref: EffectTarget): CardId | null {
  const card = resolvePermanentTarget(s, ctx, ref);
  return card && isCreature(s, card) ? card : null;
}

function resolveGraveyardTarget(s: GameState, ctx: EffectContext, ref: number): CardId | null {
  const target = ctx.targets[ref];
  if (!target || !ctx.targetLegal[ref] || isPlayerTarget(target)) return null;
  return s.cards[target.card]?.zone === 'graveyard' ? target.card : null;
}

function addEffect(
  s: GameState,
  card: CardId,
  power: number,
  toughness: number,
  extra: Omit<ContinuousEffect, 'id' | 'card' | 'power' | 'toughness' | 'until'> = {},
): void {
  s.effects.push({ id: newId(s, 'e'), card, power, toughness, until: 'endOfTurn', ...extra });
}

function pumpUntilEndOfTurn(
  s: GameState,
  card: CardId,
  power: number,
  toughness: number,
  keywords: Keyword[] = [],
): void {
  const effect: ContinuousEffect = { id: newId(s, 'e'), card, power, toughness, until: 'endOfTurn' };
  const event: GameEvent = { t: 'pump', card, power, toughness };
  if (keywords.length > 0) {
    effect.keywords = [...keywords];
    event.keywords = [...keywords];
  }
  s.effects.push(effect);
  s.events.push(event);
}

export const PAY_LIFE_CUSHION = 6;

function conditionMet(s: GameState, ctx: EffectContext, condition: EffectCondition | undefined): boolean {
  if (!condition) return true;
  if ('kicked' in condition) return ctx.kicked === true;
  if ('targetSubtype' in condition) {
    const target = ctx.targets[condition.target];
    if (!target || isPlayerTarget(target)) return false;
    const card = s.cards[target.card];
    return card !== undefined && hasSubtype(getCardDef(card.def), condition.targetSubtype);
  }
  if ('payMana' in condition) {
    const cost = parseCost(condition.payMana);
    if (!canAfford(s, ctx.controller, cost)) return false;
    const payment = findPayment(s, ctx.controller, cost);
    if (!payment) return false;
    payWith(s, payment);
    return true;
  }
  if (s.players[ctx.controller].life < condition.payLife + PAY_LIFE_CUSHION) return false;
  s.events.push({ t: 'loseLife', player: ctx.controller, amount: condition.payLife });
  changeLife(s, ctx.controller, -condition.payLife);
  return true;
}

function scry(s: GameState, player: PlayerId, amount: number): void {
  const ps = s.players[player];
  const lands = [...ps.battlefield, ...ps.hand].filter((id) => isLandDef(defOf(s, id))).length;
  const top = ps.library.slice(0, amount);
  const bottom = top.filter((id) => isLandDef(defOf(s, id)) && lands >= 5);
  for (const id of bottom) {
    ps.library.splice(ps.library.indexOf(id), 1);
    ps.library.push(id);
  }
  s.events.push({ t: 'scry', player, bottom: bottom.length, top: top.length - bottom.length });
}

function distributeCounters(s: GameState, ctx: EffectContext, amount: number): void {
  const cards = ctx.targets
    .map((_, index) => resolveCreatureTarget(s, ctx, index))
    .filter((card): card is CardId => card !== null);
  if (cards.length === 0) return;
  cards.forEach((card, index) => {
    const share = Math.floor(amount / cards.length) + (index < amount % cards.length ? 1 : 0);
    addCounters(s, card, share);
  });
  for (const card of cards) addCounters(s, card, getCard(s, card).counters);
}

function playerOf(ctx: EffectContext, who: Who | undefined): PlayerId {
  return who === 'opponent' ? opponent(ctx.controller) : ctx.controller;
}

export function addCounters(s: GameState, card: CardId, amount: number): void {
  if (amount <= 0) return;
  const instance = getCard(s, card);
  instance.counters += amount;
  s.events.push({ t: 'addCounters', card, amount });
  if (!isCreature(s, card) || hasSubtype(defOf(s, card), 'Hydra')) return;
  for (const other of triggerSources(s, instance.controller)) {
    if (other !== card) queueTriggers(s, other, 'allyCounters', instance.controller, card);
  }
}

function searchLand(
  s: GameState,
  player: PlayerId,
  land: string,
  battlefield: number,
  hand: number,
  tapped: boolean,
): void {
  const library = s.players[player].library;
  const found = library.filter((id) => getCard(s, id).def === land).slice(0, battlefield + hand);
  found.forEach((id, index) => {
    const to = index < battlefield ? 'battlefield' : 'hand';
    s.events.push({ t: 'search', player, card: id, to });
    moveCard(s, id, to, { controller: player });
    if (to === 'battlefield' && tapped) getCard(s, id).tapped = true;
  });
  shuffleInPlace(s, library);
}

export function executeEffects(s: GameState, effects: Effect[], ctx: EffectContext): void {
  for (const effect of effects) {
    if (!conditionMet(s, ctx, effect.if)) continue;
    switch (effect.kind) {
      case 'damage': {
        const target = resolveEffectTarget(s, ctx, effect.to);
        const amount = effect.amount * (effect.times ? countOf(s, ctx.controller, effect.times) : 1);
        if (target) applyDamage(s, [{ source: ctx.source, target, amount }], false);
        break;
      }
      case 'pump': {
        const card = resolveCreatureTarget(s, ctx, effect.to);
        if (card) pumpUntilEndOfTurn(s, card, effect.power, effect.toughness, effect.keywords);
        break;
      }
      case 'pumpTeam':
        for (const card of creaturesOf(s, ctx.controller))
          pumpUntilEndOfTurn(s, card, effect.power, effect.toughness, effect.keywords);
        break;
      case 'pumpAttackers': {
        const attackers = (s.combat?.attackers ?? []).filter(
          (card) => onBattlefield(s, card) && getCard(s, card).controller === ctx.controller,
        );
        const amount = effect.perAttacker * attackers.length;
        for (const card of attackers) pumpUntilEndOfTurn(s, card, amount, amount);
        break;
      }
      case 'addCounters': {
        const card = resolveCreatureTarget(s, ctx, effect.to);
        if (card) addCounters(s, card, effect.amount);
        break;
      }
      case 'addCountersTeam':
        for (const card of creaturesOf(s, ctx.controller)) addCounters(s, card, effect.amount);
        break;
      case 'distributeCounters':
        distributeCounters(s, ctx, effect.amount);
        break;
      case 'destroy': {
        const card = resolvePermanentTarget(s, ctx, effect.to);
        if (card && !(isCreature(s, card) && hasKeyword(s, card, 'indestructible'))) moveCard(s, card, 'graveyard');
        break;
      }
      case 'exile': {
        const card = resolvePermanentTarget(s, ctx, effect.to);
        if (card) moveCard(s, card, 'exile');
        break;
      }
      case 'exileIfDies': {
        const card = resolveCreatureTarget(s, ctx, effect.to);
        if (card) addEffect(s, card, 0, 0, { exileIfDies: true });
        break;
      }
      case 'bounce': {
        const card = resolvePermanentTarget(s, ctx, effect.to);
        if (!card) break;
        moveCard(s, card, 'hand');
        s.events.push({ t: 'bounce', card, player: getCard(s, card).owner });
        break;
      }
      case 'counter': {
        const target = resolveEffectTarget(s, ctx, effect.to);
        if (!target || isPlayerTarget(target)) break;
        const index = s.stack.findIndex((item) => item.kind === 'spell' && item.card === target.card);
        const item = s.stack[index];
        if (!item) break;
        s.stack.splice(index, 1);
        moveCard(s, target.card, 'graveyard');
        s.events.push({ t: 'counter', card: target.card, player: item.controller });
        break;
      }
      case 'draw':
        drawCards(s, ctx.controller, effect.amount);
        break;
      case 'gainLife':
        changeLife(s, ctx.controller, effect.amount * (effect.times ? countOf(s, ctx.controller, effect.times) : 1));
        break;
      case 'loseLife': {
        const player = playerOf(ctx, effect.who);
        s.events.push({ t: 'loseLife', player, amount: effect.amount });
        changeLife(s, player, -effect.amount);
        break;
      }
      case 'fight': {
        const a = resolveCreatureTarget(s, ctx, effect.a);
        const b = resolveCreatureTarget(s, ctx, effect.b);
        if (!a || !b) break;
        s.events.push({ t: 'fight', a, b });
        applyDamage(
          s,
          [
            { source: a, target: { card: b }, amount: getPower(s, a) },
            { source: b, target: { card: a }, amount: getPower(s, b) },
          ],
          false,
        );
        break;
      }
      case 'bite': {
        const a = resolveCreatureTarget(s, ctx, effect.a);
        const b = resolveCreatureTarget(s, ctx, effect.b);
        if (!a || !b) break;
        s.events.push({ t: 'bite', a, b });
        applyDamage(s, [{ source: a, target: { card: b }, amount: getPower(s, a) }], false);
        break;
      }
      case 'createTokens':
        for (let i = 0; i < effect.amount; i++) createToken(s, effect.token, ctx.controller);
        break;
      case 'discard': {
        const player = playerOf(ctx, effect.who);
        if (nemesisDiscard(s, player, effect.amount)) break;
        const count = Math.min(effect.amount, s.players[player].hand.length);
        if (count > 0) s.pending = { kind: 'discard', player, count, source: ctx.source };
        break;
      }
      case 'returnToBattlefield': {
        const card = s.cards[ctx.source];
        if (!card || card.zone !== 'graveyard') break;
        moveCard(s, ctx.source, 'battlefield', { controller: card.owner });
        s.events.push({ t: 'return', player: card.owner, card: ctx.source });
        addCounters(s, ctx.source, effect.counters);
        break;
      }
      case 'returnSelf': {
        const card = s.cards[ctx.source];
        if (!card || card.zone !== 'graveyard') break;
        moveCard(s, ctx.source, 'battlefield', { controller: card.owner });
        if (effect.tapped) card.tapped = true;
        s.events.push({ t: 'return', player: card.owner, card: ctx.source });
        break;
      }
      case 'returnToHand': {
        const card = resolveGraveyardTarget(s, ctx, effect.to);
        if (card) moveCard(s, card, 'hand');
        break;
      }
      case 'mill': {
        const library = s.players[ctx.controller].library;
        for (let i = 0; i < effect.amount; i++) {
          const top = library[0];
          if (top === undefined) break;
          moveCard(s, top, 'graveyard');
          s.events.push({ t: 'mill', card: top, player: ctx.controller });
        }
        break;
      }
      case 'scry':
        scry(s, ctx.controller, effect.amount);
        break;
      case 'attach': {
        const card = resolveCreatureTarget(s, ctx, effect.to);
        const source = s.cards[ctx.source];
        if (!card || !source || source.zone !== 'battlefield') break;
        source.attachedTo = card;
        s.events.push({ t: 'attach', card: ctx.source, to: card });
        break;
      }
      case 'tap': {
        const card = resolvePermanentTarget(s, ctx, effect.to);
        if (card) getCard(s, card).tapped = true;
        break;
      }
      case 'cantBlock': {
        const card = resolveCreatureTarget(s, ctx, effect.to);
        if (card) addEffect(s, card, 0, 0, { cantBlock: true });
        break;
      }
      case 'unblockable': {
        const card = resolveCreatureTarget(s, ctx, effect.to);
        if (card) addEffect(s, card, 0, 0, { unblockable: true });
        break;
      }
      case 'doom': {
        const card = resolveCreatureTarget(s, ctx, effect.to);
        if (card) addEffect(s, card, 0, 0, { doom: true });
        break;
      }
      case 'extraLands':
        s.players[ctx.controller].extraLandsThisTurn += effect.amount;
        s.events.push({ t: 'extraLands', player: ctx.controller, amount: effect.amount });
        break;
      case 'searchLand':
        searchLand(s, ctx.controller, effect.land, effect.battlefield, effect.hand ?? 0, effect.tapped ?? false);
        break;
    }
  }
}

export function stackItemSource(item: StackItem): CardId {
  return item.kind === 'spell' ? item.card : item.source;
}

export function stackItemAbility(s: GameState, item: StackItem): { targets: TargetSpec[]; effects: Effect[] } | null {
  const def = defOf(s, stackItemSource(item));
  if (item.kind === 'spell') return def.spell ?? { targets: [], effects: [] };
  if (item.kind === 'trigger') return triggeredAbility(def, item.ability) ?? null;
  return def.activated?.[item.ability] ?? null;
}

export function targetLegality(s: GameState, item: StackItem, specs: TargetSpec[]): boolean[] {
  const source = stackItemSource(item);
  return item.targets.map((target, i) => {
    const spec = specs[i];
    return spec && !item.lost?.includes(i) ? isLegalTarget(s, item.controller, spec, target, source) : false;
  });
}

function resolvePermanentSpell(s: GameState, item: Extract<StackItem, { kind: 'spell' }>): void {
  const def = defOf(s, item.card);
  if (def.enchant) {
    const legal = targetLegality(s, item, [def.enchant]);
    const target = item.targets[0];
    if (!target || isPlayerTarget(target) || !legal[0]) {
      s.events.push({ t: 'fizzle', item });
      moveCard(s, item.card, 'graveyard');
      return;
    }
    s.events.push({ t: 'resolve', item });
    getCard(s, item.card).attachedTo = target.card;
    moveCard(s, item.card, 'battlefield', { controller: item.controller });
    s.events.push({ t: 'attach', card: item.card, to: target.card });
    return;
  }
  s.events.push({ t: 'resolve', item });
  moveCard(s, item.card, 'battlefield', { controller: item.controller });
  if (def.xCounters && item.x) addCounters(s, item.card, item.x);
}

export function resolveTopOfStack(s: GameState): void {
  const item = s.stack.pop();
  if (!item) return;
  if (resolveThreatSpell(s, item)) return;
  const source = stackItemSource(item);

  if (item.kind === 'spell' && isPermanentDef(defOf(s, source))) {
    resolvePermanentSpell(s, item);
    return;
  }

  const ability = stackItemAbility(s, item);
  if (!ability) return;
  const legal = targetLegality(s, item, ability.targets);
  if (item.targets.length > 0 && !legal.some(Boolean)) {
    s.events.push({ t: 'fizzle', item });
  } else {
    s.events.push({ t: 'resolve', item });
    executeEffects(s, ability.effects, {
      controller: item.controller,
      source,
      targets: item.targets,
      targetLegal: legal,
      kicked: item.kind === 'spell' && item.kicked === true,
    });
  }
  if (item.kind === 'spell') moveCard(s, source, 'graveyard');
}
