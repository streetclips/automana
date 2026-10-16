import { chooseAction } from '../ai';
import { applyAction, checkInvariants, createGame, describeEvent, type GameState } from '../engine';
import { nemesisAction } from './mind';
import type { NemesisDeck } from './threats';

const MAX_ACTIONS = 5000;

export interface GameResult {
  won: boolean;
  draw: boolean;
  rounds: number;
  playerLife: number;
  nemesisLife: number;
  mulligans: number;
  overflows: number;
  error?: string;
}

export function startNemesisGame(seed: number, deck: string[], nemesis: NemesisDeck): GameState {
  return createGame({
    seed,
    players: [
      { deck },
      {
        deck: nemesis.threats,
        nemesis: true,
        challenge: nemesis.rules,
        battlefield: nemesis.battlefield,
        creatureLimit: nemesis.creatureLimit,
        headStart: nemesis.headStart,
      },
    ],
  });
}

export function nextAction(s: GameState): ReturnType<typeof chooseAction> {
  const pending = s.pending;
  if (!pending || pending.kind === 'gameOver') throw new Error('the game is over');
  return s.players[pending.player].nemesis ? nemesisAction(s, pending.player) : chooseAction(s, pending.player);
}

export function playNemesisGame(seed: number, deck: string[], nemesis: NemesisDeck, log?: string[]): GameResult {
  let s = startNemesisGame(seed, deck, nemesis);
  const record = (state: GameState): void => {
    if (!log) return;
    for (const event of state.events) {
      const line = describeEvent(state, event, 0);
      if (line) log.push(line);
    }
  };
  record(s);
  let error: string | undefined;
  try {
    for (let actions = 0; s.pending && s.pending.kind !== 'gameOver'; actions++) {
      if (actions >= MAX_ACTIONS) throw new Error('game did not finish');
      s = applyAction(s, nextAction(s));
      record(s);
      const problems = checkInvariants(s);
      if (problems.length > 0) throw new Error(`invariant violated: ${problems.join('; ')}`);
    }
  } catch (caught) {
    error = (caught as Error).message;
  }
  const pending = s.pending;
  const over = pending?.kind === 'gameOver';
  return {
    won: over && pending.winner === 0,
    draw: over && pending.winner === null,
    rounds: Math.ceil(s.turn / 2),
    playerLife: s.players[0].life,
    nemesisLife: s.players[1].life,
    mulligans: s.players[0].mulligans,
    overflows: s.players[1].overflows ?? 0,
    error,
  };
}
