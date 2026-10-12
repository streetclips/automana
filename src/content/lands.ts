import type { Card } from "./types";

export const LANDS: Card[] = [
  {
    id: "mountain", color: "R", cost: ["R"], type: "land", qty: 0,
    art: { subject: { shape: "mountain" }, scene: "sky", tint: "#8a6a55", detail: "#ffffff" },
    en: { name: "Mountain", text: "{T}: Add {R}.", flavor: "Back of every Emberkin card." },
    es: { name: "Montaña", text: "{T}: Añade {R}.", flavor: "Dorso de todas las cartas de Clan Ascua." },
  },
  {
    id: "forest", color: "G", cost: ["G"], type: "land", qty: 0,
    art: { subject: { shape: "forest" }, scene: "sun", tint: "#2f6b33", detail: "#1b3d1e" },
    en: { name: "Forest", text: "{T}: Add {G}.", flavor: "Back of every Wildwood card." },
    es: { name: "Bosque", text: "{T}: Añade {G}.", flavor: "Dorso de todas las cartas de Monteverde." },
  },
];
