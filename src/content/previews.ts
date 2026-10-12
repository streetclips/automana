import type { Card } from "./types";

export const EXPANSION_PREVIEWS: Card[] = [
  {
    id: "luminous-aegis", color: "W", cost: ["W"], type: "instant", qty: 2,
    art: { subject: { shape: "shield" }, scene: "dawn", tint: "#efe8d4", detail: "#d9a520" },
    en: { name: "Luminous Aegis", text: "Prevent all damage that would be dealt to a creature you control this turn.", flavor: "Light does not strike: it endures." },
    es: { name: "Égida Luminosa", text: "Previene todo el daño que se haría a una criatura tuya este turno.", flavor: "La luz no golpea: resiste." },
  },
  {
    id: "mist-hawk", color: "U", cost: ["1", "U"], type: "creature", qty: 1, pt: "2/1",
    art: { subject: { shape: "hawk" }, scene: "sea", tint: "#dce8f3", detail: "#1f3550" },
    en: { name: "Mist Hawk", sub: "Bird", text: "<b>Flying</b>", flavor: "It sees the storm before it is born." },
    es: { name: "Halcón de Bruma", sub: "Ave", text: "<b>Volar</b>", flavor: "Ve la tormenta antes de que nazca." },
  },
  {
    id: "lethal-whisper", color: "B", cost: ["B"], type: "instant", qty: 2,
    art: { subject: { shape: "skull" }, scene: "crypt", tint: "#efe6d6", detail: "#1a1022" },
    en: { name: "Lethal Whisper", text: "A Nemesis creature gets −2/−2 until end of turn.", flavor: "One word in the ear is enough." },
    es: { name: "Susurro Letal", text: "Una criatura de la Némesis obtiene −2/−2 hasta el final del turno.", flavor: "Basta una palabra al oído." },
  },
];
