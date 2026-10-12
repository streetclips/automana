export type Locale = "en" | "es";

export type Color = "R" | "G" | "W" | "U" | "B" | "T";

export type ManaSymbol = "R" | "G" | "W" | "U" | "B" | `${number}`;

export type CardType = "creature" | "instant" | "sorcery" | "aura" | "land" | "spell";

export type ShapeId = "goblin" | "bear" | "bolt" | "sprout" | "shield" | "hawk" | "skull" | "demon" | "mountain" | "forest";

export type SceneId = "peaks" | "forest" | "storm" | "sun" | "dawn" | "sea" | "crypt" | "lava" | "sky";

export type Subject = { shape: ShapeId } | { emoji: string };

export interface CardArt {
  subject: Subject;
  scene: SceneId;
  tint?: string;
  detail?: string;
}

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
  art: CardArt;
  en: CardText;
  es: CardText;
}

export interface Palette {
  p: string;
  s: string;
  d: string;
  l: string;
  sky1: string;
  sky2: string;
}
