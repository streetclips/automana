import {
  blocksError,
  cloneState,
  creaturesOf,
  defOf,
  eligibleAttackers,
  getCard,
  getCost,
  getKeywords,
  getPower,
  getToughness,
  hasKeyword,
  manaValue,
  opponent,
  shuffleInPlace,
  triggeredAbility,
  type Action,
  type Block,
  type CardId,
  type GameState,
  type PlayerId,
  type Target,
  type TargetSpec,
} from '../engine';
import { canBlockAttacker } from '../engine/combat';
import { compareIds } from '../engine/mana';
import { forcedAttackers } from '../engine/challenge';
import { nemesisSeat } from '../engine/nemesis';
import { castError } from '../engine/rules';
import { isLegalTarget, legalTargets, sameTarget } from '../engine/targets';

interface Fighter {
  power: number;
  toughness: number;
  damage: number;
  first: boolean;
  regular: boolean;
  deathtouch: boolean;
  indestructible: boolean;
}

function fighter(s: GameState, id: CardId): Fighter {
  const keywords = getKeywords(s, id) as string[];
  const firstStrike = keywords.includes('firstStrike');
  const doubleStrike = keywords.includes('doubleStrike');
  return {
    power: getPower(s, id),
    toughness: getToughness(s, id),
    damage: getCard(s, id).damage,
    first: firstStrike || doubleStrike,
    regular: !firstStrike || doubleStrike,
    deathtouch: keywords.includes('deathtouch'),
    indestructible: keywords.includes('indestructible'),
  };
}

function dies(f: Fighter, taken: number, deathtouched: boolean): boolean {
  if (f.toughness <= 0) return true;
  if (f.indestructible) return false;
  return f.damage + taken >= f.toughness || (deathtouched && taken > 0);
}

export function duel(s: GameState, attacker: CardId, blocker: CardId): { attackerDies: boolean; blockerDies: boolean } {
  const a = fighter(s, attacker);
  const b = fighter(s, blocker);
  let toA = 0;
  let toB = 0;
  let deathtouchA = false;
  let deathtouchB = false;
  if (a.first && a.power > 0) {
    toB += a.power;
    deathtouchB ||= a.deathtouch;
  }
  if (b.first && b.power > 0) {
    toA += b.power;
    deathtouchA ||= b.deathtouch;
  }
  if (!dies(a, toA, deathtouchA) && !dies(b, toB, deathtouchB)) {
    if (a.regular && a.power > 0) {
      toB += a.power;
      deathtouchB ||= a.deathtouch;
    }
    if (b.regular && b.power > 0) {
      toA += b.power;
      deathtouchA ||= b.deathtouch;
    }
  }
  return { attackerDies: dies(a, toA, deathtouchA), blockerDies: dies(b, toB, deathtouchB) };
}

function seniority(s: GameState, id: CardId): number {
  const card = getCard(s, id);
  return s.players[card.controller].battlefield.indexOf(id);
}

export function strongestFirst(s: GameState, ids: CardId[]): CardId[] {
  return [...ids].sort(
    (a, b) =>
      getPower(s, b) - getPower(s, a) || getToughness(s, b) - getToughness(s, a) || seniority(s, a) - seniority(s, b),
  );
}

function hasWard(s: GameState, id: CardId): boolean {
  return (getKeywords(s, id) as string[]).includes('ward');
}

function couldBlock(s: GameState, blocker: CardId, attacker: CardId): boolean {
  if (hasKeyword(s, attacker, 'menace')) return false;
  const probe = cloneState(s);
  probe.combat = {
    attackers: [attacker],
    blocks: [],
    blockersDeclared: false,
    blocked: [],
    firstStrikers: null,
  };
  return canBlockAttacker(probe, blocker, attacker);
}

export function nemesisAttackers(s: GameState, player: PlayerId): CardId[] {
  const defenders = creaturesOf(s, opponent(player)).filter((id) => !getCard(s, id).tapped);
  return eligibleAttackers(s).filter(
    (attacker) =>
      !defenders.some((blocker) => {
        if (!couldBlock(s, blocker, attacker)) return false;
        const outcome = duel(s, attacker, blocker);
        return outcome.attackerDies && !outcome.blockerDies;
      }),
  );
}

export function unblockedDamage(s: GameState, attackers: CardId[], blocks: Block[]): number {
  let total = 0;
  for (const attacker of attackers) {
    const power = Math.max(0, getPower(s, attacker));
    const times = hasKeyword(s, attacker, 'doubleStrike') ? 2 : 1;
    const blockers = blocks.filter((block) => block.attacker === attacker).map((block) => block.blocker);
    if (blockers.length === 0) {
      total += power * times;
      continue;
    }
    if (!hasKeyword(s, attacker, 'trample')) continue;
    const absorbed = blockers.reduce(
      (sum, blocker) => sum + Math.max(0, getToughness(s, blocker) - getCard(s, blocker).damage),
      0,
    );
    total += Math.max(0, power * times - absorbed);
  }
  return total;
}

export function nemesisBlocks(s: GameState, player: PlayerId): Block[] {
  const combat = s.combat;
  if (!combat) return [];
  const attackers = strongestFirst(
    s,
    combat.attackers.filter((id) => s.cards[id]?.zone === 'battlefield'),
  );
  const blockers = creaturesOf(s, player).filter((id) => !getCard(s, id).tapped);
  const blocks: Block[] = [];
  const used = new Set<CardId>();
  const blocked = new Set<CardId>();
  const assign = (blocker: CardId, attacker: CardId): void => {
    blocks.push({ blocker, attacker });
    used.add(blocker);
    blocked.add(attacker);
  };
  const single = (blocker: CardId, attacker: CardId): boolean =>
    !blocked.has(attacker) && !hasKeyword(s, attacker, 'menace') && canBlockAttacker(s, blocker, attacker);

  for (const blocker of blockers) {
    const target = attackers.find((attacker) => {
      if (!single(blocker, attacker)) return false;
      const outcome = duel(s, attacker, blocker);
      return outcome.attackerDies && !outcome.blockerDies;
    });
    if (target) assign(blocker, target);
  }
  for (const blocker of blockers) {
    if (used.has(blocker)) continue;
    const target = attackers.find((attacker) => single(blocker, attacker) && duel(s, attacker, blocker).attackerDies);
    if (target) assign(blocker, target);
  }
  if (unblockedDamage(s, attackers, blocks) >= s.players[player].life) {
    for (const blocker of blockers) {
      if (used.has(blocker)) continue;
      for (const attacker of attackers) {
        if (blocked.has(attacker) || !canBlockAttacker(s, blocker, attacker)) continue;
        if (!hasKeyword(s, attacker, 'menace')) {
          assign(blocker, attacker);
          break;
        }
        const partner = blockers.find(
          (other) => other !== blocker && !used.has(other) && canBlockAttacker(s, other, attacker),
        );
        if (!partner) continue;
        assign(blocker, attacker);
        assign(partner, attacker);
        break;
      }
    }
  }
  return blocksError(s, blocks) ? [] : blocks;
}

export function nemesisTargets(s: GameState, player: PlayerId, specs: TargetSpec[]): Target[] | null {
  const foe = opponent(player);
  const chosen: Target[] = [];
  for (const spec of specs) {
    const fresh = (target: Target): boolean =>
      isLegalTarget(s, player, spec, target) && !chosen.some((other) => sameTarget(other, target));
    let pick: Target | undefined;
    if (spec.kind === 'creature' || spec.kind === 'any') {
      const victims = creaturesOf(s, foe).filter((id) => !hasWard(s, id) && fresh({ card: id }));
      const best = strongestFirst(s, victims)[0];
      if (best) pick = { card: best };
    }
    if (!pick && fresh({ player: foe })) pick = { player: foe };
    if (!pick) pick = legalTargets(s, player, spec).find(fresh);
    if (!pick) return null;
    chosen.push(pick);
  }
  return chosen;
}

function castOmen(s: GameState, player: PlayerId): Action | null {
  if (s.activePlayer !== player || s.stack.length > 0) return null;
  if (s.step !== 'main1' && !s.players[player].challenge) return null;
  for (const card of s.players[player].hand) {
    const targets = nemesisTargets(s, player, defOf(s, card).spell?.targets ?? []);
    if (targets && !castError(s, player, card, targets)) return { type: 'cast', player, card, targets };
  }
  return null;
}

export function nemesisAction(s: GameState, player: PlayerId): Action {
  const pending = s.pending;
  if (!pending || pending.kind === 'gameOver') throw new Error('the game is not waiting for a decision');
  switch (pending.kind) {
    case 'priority':
      return castOmen(s, player) ?? { type: 'pass', player };
    case 'declareAttackers': {
      const attackers = s.players[player].challenge
        ? forcedAttackers(s, player, eligibleAttackers(s))
        : nemesisAttackers(s, player);
      return { type: 'declareAttackers', player, attackers };
    }
    case 'declareBlockers':
      return { type: 'declareBlockers', player, blocks: s.players[player].challenge ? [] : nemesisBlocks(s, player) };
    case 'chooseTargets': {
      const trigger = s.triggers.find((candidate) => candidate.id === pending.trigger);
      const specs = trigger ? (triggeredAbility(defOf(s, trigger.source), trigger.ability)?.targets ?? []) : [];
      return { type: 'chooseTargets', player, targets: nemesisTargets(s, player, specs) ?? [] };
    }
    case 'mulligan':
      return { type: 'keep', player };
    case 'bottom':
    case 'discard':
      return { type: pending.kind, player, cards: s.players[player].hand.slice(0, pending.count) };
  }
}

export function counterWaiting(s: GameState, player: PlayerId): boolean {
  const foe = opponent(player);
  if (!s.players[foe].nemesis) return false;
  return s.players[foe].battlefield.some((id) => defOf(s, id).threat?.effect?.kind === 'counterNext');
}

export function feedCounter(s: GameState, player: PlayerId, legal: Action[]): Action | null {
  if (!counterWaiting(s, player) || s.activePlayer !== player || s.stack.length > 0) return null;
  if (s.step !== 'main1' && s.step !== 'main2') return null;
  const rank = (action: Action): number => {
    if (action.type !== 'cast') return Number.POSITIVE_INFINITY;
    const def = defOf(s, action.card);
    return manaValue(getCost(def.id)) * 2 + (def.types.includes('creature') ? 1 : 0);
  };
  const casts = legal.filter((action) => action.type === 'cast').sort((a, b) => rank(a) - rank(b));
  return casts[0] ?? null;
}

export function hideFaceDownThreats(s: GameState): GameState {
  const seat = nemesisSeat(s);
  if (seat === null) return s;
  const library = s.players[seat].library;
  if (library.length <= 1) return s;
  const view = cloneState(s);
  const sorted = [...library].sort(compareIds);
  const tiers = [1, 2, 3].map((tier) => sorted.filter((id) => (defOf(s, id).threat?.tier ?? 3) === tier));
  for (const tier of tiers) shuffleInPlace(view, tier);
  view.players[seat].library = tiers.flat();
  return view;
}
