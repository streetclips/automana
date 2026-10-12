import type { CardType, Locale } from "../content/types";

export interface Strings {
  typeLabel: Record<CardType, string>;
  threatPrefix: string;
  walkerName: string;
  face: string;
  charge: string;
  discharge: string;
  ultimate: string;
  nemName: string;
  phase1: string;
  phase2: string;
  heroicTag: string;
  nemA: string;
  nemB: string;
  heroic: string;
  omen: string;
  noCreatures: string;
  you: string;
  hand: string;
  omenLabel: string;
  lowered: string;
  why: string;
}

export const STRINGS: Record<Locale, Strings> = {
  en: {
    typeLabel: { creature: "Creature", instant: "Instant", sorcery: "Sorcery", aura: "Aura", land: "Land", spell: "Spell" },
    threatPrefix: "Threat · ",
    walkerName: "Kael, Wandering Pyromancer",
    face: "Face",
    charge: "<b>CHARGE</b> (+1 state): a creature you control gets +1/+0 until end of turn.",
    discharge: "<b>DISCHARGE</b> (−2 states): Kael deals 2 damage to a creature.",
    ultimate: "<b>ULTIMATE</b> (go to I): Kael deals 3 damage to the Nemesis. Your creatures get +1/+0 until end of turn.",
    nemName: "Vorthrax, the Ash Tyrant",
    phase1: "PHASE 1",
    phase2: "PHASE 2",
    heroicTag: "HEROIC",
    nemA:
      "<p><b>ASH HIDE</b> — Prevent the first 2 damage dealt to Vorthrax each turn.</p>" +
      "<p><b>SMOLDER</b> — At the end of each Nemesis turn, Vorthrax deals 1 damage to you.</p>" +
      "<p class='trig'>When the Threat deck has <b>7 or fewer</b> face-down cards, flip Vorthrax. " +
      "<b>REKINDLE</b>: return the 3 rearmost Ruin cards face-down to the bottom.</p>",
    nemB:
      "<p><b>INFERNO</b> — Nemesis creatures have <b>Haste</b>.</p>" +
      "<p>At the end of each Nemesis turn, Vorthrax deals 2 damage to you.</p>" +
      "<p class='trig'>Ash Hide is gone. Defeat Vorthrax by emptying its face-down Threat cards.</p>",
    heroic: "<p><b>HEROIC</b> — Everything above, and Nemesis creatures get +1/+0.</p>",
    omen: "OMEN",
    noCreatures: "no creatures",
    you: "You",
    hand: "Hand",
    omenLabel: "Omen:",
    lowered: "↓ lowered",
    why: "Why?",
  },
  es: {
    typeLabel: { creature: "Criatura", instant: "Instantáneo", sorcery: "Conjuro", aura: "Aura", land: "Tierra", spell: "Hechizo" },
    threatPrefix: "Amenaza · ",
    walkerName: "Kael, Piromante Errante",
    face: "Cara",
    charge: "<b>CARGAR</b> (+1 estado): una criatura tuya obtiene +1/+0 hasta el final del turno.",
    discharge: "<b>DESCARGAR</b> (−2 estados): Kael hace 2 de daño a una criatura.",
    ultimate: "<b>DEFINITIVA</b> (vuelve a I): Kael hace 3 de daño a la Némesis. Tus criaturas obtienen +1/+0 hasta el final del turno.",
    nemName: "Vorthrax, el Tirano de Ceniza",
    phase1: "FASE 1",
    phase2: "FASE 2",
    heroicTag: "HEROICO",
    nemA:
      "<p><b>PIEL DE CENIZA</b> — Previene los primeros 2 puntos de daño que recibe Vorthrax cada turno.</p>" +
      "<p><b>RESCOLDO</b> — Al final de cada turno de la Némesis, Vorthrax te hace 1 de daño.</p>" +
      "<p class='trig'>Cuando al mazo de Amenaza le queden <b>7 o menos</b> cartas boca abajo, voltea a Vorthrax. " +
      "<b>REAVIVAR</b>: devuelve boca abajo al fondo las 3 últimas cartas de la Ruina.</p>",
    nemB:
      "<p><b>INFIERNO</b> — Las criaturas de la Némesis tienen <b>Prisa</b>.</p>" +
      "<p>Al final de cada turno de la Némesis, Vorthrax te hace 2 de daño.</p>" +
      "<p class='trig'>La Piel de Ceniza desaparece. Derrota a Vorthrax vaciando sus cartas de Amenaza boca abajo.</p>",
    heroic: "<p><b>HEROICO</b> — Todo lo anterior, y además las criaturas de la Némesis obtienen +1/+0.</p>",
    omen: "PRESAGIO",
    noCreatures: "sin criaturas",
    you: "Tú",
    hand: "Mano",
    omenLabel: "Presagio:",
    lowered: "↓ bajada",
    why: "¿Por qué?",
  },
};
