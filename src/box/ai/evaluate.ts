import {
  abilitiesLost,
  cantAttack,
  cantBlock,
  doesntUntap,
  getCardDef,
  isCreature,
  isLand,
  opponent,
  staticStats,
  type CardId,
  type GameState,
  type Keyword,
  type PlayerId,
  type TriggerEvent,
} from '../engine';

export const WIN_SCORE = 10_000;

export function lifeScore(life: number): number {
  if (life <= 0) return -1000;
  let score = 0;
  for (let point = 1; point <= life; point++) {
    if (point <= 5) score += 1.8;
    else if (point <= 10) score += 1.1;
    else if (point <= 20) score += 0.5;
    else score += 0.25;
  }
  return score;
}

function counters(s: GameState, id: CardId): number {
  return s.cards[id]?.counters ?? 0;
}

function lastingKeywords(s: GameState, id: CardId): readonly Keyword[] {
  return s.cards[id]?.zone === 'battlefield' ? staticStats(s, id).keywords : (getCardDef(s.cards[id]?.def ?? '').keywords ?? []);
}

function lastingPower(s: GameState, id: CardId): number {
  if (s.cards[id]?.zone === 'battlefield') return staticStats(s, id).power;
  return (getCardDef(s.cards[id]?.def ?? '').power ?? 0) + counters(s, id);
}

const LASTING_TRIGGERS: ReadonlySet<TriggerEvent> = new Set([
  'attacks',
  'spell',
  'allyEnters',
  'allyDies',
  'damagesPlayer',
  'lifeGain',
  'landfall',
]);

const PACIFIED_SHARE = 0.15;
const LOCKED_SHARE = 0.2;
const CANT_BLOCK_PENALTY = 1;

export function creatureValue(s: GameState, id: CardId): number {
  const def = getCardDef(s.cards[id]?.def ?? '');
  const onBattlefield = s.cards[id]?.zone === 'battlefield';
  const stats = onBattlefield
    ? staticStats(s, id)
    : { power: (def.power ?? 0) + counters(s, id), toughness: (def.toughness ?? 0) + counters(s, id) };
  const power = Math.max(0, stats.power);
  const toughness = stats.toughness;
  let value = 1 + power * 1.5 + toughness;
  for (const keyword of lastingKeywords(s, id)) {
    switch (keyword) {
      case 'flying':
        value += 1 + power * 0.6;
        break;
      case 'reach':
        value += 0.5;
        break;
      case 'vigilance':
        value += 0.6;
        break;
      case 'trample':
        value += power * 0.3;
        break;
      case 'firstStrike':
        value += 1 + power * 0.3;
        break;
      case 'doubleStrike':
        value += 1 + power;
        break;
      case 'deathtouch':
        value += 2.5;
        break;
      case 'lifelink':
        value += power * 0.5;
        break;
      case 'menace':
        value += 0.5 + power * 0.3;
        break;
      case 'defender':
        value -= power * 1.2;
        break;
      case 'skulk':
        value += 0.6 + power * 0.4;
        break;
      case 'undying':
        if (counters(s, id) === 0) value += 1 + power * 0.5;
        break;
      case 'hexproof':
        value += 1 + power * 0.3;
        break;
      case 'evolve':
        value += 1;
        break;
      case 'prowess':
        value += 0.8;
        break;
      case 'indestructible':
        value += 2 + toughness * 0.3;
        break;
      case 'ward':
        value += 1;
        break;
      case 'haste':
      case 'flash':
        break;
    }
  }
  const lost = onBattlefield && abilitiesLost(s, id);
  if (!lost) {
    if (def.mana?.length) value += 1.2;
    if (def.activated?.length) value += 1;
    if (def.statics?.length) value += 1;
    for (const trigger of def.triggers ?? []) if (LASTING_TRIGGERS.has(trigger.on)) value += 1;
  }
  if (!onBattlefield) return value;
  if (cantAttack(s, id) && cantBlock(s, id)) return value * PACIFIED_SHARE;
  if (doesntUntap(s, id) && s.cards[id]?.tapped) return value * LOCKED_SHARE;
  if (cantBlock(s, id)) value -= CANT_BLOCK_PENALTY;
  return value;
}

const TREASURE_VALUE = 0.8;
const EQUIPMENT_VALUE = 3;
const ENCHANTMENT_VALUE = 3;
const MANA_ROCK_VALUE = 3.5;

function permanentValue(s: GameState, id: CardId): number {
  const def = getCardDef(s.cards[id]?.def ?? '');
  if (def.sacrificeForMana) return TREASURE_VALUE;
  if (def.enchant) return 0;
  if (def.mana?.length) return MANA_ROCK_VALUE;
  if (def.attachment) return EQUIPMENT_VALUE;
  return ENCHANTMENT_VALUE;
}

export const CARD_IN_HAND_VALUE = 2.3;

function sideScore(s: GameState, player: PlayerId): number {
  const ps = s.players[player];
  let score = lifeScore(ps.life);
  let lands = 0;
  for (const id of ps.battlefield) {
    if (isCreature(s, id)) score += creatureValue(s, id);
    else if (isLand(s, id)) {
      lands += 1;
      score += lands <= 6 ? 1.5 : 0.4;
    } else score += permanentValue(s, id);
  }
  score += ps.hand.length * CARD_IN_HAND_VALUE;
  if (!ps.nemesis && ps.library.length < 4) score -= (4 - ps.library.length) * 3;
  return score;
}

function exposurePenalty(s: GameState, player: PlayerId): number {
  if (s.activePlayer !== player) return 0;
  const opp = opponent(player);
  const attackers = s.players[opp].battlefield
    .filter((id) => isCreature(s, id) && !lastingKeywords(s, id).includes('defender') && !cantAttack(s, id))
    .map((id) => ({
      power: lastingPower(s, id),
      flying: lastingKeywords(s, id).includes('flying'),
    }))
    .sort((a, b) => b.power - a.power);
  const blockers = s.players[player].battlefield.filter(
    (id) => isCreature(s, id) && !s.cards[id]?.tapped && !cantBlock(s, id),
  );
  let flyingBlockers = blockers.filter((id) => {
    const keywords = lastingKeywords(s, id);
    return keywords.includes('flying') || keywords.includes('reach');
  }).length;
  let groundBlockers = blockers.length - flyingBlockers;
  let unblocked = 0;
  for (const attacker of attackers) {
    if (attacker.flying) {
      if (flyingBlockers > 0) flyingBlockers -= 1;
      else unblocked += attacker.power;
    } else if (groundBlockers > 0) groundBlockers -= 1;
    else if (flyingBlockers > 0) flyingBlockers -= 1;
    else unblocked += attacker.power;
  }
  const life = s.players[player].life;
  if (unblocked >= life) return 25;
  if (unblocked + 2 >= life) return 8;
  return 0;
}

export function evaluate(s: GameState, player: PlayerId): number {
  const pending = s.pending;
  if (pending?.kind === 'gameOver') {
    if (pending.winner === null) return 0;
    return pending.winner === player ? WIN_SCORE : -WIN_SCORE;
  }
  const opp = opponent(player);
  return sideScore(s, player) - sideScore(s, opp) - exposurePenalty(s, player) + exposurePenalty(s, opp);
}
