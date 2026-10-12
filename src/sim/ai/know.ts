import { type Rng, shuffle } from "../engine/rng";
import { type Perm, type State, clone, defOf } from "../engine/state";

export interface DecisionCtx {
  unknown: Uint8Array;
  avgCard: number;
  avgThreat: number;
}

export function unknownSet(s: State): Uint8Array {
  const u = new Uint8Array(s.ctx.defs.length);
  for (const uid of s.library) if (!s.known[uid]) u[uid] = 1;
  for (const uid of s.faceDown) if (!s.known[uid]) u[uid] = 1;
  return u;
}

function reshuffle(zone: number[], known: Uint8Array, next: Rng, fixFront: ((uid: number) => boolean) | null): void {
  const pos: number[] = [];
  const ids: number[] = [];
  for (let i = 0; i < zone.length; i++) if (!known[zone[i]]) { pos.push(i); ids.push(zone[i]); }
  if (ids.length < 2) return;
  shuffle(ids, next);
  if (fixFront && pos[0] === 0) {
    const j = ids.findIndex(fixFront);
    if (j > 0) [ids[0], ids[j]] = [ids[j], ids[0]];
  }
  for (let i = 0; i < pos.length; i++) zone[pos[i]] = ids[i];
}

export function resample(c: State, next: Rng): State {
  const front = c.library.length && !c.known[c.library[0]] ? defOf(c, c.library[0]).color : null;
  reshuffle(c.library, c.known, next, front ? (uid) => defOf(c, uid).color === front : null);
  reshuffle(c.faceDown, c.known, next, null);
  return c;
}

export function determinize(s: State, next: Rng): State {
  return resample(clone(s), next);
}

let h1 = 0;
let h2 = 0;

function mix(x: number): void {
  h1 = Math.imul(h1 ^ x, 0x01000193);
  h1 ^= h1 >>> 13;
  h2 = Math.imul(h2 + x + 0x9e3779b9, 0x5bd1e995);
  h2 ^= h2 >>> 15;
}

function mixPerm(p: Perm): void {
  mix(p.uid);
  mix((p.tapped ? 1 : 0) | (p.sick ? 2 : 0) | (p.frozen ? 4 : 0) | (p.pacified ? 8 : 0) | (p.shield ? 16 : 0) | (p.dt ? 32 : 0));
  mix(p.damage * 4096 + (p.tp + 64) * 64 + (p.tt + 32));
  mix(p.ap * 256 + p.at * 16 + p.akw);
  for (const a of p.auras) mix(a + 500);
}

export function publicKey(s: State): number {
  h1 = 0x811c9dc5;
  h2 = 0x12345678;
  mix(s.library.length);
  for (let i = 0; i < s.library.length; i++) if (s.known[s.library[i]]) mix(i * 64 + s.library[i] + 7000);
  mix(s.hand.length + 100);
  for (const u of s.hand) mix(u);
  mix(s.grave.length + 200);
  for (const u of s.grave) mix(u);
  mix(s.lands.length + 300);
  for (const u of s.lands) mix(u);
  mix(s.tapped);
  mix(s.mine.length + 400);
  for (const p of s.mine) mixPerm(p);
  mix(s.nem.length + 500);
  for (const p of s.nem) mixPerm(p);
  mix(s.kael * 8 + (s.kaelUsed ? 1 : 0) + (s.landPlayed ? 2 : 0) + s.spells * 64);
  mix(s.omen + 600);
  mix(s.faceDown.length + 700);
  for (let i = 0; i < s.faceDown.length; i++) if (s.known[s.faceDown[i]]) mix(i * 64 + s.faceDown[i] + 9000);
  mix(s.ruin.length + 800);
  for (const u of s.ruin) mix(u);
  for (const u of s.counters) mix(u + 900);
  mix(s.phase * 16 + s.ash + s.over * 256 + s.active * 1024);
  for (let i = 0; i < s.atk.length; i++) mix(s.atk[i] * 64 + s.blk[i] + 2);
  mix(s.pend * 64 + s.pendTarget + 3);
  mix(s.q.length + 1100);
  for (const t of s.q) mix(t.k * 64 + t.u + 1);
  return (h1 >>> 0) * 2097152 + ((h2 >>> 0) & 0x1fffff);
}
