import { renderCard, renderGrimoireBack } from "../render/card";
import { type State, defOf } from "../sim/engine/state";

export type Zone = "hand" | "library" | "grave" | "mine" | "nem" | "omen" | "threat" | "ruin" | "counter" | "stack" | `aura:${number}`;

export interface Move {
  uid: number;
  from: Zone;
  to: Zone;
  card: string;
}

export function zoneOf(s: State, uid: number): Zone {
  if (s.hand.includes(uid)) return "hand";
  if (s.library.includes(uid)) return "library";
  if (s.grave.includes(uid)) return "grave";
  if (s.omen === uid) return "omen";
  if (s.faceDown.includes(uid)) return "threat";
  if (s.ruin.includes(uid)) return "ruin";
  if (s.counters.includes(uid)) return "counter";
  for (const p of s.mine) if (p.uid === uid) return "mine";
  for (const p of s.nem) if (p.uid === uid) return "nem";
  for (const p of [...s.mine, ...s.nem]) if (p.auras.includes(uid)) return `aura:${p.uid}`;
  return "stack";
}

export function moves(prev: State, next: State): Move[] {
  const out: Move[] = [];
  for (let uid = 0; uid < next.ctx.defs.length; uid++) {
    const from = zoneOf(prev, uid);
    const to = zoneOf(next, uid);
    if (from !== to) out.push({ uid, from, to, card: to === "library" ? renderGrimoireBack() : renderCard(defOf(next, uid).id) });
  }
  return out;
}
