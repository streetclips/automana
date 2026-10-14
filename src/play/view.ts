import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "../content/types";
import { getLocale } from "../i18n/locale";
import { SRC, artPath, readCss } from "../lib/paths";
import { artCss } from "../render/art";
import { renderCard, renderGrimoireBack, renderThreatBack } from "../render/card";
import { pips } from "../render/pips";
import { DEATHTOUCH, DEFENDER, FLYING, HASTE, LIFELINK, NEMESIS_LIST, PAIRS, REACH, TRAMPLE, VIGILANCE } from "../sim/engine/defs";
import { findMine, findNem, kills, kwOf, manaLeft, pw, tg } from "../sim/engine/engine";
import { HAND_LIMIT, type Perm, ROUND_MANA, type State, defOf, isPlayerCard } from "../sim/engine/state";
import { type Ask, type Item, nameOf, stats } from "./agent";
import type { GameSpec, Snapshot } from "./game";
import { type Move, moves, zoneOf } from "./motion";
import { say, ui } from "./strings";

export const LOCALES: Locale[] = ["en", "es"];

const KEYWORDS = [FLYING, REACH, TRAMPLE, HASTE, DEFENDER, VIGILANCE, LIFELINK, DEATHTOUCH];

const LINE = /^R(\d+) (You|Nemesis): (.*)$/;

const EMPTY = `<div class="pw-card empty"></div>`;

interface SlotOptions {
  cls?: string[];
  uid?: number;
  key?: number | string;
  data?: Record<string, string | number>;
  pick?: boolean;
  menu?: Item[];
  badges?: string;
  tags?: string[];
  label?: string;
  title?: string;
  tucks?: string[];
}

export interface AnimationFrame {
  at: number;
  nemesis: boolean;
  head: string;
  table: string;
  moves: Move[];
}

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function artUrl(cardId: string): string {
  return `/art/${cardId}.jpg?v=${statSync(artPath(cardId)).mtimeMs}`;
}

function card(s: State, uid: number): string {
  return renderCard(defOf(s, uid).id);
}

function button(item: Item): string {
  const target = item.target !== undefined ? ` data-target="${item.target}"` : "";
  return `<button data-answer="${esc(JSON.stringify(item.answer))}"${target}${item.primary ? " data-primary" : ""}>${pips(esc(item.label))}</button>`;
}

function attrs(data: Record<string, string | number>): string {
  return Object.entries(data).map(([k, v]) => ` data-${k}="${v}"`).join("");
}

function plain(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function slot(inner: string, o: SlotOptions = {}): string {
  const cls = ["slot", ...(o.cls ?? []), o.menu?.length ? "has-menu" : ""].filter(Boolean).join(" ");
  const data = attrs({
    ...(o.uid !== undefined ? { uid: o.uid } : {}),
    ...(o.key !== undefined ? { key: o.key } : {}),
    ...(o.pick ? { pick: o.uid ?? "" } : {}),
    ...(o.title ? { title: esc(plain(o.title)) } : {}),
    ...o.data,
  });
  const tucks = o.tucks?.length ? `<div class="tucks" style="--count:${o.tucks.length}">${o.tucks.join("")}</div>` : "";
  const tags = o.tags?.length ? `<div class="tags">${o.tags.map((t) => `<span>${pips(esc(t))}</span>`).join("")}</div>` : "";
  const label = o.label ? `<div class="label">${o.label}</div>` : "";
  const menu = o.menu?.length ? `<div class="menu">${o.menu.map(button).join("")}</div>` : "";
  return `<div class="${cls}"${data}>${tucks}${inner}${o.badges ?? ""}${tags}${label}${menu}</div>`;
}

function tuck(uid: number, i: number, face: string, title: string): string {
  return `<div class="tuck" data-key="${uid}" data-title="${esc(plain(title))}" style="--i:${i}">${face}</div>`;
}

function menuFor(ask: Ask | null, src: number): Item[] {
  return ask?.kind === "menu" ? ask.items.filter((i) => i.src === src) : [];
}

function pickable(ask: Ask | null, uid: number): boolean {
  return ask?.kind === "pick" && !ask.tray && ask.from.includes(uid);
}

function depth(n: number): string {
  const layers = Math.min(8, Math.ceil(n / 3));
  if (!layers) return "";
  const edges = Array.from({ length: layers }, (_, i) => `${(i + 1) * 1.5}px ${(i + 1) * 1.5}px 0 ${i % 2 ? "#3a2d22" : "#e6dcc8"}`).join(", ");
  return `<div class="depth" style="box-shadow: ${edges}"></div>`;
}

function pileList(s: State, title: string, uids: number[]): string {
  return `<div class="pile-list"><h3>${ui().pileHeading(title, uids.length)}</h3>${uids.slice().reverse().map((u) => card(s, u)).join("")}</div>`;
}

function creature(s: State, p: Perm, ask: Ask | null, split: boolean): string {
  const t = ui();
  const mine = s.mine.includes(p);
  const cls = ["item", "creature", mine ? "mine" : "nem", split ? "split" : ""];
  const k = kwOf(p);
  const power = pw(p);
  const tough = tg(p);
  const changed = power !== p.def.power || tough !== p.def.toughness;
  const tags = [...(changed ? [`${power}/${tough}`] : []), ...KEYWORDS.flatMap((bit, i) => (k & bit ? [t.keywords[i]] : []))];
  const badges: string[] = [];
  if (p.sick && !(k & HASTE) && s.active === (mine ? 0 : 1)) {
    tags.push(t.sick);
    badges.push(`<span class="sick">Zz</span>`);
  }
  if (p.tapped) {
    cls.push("lowered");
    tags.push(t.lowered);
  }
  if (p.frozen) {
    cls.push("frozen");
    tags.push(t.frozen);
  }
  if (p.pacified) tags.push(t.pacified);
  if (p.shield) tags.push(t.shielded);
  for (const a of p.auras) tags.push(`+ ${nameOf(s, a)}`);
  const i = s.atk.indexOf(p.uid);
  if (i >= 0) {
    cls.push("attacking");
    tags.push(s.blk[i] >= 0 ? t.attackingBlocked(nameOf(s, s.blk[i])) : t.attacking);
    badges.push(`<span class="atk">${i + 1}</span>`);
  }
  const j = s.blk.indexOf(p.uid);
  if (j >= 0) {
    cls.push("blocking");
    tags.push(t.blocking(nameOf(s, s.atk[j])));
    badges.push(`<span class="blk">${j + 1}</span>`);
  }
  if (p.damage) {
    tags.push(t.damage(p.damage));
    badges.push(`<span class="dmg">${p.damage}</span>`);
  }
  if (s.pend >= 0 && s.pendTarget === p.uid) cls.push("targeted");
  const shift = power - p.def.power + tough - p.def.toughness;
  const pt = changed ? `<span class="pt${shift > 0 ? " up" : shift < 0 ? " down" : ""}">${power}/${tough}</span>` : "";
  return slot(card(s, p.uid), {
    cls, uid: p.uid, key: p.uid, data: { damage: p.damage, pt: `${power}/${tough}` }, pick: pickable(ask, p.uid), menu: menuFor(ask, p.uid),
    badges: `<div class="badges">${badges.join("")}</div>${pt}`, tags, tucks: p.auras.map((a, n) => tuck(a, n, card(s, a), nameOf(s, a))),
  });
}

function effects(s: State): string[] {
  const t = ui();
  const out: string[] = [];
  if (s.round === 0) return out;
  if (s.counters.length) out.push(t.counterNow(s.counters.length));
  return out;
}

function threatDeck(s: State): string {
  const t = ui();
  const last = s.ruin[s.ruin.length - 1];
  const ruinTitle = esc(`${t.ruin} · ${s.ruin.length}`);
  const ruin = last === undefined ? ""
    : `<details class="slot item pack ruin" data-anchor="ruin" data-title="${ruinTitle}"><summary><div class="pile-top" data-key="${last}">${card(s, last)}</div>`
      + `<span class="pill">${s.ruin.length}</span></summary>${pileList(s, t.ruin, s.ruin)}</details>`;
  const n = s.faceDown.length;
  const deck = `<div class="slot item pack threat" data-anchor="threat counter" data-counter="nemesis" data-count="${n}" data-title="${esc(plain(t.threatDeck(n)))}">`
    + `${renderThreatBack()}<span class="num">${n}</span></div>`;
  const omen = s.omen >= 0 ? slot(card(s, s.omen), { cls: ["item", "omen"], key: s.omen, title: t.omen }) : `<div class="slot item omen">${EMPTY}</div>`;
  return ruin + deck + omen;
}

function held(s: State): string {
  const t = ui();
  const out: string[] = [];
  for (let uid = 0; uid < s.ctx.defs.length; uid++) {
    if (zoneOf(s, uid) !== "stack") continue;
    const nemesis = !isPlayerCard(s, uid);
    out.push(slot(card(s, uid), { cls: ["held-card", nemesis && s.pendTarget >= 0 ? "targeted" : ""], key: uid, label: nemesis ? t.resolving : t.casting }));
  }
  return out.length ? `<div class="held">${out.join("")}</div>` : "";
}

function status(s: State): string {
  const t = ui();
  const nemesis = NEMESIS_LIST.find((n) => n.id === s.ctx.nemesis)!;
  const ruinCreatures = s.ruin.filter((u) => defOf(s, u).kind === "creature").length;
  const nem = [
    `<b>${nemesis[getLocale()].name.split(",")[0]}</b>`,
    t.life(s.faceDown.length),
    s.omen >= 0 ? t.omenIs(nameOf(s, s.omen)) : "",
    `${t.ruin} · <b>${s.ruin.length}</b>${ruinCreatures ? ` · ${t.creatures(ruinCreatures)}` : ""}`,
    ...effects(s).map((e) => `<span class="chip">${pips(esc(e))}</span>`),
  ];
  const you = [`<b>${t.you}</b> · ${t.life(s.library.length)}`, t.mana(manaLeft(s), ROUND_MANA)];
  const side = (cls: string, lines: string[]) => `<div class="${cls}">${lines.filter(Boolean).map((l) => `<p>${l}</p>`).join("")}</div>`;
  return `<div class="status">${side("nem-side", nem)}${side("you-side", you)}</div>`;
}

function tableHold(s: State, ask: Ask | null): string {
  const t = ui();
  const fan = [
    threatDeck(s),
    ...s.nem.map((p) => creature(s, p, ask, false)),
    ...s.counters.map((uid) => slot(card(s, uid), { cls: ["item", "nem", "sideways"], key: uid, title: t.counterNow(1) })),
    ...s.mine.map((p, i) => creature(s, p, ask, i === 0)),
  ];
  return `<section class="hold table-hold"><h3>${t.leftHand} <span>${t.leftHow}</span></h3>`
    + `<div class="hold-row"><div class="fan table-fan">${fan.join("")}</div>${held(s)}${status(s)}</div></section>`;
}

function grimoireHold(s: State, ask: Ask | null): string {
  const t = ui();
  const cards = s.hand.map((uid) => slot(card(s, uid), { cls: ["item"], uid, key: uid, pick: pickable(ask, uid), menu: menuFor(ask, uid) })).join("");
  const order = s.ctx.nemesis === "mirror-archmage" ? t.leftmost : "";
  const hand = `<div class="zone hand-zone"><div class="fan hand-fan" style="--n:${Math.max(s.hand.length, 2)}">${cards || `<span class="none">${t.emptyHand}</span>`}</div>`
    + `<p class="label">${t.hand(s.hand.length)}${s.hand.length > HAND_LIMIT ? t.limit(HAND_LIMIT) : ""}${order}</p></div>`;
  const top = s.library[0];
  const known = top !== undefined && s.known[top] ? ` · ${t.top(nameOf(s, top))}` : "";
  const library = slot(`${depth(s.library.length)}${top === undefined ? EMPTY : renderGrimoireBack()}<span class="num">${s.library.length}</span>`, {
    cls: ["pack"], key: top, data: { anchor: "library", counter: "life", count: s.library.length }, title: t.library(s.library.length),
  });
  const last = s.grave[s.grave.length - 1];
  const graveTitle = esc(`${t.graveyard} · ${s.grave.length}`);
  const grave = last === undefined ? `<div class="slot pack" data-anchor="grave" data-title="${graveTitle}">${EMPTY}</div>`
    : `<details class="slot pack" data-anchor="grave" data-title="${graveTitle}"><summary>${depth(s.grave.length)}<div class="pile-top" data-key="${last}">${card(s, last)}</div>`
      + `<span class="num">${s.grave.length}</span></summary>${pileList(s, t.graveyard, s.grave)}</details>`;
  return `<section class="hold grimoire-hold"><h3>${t.rightHand} <span>${t.rightHow}</span></h3><div class="packet">${hand}`
    + `<span class="chev">›</span><div class="zone">${library}<p class="label">${t.library(s.library.length)}${known}</p></div>`
    + `<span class="chev">›</span><div class="zone">${grave}<p class="label">${t.graveyard} · <b>${s.grave.length}</b></p></div></div></section>`;
}

function outcome(blocker: Perm, attacker: Perm): string {
  const t = ui();
  const kill = kills(blocker, attacker);
  const die = kills(attacker, blocker);
  return kill ? (die ? t.trade : t.killsIt) : die ? t.diesBlocking : t.bothSurvive;
}

function ending(s: State): string {
  const t = ui();
  if (s.over === 1) return t.victory(s.round, s.library.length);
  if (s.over === 2) return t.defeat(s.round, s.faceDown.length);
  return t.draw(s.round);
}

function prompt(snap: Snapshot): string {
  const t = ui();
  const { s, ask } = snap;
  const notice = snap.dropped ? `<p class="notice">${t.dropped(snap.dropped)}</p>` : "";
  if (!ask) {
    return `<section class="prompt">${notice}<h2>${ending(s)}</h2><div class="buttons"><button data-cmd="undo">${t.undoLast}</button>`
      + `<button data-cmd="restart">${t.replay}</button><button data-cmd="new" data-primary>${t.newGame}</button></div></section>`;
  }
  const head = `${notice}<h2>${esc(ask.title)}</h2>${ask.note ? `<p>${pips(esc(ask.note))}</p>` : ""}`;
  if (ask.kind === "menu") {
    const free = ask.items.filter((i) => i.src === undefined);
    const main = ask.title === t.mainTitle(1) || ask.title === t.mainTitle(2);
    const hint = free.length < ask.items.length && !main ? `<p class="hint">${t.respondHint}</p>` : "";
    return `<section class="prompt">${head}${hint}<div class="buttons">${free.map(button).join("")}</div></section>`;
  }
  if (ask.kind === "pick") {
    const tray = ask.tray ? `<div class="tray">${ask.from.map((u) => slot(card(s, u), { uid: u, pick: true })).join("")}</div>` : "";
    return `<section class="prompt">${head}${tray}<div class="buttons">${ask.quick.map(button).join("")}<button data-confirm data-primary>${esc(ask.none ?? ask.confirm)}</button><span class="count"></span></div></section>`;
  }
  const rows = ask.attackers.map((u, i) => {
    const a = findNem(s, u)!;
    const options = ask.options[i].map((b) => {
      const p = findMine(s, b)!;
      return `<label><input type="radio" name="block${i}" value="${b}"> ${esc(stats(p))} <i>${outcome(p, a)}</i></label>`;
    });
    return `<div class="block-row"><b>${esc(stats(a))}</b><label><input type="radio" name="block${i}" value="-1" checked> ${t.noBlock}</label>${options.join("")}</div>`;
  });
  return `<section class="prompt">${head}<div class="blocks">${rows.join("")}</div><div class="buttons"><button data-blocks data-primary>${t.confirmBlocks}</button></div></section>`;
}

function turnOf(round: string, side: string): string {
  return round === "0" ? ui().setup : ui().turn(Number(round), side === "Nemesis");
}

function caption(line: string): string {
  const [, round, side, text] = LINE.exec(line)!;
  return `<section class="prompt caption"><p class="head">${turnOf(round, side)}</p><h2>${esc(say(text, side === "Nemesis"))}</h2>`
    + `<div class="buttons"><button data-skip>${ui().skip}</button><span class="hint">${ui().orClick}</span></div></section>`;
}

function log(s: State, mark: number): string {
  const out: string[] = [];
  let turn = "";
  (s.log ?? []).forEach((line, i) => {
    const m = LINE.exec(line);
    if (!m || m[3].startsWith("hand [")) return;
    const head = turnOf(m[1], m[2]);
    if (head !== turn) out.push(`<li class="turn" data-at="${i}">${(turn = head)}</li>`);
    out.push(`<li data-at="${i}"${i >= mark ? ' class="new"' : ""}>${esc(say(m[3], m[2] === "Nemesis"))}</li>`);
  });
  return out.join("");
}

function frames(snap: Snapshot): { frames: AnimationFrame[]; moves: Move[] } {
  let prev = snap.base;
  if (!prev) return { frames: [], moves: [] };
  const out: AnimationFrame[] = [];
  for (const f of snap.frames) {
    const line = snap.s.log?.[f.at] ?? "";
    const m = LINE.exec(line);
    if (!m || m[3].startsWith("hand [")) continue;
    out.push({ at: f.at, nemesis: m[2] === "Nemesis", head: turnOf(m[1], m[2]), table: tableHold(f.s, null) + caption(line) + grimoireHold(f.s, null), moves: moves(prev, f.s) });
    prev = f.s;
  }
  return { frames: out, moves: moves(prev, snap.s) };
}

export function renderGame(spec: GameSpec, snap: Snapshot, animate: boolean): { title: string; turn: string; table: string; log: string; frames: AnimationFrame[]; moves: Move[] } {
  const t = ui();
  const locale = getLocale();
  const { s, ask } = snap;
  const pair = PAIRS.find((p) => p.key === spec.pair)!;
  const nemesis = NEMESIS_LIST.find((n) => n.id === spec.nemesis)!;
  return {
    title: t.title(`${pair.halves[0][locale].name} + ${pair.halves[1][locale].name}`, nemesis[locale].name, spec.seed),
    turn: s.over ? t.gameOver : s.round === 0 ? t.setup : turnOf(String(s.round), s.active ? "Nemesis" : "You"),
    table: tableHold(s, ask) + prompt(snap) + grimoireHold(s, ask),
    log: log(s, snap.mark),
    ...(animate ? frames(snap) : { frames: [], moves: [] }),
  };
}

export function renderShell(): string {
  const t = ui();
  const locale = getLocale();
  const pairs = PAIRS.map((p) => `<option value="${p.key}"${p.key === "R/G" ? " selected" : ""}>${p.key} · ${p.halves[0][locale].name} + ${p.halves[1][locale].name}</option>`).join("");
  const nemeses = NEMESIS_LIST.map((n) => `<option value="${n.id}">${n[locale].name}</option>`).join("");
  const langs = LOCALES.map((l) => `<a href="/${l}"${l === locale ? ' class="on"' : ""}>${l.toUpperCase()}</a>`).join("");
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${t.page}</title><link rel="icon" href="data:,">
<style>${readCss("render/card.css", "render/faces.css", "play/play.css")}\n${artCss(artUrl)}</style></head>
<body><header><b>Palmwalker</b><span id="title"></span><nav><span class="langs">${langs}</span><button data-cmd="speed" id="speed" title="${t.speedTip}"></button>`
    + `<button data-cmd="undo" title="${t.undoTip}">${t.undo}</button><button data-cmd="restart">${t.restart}</button><button data-cmd="new">${t.newGame}</button></nav></header>
<div class="layout"><main id="table"></main><aside><div id="zoom"></div><ol id="log"></ol></aside></div>
<dialog id="setup"><form method="dialog"><h2>${t.newGame}</h2>
<label>${t.grimoire}<select name="pair">${pairs}</select></label>
<label>${t.nemesisLabel}<select name="nemesis">${nemeses}</select></label>
<label>${t.seed}<input name="seed" inputmode="numeric" placeholder="${t.random}"></label>
<div class="buttons"><button value="cancel">${t.cancel}</button><button value="start" class="go">${t.start}</button></div></form></dialog>
<script>const UI = ${JSON.stringify(t.client)};\n${readFileSync(join(SRC, "play/client.js"), "utf8")}</script></body></html>`;
}
