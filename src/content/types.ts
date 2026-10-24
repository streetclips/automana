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

export interface RulebookBox {
  title: string;
  text: string;
}

export interface RulebookList {
  title: string;
  items: string[];
}

export interface RulebookExample {
  title: string;
  setup: string;
  steps: string[];
}

export interface NemesisProfile {
  plays: string;
  special?: RulebookBox;
  watch: string[];
}

export interface RulebookText {
  title: string;
  tagline: string;
  facts: string;
  welcome: { title: string; intro: string[]; need: RulebookList; contents: string };
  game: { title: string; intro: string; you: RulebookList; it: RulebookList; win: RulebookList; lose: RulebookList; run: RulebookBox };
  setup: { title: string; steps: string[]; row: RulebookBox; table: Record<"nemesis" | "you" | "library" | "graveyard" | "life" | "permanents" | "row" | "oldest" | "newest" | "hand" | "lands" | "creatures", string> };
  threats: { title: string; intro: string; parts: string[]; symbols: string; reference: RulebookBox };
  yourTurn: { title: string; intro: string; head: [string, string]; rows: [string, string][]; never: RulebookBox; attack: string };
  itsTurn: { title: string; intro: string; steps: RulebookBox[]; cast: RulebookList; empty: RulebookBox; example: RulebookBox };
  attacks: { title: string; intro: string; rules: string[]; abilities: string; key: RulebookBox; example: RulebookExample };
  blocks: { title: string; intro: string; lineUp: RulebookList; steps: RulebookBox[]; always: RulebookList; examples: string };
  examples: { title: string; safe: RulebookExample; order: RulebookExample; double: RulebookExample; desperation: RulebookExample };
  walkthrough: RulebookExample & { moral: string };
  targets: { title: string; rule: string; timing: string; example: RulebookExample; choices: RulebookList };
  glossary: { title: string; entries: [string, string][] };
  faq: { title: string; items: [string, string][] };
  nemeses: { title: string; intro: string; head: string[]; normal: string; hard: string; start: string };
  profile: { cards: string; starts: string; nothing: string; difficulty: string; watch: string; key: string };
  profiles: Record<string, NemesisProfile>;
  decks: { title: string; intro: string; starts: string };
  credits: { title: string; lines: string[]; legal: string };
  quick: { title: string; sections: RulebookList[] };
  diagram: Record<"you" | "life" | "damage" | "attacks" | "stays" | "target" | "skipped" | "hexproof", string>;
}
