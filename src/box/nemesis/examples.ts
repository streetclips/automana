import { chooseAction } from '../ai';
import {
  applyAction,
  createScenario,
  getCardDef,
  hasCardDef,
  registerCard,
  type CardId,
  type GameState,
  type Keyword,
  type ScenarioSpec,
} from '../engine';
import { duel, nemesisAction, nemesisAttackers, nemesisBlocks, nemesisTargets } from './mind';
import './challenges';
import './threats';

export type BlockStep = 'safe' | 'trade' | 'desperation';

export interface PlayerCreature {
  pt: [number, number];
  keywords?: Keyword[];
}

function playerCard({ pt: [power, toughness], keywords = [] }: PlayerCreature): string {
  const id = ['rb', power, toughness, ...keywords].join('_');
  if (!hasCardDef(id)) registerCard({ id, name: id, types: ['creature'], cost: '{1}', power, toughness, keywords });
  return id;
}

function scenario(spec: ScenarioSpec): GameState {
  return createScenario({ ...spec, players: [spec.players[0], { ...spec.players[1], nemesis: true }] });
}

function passUntil(s: GameState, until: (state: GameState) => boolean): GameState {
  let state = s;
  for (let guard = 0; guard < 200 && !until(state); guard++) {
    const pending = state.pending;
    if (!pending || pending.kind === 'gameOver') throw new Error('the example game ended early');
    if (state.players[pending.player].nemesis) state = applyAction(state, nemesisAction(state, pending.player));
    else if (pending.kind === 'priority') state = applyAction(state, { type: 'pass', player: pending.player });
    else state = applyAction(state, chooseAction(state, pending.player));
  }
  if (!until(state)) throw new Error('the example never reached its step');
  return state;
}

const indexIn = (ids: CardId[], id: CardId): number => ids.indexOf(id);

export function exampleAttackers(nemesis: string[], yours: PlayerCreature[]): number[] {
  const s = scenario({ activePlayer: 1, players: [{ battlefield: yours.map(playerCard) }, { battlefield: nemesis }] });
  const row = s.players[1].battlefield;
  return nemesisAttackers(s, 1)
    .map((id) => indexIn(row, id))
    .sort((a, b) => a - b);
}

function stepOf(s: GameState, blocker: CardId, attacker: CardId): BlockStep {
  const { attackerDies, blockerDies } = duel(s, attacker, blocker);
  if (attackerDies) return blockerDies ? 'trade' : 'safe';
  return 'desperation';
}

export function exampleBlocks(nemesis: string[], yours: PlayerCreature[], life: number): [number, number, BlockStep][] {
  let s = scenario({ players: [{ battlefield: yours.map(playerCard) }, { life, battlefield: nemesis }] });
  const attackers = [...s.players[0].battlefield];
  const row = [...s.players[1].battlefield];
  s = passUntil(s, (state) => state.pending?.kind === 'declareAttackers');
  s = applyAction(s, { type: 'declareAttackers', player: 0, attackers });
  s = passUntil(s, (state) => state.pending?.kind === 'declareBlockers');
  return nemesisBlocks(s, 1).map(({ blocker, attacker }) => [indexIn(row, blocker), indexIn(attackers, attacker), stepOf(s, blocker, attacker)]);
}

export function exampleTurnAttackers(nemesis: string[], hand: string[], yours: PlayerCreature[]): number[] {
  let s = scenario({ activePlayer: 1, players: [{ battlefield: yours.map(playerCard) }, { hand, battlefield: nemesis }] });
  const row = [...s.players[1].battlefield];
  s = passUntil(s, (state) => state.pending?.kind === 'declareBlockers');
  return (s.combat?.attackers ?? []).map((id) => indexIn(row, id)).sort((a, b) => a - b);
}

export function exampleTarget(spell: string, yours: PlayerCreature[]): number | null {
  const s = scenario({ activePlayer: 1, players: [{ battlefield: yours.map(playerCard) }, {}] });
  const [target] = nemesisTargets(s, 1, getCardDef(spell).spell?.targets ?? []) ?? [];
  return target && 'card' in target ? indexIn(s.players[0].battlefield, target.card) : null;
}
