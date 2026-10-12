import { findCardByName } from "../content";
import { renderCard, type CardSize } from "../render/card";
import { nemesisFace } from "../render/faces";
import { pips } from "../render/pips";
import type { BoardState, Overlay } from "./model";

type State = BoardState & Overlay;

const YOUR_STEPS = ["Enderezar", "Robar", "Principal", "Combate", "Final"];
const NEM_STEPS = ["Enderezar", "Presagio", "Revelar", "Ataque", "Final"];

function card(name: string, size: CardSize): string {
  return renderCard(findCardByName(name, "es"), size);
}

function slot(inner: string, key: string, st: State, label = "", low = false, lowText = "↓ bajada"): string {
  const cls = "slot" + (low ? " low" : "") + (st.hl.includes(key) ? " hl" : "");
  const raw = st.tags[key];
  let tag = "";
  if (raw !== undefined) {
    const [text, tone] = Array.isArray(raw) ? raw : [raw, ""];
    tag = `<div class="tagx ${tone}">${text}</div>`;
  }
  const lowLbl = low ? `<div class="lowlbl">${lowText}</div>` : "";
  return `<div class="${cls}"><div class="lbl">${label}</div>${inner}${tag}${lowLbl}</div>`;
}

function kaelPanel(st: State): string {
  const k = st.kael;
  const states = ["I", "II", "III", "IV"].map((r, i) => `<div class="s${i + 1 === k ? " on" : ""}">${r}</div>`).join("");
  const ab = `<div class="ok">Cargar (+1)</div><div class="${k >= 3 ? "ok" : ""}">Descargar (−2)</div><div class="${k === 4 ? "ok" : ""}">Definitiva (IV → I)</div>`;
  return `<div class="kael${st.hl.includes("kael") ? " hl" : ""}"><div class="kt">KAEL</div><div class="ks">Piromante Errante</div><div class="states">${states}</div><div class="ab">${ab}</div></div>`;
}

function lifeBox(st: State, key: string, cls: string, title: string, value: number, sub: string): string {
  const d = st.deltas[key];
  const delta = d ? `<div class="delta${d.startsWith("+") ? " up" : ""}">${d}</div>` : "";
  return `<div class="lbox ${cls}${st.hl.includes(key) ? " hl" : ""}">${delta}<div class="lt">${title}</div><div class="lv">${value}</div><div class="ls">${sub}</div></div>`;
}

export function boardHtml(st: State): string {
  const yourTurn = st.who === "you";
  const rnd = yourTurn ? (st.rnd ? `RONDA ${st.rnd} · TU TURNO` : "PREPARACIÓN") : `RONDA ${st.rnd} · TURNO DE VORTHRAX`;
  const pills = st.rnd ? (yourTurn ? YOUR_STEPS : NEM_STEPS).map((s) => `<div class="st${st.step === s ? " on" : ""}">${s}</div>`).join("") : "";
  const hdr = `<div class="hdr"><div class="rnd">${rnd}</div><div class="steps">${pills}</div><div class="ph${st.phase === 2 ? " p2" : ""}">FASE ${st.phase}</div></div>`;

  const backs = [0, 1, 2].map((i) => `<div class="bk" style="left:${i * 5}px; top:${20 - i * 5}px"></div>`).join("");
  const pile = `<div class="slot"><div class="lbl">MAZO DE AMENAZA</div><div class="pile${st.hl.includes("pile") ? " hl" : ""}">${backs}`
    + `<div class="cnt"><b>${st.vor}</b><span>BOCA ABAJO</span></div></div><div class="ruin">Ruina: ${st.ruin}</div></div>`;
  const omen = slot(st.omen ? card(st.omen, "vd") : '<div class="empty2">—</div>', "omen", st, "PRESAGIO");
  const vor = slot(nemesisFace(st.phase === 1 ? "A" : "B", "vd"), "vor", st, "LA NÉMESIS");
  const nem = st.nem.map((n) => slot(card(n.name, "vd"), "nem:" + n.name, st, n.label, n.low, n.lowText)).join("") || '<div class="empty2">sin criaturas</div>';
  const zoneNem = `<div class="zone nem"><div class="zrow">${pile}${omen}${vor}<div style="width:14px"></div>${nem}</div></div>`;

  const yours = st.yours.map((c) => slot(card(c.name, "vd"), "you:" + c.name, st, c.label, c.low, c.lowText)).join("") || '<div class="empty2">sin criaturas</div>';
  const strips = st.lands
    .map((l) => `<div class="lstrip ${l.k}${l.low ? " low" : ""}">${pips(l.k === "M" ? "{R}" : "{G}")}${l.k === "M" ? "Montaña" : "Bosque"}</div>`)
    .join("") || '<div style="font-style:italic; opacity:.5; font-size:18px">sin tierras</div>';
  const lands = `<div class="lands${st.hl.includes("lands") ? " hl" : ""}"><div class="lbl" style="font-family:Copperplate,serif;font-size:13px;color:#b9f0a8;letter-spacing:.1em">TIERRAS</div>${strips}</div>`;
  const zoneYou = `<div class="zone you"><div class="zrow" style="justify-content:space-between"><div class="zrow">${yours}</div>`
    + `<div class="zrow" style="gap:18px">${lands}${kaelPanel(st)}</div></div></div>`;

  const hand = st.hand.map((n) => slot(card(n, "hd"), "hand:" + n, st)).join("") || '<div class="empty2">mano vacía</div>';
  const hud = `<div class="hud"><div class="life">${lifeBox(st, "you_life", "you", "TÚ · VIDA", st.you, "cartas en tu biblioteca")}`
    + `${lifeBox(st, "vor_life", "vor", "VORTHRAX · VIDA", st.vor, "Amenazas boca abajo")}</div>`
    + `<div class="handbox"><div class="hl2">TU MANO</div><div class="handcards">${hand}</div></div>`
    + `<div class="misc"><div>Cementerio<b>${st.grave}</b></div><div>Ruina de Vorthrax<b>${st.ruin}</b></div></div></div>`;
  const banner = st.banner ? `<div class="banner"><span>${st.banner}</span></div>` : "";
  return hdr + zoneNem + zoneYou + hud + banner;
}
