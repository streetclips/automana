import { getCard } from "../content";
import { getLocale } from "../i18n/locale";
import { type Action, type Agent, CHARGE, DISCHARGE, PASS, ULTIMATE } from "../sim/engine/agent";
import { DEFENDER, HASTE } from "../sim/engine/defs";
import {
  ARCHIVIST, bestRuinCreature, canBlock, castable, findMine, findNem, kwOf, nemAttackers, pw, refraction, ruinCreatures,
  sources, targets, tg, wardActive,
} from "../sim/engine/engine";
import { FACE, MAX_CREATURES, MAX_LANDS, type Perm, type State, type Window, clone, defOf } from "../sim/engine/state";
import { ROMAN, cardName, landName, ui } from "./strings";

export type Answer = Action | boolean | number[] | "skip";

export interface Item {
  label: string;
  answer: Answer;
  src?: number | "kael";
  target?: number;
  primary?: boolean;
}

interface Prompt {
  title: string;
  note: string;
}

export interface Pick extends Prompt {
  kind: "pick";
  from: number[];
  min: number;
  max: number;
  ordered: boolean;
  tray: boolean;
  confirm: string;
  none?: string;
  preset?: number[];
  quick: Item[];
}

export type Ask =
  | (Prompt & { kind: "menu"; items: Item[] })
  | Pick
  | (Prompt & { kind: "blocks"; attackers: number[]; options: number[][] });

export class Pending extends Error {
  constructor(readonly ask: Ask) {
    super("Waiting for the player");
  }
}

export function nameOf(s: State, uid: number): string {
  return cardName(defOf(s, uid).id);
}

export function stats(s: State, p: Perm): string {
  return `${cardName(p.def.id)} ${pw(s, p)}/${tg(s, p)}`;
}

function who(s: State, uid: number, self = -1): string {
  if (uid === FACE) return ui().nemesis;
  if (uid === self) return ui().itself;
  const n = findNem(s, uid);
  if (n) return stats(s, n);
  const m = findMine(s, uid);
  if (m) return ui().yours(stats(s, m));
  return ui().fromGrave(nameOf(s, uid));
}

function onTable(s: State, uid: number): boolean {
  return uid >= 0 && (findMine(s, uid) ?? findNem(s, uid)) !== undefined;
}

function canAttack(s: State, p: Perm): boolean {
  const k = kwOf(s, p);
  return !p.tapped && (!p.sick || (k & HASTE) !== 0) && !(k & DEFENDER);
}

function castLabel(s: State, uid: number, target: number, pay: boolean): string {
  const d = defOf(s, uid);
  const t = ui();
  const parts = [d.id === "bend-fate" ? (target === 1 ? t.bendBottom : t.bendKeep) : target === -1 ? t.cast : t.castOn(who(s, target, uid))];
  if (refraction(s)) parts.push(t.refraction);
  if (s.counters.length) parts.push(t.counterspell);
  else if (wardActive(s)) parts.push(pay ? t.wardPay : t.wardCountered);
  return parts.join(" · ");
}

function castItems(s: State, main: boolean): Item[] {
  const items: Item[] = [];
  const have = sources(s);
  const pays = wardActive(s) && !s.counters.length ? [true, false] : [false];
  for (const uid of s.hand) {
    const aimed = defOf(s, uid).id !== "bend-fate";
    for (const pay of pays) {
      if (!castable(s, uid, main, pay, have)) continue;
      for (const target of targets(s, uid)) {
        items.push({ label: castLabel(s, uid, target, pay), answer: { t: "cast", uid, target, pay }, src: uid, target: aimed && onTable(s, target) ? target : undefined });
      }
    }
  }
  return items;
}

function landItems(s: State): Item[] {
  if (s.landPlayed || s.lands.length >= MAX_LANDS) return [];
  return s.hand.map((uid): Item => {
    const c = defOf(s, uid).color;
    return { label: ui().asLand(landName(c), c), answer: { t: "land", uid }, src: uid };
  });
}

function kaelItems(s: State): Item[] {
  if (s.kaelUsed) return [];
  const items: Item[] = [];
  const add = (ab: number, target: number, label: string): void => {
    items.push({ label, answer: { t: "kael", ab, target }, src: "kael", target: target >= 0 ? target : undefined });
  };
  const t = ui();
  const charge = t.charge(ROMAN[s.kael], ROMAN[s.kael + 1]);
  if (s.kael < 4 && !s.mine.length) add(CHARGE, -1, charge);
  if (s.kael < 4) for (const p of s.mine) add(CHARGE, p.uid, t.chargeOn(charge, who(s, p.uid)));
  if (s.kael >= 3) for (const p of [...s.nem, ...s.mine]) add(DISCHARGE, p.uid, t.discharge(ROMAN[s.kael], ROMAN[s.kael - 2], who(s, p.uid)));
  if (s.kael === 4) add(ULTIMATE, -1, t.ultimate);
  return items;
}

function archivistItems(s: State): Item[] {
  const p = s.mine.find((m) => m.def.id === ARCHIVIST && !m.tapped && !m.sick);
  return p ? [{ label: ui().archivist, answer: { t: "archivist" }, src: p.uid }] : [];
}

function combatNote(s: State): string {
  return s.atk.map((u, i) => (s.blk[i] >= 0 ? ui().blocked(who(s, u), who(s, s.blk[i])) : ui().unblocked(who(s, u)))).join(" · ");
}

function endNote(s: State): string {
  const t = ui();
  switch (s.ctx.nemesis) {
    case "vorthrax":
      return s.phase === 1 ? t.smolder : t.inferno;
    case "vaskara":
      return s.nem.length <= 2 ? t.brood(s.nem.length, s.omen >= 0 ? nameOf(s, s.omen) : "") : t.noBrood;
    case "morwen": {
      const i = bestRuinCreature(s);
      return s.phase === 1 && ruinCreatures(s) >= 3 && s.nem.length < MAX_CREATURES && i >= 0 ? t.tithe(nameOf(s, s.ruin[i])) : t.quietEnd;
    }
    case "mirror-archmage":
      return s.hand.length >= (s.phase === 1 ? 3 : 2) ? t.mindTide(nameOf(s, s.hand[0])) : t.noMindTide;
  }
}

function windowText(s: State, w: Window): [string, string] {
  const t = ui();
  switch (w) {
    case "upkeep":
      return [t.upkeepTitle, t.upkeepNote];
    case "start":
      return [t.startTitle, t.startNote(s.omen >= 0 ? nameOf(s, s.omen) : "")];
    case "spell": {
      const text = getCard(defOf(s, s.pend).id)[getLocale()].text.replace(/<[^>]+>/g, "");
      return [t.spellTitle(nameOf(s, s.pend)), `${text}${s.pendTarget >= 0 ? t.target(who(s, s.pendTarget)) : ""}`];
    }
    case "pre":
      return [t.preTitle, t.preNote(nemAttackers(s).map((u) => who(s, u)))];
    case "blocks":
      return [t.blocksTitle, combatNote(s)];
    case "end":
      return [t.endTitle, endNote(s)];
  }
}

function fits(ask: Ask, answer: Answer): boolean {
  if (ask.kind === "menu") {
    const key = JSON.stringify(answer);
    return ask.items.some((i) => JSON.stringify(i.answer) === key);
  }
  if (!Array.isArray(answer)) return false;
  const chosen = answer.filter((u) => u !== -1);
  if (new Set(chosen).size !== chosen.length) return false;
  if (ask.kind === "pick") return answer.length >= ask.min && answer.length <= ask.max && answer.every((u) => ask.from.includes(u));
  return answer.length === ask.attackers.length && answer.every((u, i) => u === -1 || ask.options[i].includes(u));
}

export class ReplayAgent implements Agent {
  pos = 0;
  mark = 0;
  dropped = 0;
  base: State | null = null;
  private skipRound = -1;

  constructor(readonly decisions: Answer[]) {}

  private take(s: State, ask: Ask): Answer {
    if (this.pos < this.decisions.length) {
      const answer = this.decisions[this.pos];
      if (fits(ask, answer)) {
        this.pos++;
        this.mark = s.log?.length ?? 0;
        if (this.pos === this.decisions.length) this.base = clone(s);
        return answer;
      }
      this.dropped = this.decisions.length - this.pos;
      this.decisions.length = this.pos;
    }
    throw new Pending(ask);
  }

  private menu(s: State, title: string, note: string, items: Item[]): Answer {
    return this.take(s, { kind: "menu", title, note, items });
  }

  private pick(s: State, ask: Omit<Pick, "kind" | "quick"> & { quick?: Item[] }): number[] {
    return this.take(s, { kind: "pick", quick: [], ...ask }) as number[];
  }

  mulligan(s: State): boolean {
    const t = ui();
    return this.menu(s, t.openingTitle, t.openingNote, [{ label: t.keep, answer: false, primary: true }, { label: t.mulligan, answer: true }]) === true;
  }

  mulliganDiscard(s: State): number {
    const t = ui();
    return this.pick(s, { title: t.mulligan, note: t.mulliganNote, from: s.hand.slice(), min: 1, max: 1, ordered: false, tray: false, confirm: t.toGrave })[0];
  }

  main(s: State, step: 1 | 2): Action {
    const t = ui();
    const items = [...landItems(s), ...castItems(s, true), ...kaelItems(s), ...archivistItems(s)];
    if (!items.length) return PASS;
    items.push({ label: step === 1 ? t.toCombat : t.endTurn, answer: PASS, primary: true });
    return this.menu(s, t.mainTitle(step), t.mainNote(s.landPlayed, s.kaelUsed), items) as Action;
  }

  attack(s: State): number[] {
    const t = ui();
    const from = s.mine.filter((p) => canAttack(s, p)).map((p) => p.uid);
    if (!from.length) return [];
    return this.pick(s, { title: t.attackTitle, note: t.attackNote, from, min: 0, max: from.length, ordered: false, tray: false, confirm: t.attack, none: t.noAttack });
  }

  trick(s: State): Action {
    const t = ui();
    const items = [...castItems(s, false), ...archivistItems(s)];
    if (!items.length) return PASS;
    items.push({ label: t.dealDamage, answer: PASS, primary: true });
    return this.menu(s, t.tricksTitle, combatNote(s), items) as Action;
  }

  respond(s: State, w: Window): Action {
    if (s.active === 1 && s.round === this.skipRound) return PASS;
    const items = [...castItems(s, false), ...archivistItems(s)];
    if (!items.length) return PASS;
    items.push({ label: ui().pass, answer: PASS, primary: true });
    if (s.active === 1) items.push({ label: ui().passTurn, answer: "skip" });
    const [title, note] = windowText(s, w);
    const answer = this.menu(s, title, note, items);
    if (answer !== "skip") return answer as Action;
    this.skipRound = s.round;
    return PASS;
  }

  block(s: State): number[] {
    const options = s.atk.map((u) => {
      const a = findNem(s, u);
      return a ? s.mine.filter((b) => !b.tapped && canBlock(s, b, a)).map((b) => b.uid) : [];
    });
    if (options.every((o) => !o.length)) return s.atk.map(() => -1);
    return this.take(s, { kind: "blocks", title: ui().blockTitle, note: ui().blockNote, attackers: s.atk.slice(), options }) as number[];
  }

  scry(s: State, cards: number[]): number[] {
    const t = ui();
    return this.pick(s, {
      title: t.scryTitle(cards.length), note: t.scryNote, from: cards, min: 0, max: cards.length, ordered: true, tray: true, confirm: t.done, none: t.toBottom(cards.length), preset: cards,
    });
  }

  ghoul(s: State): number {
    const t = ui();
    return this.pick(s, { title: t.dies(cardName("hungry-ghoul")), note: t.ghoulNote, from: s.grave.slice(), min: 1, max: 1, ordered: false, tray: true, confirm: t.toHand })[0];
  }

  prayer(s: State, cards: number[]): number {
    const t = ui();
    return this.pick(s, {
      title: cardName("prayer-of-restoration"), note: t.prayerNote, from: cards, min: 0, max: 1, ordered: false, tray: true, confirm: t.takeIt, none: t.allToLibrary,
    })[0] ?? -1;
  }

  discard(s: State, n: number): number[] {
    const t = ui();
    return this.pick(s, { title: t.discardTitle, note: t.discardNote(s.hand.length, n), from: s.hand.slice(), min: n, max: n, ordered: false, tray: false, confirm: t.discard });
  }

  cryptLord(s: State, options: number[]): number {
    const t = ui();
    return this.pick(s, { title: t.enters(cardName("crypt-lord")), note: t.lordNote, from: options, min: 1, max: 1, ordered: false, tray: true, confirm: t.returnIt })[0];
  }

  hound(s: State): number {
    const t = ui();
    const from = [...s.nem, ...s.mine].map((p) => p.uid);
    return this.pick(s, { title: t.enters(cardName("cinder-hound")), note: t.houndNote, from, min: 1, max: 1, ordered: false, tray: false, confirm: t.houndConfirm })[0];
  }

  tideOrder(s: State, uids: number[]): number[] {
    if (uids.length === 1) return uids;
    const t = ui();
    return this.pick(s, { title: cardName("rising-tide"), note: t.tideNote, from: uids, min: uids.length, max: uids.length, ordered: true, tray: false, confirm: t.done });
  }
}
