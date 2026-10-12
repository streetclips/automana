import type { CardType, Locale } from "../content/types";

export interface Strings {
  typeLabel: Record<CardType, string>;
  threatPrefix: string;
  face: string;
  phase1: string;
  phase2: string;
  heroicTag: string;
  heroic: string;
  flipTrigger: string;
  reference: string;
  sheetTitle: string;
  halfGrimoire: string;
  threatDeck: string;
  walker: string;
  lands: string;
}

export const STRINGS: Record<Locale, Strings> = {
  en: {
    typeLabel: { creature: "Creature", instant: "Instant", sorcery: "Sorcery", aura: "Aura", land: "Land", spell: "Spell" },
    threatPrefix: "Threat · ",
    face: "Face",
    phase1: "PHASE 1",
    phase2: "PHASE 2",
    heroicTag: "HEROIC",
    heroic: "<b>HEROIC</b> — Everything above, and Nemesis creatures get +1/+0.",
    flipTrigger: "When the Threat deck has <b>7 or fewer</b> face-down cards, flip this card.",
    reference: "Quick reference",
    sheetTitle: "Palmwalker — All cards",
    halfGrimoire: "Half-grimoire",
    threatDeck: "Threat deck",
    walker: "Walker",
    lands: "Lands (backs of the Grimoire cards)",
  },
  es: {
    typeLabel: { creature: "Criatura", instant: "Instantáneo", sorcery: "Conjuro", aura: "Aura", land: "Tierra", spell: "Hechizo" },
    threatPrefix: "Amenaza · ",
    face: "Cara",
    phase1: "FASE 1",
    phase2: "FASE 2",
    heroicTag: "HEROICO",
    heroic: "<b>HEROICO</b> — Todo lo anterior, y además las criaturas de la Némesis obtienen +1/+0.",
    flipTrigger: "Cuando al mazo de Amenaza le queden <b>7 o menos</b> cartas boca abajo, voltea esta carta.",
    reference: "Referencia rápida",
    sheetTitle: "Palmwalker — Todas las cartas",
    halfGrimoire: "Medio grimorio",
    threatDeck: "Mazo de Amenaza",
    walker: "Caminante",
    lands: "Tierras (dorsos de las cartas del Grimorio)",
  },
};
