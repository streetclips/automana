import { count, plural } from '../../i18n/plural';
import { getCardDef } from '../registry';
import type { Refusal } from '../refusals';
import { isPlayerTarget } from '../targets';
import {
  COLORS,
  type AttachmentEffect,
  type CardDef,
  type ChallengeEffect,
  type CardId,
  type CardType,
  type Color,
  type CostReduction,
  type Count,
  type Effect,
  type EffectCondition,
  type GameEvent,
  type GameState,
  type Keyword,
  type PermanentKind,
  type PlayerId,
  type SpellFilter,
  type StaticAbility,
  type Step,
  type Target,
  type TargetSpec,
  type TriggerCondition,
  type TriggerEvent,
} from '../types';
import { capitalize, capitalizeParts, formatModifier, joined, line, lowerFirst, mention, type TextPart } from './parts';
import {
  activatedText,
  describeState,
  rulesText,
  triggerText,
  type RulesGrammar,
  type SentenceContext,
  type StateWords,
  type TargetRef,
} from './shared';
import type { EngineText } from './types';

const KEYWORD_NAMES: Record<Keyword, string> = {
  flying: 'Flying',
  reach: 'Reach',
  haste: 'Haste',
  vigilance: 'Vigilance',
  trample: 'Trample',
  firstStrike: 'First strike',
  doubleStrike: 'Double strike',
  deathtouch: 'Deathtouch',
  lifelink: 'Lifelink',
  menace: 'Menace',
  defender: 'Defender',
  flash: 'Flash',
  skulk: 'Skulk',
  undying: 'Undying',
  hexproof: 'Hexproof',
  evolve: 'Evolve',
  prowess: 'Prowess',
  indestructible: 'Indestructible',
  ward: 'Ward {2}',
};

const KEYWORD_REMINDERS: Record<Keyword, string> = {
  flying: "Can't be blocked except by creatures with flying or reach.",
  reach: 'Can block creatures with flying.',
  haste: 'Can attack and {T} as soon as it comes under your control.',
  vigilance: "Attacking doesn't cause it to tap.",
  trample: "Combat damage beyond what's lethal to its blockers is dealt to the defending player.",
  firstStrike: 'Deals combat damage before creatures without first strike.',
  doubleStrike: 'Deals both first-strike and regular combat damage.',
  deathtouch: 'Any amount of damage it deals to a creature is enough to destroy it.',
  lifelink: 'Damage it deals also causes its controller to gain that much life.',
  menace: "Can't be blocked except by two or more creatures.",
  defender: "Can't attack.",
  flash: 'You may cast it any time you could cast an instant.',
  skulk: "Can't be blocked by creatures with greater power.",
  undying: 'When it dies, if it had no +1/+1 counters on it, it returns to the battlefield with a +1/+1 counter on it.',
  hexproof: "Can't be the target of spells or abilities your opponents control.",
  evolve: 'Gets a +1/+1 counter whenever another creature with greater power or toughness enters under your control.',
  prowess: 'Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.',
  indestructible: 'Damage and effects that say "destroy" don\'t destroy it.',
  ward: 'Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.',
};

const STEP_NAMES: Record<Step, string> = {
  mulligan: 'Opening hand',
  untap: 'Untap step',
  upkeep: 'Upkeep',
  draw: 'Draw step',
  main1: 'Main phase',
  beginCombat: 'Beginning of combat',
  declareAttackers: 'Declare attackers',
  declareBlockers: 'Declare blockers',
  firstStrikeDamage: 'First-strike damage',
  combatDamage: 'Combat damage',
  endCombat: 'End of combat',
  main2: 'Second main phase',
  end: 'End step',
  cleanup: 'Cleanup',
};

const TYPE_NAMES: Record<CardType, string> = {
  land: 'Land',
  creature: 'Creature',
  artifact: 'Artifact',
  enchantment: 'Enchantment',
  instant: 'Instant',
  sorcery: 'Sorcery',
  relic: 'Relic',
};

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const COLOR_WORDS: Record<Color, string> = { W: 'white', U: 'blue', B: 'black', R: 'red', G: 'green' };

const OPPONENT = 'the opponent';

function article(next: string): string {
  return /^(?:[aeiou]|8|1[18]\b)/i.test(next) ? 'an' : 'a';
}

function withArticle(phrase: string): string {
  return `${article(phrase)} ${phrase}`;
}

function countWord(amount: number): string {
  return NUMBER_WORDS[amount] ?? String(amount);
}

function andList(items: string[], conjunction = 'and'): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items.at(-1)}`;
}

function joinedAnd(items: TextPart[][]): TextPart[] {
  const last = items.at(-1);
  if (!last || items.length === 1) return last ?? [];
  if (items.length === 2) return [...(items[0] ?? []), ' and ', ...last];
  return [...joined(items.slice(0, -1), ', '), ', and ', ...last];
}

function typeLine(def: CardDef): string {
  const words = [
    ...(def.supertypes ?? []),
    ...(def.token ? ['Token'] : []),
    ...def.types.map((type) => TYPE_NAMES[type]),
  ];
  const subtypes = (def.subtypes ?? []).join(' ');
  return subtypes ? `${words.join(' ')} — ${subtypes}` : words.join(' ');
}

function keywordList(keywords: readonly Keyword[]): string {
  return andList(keywords.map((keyword) => lowerFirst(KEYWORD_NAMES[keyword])));
}

function formatPump(power: number, toughness: number, keywords: readonly Keyword[]): string {
  if (keywords.length === 0) return formatModifier(power, toughness);
  if (power === 0 && toughness === 0) return keywordList(keywords);
  return `${formatModifier(power, toughness)}, ${keywordList(keywords)}`;
}

function tokenDescription(defId: string, amount: number): string {
  const token = getCardDef(defId);
  if (!token.types.includes('creature')) return `${(token.subtypes ?? [token.name]).join(' ')} ${plural(amount, 'token', 'tokens')}`;
  const colors = token.colors?.length ? andList(token.colors.map((color) => COLOR_WORDS[color])) : 'colorless';
  const subtypes = token.subtypes?.length ? ` ${token.subtypes.join(' ')}` : '';
  const keywords = token.keywords?.length ? ` with ${keywordList(token.keywords)}` : '';
  return `${token.power}/${token.toughness} ${colors}${subtypes} creature ${plural(amount, 'token', 'tokens')}${keywords}`;
}

function pluralSubtype(subtype: string): string {
  if (subtype === 'Elf') return 'Elves';
  return `${subtype}s`;
}

function creatureNoun(spec: Extract<TargetSpec, { kind: 'creature' }>): string {
  const words = [spec.other ? 'another target' : 'target'];
  if (spec.tapped) words.push('tapped');
  if (spec.combat === 'attacking') words.push('attacking');
  if (spec.combat === 'attackingOrBlocking') words.push('attacking or blocking');
  words.push(spec.subtype ?? 'creature');
  if (spec.maxPower !== undefined) words.push(`with power ${spec.maxPower} or less`);
  if (spec.controller === 'you') words.push('you control');
  if (spec.controller === 'opponent') words.push('an opponent controls');
  return words.join(' ');
}

const PERMANENT_WORDS: Record<PermanentKind, string> = {
  artifact: 'artifact',
  enchantment: 'enchantment',
  creature: 'creature',
  flyingCreature: 'creature with flying',
  land: 'land',
  nonland: 'nonland permanent',
};

function permanentNoun(spec: Extract<TargetSpec, { kind: 'permanent' }>): string {
  const kinds = spec.types?.length ? andList(spec.types.map((kind) => PERMANENT_WORDS[kind]), 'or') : 'permanent';
  const owner = spec.controller === 'you' ? ' you control' : spec.controller === 'opponent' ? ' an opponent controls' : '';
  return `target ${kinds}${owner}`;
}

function targetPhrase(spec: TargetSpec): string {
  switch (spec.kind) {
    case 'any':
      return 'any target';
    case 'creature':
      return creatureNoun(spec);
    case 'permanent':
      return permanentNoun(spec);
    case 'player':
      if (spec.controller === 'opponent') return 'target opponent';
      if (spec.controller === 'you') return 'you';
      return 'target player';
    case 'spell':
      return 'target spell';
    case 'graveyard': {
      const kind = spec.subtype ? `${spec.subtype} ${spec.cards}` : spec.cards;
      return `target ${kind} card from your graveyard`;
    }
  }
}

function targetChoice(spec: TargetSpec): string {
  if (spec.kind === 'player' && spec.controller === 'you') return 'yourself';
  return targetPhrase(spec);
}

function repeatedPhrase(spec: TargetSpec): string {
  switch (spec.kind) {
    case 'creature':
      return 'that creature';
    case 'permanent':
      return 'that permanent';
    case 'player':
      return 'that player';
    case 'spell':
      return 'that spell';
    case 'any':
      return 'that target';
    case 'graveyard':
      return 'that card';
  }
}

function countPhrase(count: Count): string {
  switch (count.kind) {
    case 'attacking':
      return 'attacking creature';
    case 'creatures':
      return `${count.subtype ?? 'creature'} you control`;
    case 'instantsAndSorceriesInGraveyard':
      return 'instant and sorcery card in your graveyard';
  }
}

function countNumber(count: Count): string {
  switch (count.kind) {
    case 'attacking':
      return 'the number of attacking creatures';
    case 'creatures':
      return `the number of ${count.subtype ? pluralSubtype(count.subtype) : 'creatures'} you control`;
    case 'instantsAndSorceriesInGraveyard':
      return 'the number of instant and sorcery cards in your graveyard';
  }
}

function plusCounters(amount: number): string {
  return amount === 1 ? 'a +1/+1 counter' : `${countWord(amount)} +1/+1 counters`;
}

function countersLabel(amount: number): string {
  return `${amount} +1/+1 ${plural(amount, 'counter', 'counters')}`;
}

function cardsCount(amount: number): string {
  return amount === 1 ? 'a card' : `${countWord(amount)} cards`;
}

function landCards(defId: string, amount: number): string {
  const def = getCardDef(defId);
  const kind = def.supertypes?.includes('Basic') ? `basic ${def.name}` : def.name;
  const cards = `${kind} ${plural(amount, 'card', 'cards')}`;
  return amount === 1 ? withArticle(cards) : `${countWord(amount)} ${cards}`;
}

function searchLandSentence(land: string, battlefield: number, hand: number, tapped: boolean): string {
  const search = `Search your library for ${landCards(land, battlefield + hand)}`;
  if (hand === 0) {
    const put = battlefield === 1 ? 'put it' : 'put them';
    return `${search}, ${put} onto the battlefield${tapped ? ' tapped' : ''}, then shuffle.`;
  }
  if (battlefield === 0)
    return `${search}, ${hand === 1 ? 'reveal it, put it' : 'reveal them, put them'} into your hand, then shuffle.`;
  return `${search}, put one onto the battlefield${tapped ? ' tapped' : ''} and the other into your hand, then shuffle.`;
}

function extraLandsText(amount: number): string {
  return amount === 1 ? 'an additional land' : `${countWord(amount)} additional lands`;
}

function damageAmount(amount: number): string {
  return `${amount} damage`;
}

function lifeAmount(amount: number): string {
  return `${amount} life`;
}

function gainsText(verb: 'gets' | 'get', power: number, toughness: number, keywords: readonly Keyword[] = []): string {
  const gain = verb === 'gets' ? 'gains' : 'gain';
  if (keywords.length === 0) return `${verb} ${formatModifier(power, toughness)}`;
  if (power === 0 && toughness === 0) return `${gain} ${keywordList(keywords)}`;
  return `${verb} ${formatModifier(power, toughness)} and ${gain} ${keywordList(keywords)}`;
}

function effectSentence(effect: Effect, ref: TargetRef, context: SentenceContext): string {
  switch (effect.kind) {
    case 'damage':
      if (effect.times)
        return `${context.subject} deals damage to ${ref(effect.to, 'object')} equal to ${countNumber(effect.times)}.`;
      return `${context.subject} deals ${damageAmount(effect.amount)} to ${ref(effect.to, 'object')}.`;
    case 'pump':
      return `${ref(effect.to, 'subject')} ${gainsText('gets', effect.power, effect.toughness, effect.keywords)} until end of turn.`;
    case 'destroy':
      return `Destroy ${ref(effect.to, 'object')}.`;
    case 'bounce':
      return `Return ${ref(effect.to, 'object')} to its owner's hand.`;
    case 'counter':
      return `Counter ${ref(effect.to, 'object')}.`;
    case 'draw':
      if (effect.who === 'opponent') return `Your opponent draws ${cardsCount(effect.amount)}.`;
      return `Draw ${cardsCount(effect.amount)}.`;
    case 'gainLife':
      if (effect.who === 'opponent') return `Your opponent gains ${lifeAmount(effect.amount)}.`;
      if (effect.times) return `You gain ${lifeAmount(effect.amount)} for each ${countPhrase(effect.times)}.`;
      return `You gain ${lifeAmount(effect.amount)}.`;
    case 'loseLife':
      return effect.who === 'opponent'
        ? `Each opponent loses ${lifeAmount(effect.amount)}.`
        : `You lose ${lifeAmount(effect.amount)}.`;
    case 'fight':
      return `${ref(effect.a, 'subject')} fights ${ref(effect.b, 'object')}.`;
    case 'bite':
      return `${ref(effect.a, 'subject')} deals damage equal to its power to ${ref(effect.b, 'object')}.`;
    case 'pumpTeam':
      return `Creatures you control ${gainsText('get', effect.power, effect.toughness, effect.keywords)} until end of turn.`;
    case 'addCounters':
      return `Put ${plusCounters(effect.amount)} on ${ref(effect.to, 'object')}.`;
    case 'addCountersTeam':
      return `Put ${plusCounters(effect.amount)} on each creature you control.`;
    case 'createTokens': {
      const description = tokenDescription(effect.token, effect.amount);
      return `Create ${effect.amount === 1 ? withArticle(description) : `${countWord(effect.amount)} ${description}`}.`;
    }
    case 'discard':
      if (effect.who !== 'opponent') return `Discard ${cardsCount(effect.amount)}.`;
      if (context.on === 'damagesPlayer') return `That player discards ${cardsCount(effect.amount)}.`;
      return `Each opponent discards ${cardsCount(effect.amount)}.`;
    case 'returnToBattlefield':
      return `Return it to the battlefield under its owner's control with ${plusCounters(effect.counters)} on it.`;
    case 'extraLands':
      return `You may play ${extraLandsText(effect.amount)} this turn.`;
    case 'searchLand':
      return searchLandSentence(effect.land, effect.battlefield, effect.hand ?? 0, effect.tapped ?? false);
    case 'pumpAttackers':
      return 'Attacking creatures you control get +X/+X until end of turn, where X is the number of attacking creatures.';
    case 'distributeCounters':
      return `Distribute ${countWord(effect.amount)} +1/+1 counters among one, two, or three target creatures, then double the number of +1/+1 counters on each of those creatures.`;
    case 'exile':
      return `Exile ${ref(effect.to, 'object')}.`;
    case 'exileIfDies':
      return `If ${ref(effect.to, 'subject')} would die this turn, exile it instead.`;
    case 'mill':
      return `Mill ${cardsCount(effect.amount)}.`;
    case 'scry':
      return `Scry ${effect.amount}.`;
    case 'returnToHand':
      return `Return ${ref(effect.to, 'object')} to your hand.`;
    case 'returnSelf':
      return `Return this card from your graveyard to the battlefield${effect.tapped ? ' tapped' : ''}.`;
    case 'attach':
      return `Attach it to ${ref(effect.to, 'object')}.`;
    case 'tap':
      return `Tap ${ref(effect.to, 'object')}.`;
    case 'cantBlock':
      return `${ref(effect.to, 'subject')} can't block this turn.`;
    case 'unblockable':
      return `${ref(effect.to, 'subject')} can't be blocked this turn.`;
    case 'doom':
      return `When ${ref(effect.to, 'subject')} deals combat damage this turn, sacrifice it.`;
    case 'challenge':
      return CHALLENGE_TEXT[effect.effect.kind];
  }
}

const CHALLENGE_TEXT: Record<ChallengeEffect['kind'], string> = {
  turnRule: 'A rule applies this turn.',
  revealCast: 'Reveal the top card of your library and cast it.',
  sacrificeOwn: 'Sacrifice creatures.',
  returnCreatures: 'Each player returns a creature card from their graveyard to the battlefield.',
  damagePlayer: 'Deal damage to your opponent.',
  sacrificeOrDamage: 'Your opponent sacrifices an artifact or enchantment or takes damage.',
  returnNamed: 'Return cards from your graveyard to the battlefield.',
  silence: "Your opponent can't cast spells until your next turn.",
  distract: 'Your opponent sacrifices a creature to tap a Head, or loses life.',
  regrow: 'Heads return from your graveyard or library.',
  hide: 'Heads gain indestructible until the end of your next turn.',
  tangle: "Tap two Heads; they don't untap, or cast the top card.",
  breath: 'Deal damage to your opponent, or destroy their tapped creatures.',
  weakSpot: 'Destroy a Head.',
  swallow: 'Your opponent exiles a creature until a Head leaves.',
  freezeHeads: "Tap Heads; they don't untap during your next untap step.",
  revealHead: 'Reveal your top card: a Head enters, anything else goes to your graveyard.',
  pingIfUntapped: 'If it is untapped, it deals damage to your opponent.',
};

const TRIGGER_OPENERS: Record<TriggerEvent, string> = {
  upkeep: 'At the beginning of your upkeep',
  enters: 'When this creature enters',
  dies: 'When this creature dies',
  attacks: 'Whenever this creature attacks',
  spell: 'Whenever you cast an instant or sorcery spell',
  allyEnters: 'Whenever another creature you control enters',
  allyDies: 'Whenever another creature you control dies',
  damagesPlayer: 'Whenever this creature deals combat damage to a player',
  lifeGain: 'Whenever you gain life',
  landfall: 'Landfall — Whenever a land you control enters',
  beginCombat: 'At the beginning of combat on your turn',
  endStep: 'At the beginning of your end step',
  youAttack: 'Whenever one or more creatures you control attack',
  draw: 'Whenever you draw a card',
  secondDraw: 'Whenever you draw your second card each turn',
  allyCounters: 'Whenever one or more +1/+1 counters are put on another non-Hydra creature you control',
  graveyard: 'When this card is put into a graveyard from anywhere',
};

const RELIC_OPENERS: Partial<Record<TriggerEvent, string>> = {
  allyEnters: 'Whenever a creature you control enters',
  allyDies: 'Whenever a creature you control dies',
};

const TRIGGER_CONDITIONS: Record<TriggerCondition, string> = {
  opponentDamaged: 'if an opponent was dealt damage this turn',
  emptyHand: 'if you have no cards in hand',
  opponentLostLife: 'if an opponent lost life this turn',
  attackedThisTurn: 'if you attacked this turn',
  threeCreatures: 'if you control three or more creatures',
  anotherElf: 'if you control another Elf',
  opponentsTurn: "if it's an opponent's turn",
};

function costReductionLine(reduction: CostReduction): string {
  if ('per' in reduction) return `This spell costs {1} less to cast for each ${countPhrase(reduction.per)}.`;
  return `This spell costs {${reduction.amount}} less to cast if you control ${withArticle(reduction.ifControl)}.`;
}

function enchantLine(spec: TargetSpec): string {
  return spec.kind === 'permanent' && spec.types?.includes('land') ? 'Enchant land' : 'Enchant creature';
}

function staticLine(ability: StaticAbility): string {
  switch (ability.kind) {
    case 'anthem': {
      const subjects = ability.subtypes?.length ? andList(ability.subtypes.map(pluralSubtype)) : 'creatures';
      const who = `${ability.other ? 'Other ' : ''}${ability.attacking ? 'attacking ' : ''}${subjects} you control`;
      const power = ability.power ?? 0;
      const toughness = ability.toughness ?? 0;
      const keywords = ability.keywords ?? [];
      if (power === 0 && toughness === 0) return `${capitalize(who)} have ${keywordList(keywords)}.`;
      const has = keywords.length ? ` and have ${keywordList(keywords)}` : '';
      return `${capitalize(who)} get ${formatModifier(power, toughness)}${has}.`;
    }
    case 'keywordIf': {
      const keyword = lowerFirst(KEYWORD_NAMES[ability.keyword]);
      if (ability.condition === 'attacking') return `This creature has ${keyword} as long as it's attacking.`;
      if (ability.condition === 'controlDragon') return `As long as you control a Dragon, this creature has ${keyword}.`;
      return `As long as you have 25 or more life, this creature has ${keyword}.`;
    }
    case 'cantBlock':
      return "This creature can't block.";
    case 'spellDiscount':
      return `${ability.subtype} spells you cast cost {${ability.amount}} less to cast.`;
  }
}

function attachmentLine(def: CardDef, attachment: AttachmentEffect): string {
  if (attachment.landMana) return `Enchanted land has "{T}: Add ${countWord(attachment.landMana)} mana of any one color."`;
  const noun = def.enchant ? 'Enchanted creature' : 'Equipped creature';
  const parts: string[] = [];
  if (attachment.loseAbilities) parts.push('loses all abilities');
  if (attachment.base) parts.push(`has base power and toughness ${attachment.base[0]}/${attachment.base[1]}`);
  const power = attachment.power ?? 0;
  const toughness = attachment.toughness ?? 0;
  if (power !== 0 || toughness !== 0) parts.push(`gets ${formatModifier(power, toughness)}`);
  if (attachment.keywords?.length) parts.push(`has ${keywordList(attachment.keywords)}`);
  if (attachment.cantAttack && attachment.cantBlock) parts.push("can't attack or block");
  else if (attachment.cantBlock) parts.push("can't block");
  if (attachment.doesntUntap) parts.push("doesn't untap during its controller's untap step");
  const sentence = `${noun} ${andList(parts)}.`;
  return attachment.yourTurn ? `During your turn, ${lowerFirst(sentence)}` : sentence;
}

function entersOpener(def: CardDef): string {
  if (def.types.includes('creature')) return 'When this creature enters';
  if (def.enchant) return 'When this Aura enters';
  if (def.subtypes?.includes('Equipment')) return 'When this Equipment enters';
  if (def.types.includes('enchantment')) return 'When this enchantment enters';
  return 'When this artifact enters';
}

function spellOpener(filter: SpellFilter): string {
  if (filter === 'any') return 'Whenever you cast a spell';
  if (filter === 'noncreatureOrDragon') return 'Whenever you cast a noncreature or Dragon spell';
  return TRIGGER_OPENERS.spell;
}

function subtypeOpener(event: TriggerEvent, subtype: string): string {
  if (event === 'allyDies') return `Whenever another ${subtype} you control dies`;
  if (event === 'allyEnters') return `Whenever another ${subtype} you control enters`;
  return TRIGGER_OPENERS[event];
}

function conditionPrefix(condition: EffectCondition, spec: TargetSpec | undefined): string {
  if ('kicked' in condition) return 'If this spell was kicked, ';
  if ('targetSubtype' in condition) {
    return spec?.kind === 'graveyard'
      ? `If it's ${withArticle(condition.targetSubtype)} card, `
      : `If that creature is ${withArticle(condition.targetSubtype)}, `;
  }
  if ('payMana' in condition) return `You may pay ${condition.payMana}. If you do, `;
  return `You may pay ${lifeAmount(condition.payLife)}. If you do, `;
}

function manaChoice(colors: readonly Color[]): string {
  if (colors.length === COLORS.length) return 'one mana of any color';
  return andList(
    colors.map((color) => `{${color}}`),
    'or',
  );
}

function cardRefParts(s: GameState, id: CardId, viewer: PlayerId): TextPart[] {
  const card = s.cards[id];
  if (!card) return [id];
  return card.controller === viewer ? line`your ${mention(s, id)}` : line`the opponent's ${mention(s, id)}`;
}

function playerLabel(player: PlayerId, viewer: PlayerId): string {
  return player === viewer ? 'you' : OPPONENT;
}

function targetRefParts(s: GameState, target: Target, viewer: PlayerId): TextPart[] {
  return isPlayerTarget(target) ? [playerLabel(target.player, viewer)] : cardRefParts(s, target.card, viewer);
}

function act(player: PlayerId, viewer: PlayerId, second: string, third: string): string {
  return player === viewer ? `You ${second}` : `The opponent ${third}`;
}

function possessive(player: PlayerId, viewer: PlayerId): string {
  return player === viewer ? 'your' : 'their';
}

function targetsSuffix(s: GameState, targets: Target[], viewer: PlayerId): TextPart[] {
  if (targets.length === 0) return [];
  return line` targeting ${joinedAnd(targets.map((target) => targetRefParts(s, target, viewer)))}`;
}

function describeEventParts(s: GameState, event: GameEvent, viewer: PlayerId): TextPart[] | null {
  switch (event.t) {
    case 'start':
      return event.startingPlayer === viewer ? line`You go first.` : line`The opponent goes first.`;
    case 'mulligan':
      return line`${act(event.player, viewer, 'mulligan', 'mulligans')} (${event.count}).`;
    case 'keep':
      return line`${act(event.player, viewer, 'keep', 'keeps')} ${count(event.handSize, 'card', 'cards')}.`;
    case 'bottom':
      return line`${act(event.player, viewer, 'put', 'puts')} ${count(event.count, 'card', 'cards')} on the bottom of ${possessive(event.player, viewer)} library.`;
    case 'turn':
      return line`Turn ${event.turn} — ${event.player === viewer ? 'your turn' : "the opponent's turn"}.`;
    case 'draw':
      return event.player === viewer ? line`You draw ${mention(s, event.card)}.` : line`The opponent draws a card.`;
    case 'drawEmpty':
      return event.player === viewer
        ? line`You can't draw: your library is empty.`
        : line`The opponent can't draw: their library is empty.`;
    case 'land':
      return line`${act(event.player, viewer, 'play', 'plays')} ${mention(s, event.card)}.`;
    case 'cast':
      return line`${act(event.player, viewer, 'cast', 'casts')} ${mention(s, event.card)}${targetsSuffix(s, event.targets, viewer)}.`;
    case 'activate': {
      const own = s.cards[event.card]?.controller === event.player;
      const source = own
        ? line`${possessive(event.player, viewer)} ${mention(s, event.card)}`
        : cardRefParts(s, event.card, viewer);
      return line`${act(event.player, viewer, 'activate', 'activates')} ${source}${targetsSuffix(s, event.targets, viewer)}.`;
    }
    case 'trigger':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} triggers${targetsSuffix(s, event.targets, viewer)}.`;
    case 'fizzle': {
      const subject =
        event.item.kind === 'spell' ? [mention(s, event.item.card)] : line`${mention(s, event.item.source)}'s ability`;
      return line`${subject} doesn't resolve: its targets are gone.`;
    }
    case 'counter':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} is countered.`;
    case 'bounce':
      return line`${mention(s, event.card)} returns to ${event.player === viewer ? 'your hand' : "the opponent's hand"}.`;
    case 'attack':
      if (event.attackers.length === 0) return null;
      return line`${act(event.player, viewer, 'attack', 'attacks')} with ${joinedAnd(event.attackers.map((id) => [mention(s, id)]))}.`;
    case 'block':
      if (event.blocks.length === 0) return line`${act(event.player, viewer, "don't block", "doesn't block")}.`;
      return line`${act(event.player, viewer, 'block', 'blocks')}: ${joined(
        event.blocks.map((block) => line`${mention(s, block.blocker)} → ${mention(s, block.attacker)}`),
        ', ',
      )}.`;
    case 'damage':
      return line`${capitalizeParts(cardRefParts(s, event.source, viewer))} deals ${damageAmount(event.amount)} to ${targetRefParts(s, event.target, viewer)}.`;
    case 'life':
      return event.delta > 0
        ? line`${act(event.player, viewer, 'gain', 'gains')} ${lifeAmount(event.delta)} (${event.life}).`
        : null;
    case 'loseLife':
      return line`${act(event.player, viewer, 'lose', 'loses')} ${lifeAmount(event.amount)}.`;
    case 'pump':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} ${gainsText('gets', event.power, event.toughness, event.keywords)} until end of turn.`;
    case 'create': {
      const token = mention(s, event.card);
      const name = typeof token === 'string' ? token : token.name;
      return line`${act(event.player, viewer, 'create', 'creates')} ${article(name)} ${token} token.`;
    }
    case 'return':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} returns to the battlefield.`;
    case 'addCounters':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} gets ${event.amount === 1 ? 'a +1/+1 counter' : `${event.amount} +1/+1 counters`}.`;
    case 'fight':
      return line`${capitalizeParts(cardRefParts(s, event.a, viewer))} fights ${cardRefParts(s, event.b, viewer)}.`;
    case 'bite':
      return null;
    case 'dies':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} dies.`;
    case 'discard':
      return line`${act(event.player, viewer, 'discard', 'discards')} ${mention(s, event.card)}.`;
    case 'concede':
      return line`${act(event.player, viewer, 'concede', 'concedes')}.`;
    case 'gameOver':
      if (event.winner === null) return line`The game ends in a draw.`;
      return event.winner === viewer ? line`You win!` : line`The opponent wins.`;
    case 'search': {
      const mine = event.player === viewer;
      const where = event.to === 'hand' ? `into ${mine ? 'your' : 'their'} hand` : 'onto the battlefield';
      return line`${act(event.player, viewer, 'search', 'searches')} ${possessive(event.player, viewer)} library and ${mine ? 'put' : 'puts'} ${mention(s, event.card)} ${where}.`;
    }
    case 'extraLands':
      return line`${act(event.player, viewer, 'may', 'may')} play ${extraLandsText(event.amount)} this turn.`;
    case 'exile':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} is exiled.`;
    case 'mill':
      return line`${act(event.player, viewer, 'mill', 'mills')} ${mention(s, event.card)}.`;
    case 'attach':
      return line`${capitalizeParts(cardRefParts(s, event.card, viewer))} is attached to ${cardRefParts(s, event.to, viewer)}.`;
    case 'scry':
      return line`${act(event.player, viewer, 'scry', 'scries')} ${event.top + event.bottom}.`;
    case 'sacrifice':
      return line`${act(event.player, viewer, 'sacrifice', 'sacrifices')} ${mention(s, event.card)}.`;
    case 'resolve':
    case 'enter':
      return null;
  }
}

function refusal(refused: Refusal): string {
  switch (refused.code) {
    case 'malformedAction':
      return 'malformed action';
    case 'unknownAction':
      return `unknown action type "${refused.type}"`;
    case 'unknownPlayer':
      return 'unknown player';
    case 'noDecision':
      return "the game isn't waiting for any decision";
    case 'gameOver':
      return 'the game is over';
    case 'notWaitingFor':
      return `the game isn't waiting for the "${refused.kind}" decision`;
    case 'notTheirDecision':
      return `it isn't player ${refused.player}'s decision`;
    case 'otherSeat':
      return 'you can only act for your own seat';
    case 'notYourDecision':
      return "it isn't your decision";
    case 'noMoreMulligans':
      return 'no more mulligans are allowed';
    case 'cardsNotList':
      return 'the cards must be a list';
    case 'chooseExactly':
      return `choose exactly ${count(refused.count, 'card', 'cards')}`;
    case 'chosenNotInHand':
      return `${refused.card} isn't in your hand`;
    case 'chosenTwice':
      return `${refused.card} was chosen twice`;
    case 'notInHand':
      return "that card isn't in your hand";
    case 'notALand':
      return "that card isn't a land";
    case 'landTiming':
      return 'lands can only be played in your main phase while the stack is empty';
    case 'landPlayed':
      return "you've already played a land this turn";
    case 'allLandsPlayed':
      return "you've already played all the lands you can this turn";
    case 'landsAreNotCast':
      return 'lands are played, not cast';
    case 'noPriority':
      return "you don't have priority";
    case 'sorceryTiming':
      return 'this can only be cast in your main phase while the stack is empty';
    case 'silenced':
      return "you can't cast spells until the Nemesis's next turn";
    case 'notEnoughMana':
      return 'not enough mana';
    case 'notYourPermanent':
      return "you don't control that permanent";
    case 'noSuchAbility':
      return "that permanent doesn't have that ability";
    case 'tapped':
      return 'that permanent is tapped';
    case 'summoningSick':
      return 'that creature has summoning sickness';
    case 'triggerGone':
      return "that triggered ability isn't waiting for targets anymore";
    case 'targetsNotList':
      return 'the targets must be a list';
    case 'targetCount':
      return `wrong number of targets: ${refused.given} instead of ${refused.expected}`;
    case 'targetMalformed':
      return `target ${refused.index} is malformed`;
    case 'illegalTarget':
      return `target ${refused.index} (${refused.target}) isn't legal`;
    case 'sameTargetTwice':
      return "the same target can't be chosen twice";
    case 'attackersNotList':
      return 'the attackers must be a list';
    case 'attackersNotIds':
      return 'the attackers must be card ids';
    case 'attackerTwice':
      return `${refused.card} was declared twice`;
    case 'cannotAttack':
      return `${refused.card} can't attack`;
    case 'blocksNotList':
      return 'the blocks must be a list';
    case 'noCombat':
      return "there's no combat";
    case 'malformedBlock':
      return 'malformed block';
    case 'blockerTwice':
      return `${refused.card} can only block one attacker`;
    case 'cannotBlock':
      return `${refused.blocker} can't block ${refused.attacker}`;
    case 'menace':
      return `${refused.attacker} has menace and can't be blocked except by two or more creatures`;
    case 'abilityUsed':
      return 'that ability can only be activated once';
    case 'invalidSacrifice':
      return "that creature can't be sacrificed for this";
    case 'invalidX':
      return 'choose a valid value for X';
  }
}

function sacrificeSelfCost(def: CardDef): string {
  if (def.types.includes('creature')) return 'Sacrifice this creature';
  if (def.token) return 'Sacrifice this token';
  return `Sacrifice this ${def.types.includes('artifact') ? 'artifact' : 'enchantment'}`;
}

const RULES: RulesGrammar = {
  keywordNames: KEYWORD_NAMES,
  keywordLine: (keywords) => keywords,
  entersTapped: 'This land enters tapped.',
  manaAbility: (colors) => `{T}: Add ${manaChoice(colors)}.`,
  triggerOpeners: TRIGGER_OPENERS,
  relicOpeners: RELIC_OPENERS,
  triggerConditions: TRIGGER_CONDITIONS,
  undying: `${TRIGGER_OPENERS.dies}, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.`,
  evolve: `${TRIGGER_OPENERS.allyEnters}, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.`,
  prowess: KEYWORD_REMINDERS.prowess,
  selves: {
    pronoun: { subject: 'it', object: 'it' },
    creature: { subject: 'this creature', object: 'this creature' },
    sacrificed: { subject: 'it', object: 'it' },
  },
  targetPhrase,
  repeatedPhrase,
  effectSentence,
  moreDamage: (amount, target) => `and ${damageAmount(amount)} to ${target}.`,
  andThen: ', then ',
  creatureEntersTapped: 'This creature enters tapped.',
  kickerLine: (cost) => `Kicker ${cost}`,
  additionalCostLine: (cost) => `As an additional cost to cast this spell, sacrifice a creature or pay ${cost}.`,
  costReductionLine,
  enchantLine,
  xCountersLine: 'This creature enters with X +1/+1 counters on it.',
  manaTimesLine: (colors, count) => `{T}: Add ${manaChoice(colors)} for each ${countPhrase(count)}.`,
  staticLine,
  attachmentLine,
  entersOpener,
  spellOpener,
  subtypeOpener,
  conditionPrefix,
  equipLine: (cost) => `Equip ${cost}`,
  sorceryOnly: 'Activate only as a sorcery.',
  onceOnly: 'Activate only once.',
  sacrificeAnotherCost: 'Sacrifice another creature',
  exileSelfCost: 'Exile this card from your graveyard',
  sacrificeSelfCost,
  attachedRef: 'enchanted creature',
  eachOpponent: 'each opponent',
};

const STATE: StateWords = {
  stepName: (step) => STEP_NAMES[step],
  turn: 'Turn',
  active: 'active',
  life: lifeAmount,
  library: 'library',
  graveyard: 'graveyard',
  hand: 'hand',
  hiddenHand: (cards) => `${cards} cards`,
  battlefield: 'battlefield',
  relics: 'relics',
  stack: 'stack',
  ability: (source) => `${source}'s ability`,
  targets: targetsSuffix,
  waitingFor: 'waiting for',
  tapped: 'tapped',
  summoningSick: 'summoning sick',
  damage: (amount) => `${amount} damage`,
  counters: countersLabel,
  attacking: 'attacking',
  blocking: (attacker) => `blocking ${attacker}`,
};

export const en: EngineText = {
  playerNames: ['You', 'AI'],
  keywordName: (keyword) => KEYWORD_NAMES[keyword],
  keywordReminder: (keyword) => KEYWORD_REMINDERS[keyword],
  stepName: (step) => STEP_NAMES[step],
  colorName: (color) => COLOR_WORDS[color],
  typeLine,
  rulesText: (def) => rulesText(RULES, def),
  triggerText: (def, index) => triggerText(RULES, def, index),
  activatedText: (def, index) => activatedText(RULES, def, index),
  tokenDescription,
  targetChoice,
  formatPump,
  countersLabel,
  targetRefParts,
  describeEventParts,
  describeState: (s, viewer, revealAll) => describeState(STATE, s, viewer, revealAll),
  refusal,
};
