export type Locale = "en" | "es";

export type CardType = "creature" | "sorcery" | "spell" | "artifact" | "enchantment";

export interface CardText {
  name: string;
  sub?: string;
  text: string;
  flavor?: string;
}

export interface PrintedCard {
  type: CardType;
  art?: string;
  en: CardText;
  es: CardText;
}

export interface Card extends PrintedCard {
  id: string;
  qty: number;
  pt?: string;
}

export interface DeckName {
  en: { name: string };
  es: { name: string };
}

export interface ReferenceSide {
  title: string;
  items: string[];
}

export interface Reference {
  en: [ReferenceSide, ReferenceSide, ReferenceSide, ReferenceSide];
  es: [ReferenceSide, ReferenceSide, ReferenceSide, ReferenceSide];
}
