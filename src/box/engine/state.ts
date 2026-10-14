import { canPay, choosePayment, manaValue, parseCost, type ManaSource } from './mana';
import { changeNemesisLife, nemesisDestination, recursOnDeath, spellTax } from './nemesis';
import { getCardDef, getCost } from './registry';
import {
  COLORS,
  type AttachmentEffect,
  type CardDef,
  type CardId,
  type CardInstance,
  type Count,
  type GameState,
  type Keyword,
  type ManaCost,
  type PlayerId,
  type PlayerState,
  type SpellFilter,
  type TriggerCondition,
  type TriggerEvent,
  type TriggeredAbility,
  type Zone,
} from './types';

export const UNDYING_TRIGGER = -1;
export const EVOLVE_TRIGGER = -2;
export const PROWESS_TRIGGER = -3;

const UNDYING_ABILITY: TriggeredAbility = {
  on: 'dies',
  targets: [],
  effects: [{ kind: 'returnToBattlefield', counters: 1 }],
};

const EVOLVE_ABILITY: TriggeredAbility = {
  on: 'allyEnters',
  targets: [],
  effects: [{ kind: 'addCounters', amount: 1, to: 'self' }],
};

const PROWESS_ABILITY: TriggeredAbility = {
  on: 'spell',
  targets: [],
  effects: [{ kind: 'pump', power: 1, toughness: 1, to: 'self' }],
};

export const STARTING_LIFE = 20;
export const OPENING_HAND = 7;
export const MAX_HAND_SIZE = 7;
export const MAX_MULLIGANS = 6;
export const DEFAULT_TURN_LIMIT = 200;

export function opponent(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0;
}

export function cloneState(s: GameState): GameState {
  const cards: Record<CardId, CardInstance> = {};
  for (const id in s.cards) cards[id] = { ...(s.cards[id] as CardInstance) };
  return {
    ...s,
    players: [clonePlayer(s.players[0]), clonePlayer(s.players[1])],
    cards,
    stack: s.stack.map((item) => ({ ...item, targets: [...item.targets] })),
    effects: s.effects.map((effect) => ({ ...effect })),
    combat: s.combat && {
      attackers: [...s.combat.attackers],
      blocks: s.combat.blocks.map((block) => ({ ...block })),
      blockersDeclared: s.combat.blockersDeclared,
      blocked: [...s.combat.blocked],
      firstStrikers: s.combat.firstStrikers && [...s.combat.firstStrikers],
    },
    triggers: s.triggers.map((trigger) => ({ ...trigger })),
    pending: s.pending && { ...s.pending },
    events: [...s.events],
  };
}

function clonePlayer(p: PlayerState): PlayerState {
  return {
    ...p,
    library: [...p.library],
    hand: [...p.hand],
    battlefield: [...p.battlefield],
    graveyard: [...p.graveyard],
    exile: [...p.exile],
    command: [...p.command],
  };
}

export function newId(s: GameState, prefix: string): string {
  s.nextId += 1;
  return `${prefix}${s.nextId}`;
}

export function getCard(s: GameState, id: CardId): CardInstance {
  const card = s.cards[id];
  if (!card) throw new Error(`Unknown card "${id}"`);
  return card;
}

export function defOf(s: GameState, id: CardId): CardDef {
  return getCardDef(getCard(s, id).def);
}

export function isCreatureDef(def: CardDef): boolean {
  return def.types.includes('creature');
}

export function isLandDef(def: CardDef): boolean {
  return def.types.includes('land');
}

export function isInstantDef(def: CardDef): boolean {
  return def.types.includes('instant');
}

export function isInstantOrSorceryDef(def: CardDef): boolean {
  return def.types.includes('instant') || def.types.includes('sorcery');
}

export function hasFlashDef(def: CardDef): boolean {
  return (def.keywords ?? []).includes('flash');
}

export function isTokenDef(def: CardDef): boolean {
  return def.token === true;
}

export function triggeredAbility(def: CardDef, index: number): TriggeredAbility | undefined {
  if (index === UNDYING_TRIGGER) return UNDYING_ABILITY;
  if (index === EVOLVE_TRIGGER) return EVOLVE_ABILITY;
  if (index === PROWESS_TRIGGER) return PROWESS_ABILITY;
  return def.triggers?.[index];
}

export function isRelicDef(def: CardDef): boolean {
  return def.types.includes('relic');
}

export function isPermanentDef(def: CardDef): boolean {
  return (
    def.types.includes('creature') ||
    def.types.includes('land') ||
    def.types.includes('artifact') ||
    def.types.includes('enchantment')
  );
}

export function hasSubtype(def: CardDef, subtype: string): boolean {
  return def.subtypes?.includes(subtype) ?? false;
}

export function isAttachmentDef(def: CardDef): boolean {
  return def.attachment !== undefined;
}

export function isCreature(s: GameState, id: CardId): boolean {
  return isCreatureDef(defOf(s, id));
}

export function isLand(s: GameState, id: CardId): boolean {
  return isLandDef(defOf(s, id));
}

export function onBattlefield(s: GameState, id: CardId): boolean {
  return s.cards[id]?.zone === 'battlefield';
}

export function creaturesOf(s: GameState, player: PlayerId): CardId[] {
  return s.players[player].battlefield.filter((id) => isCreature(s, id));
}

export function triggerSources(s: GameState, player: PlayerId): CardId[] {
  return [...s.players[player].battlefield, ...s.players[player].command];
}

export function allCreatures(s: GameState): CardId[] {
  return [...creaturesOf(s, 0), ...creaturesOf(s, 1)];
}

function battlefieldIds(s: GameState): CardId[] {
  return [...s.players[0].battlefield, ...s.players[1].battlefield];
}

export function attachmentsOf(s: GameState, id: CardId): AttachmentEffect[] {
  const found: AttachmentEffect[] = [];
  for (const other of battlefieldIds(s)) {
    const card = getCard(s, other);
    if (card.attachedTo !== id) continue;
    const attachment = getCardDef(card.def).attachment;
    if (!attachment) continue;
    if (attachment.yourTurn && s.activePlayer !== getCard(s, id).controller) continue;
    found.push(attachment);
  }
  return found;
}

export function abilitiesLost(s: GameState, id: CardId): boolean {
  for (const other of battlefieldIds(s)) {
    const card = getCard(s, other);
    if (card.attachedTo === id && getCardDef(card.def).attachment?.loseAbilities) return true;
  }
  return false;
}

export function isAttacking(s: GameState, id: CardId): boolean {
  return s.combat?.attackers.includes(id) ?? false;
}

interface StaticBonus {
  power: number;
  toughness: number;
  keywords: Keyword[];
}

function staticBonus(s: GameState, id: CardId): StaticBonus {
  const bonus: StaticBonus = { power: 0, toughness: 0, keywords: [] };
  const card = getCard(s, id);
  const def = getCardDef(card.def);
  for (const attachment of attachmentsOf(s, id)) {
    bonus.power += attachment.power ?? 0;
    bonus.toughness += attachment.toughness ?? 0;
    bonus.keywords.push(...(attachment.keywords ?? []));
  }
  for (const source of s.players[card.controller].battlefield) {
    const statics = getCardDef(getCard(s, source).def).statics;
    if (!statics || abilitiesLost(s, source)) continue;
    for (const ability of statics) {
      if (ability.kind === 'anthem') {
        if (ability.other && source === id) continue;
        if (ability.attacking && !isAttacking(s, id)) continue;
        if (ability.subtypes && !ability.subtypes.some((subtype) => hasSubtype(def, subtype))) continue;
        bonus.power += ability.power ?? 0;
        bonus.toughness += ability.toughness ?? 0;
        bonus.keywords.push(...(ability.keywords ?? []));
      } else if (ability.kind === 'keywordIf' && source === id && keywordConditionHolds(s, id, ability.condition)) {
        bonus.keywords.push(ability.keyword);
      }
    }
  }
  return bonus;
}

function keywordConditionHolds(s: GameState, id: CardId, condition: 'attacking' | 'controlDragon' | 'life25'): boolean {
  const controller = getCard(s, id).controller;
  switch (condition) {
    case 'attacking':
      return isAttacking(s, id);
    case 'controlDragon':
      return s.players[controller].battlefield.some((other) => hasSubtype(defOf(s, other), 'Dragon'));
    case 'life25':
      return s.players[controller].life >= 25;
  }
}

function basePowerToughness(s: GameState, id: CardId): [number, number] {
  for (const other of battlefieldIds(s)) {
    const card = getCard(s, other);
    const base = card.attachedTo === id ? getCardDef(card.def).attachment?.base : undefined;
    if (base) return base;
  }
  const def = defOf(s, id);
  return [def.power ?? 0, def.toughness ?? 0];
}

export function staticStats(s: GameState, id: CardId): { power: number; toughness: number; keywords: Keyword[] } {
  const [power, toughness] = basePowerToughness(s, id);
  const counters = getCard(s, id).counters;
  const bonus = staticBonus(s, id);
  const printed = abilitiesLost(s, id) ? [] : (defOf(s, id).keywords ?? []);
  return {
    power: power + counters + bonus.power,
    toughness: toughness + counters + bonus.toughness,
    keywords: [...new Set([...printed, ...bonus.keywords])],
  };
}

export function getPower(s: GameState, id: CardId): number {
  let power = basePowerToughness(s, id)[0] + getCard(s, id).counters + staticBonus(s, id).power;
  for (const effect of s.effects) if (effect.card === id) power += effect.power;
  return power;
}

export function getToughness(s: GameState, id: CardId): number {
  let toughness = basePowerToughness(s, id)[1] + getCard(s, id).counters + staticBonus(s, id).toughness;
  for (const effect of s.effects) if (effect.card === id) toughness += effect.toughness;
  return toughness;
}

export function getKeywords(s: GameState, id: CardId): Keyword[] {
  const keywords = abilitiesLost(s, id) ? [] : [...(defOf(s, id).keywords ?? [])];
  const add = (keyword: Keyword): void => {
    if (!keywords.includes(keyword)) keywords.push(keyword);
  };
  for (const effect of s.effects) {
    if (effect.card === id) for (const keyword of effect.keywords ?? []) add(keyword);
  }
  if (s.cards[id]?.zone === 'battlefield') for (const keyword of staticBonus(s, id).keywords) add(keyword);
  return keywords;
}

export function hasKeyword(s: GameState, id: CardId, keyword: Keyword): boolean {
  return getKeywords(s, id).includes(keyword);
}

export function cantAttack(s: GameState, id: CardId): boolean {
  return attachmentsOf(s, id).some((attachment) => attachment.cantAttack);
}

export function cantBlock(s: GameState, id: CardId): boolean {
  if (attachmentsOf(s, id).some((attachment) => attachment.cantBlock)) return true;
  if (s.effects.some((effect) => effect.card === id && effect.cantBlock)) return true;
  return !abilitiesLost(s, id) && (defOf(s, id).statics ?? []).some((ability) => ability.kind === 'cantBlock');
}

export function isUnblockable(s: GameState, id: CardId): boolean {
  return s.effects.some((effect) => effect.card === id && effect.unblockable);
}

export function doesntUntap(s: GameState, id: CardId): boolean {
  return attachmentsOf(s, id).some((attachment) => attachment.doesntUntap);
}

export function countOf(s: GameState, player: PlayerId, count: Count): number {
  switch (count.kind) {
    case 'attacking':
      return s.activePlayer === player ? (s.combat?.attackers.length ?? 0) : 0;
    case 'creatures':
      return creaturesOf(s, player).filter((id) => !count.subtype || hasSubtype(defOf(s, id), count.subtype)).length;
    case 'instantsAndSorceriesInGraveyard':
      return s.players[player].graveyard.filter((id) => {
        const def = defOf(s, id);
        return def.types.includes('instant') || def.types.includes('sorcery');
      }).length;
  }
}

export function spellCost(s: GameState, player: PlayerId, cardId: CardId, x = 0, kicked = false): ManaCost {
  const def = defOf(s, cardId);
  const base = getCost(def.id);
  const cost: ManaCost = { ...base, generic: base.generic + (base.x ?? 0) * x, x: 0 };
  if (kicked && def.kicker) {
    const kicker = parseCost(def.kicker);
    cost.generic += kicker.generic;
    for (const color of COLORS) cost[color] += kicker[color];
  }
  let reduction = 0;
  const own = def.costReduction;
  if (own && 'per' in own) reduction += countOf(s, player, own.per);
  if (own && 'ifControl' in own && s.players[player].battlefield.some((id) => hasSubtype(defOf(s, id), own.ifControl)))
    reduction += own.amount;
  for (const source of s.players[player].battlefield) {
    if (abilitiesLost(s, source)) continue;
    for (const ability of defOf(s, source).statics ?? []) {
      if (ability.kind === 'spellDiscount' && hasSubtype(def, ability.subtype)) reduction += ability.amount;
    }
  }
  cost.generic = Math.max(0, cost.generic + spellTax(s, player) - reduction);
  return cost;
}

export function isReadyToTap(s: GameState, id: CardId): boolean {
  const card = getCard(s, id);
  if (!isCreature(s, id)) return true;
  return !card.summoningSick || hasKeyword(s, id, 'haste');
}

function zoneList(s: GameState, card: CardInstance, zone: Zone): CardId[] | null {
  switch (zone) {
    case 'library':
      return s.players[card.owner].library;
    case 'hand':
      return s.players[card.owner].hand;
    case 'graveyard':
      return s.players[card.owner].graveyard;
    case 'exile':
      return s.players[card.owner].exile;
    case 'command':
      return s.players[card.owner].command;
    case 'battlefield':
      return s.players[card.controller].battlefield;
    case 'stack':
    case 'gone':
      return null;
  }
}

export interface MoveOptions {
  toBottom?: boolean;
  controller?: PlayerId;
  watchers?: CardId[];
}

function removeFromList(list: CardId[] | null, id: CardId): void {
  if (!list) return;
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
}

function evolves(s: GameState, evolver: CardId, newcomer: CardId): boolean {
  if (!hasKeyword(s, evolver, 'evolve')) return false;
  return getPower(s, newcomer) > getPower(s, evolver) || getToughness(s, newcomer) > getToughness(s, evolver);
}

function enterBattlefield(s: GameState, id: CardId): void {
  const card = getCard(s, id);
  const def = getCardDef(card.def);
  const creature = isCreatureDef(def);
  card.summoningSick = creature;
  if (def.entersTapped) card.tapped = true;
  s.events.push({ t: 'enter', player: card.controller, card: id });
  queueTriggers(s, id, 'enters', card.controller);
  if (isLandDef(def)) {
    for (const other of triggerSources(s, card.controller)) queueTriggers(s, other, 'landfall', card.controller);
  }
  if (!creature) return;
  for (const other of triggerSources(s, card.controller)) {
    if (other === id) continue;
    queueTriggers(s, other, 'allyEnters', card.controller);
    if (evolves(s, other, id))
      s.triggers.push({ id: newId(s, 't'), controller: card.controller, source: other, ability: EVOLVE_TRIGGER });
  }
}

export function createToken(s: GameState, defId: string, controller: PlayerId): CardId {
  const id = newId(s, 'tk');
  s.cards[id] = {
    id,
    def: defId,
    owner: controller,
    controller,
    zone: 'battlefield',
    tapped: false,
    summoningSick: false,
    damage: 0,
    deathtouchDamage: false,
    counters: 0,
  };
  s.players[controller].battlefield.push(id);
  s.events.push({ t: 'create', player: controller, card: id });
  enterBattlefield(s, id);
  return id;
}

export function moveCard(s: GameState, id: CardId, destination: Zone, requested: MoveOptions = {}): void {
  const card = getCard(s, id);
  const from = card.zone;
  const def = getCardDef(card.def);
  const exiled =
    from === 'battlefield' &&
    destination === 'graveyard' &&
    isCreatureDef(def) &&
    s.effects.some((effect) => effect.card === id && effect.exileIfDies);
  const redirect = exiled ? null : nemesisDestination(s, id, from, destination);
  const to: Zone = exiled ? 'exile' : (redirect?.to ?? destination);
  const options = redirect ? { ...requested, toBottom: redirect.toBottom } : requested;
  const lostAbilities = from === 'battlefield' && abilitiesLost(s, id);
  removeFromList(zoneList(s, card, from), id);
  const previousController = card.controller;
  const undying = from === 'battlefield' && card.counters === 0 && getKeywords(s, id).includes('undying');

  if (from === 'battlefield') {
    card.tapped = false;
    card.summoningSick = false;
    card.damage = 0;
    card.deathtouchDamage = false;
    card.counters = 0;
    delete card.attachedTo;
    delete card.spent;
    s.effects = s.effects.filter((effect) => effect.card !== id);
    removeFromCombat(s, id);
    loseTargetsOn(s, id);
  }

  card.zone = to;
  card.controller = to === 'battlefield' ? (options.controller ?? card.controller) : card.owner;
  const toList = zoneList(s, card, to);
  if (toList) {
    if (options.toBottom || to !== 'library') toList.push(id);
    else toList.unshift(id);
  }

  if (to === 'exile') s.events.push({ t: 'exile', card: id, player: previousController });
  if (from === 'battlefield' && to === 'graveyard' && isCreatureDef(def)) {
    s.events.push({ t: 'dies', card: id, player: previousController });
    if (!lostAbilities) queueTriggers(s, id, 'dies', previousController, id);
    for (const watcher of options.watchers ?? triggerSources(s, previousController)) {
      if (watcher !== id) queueTriggers(s, watcher, 'allyDies', previousController, id);
    }
    if (undying)
      s.triggers.push({ id: newId(s, 't'), controller: previousController, source: id, ability: UNDYING_TRIGGER });
  }
  if (to === 'battlefield') enterBattlefield(s, id);
  if (isTokenDef(def) && to !== 'battlefield') {
    removeFromList(zoneList(s, card, to), id);
    card.zone = 'gone';
  }
  if (recursOnDeath(s, id, from, to)) moveCard(s, id, 'library', { toBottom: true });
}

function loseTargetsOn(s: GameState, id: CardId): void {
  for (const item of s.stack) {
    item.targets.forEach((target, index) => {
      if ('card' in target && target.card === id && !item.lost?.includes(index))
        item.lost = [...(item.lost ?? []), index];
    });
  }
}

export function removeFromCombat(s: GameState, id: CardId): void {
  const combat = s.combat;
  if (!combat) return;
  combat.attackers = combat.attackers.filter((attacker) => attacker !== id);
  combat.blocks = combat.blocks.filter((block) => block.blocker !== id && block.attacker !== id);
}

function conditionHolds(
  s: GameState,
  condition: TriggerCondition | undefined,
  controller: PlayerId,
  source: CardId,
): boolean {
  switch (condition) {
    case undefined:
      return true;
    case 'opponentDamaged':
      return s.players[opponent(controller)].damagedThisTurn;
    case 'emptyHand':
      return s.players[controller].hand.length === 0;
    case 'opponentLostLife':
      return s.players[opponent(controller)].lostLifeThisTurn;
    case 'attackedThisTurn':
      return s.players[controller].attackedThisTurn;
    case 'threeCreatures':
      return creaturesOf(s, controller).length >= 3;
    case 'anotherElf':
      return creaturesOf(s, controller).some((id) => id !== source && hasSubtype(defOf(s, id), 'Elf'));
    case 'opponentsTurn':
      return s.activePlayer !== controller;
  }
}

function spellMatches(filter: SpellFilter, def: CardDef): boolean {
  switch (filter) {
    case 'instantOrSorcery':
      return isInstantOrSorceryDef(def);
    case 'any':
      return true;
    case 'noncreatureOrDragon':
      return !isCreatureDef(def) || hasSubtype(def, 'Dragon');
  }
}

export function queueTriggers(
  s: GameState,
  source: CardId,
  event: TriggerEvent,
  controller: PlayerId,
  subject?: CardId,
): void {
  const triggers = defOf(s, source).triggers ?? [];
  if (triggers.length === 0) return;
  if (s.cards[source]?.zone === 'battlefield' && isCreature(s, source) && abilitiesLost(s, source)) return;
  triggers.forEach((trigger, ability) => {
    if (trigger.on !== event || !conditionHolds(s, trigger.condition, controller, source)) return;
    const subjectDef = subject === undefined ? undefined : defOf(s, subject);
    if (trigger.subtype && (!subjectDef || !hasSubtype(subjectDef, trigger.subtype))) return;
    if (event === 'spell' && (!subjectDef || !spellMatches(trigger.spells ?? 'instantOrSorcery', subjectDef))) return;
    s.triggers.push({ id: newId(s, 't'), controller, source, ability });
  });
}

export function drawCards(s: GameState, player: PlayerId, count: number): void {
  const ps = s.players[player];
  for (let i = 0; i < count; i++) {
    const top = ps.library[0];
    if (top === undefined) {
      ps.drewFromEmptyLibrary = true;
      s.events.push({ t: 'drawEmpty', player });
      continue;
    }
    moveCard(s, top, 'hand');
    s.events.push({ t: 'draw', player, card: top });
    ps.drawsThisTurn += 1;
    for (const id of triggerSources(s, player)) {
      queueTriggers(s, id, 'draw', player);
      if (ps.drawsThisTurn === 2) queueTriggers(s, id, 'secondDraw', player);
    }
  }
}

export function changeLife(s: GameState, player: PlayerId, delta: number): void {
  if (delta === 0) return;
  const ps = s.players[player];
  if (ps.nemesis) {
    changeNemesisLife(s, player, delta);
    return;
  }
  ps.life += delta;
  if (delta < 0) ps.lostLifeThisTurn = true;
  s.events.push({ t: 'life', player, delta, life: ps.life });
  if (delta > 0) for (const id of triggerSources(s, player)) queueTriggers(s, id, 'lifeGain', player);
}

export function manaSources(s: GameState, player: PlayerId, exclude?: CardId): ManaSource[] {
  const sources: ManaSource[] = [];
  for (const id of s.players[player].battlefield) {
    if (id === exclude) continue;
    const card = getCard(s, id);
    const def = getCardDef(card.def);
    if (card.tapped || !isReadyToTap(s, id)) continue;
    const isCreatureSource = isCreatureDef(def);
    const landMana = isLandDef(def)
      ? attachmentsOf(s, id).reduce((sum, attachment) => sum + (attachment.landMana ?? 0), 0)
      : 0;
    if (landMana > 0) {
      for (let i = 0; i < landMana; i++) sources.push({ id, colors: [...COLORS], isCreature: false });
      continue;
    }
    if (!def.mana || (isCreatureSource && abilitiesLost(s, id))) continue;
    const times = def.manaTimes ? Math.max(1, countOf(s, player, def.manaTimes)) : 1;
    for (let i = 0; i < times; i++) {
      sources.push({ id, colors: def.mana, isCreature: isCreatureSource, sacrifice: def.sacrificeForMana === true });
    }
  }
  return sources;
}

function manaWants(s: GameState, player: PlayerId, exclude?: CardId): ManaCost[] {
  const wants: ManaCost[] = [];
  for (const id of s.players[player].hand) {
    if (id === exclude || isLandDef(defOf(s, id))) continue;
    wants.push(getCost(getCard(s, id).def));
  }
  for (const id of s.players[player].battlefield) {
    for (const ability of defOf(s, id).activated ?? []) {
      const cost = parseCost(ability.cost);
      if (manaValue(cost) > 0) wants.push(cost);
    }
  }
  return wants;
}

export function findPayment(
  s: GameState,
  player: PlayerId,
  cost: ManaCost,
  options: { excludeSource?: CardId; excludeFromDemand?: CardId } = {},
): CardId[] | null {
  return choosePayment(
    manaSources(s, player, options.excludeSource),
    cost,
    manaWants(s, player, options.excludeFromDemand),
  );
}

export function canAfford(s: GameState, player: PlayerId, cost: ManaCost, excludeSource?: CardId): boolean {
  return canPay(manaSources(s, player, excludeSource), cost);
}

export function tapCards(s: GameState, ids: CardId[]): void {
  for (const id of ids) getCard(s, id).tapped = true;
}

export function payWith(s: GameState, ids: CardId[]): void {
  tapCards(s, ids);
  for (const id of new Set(ids)) {
    const card = getCard(s, id);
    if (card.zone !== 'battlefield' || !getCardDef(card.def).sacrificeForMana) continue;
    s.events.push({ t: 'sacrifice', card: id, player: card.controller });
    moveCard(s, id, 'graveyard');
  }
}
