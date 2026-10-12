export type Locale = "en" | "es";

export type Color = "R" | "G" | "W" | "U" | "B" | "T";

export type ManaSymbol = "R" | "G" | "W" | "U" | "B" | `${number}`;

export type CardType = "creature" | "instant" | "sorcery" | "aura" | "land" | "spell";

export interface CardText {
  name: string;
  sub?: string;
  text: string;
  flavor?: string;
}

export interface Card {
  id: string;
  color: Color;
  cost: ManaSymbol[];
  type: CardType;
  qty: number;
  pt?: string;
  threat?: boolean;
  emoji: string;
  en: CardText;
  es: CardText;
}
