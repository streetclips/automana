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

export interface HalfGrimoire {
  id: string;
  color: Exclude<Color, "T">;
  land: string;
  en: { name: string };
  es: { name: string };
  cards: Card[];
}

export interface NemesisText {
  name: string;
  phase1: string[];
  flip: string;
  phase2: string[];
}

export interface Nemesis {
  id: string;
  color: Exclude<Color, "T">;
  en: NemesisText;
  es: NemesisText;
  threats: Card[];
}

export interface WalkerText {
  name: string;
  charge: string;
  discharge: string;
  ultimate: string;
}

export interface Walker {
  en: WalkerText;
  es: WalkerText;
}

export interface ReferenceSide {
  title: string;
  items: string[];
}

export interface Reference {
  en: [ReferenceSide, ReferenceSide, ReferenceSide, ReferenceSide];
  es: [ReferenceSide, ReferenceSide, ReferenceSide, ReferenceSide];
}
