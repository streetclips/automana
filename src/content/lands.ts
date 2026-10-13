import type { Card } from "./types";

export const LANDS: Card[] = [
  {
    id: "plains", color: "W", cost: ["W"], type: "land", qty: 0,
    art: "wide golden plains under a bright sunlit sky",
    en: { name: "Plains", text: "{T}: Add {W}.", flavor: "Back of every Dawnward Order card." },
    es: { name: "Llanura", text: "{T}: Añade {W}.", flavor: "Dorso de todas las cartas de Orden del Alba." },
  },
  {
    id: "island", color: "U", cost: ["U"], type: "land", qty: 0,
    art: "a rocky island rising from a calm blue sea",
    en: { name: "Island", text: "{T}: Add {U}.", flavor: "Back of every Arcane Tide card." },
    es: { name: "Isla", text: "{T}: Añade {U}.", flavor: "Dorso de todas las cartas de Marea Arcana." },
  },
  {
    id: "swamp", color: "B", cost: ["B"], type: "land", qty: 0,
    art: "a dark swamp with dead trees and murky water under a purple dusk",
    en: { name: "Swamp", text: "{T}: Add {B}.", flavor: "Back of every Grim Pact card." },
    es: { name: "Pantano", text: "{T}: Añade {B}.", flavor: "Dorso de todas las cartas de Pacto Sombrío." },
  },
  {
    id: "mountain", color: "R", cost: ["R"], type: "land", qty: 0,
    art: "jagged mountains glowing red and orange at sunset",
    en: { name: "Mountain", text: "{T}: Add {R}.", flavor: "Back of every Emberkin card." },
    es: { name: "Montaña", text: "{T}: Añade {R}.", flavor: "Dorso de todas las cartas de Clan Ascua." },
  },
  {
    id: "forest", color: "G", cost: ["G"], type: "land", qty: 0,
    art: "a deep green forest of ancient towering trees",
    en: { name: "Forest", text: "{T}: Add {G}.", flavor: "Back of every Wildwood card." },
    es: { name: "Bosque", text: "{T}: Añade {G}.", flavor: "Dorso de todas las cartas de Monteverde." },
  },
];
