import type { CardType, Locale } from "../content/types";

export interface Strings {
  typeLabel: Record<CardType, string>;
  threatPrefix: string;
  face: string;
  reference: string;
  sheetTitle: string;
  threatDeck: string;
  backs: string;
}

export const STRINGS: Record<Locale, Strings> = {
  en: {
    typeLabel: { creature: "Creature", sorcery: "Sorcery", spell: "Spell", artifact: "Artifact", enchantment: "Enchantment" },
    threatPrefix: "Threat · ",
    face: "Face",
    reference: "Quick reference",
    sheetTitle: "Palmwalker — All cards",
    threatDeck: "Threat deck",
    backs: "Card backs",
  },
  es: {
    typeLabel: { creature: "Criatura", sorcery: "Conjuro", spell: "Hechizo", artifact: "Artefacto", enchantment: "Encantamiento" },
    threatPrefix: "Amenaza · ",
    face: "Cara",
    reference: "Referencia rápida",
    sheetTitle: "Palmwalker — Todas las cartas",
    threatDeck: "Mazo de Amenaza",
    backs: "Dorsos",
  },
};
