export type PlayerId = 0 | 1;
export type CardId = string;

export type Color = 'W' | 'U' | 'B' | 'R' | 'G';
export const COLORS: readonly Color[] = ['W', 'U', 'B', 'R', 'G'];

export interface ManaCost {
  generic: number;
  W: number;
  U: number;
  B: number;
  R: number;
  G: number;
  x?: number;
}

export type CardType = 'land' | 'creature' | 'artifact' | 'enchantment' | 'instant' | 'sorcery' | 'relic';

export type Keyword =
  | 'flying'
  | 'reach'
  | 'haste'
  | 'vigilance'
  | 'trample'
  | 'firstStrike'
  | 'doubleStrike'
  | 'deathtouch'
  | 'lifelink'
  | 'menace'
  | 'defender'
  | 'flash'
  | 'skulk'
  | 'undying'
  | 'hexproof'
  | 'evolve'
  | 'prowess'
  | 'indestructible'
  | 'ward';

export const KEYWORDS: readonly Keyword[] = [
  'flying',
  'reach',
  'haste',
  'vigilance',
  'trample',
  'firstStrike',
  'doubleStrike',
  'deathtouch',
  'lifelink',
  'menace',
  'defender',
  'flash',
  'skulk',
  'undying',
  'hexproof',
  'evolve',
  'prowess',
  'indestructible',
  'ward',
];

export type PermanentKind = 'artifact' | 'enchantment' | 'creature' | 'flyingCreature' | 'land' | 'nonland';

export type TargetSpec =
  | { kind: 'any' }
  | {
      kind: 'creature';
      controller?: 'you' | 'opponent';
      tapped?: boolean;
      other?: boolean;
      subtype?: string;
      combat?: 'attacking' | 'attackingOrBlocking';
      maxPower?: number;
    }
  | { kind: 'permanent'; controller?: 'you' | 'opponent'; types?: PermanentKind[] }
  | { kind: 'player'; controller?: 'you' | 'opponent' }
  | { kind: 'spell' }
  | { kind: 'graveyard'; cards: 'creature' | 'permanent'; subtype?: string };

export type Target = { player: PlayerId } | { card: CardId };

export type EffectTarget = number | 'self' | 'attached' | 'opponent';

export type Who = 'you' | 'opponent';

export type Count =
  | { kind: 'attacking' }
  | { kind: 'creatures'; subtype?: string }
  | { kind: 'instantsAndSorceriesInGraveyard' };

export type EffectCondition =
  | { kicked: true }
  | { targetSubtype: string; target: number }
  | { payMana: string }
  | { payLife: number };

export type Effect = (
  | { kind: 'damage'; amount: number; to: EffectTarget; times?: Count }
  | { kind: 'pump'; power: number; toughness: number; to: EffectTarget; keywords?: Keyword[] }
  | { kind: 'destroy'; to: EffectTarget }
  | { kind: 'bounce'; to: EffectTarget }
  | { kind: 'counter'; to: number }
  | { kind: 'draw'; amount: number; who?: Who }
  | { kind: 'gainLife'; amount: number; times?: Count; who?: Who }
  | { kind: 'loseLife'; amount: number; who?: Who }
  | { kind: 'fight'; a: EffectTarget; b: EffectTarget }
  | { kind: 'bite'; a: EffectTarget; b: EffectTarget }
  | { kind: 'pumpTeam'; power: number; toughness: number; keywords?: Keyword[] }
  | { kind: 'pumpAttackers'; perAttacker: number }
  | { kind: 'addCounters'; amount: number; to: EffectTarget }
  | { kind: 'addCountersTeam'; amount: number }
  | { kind: 'distributeCounters'; amount: number }
  | { kind: 'createTokens'; token: string; amount: number }
  | { kind: 'discard'; amount: number; who?: Who }
  | { kind: 'returnToBattlefield'; counters: number }
  | { kind: 'extraLands'; amount: number }
  | { kind: 'searchLand'; land: string; battlefield: number; hand?: number; tapped?: boolean }
  | { kind: 'exile'; to: EffectTarget }
  | { kind: 'exileIfDies'; to: EffectTarget }
  | { kind: 'mill'; amount: number }
  | { kind: 'scry'; amount: number }
  | { kind: 'returnToHand'; to: number }
  | { kind: 'returnSelf'; tapped: boolean }
  | { kind: 'attach'; to: number }
  | { kind: 'tap'; to: EffectTarget }
  | { kind: 'cantBlock'; to: EffectTarget }
  | { kind: 'unblockable'; to: EffectTarget }
  | { kind: 'doom'; to: EffectTarget }
  | { kind: 'challenge'; effect: ChallengeEffect }
) & { if?: EffectCondition };

export type TriggerEvent =
  | 'upkeep'
  | 'enters'
  | 'dies'
  | 'attacks'
  | 'spell'
  | 'allyEnters'
  | 'allyDies'
  | 'damagesPlayer'
  | 'lifeGain'
  | 'landfall'
  | 'beginCombat'
  | 'endStep'
  | 'youAttack'
  | 'draw'
  | 'secondDraw'
  | 'allyCounters'
  | 'graveyard';

export type TriggerCondition =
  | 'opponentDamaged'
  | 'emptyHand'
  | 'opponentLostLife'
  | 'attackedThisTurn'
  | 'threeCreatures'
  | 'anotherElf'
  | 'opponentsTurn';

export type SpellFilter = 'instantOrSorcery' | 'any' | 'noncreatureOrDragon';

export interface TriggeredAbility {
  on: TriggerEvent;
  condition?: TriggerCondition;
  spells?: SpellFilter;
  subtype?: string;
  targets: TargetSpec[];
  minTargets?: number;
  effects: Effect[];
}

export interface ActivatedAbility {
  cost: string;
  tap?: boolean;
  sacrifice?: boolean;
  sacrificeAnother?: boolean;
  exileSelf?: boolean;
  fromGraveyard?: boolean;
  sorcery?: boolean;
  once?: boolean;
  targets: TargetSpec[];
  minTargets?: number;
  effects: Effect[];
}

export interface SpellAbility {
  targets: TargetSpec[];
  minTargets?: number;
  effects: Effect[];
}

export type StaticAbility =
  | {
      kind: 'anthem';
      subtypes?: string[];
      other?: boolean;
      attacking?: boolean;
      power?: number;
      toughness?: number;
      keywords?: Keyword[];
      ifCount?: number;
    }
  | { kind: 'keywordIf'; keyword: Keyword; condition: 'attacking' | 'controlDragon' | 'life25' }
  | { kind: 'cantBlock' }
  | { kind: 'spellDiscount'; subtype: string; amount: number };

export interface AttachmentEffect {
  power?: number;
  toughness?: number;
  keywords?: Keyword[];
  yourTurn?: boolean;
  cantAttack?: boolean;
  cantBlock?: boolean;
  loseAbilities?: boolean;
  base?: [number, number];
  doesntUntap?: boolean;
  landMana?: number;
}

export type CostReduction = { per: Count } | { ifControl: string; amount: number };
export type ThreatEffect =
  | { kind: 'damageEach'; creatures: number; player: number }
  | { kind: 'shrinkTarget'; amount: number; fallback: number }
  | { kind: 'reanimate'; count: number; fallback: number; damage: boolean }
  | { kind: 'reveal'; count: number }
  | { kind: 'shrinkAll'; amount: number }
  | { kind: 'counterNext' }
  | { kind: 'rebound' }
  | { kind: 'randomDiscard'; fallback: number }
  | { kind: 'tapAll' };

export type TurnRule = (
  | { kind: 'attackers'; subtype: string; power: number; keywords: Keyword[]; destroy?: boolean }
  | { kind: 'mustAttack'; subtype: string; haste?: boolean; keywords?: Keyword[] }
  | { kind: 'combatDamage'; creatures: number }
  | { kind: 'revelerDamage'; creatures: boolean }
) & { source?: CardId };

export type ChallengeEffect =
  | { kind: 'turnRule'; rule: TurnRule }
  | { kind: 'revealCast'; count: number }
  | { kind: 'sacrificeOwn'; subtype: string; count: number }
  | { kind: 'returnCreatures' }
  | { kind: 'damagePlayer'; amount: number; perHead?: boolean }
  | { kind: 'sacrificeOrDamage'; types: CardType[]; amount: number }
  | { kind: 'returnNamed'; card: string; count: number }
  | { kind: 'silence' }
  | { kind: 'distract'; life: number }
  | { kind: 'regrow'; card: string; count: number }
  | { kind: 'hide' }
  | { kind: 'tangle'; heads: number }
  | { kind: 'breath'; amount: number }
  | { kind: 'weakSpot' }
  | { kind: 'swallow' }
  | { kind: 'freezeHeads'; count: number }
  | { kind: 'revealHead'; count: number }
  | { kind: 'pingIfUntapped'; amount: number };

export interface ChallengeInfo {
  mustAttack?: boolean | number;
  reveals?: number;
  revealsWith?: number;
  anchor?: boolean;
  elite?: boolean;
  flame?: number;
  panic?: number;
  passive?: boolean;
}

export interface ThreatInfo {
  effect?: ThreatEffect;
  recur?: boolean;
  tax?: number;
}

export interface CardDef {
  id: string;
  name: string;
  types: CardType[];
  supertypes?: string[];
  subtypes?: string[];
  cost?: string;
  power?: number;
  toughness?: number;
  keywords?: Keyword[];
  mana?: Color[];
  entersTapped?: boolean;
  token?: boolean;
  colors?: Color[];
  spell?: SpellAbility;
  triggers?: TriggeredAbility[];
  activated?: ActivatedAbility[];
  statics?: StaticAbility[];
  enchant?: TargetSpec;
  attachment?: AttachmentEffect;
  kicker?: string;
  costReduction?: CostReduction;
  xCounters?: boolean;
  manaTimes?: Count;
  sacrificeForMana?: boolean;
  sacrificeCreatureOr?: string;
  flavor?: string;
  threat?: ThreatInfo;
  challenge?: ChallengeInfo;
}

export type Zone = 'library' | 'hand' | 'battlefield' | 'graveyard' | 'exile' | 'command' | 'stack' | 'gone';

export interface CardInstance {
  id: CardId;
  def: string;
  owner: PlayerId;
  controller: PlayerId;
  zone: Zone;
  tapped: boolean;
  summoningSick: boolean;
  damage: number;
  deathtouchDamage: boolean;
  counters: number;
  attachedTo?: CardId;
  spent?: boolean;
  frozen?: boolean;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  life: number;
  library: CardId[];
  hand: CardId[];
  battlefield: CardId[];
  graveyard: CardId[];
  exile: CardId[];
  command: CardId[];
  landsPlayedThisTurn: number;
  mulligans: number;
  kept: boolean;
  bottomed: boolean;
  drewFromEmptyLibrary: boolean;
  conceded: boolean;
  damagedThisTurn: boolean;
  lostLifeThisTurn: boolean;
  attackedThisTurn: boolean;
  drawsThisTurn: number;
  extraLandsThisTurn: number;
  openingHand?: number;
  drawOnFirstTurn?: boolean;
  nemesis?: boolean;
  spellsCastThisTurn?: number;
  turnRules?: TurnRule[];
  extraTurns?: number;
  silenced?: boolean;
  swallowed?: CardId[];
  defeated?: boolean;
}

export type Step =
  | 'mulligan'
  | 'untap'
  | 'upkeep'
  | 'draw'
  | 'main1'
  | 'beginCombat'
  | 'declareAttackers'
  | 'declareBlockers'
  | 'firstStrikeDamage'
  | 'combatDamage'
  | 'endCombat'
  | 'main2'
  | 'end'
  | 'cleanup';

export type StackItem =
  | {
      id: string;
      kind: 'spell';
      controller: PlayerId;
      card: CardId;
      targets: Target[];
      lost?: number[];
      x?: number;
      kicked?: boolean;
    }
  | {
      id: string;
      kind: 'trigger';
      controller: PlayerId;
      source: CardId;
      ability: number;
      targets: Target[];
      lost?: number[];
    }
  | {
      id: string;
      kind: 'activated';
      controller: PlayerId;
      source: CardId;
      ability: number;
      targets: Target[];
      lost?: number[];
    };

export interface ContinuousEffect {
  id: string;
  card: CardId;
  power: number;
  toughness: number;
  keywords?: Keyword[];
  cantBlock?: boolean;
  unblockable?: boolean;
  exileIfDies?: boolean;
  doom?: boolean;
  destroyAtEndOfCombat?: boolean;
  until: 'endOfTurn';
  expires?: number;
}

export interface Block {
  blocker: CardId;
  attacker: CardId;
}

export interface CombatState {
  attackers: CardId[];
  blocks: Block[];
  blockersDeclared: boolean;
  blocked: CardId[];
  firstStrikers: CardId[] | null;
}

export interface PendingTrigger {
  id: string;
  controller: PlayerId;
  source: CardId;
  ability: number;
}

export type PendingDecision =
  | { kind: 'mulligan'; player: PlayerId }
  | { kind: 'bottom'; player: PlayerId; count: number }
  | { kind: 'priority'; player: PlayerId }
  | { kind: 'declareAttackers'; player: PlayerId }
  | { kind: 'declareBlockers'; player: PlayerId }
  | { kind: 'chooseTargets'; player: PlayerId; trigger: string }
  | { kind: 'discard'; player: PlayerId; count: number; source?: CardId }
  | { kind: 'gameOver'; winner: PlayerId | null; reason: GameOverReason };

export type GameOverReason = 'life' | 'decked' | 'concede' | 'turnLimit' | 'challenge';

export type Action =
  | { type: 'keep'; player: PlayerId }
  | { type: 'mulligan'; player: PlayerId }
  | { type: 'bottom'; player: PlayerId; cards: CardId[] }
  | { type: 'pass'; player: PlayerId }
  | { type: 'playLand'; player: PlayerId; card: CardId }
  | { type: 'cast'; player: PlayerId; card: CardId; targets: Target[]; x?: number; sacrifice?: CardId }
  | { type: 'activate'; player: PlayerId; card: CardId; ability: number; targets: Target[]; sacrifice?: CardId }
  | { type: 'declareAttackers'; player: PlayerId; attackers: CardId[] }
  | { type: 'declareBlockers'; player: PlayerId; blocks: Block[] }
  | { type: 'chooseTargets'; player: PlayerId; targets: Target[] }
  | { type: 'discard'; player: PlayerId; cards: CardId[] }
  | { type: 'concede'; player: PlayerId };

export type GameEvent =
  | { t: 'start'; startingPlayer: PlayerId }
  | { t: 'mulligan'; player: PlayerId; count: number }
  | { t: 'keep'; player: PlayerId; handSize: number }
  | { t: 'bottom'; player: PlayerId; count: number }
  | { t: 'turn'; turn: number; player: PlayerId }
  | { t: 'draw'; player: PlayerId; card: CardId }
  | { t: 'drawEmpty'; player: PlayerId }
  | { t: 'land'; player: PlayerId; card: CardId }
  | { t: 'cast'; player: PlayerId; card: CardId; targets: Target[] }
  | { t: 'activate'; player: PlayerId; card: CardId; ability: number; targets: Target[] }
  | { t: 'trigger'; player: PlayerId; card: CardId; ability: number; targets: Target[] }
  | { t: 'resolve'; item: StackItem }
  | { t: 'fizzle'; item: StackItem }
  | { t: 'counter'; card: CardId; player: PlayerId }
  | { t: 'bounce'; card: CardId; player: PlayerId }
  | { t: 'enter'; player: PlayerId; card: CardId }
  | { t: 'search'; player: PlayerId; card: CardId; to: 'battlefield' | 'hand' }
  | { t: 'extraLands'; player: PlayerId; amount: number }
  | { t: 'create'; player: PlayerId; card: CardId }
  | { t: 'return'; player: PlayerId; card: CardId }
  | { t: 'attack'; player: PlayerId; attackers: CardId[] }
  | { t: 'block'; player: PlayerId; blocks: Block[] }
  | { t: 'damage'; source: CardId; target: Target; amount: number; combat: boolean }
  | { t: 'life'; player: PlayerId; delta: number; life: number }
  | { t: 'loseLife'; player: PlayerId; amount: number }
  | { t: 'pump'; card: CardId; power: number; toughness: number; keywords?: Keyword[] }
  | { t: 'addCounters'; card: CardId; amount: number }
  | { t: 'fight'; a: CardId; b: CardId }
  | { t: 'bite'; a: CardId; b: CardId }
  | { t: 'dies'; card: CardId; player: PlayerId }
  | { t: 'exile'; card: CardId; player: PlayerId }
  | { t: 'mill'; card: CardId; player: PlayerId }
  | { t: 'attach'; card: CardId; to: CardId }
  | { t: 'scry'; player: PlayerId; bottom: number; top: number }
  | { t: 'sacrifice'; card: CardId; player: PlayerId }
  | { t: 'discard'; player: PlayerId; card: CardId }
  | { t: 'concede'; player: PlayerId }
  | { t: 'gameOver'; winner: PlayerId | null; reason: GameOverReason };

export interface GameState {
  seed: number;
  rng: number;
  nextId: number;
  turn: number;
  activePlayer: PlayerId;
  startingPlayer: PlayerId;
  step: Step;
  stepStarted: boolean;
  priority: PlayerId | null;
  passes: number;
  players: [PlayerState, PlayerState];
  cards: Record<CardId, CardInstance>;
  stack: StackItem[];
  effects: ContinuousEffect[];
  combat: CombatState | null;
  triggers: PendingTrigger[];
  pending: PendingDecision | null;
  events: GameEvent[];
  actionCount: number;
  turnLimit: number;
}
