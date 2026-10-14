import type { CardType, Locale } from "../content/types";

export interface Strings {
  typeLabel: Record<CardType, string>;
  threatPrefix: string;
  face: string;
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
    reference: "Referencia rápida",
    sheetTitle: "Palmwalker — Todas las cartas",
    halfGrimoire: "Medio grimorio",
    threatDeck: "Mazo de Amenaza",
    walker: "Caminante",
    lands: "Tierras (dorsos de las cartas del Grimorio)",
  },
};
