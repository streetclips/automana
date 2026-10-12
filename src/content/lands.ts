import type { Card } from "./types";

export const LANDS: Card[] = [
  {
    id: "mountain", color: "R", cost: ["R"], type: "land", qty: 0,
    emoji: "⛰️",
    en: { name: "Mountain", text: "{T}: Add {R}.", flavor: "Back of every Emberkin card." },
    es: { name: "Montaña", text: "{T}: Añade {R}.", flavor: "Dorso de todas las cartas de Clan Ascua." },
  },
  {
    id: "forest", color: "G", cost: ["G"], type: "land", qty: 0,
    emoji: "🌲",
    en: { name: "Forest", text: "{T}: Add {G}.", flavor: "Back of every Wildwood card." },
    es: { name: "Bosque", text: "{T}: Añade {G}.", flavor: "Dorso de todas las cartas de Monteverde." },
  },
];
