export type Locale = "en" | "es";

export type Color = "R" | "G" | "W" | "U" | "B" | "T";

export type CardType = "creature" | "instant" | "sorcery" | "aura" | "spell";

export interface CardText {
  name: string;
  sub?: string;
  text: string;
  flavor?: string;
}

export interface Card {
  id: string;
  color: Color;
  cost?: number;
  type: CardType;
  qty: number;
  pt?: string;
  threat?: boolean;
  art: string;
  en: CardText;
  es: CardText;
}

export interface HalfGrimoire {
  id: string;
  color: Exclude<Color, "T">;
  en: { name: string };
  es: { name: string };
  cards: Card[];
}

export interface Nemesis {
  id: string;
  color: Exclude<Color, "T">;
  en: { name: string };
  es: { name: string };
  threats: Card[];
}

export interface ReferenceSide {
  title: string;
  items: string[];
}

export interface Reference {
  en: [ReferenceSide, ReferenceSide, ReferenceSide, ReferenceSide];
  es: [ReferenceSide, ReferenceSide, ReferenceSide, ReferenceSide];
}
