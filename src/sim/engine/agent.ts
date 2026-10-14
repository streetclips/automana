import type { State, Window } from "./state";

export type Action =
  | { t: "cast"; uid: number; target: number }
  | { t: "archivist" }
  | { t: "pass" };

export const PASS: Action = { t: "pass" };

export interface Agent {
  mulligan(s: State): boolean;
  mulliganDiscard(s: State): number;
  main(s: State, step: 1 | 2): Action;
  attack(s: State): number[];
  trick(s: State): Action;
  respond(s: State, w: Window): Action;
  block(s: State): number[];
  scry(s: State, cards: number[]): number[];
  ghoul(s: State): number;
  prayer(s: State, cards: number[]): number;
  discard(s: State, n: number): number[];
  cryptLord(s: State, options: number[]): number;
  hound(s: State): number;
  tideOrder(s: State, uids: number[]): number[];
}
