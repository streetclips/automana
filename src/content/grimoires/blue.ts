import type { HalfGrimoire } from "../types";

export const ARCANE_TIDE: HalfGrimoire = {
  id: "arcane-tide", color: "U", land: "island",
  en: { name: "Arcane Tide" },
  es: { name: "Marea Arcana" },
  cards: [
    {
      id: "tide-apprentice", color: "U", cost: ["U"], type: "creature", qty: 2, pt: "1/1",
      emoji: "🧑‍🎓",
      en: { name: "Tide Apprentice", sub: "Human Wizard", text: "When Tide Apprentice enters, <b>Scry</b> 2.", flavor: "First lesson: the sea always answers." },
      es: { name: "Aprendiz de las Mareas", sub: "Hechicero humano", text: "Cuando el Aprendiz de las Mareas entra, <b>Adivinar</b> 2.", flavor: "Primera lección: el mar siempre responde." },
    },
    {
      id: "bend-fate", color: "U", cost: ["U"], type: "instant", qty: 2,
      emoji: "🌀",
      en: { name: "Bend Fate", text: "You may put the Omen face-down at the bottom of the Threat deck; if you do, reveal a new Omen. <b>Scry</b> 1." },
      es: { name: "Desviar el Destino", text: "Puedes poner el Presagio boca abajo en el fondo del mazo de Amenaza; si lo haces, revela un nuevo Presagio. <b>Adivinar</b> 1." },
    },
    {
      id: "mist-hawk", color: "U", cost: ["1", "U"], type: "creature", qty: 1, pt: "2/1",
      emoji: "🦅",
      en: { name: "Mist Hawk", sub: "Bird", text: "<b>Flying</b>", flavor: "It sees the storm before it is born." },
      es: { name: "Halcón de Bruma", sub: "Ave", text: "<b>Volar</b>", flavor: "Ve la tormenta antes de que nazca." },
    },
    {
      id: "deep-freeze", color: "U", cost: ["1", "U"], type: "instant", qty: 1,
      emoji: "🧊",
      en: { name: "Deep Freeze", text: "<b>Freeze</b> a Nemesis creature.", flavor: "Even rage forgets how to move." },
      es: { name: "Congelar", text: "<b>Congela</b> una criatura de la Némesis.", flavor: "Hasta la furia olvida cómo moverse." },
    },
    {
      id: "return-to-the-tide", color: "U", cost: ["1", "U"], type: "instant", qty: 1,
      emoji: "🌊",
      en: { name: "Return to the Tide", text: "Put a Nemesis creature on top of the Threat deck as the new Omen. The old Omen goes face-down right behind it." },
      es: { name: "Devolver a la Marea", text: "Pon una criatura de la Némesis encima del mazo de Amenaza como nuevo Presagio. El Presagio anterior va boca abajo justo detrás." },
    },
    {
      id: "watchful-siren", color: "U", cost: ["2", "U"], type: "creature", qty: 1, pt: "2/3",
      emoji: "🧜",
      en: { name: "Watchful Siren", sub: "Siren", text: "<b>Flying</b>" },
      es: { name: "Sirena Vigía", sub: "Sirena", text: "<b>Volar</b>" },
    },
    {
      id: "learned-archivist", color: "U", cost: ["2", "U"], type: "creature", qty: 1, pt: "2/2",
      emoji: "📜",
      en: { name: "Learned Archivist", sub: "Human Wizard", text: "{T}: <b>Scry</b> 1.", flavor: "Every future has already been written somewhere." },
      es: { name: "Archivista Ilustrado", sub: "Hechicero humano", text: "{T}: <b>Adivinar</b> 1.", flavor: "Todo futuro ya está escrito en alguna parte." },
    },
    {
      id: "arcane-study", color: "U", cost: ["2", "U"], type: "sorcery", qty: 1,
      emoji: "📘",
      en: { name: "Arcane Study", text: "<b>Scry</b> 2, then draw 2 cards." },
      es: { name: "Lectura Arcana", text: "<b>Adivinar</b> 2 y después roba 2 cartas." },
    },
    {
      id: "cloud-djinn", color: "U", cost: ["3", "U"], type: "creature", qty: 1, pt: "4/3",
      emoji: "🧞",
      en: { name: "Cloud Djinn", sub: "Djinn", text: "<b>Flying</b>", flavor: "Bound to no lamp but the sky." },
      es: { name: "Djinn de las Nubes", sub: "Djinn", text: "<b>Volar</b>", flavor: "No lo ata otra lámpara que el cielo." },
    },
    {
      id: "rising-tide", color: "U", cost: ["4", "U"], type: "sorcery", qty: 1,
      emoji: "🌪️",
      en: { name: "Rising Tide", text: "Put every Nemesis creature on top of the Threat deck in any order; the top one becomes the Omen." },
      es: { name: "Marea Creciente", text: "Pon todas las criaturas de la Némesis encima del mazo de Amenaza en cualquier orden; la de arriba pasa a ser el Presagio." },
    },
  ],
};
