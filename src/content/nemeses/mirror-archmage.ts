import type { Nemesis } from "../types";

export const MIRROR_ARCHMAGE: Nemesis = {
  id: "mirror-archmage", color: "U",
  en: { name: "The Mirror Archmage" },
  es: { name: "El Archimago Espejo" },
  threats: [
    {
      id: "fragile-illusion", color: "T", type: "creature", qty: 2, pt: "3/1", threat: true,
      art: "a translucent illusory dragon made of shimmering bubbles and blue light",
      en: { name: "Fragile Illusion", sub: "Illusion", text: "<b>Flying</b>" },
      es: { name: "Ilusión Frágil", sub: "Ilusión", text: "<b>Volar</b>" },
    },
    {
      id: "water-elemental", color: "T", type: "creature", qty: 2, pt: "2/4", threat: true,
      art: "a towering water elemental rising from a lake, its body made of swirling waves",
      en: { name: "Water Elemental", sub: "Elemental", text: "" },
      es: { name: "Elemental de Agua", sub: "Elemental", text: "" },
    },
    {
      id: "crystal-golem", color: "T", type: "creature", qty: 2, pt: "1/4", threat: true,
      art: "a blue crystal golem standing guard before a mirrored gate",
      en: { name: "Crystal Golem", sub: "Golem", text: "<b>Defender</b>" },
      es: { name: "Gólem de Cristal", sub: "Gólem", text: "<b>Defensor</b>" },
    },
    {
      id: "guardian-sphinx", color: "T", type: "creature", qty: 1, pt: "3/3", threat: true,
      art: "a winged sphinx with a lion's body perched atop an ancient blue stone archway",
      en: { name: "Guardian Sphinx", sub: "Sphinx", text: "<b>Flying</b>" },
      es: { name: "Esfinge Guardiana", sub: "Esfinge", text: "<b>Volar</b>" },
    },
    {
      id: "mirror-djinn", color: "T", type: "creature", qty: 1, pt: "4/2", threat: true,
      art: "a djinn made of silver mirror shards swirling out of a tall ornate mirror",
      en: { name: "Mirror Djinn", sub: "Djinn", text: "<b>Flying</b>" },
      es: { name: "Djinn del Espejo", sub: "Djinn", text: "<b>Volar</b>" },
    },
    {
      id: "tide-serpent", color: "T", type: "creature", qty: 1, pt: "4/5", threat: true,
      art: "a huge sea serpent coiling around a sinking ship in a stormy sea",
      en: { name: "Tide Serpent", sub: "Serpent", text: "" },
      es: { name: "Serpiente de la Marea", sub: "Serpiente", text: "" },
    },
    {
      id: "counterspell", color: "T", type: "spell", qty: 2, threat: true,
      art: "a wizard's fiery spell shattering into shards against a mirrored shield of blue light",
      en: { name: "Counterspell", text: "<b>Counter reminder</b>: the next spell you cast is countered." },
      es: { name: "Contraconjuro", text: "<b>Recordatorio de contraconjuro</b>: el próximo hechizo que lances es contrarrestado." },
    },
    {
      id: "rebound", color: "T", type: "spell", qty: 2, threat: true,
      art: "a charging knight flung backwards through the air by a rippling wave of blue magic",
      en: { name: "Rebound", text: "Return your highest-power creature to your hand. If you have none, discard the leftmost card of your hand." },
      es: { name: "Rebote", text: "Devuelve a tu mano tu criatura de mayor fuerza. Si no tienes ninguna, descarta la carta más a la izquierda de tu mano." },
    },
    {
      id: "mind-theft", color: "T", type: "spell", qty: 1, threat: true,
      art: "an archmage drawing glowing blue threads of thought out of a dazed wizard's head",
      en: { name: "Mind Theft", text: "Discard the leftmost card of your hand. If you can't, you lose 2 life." },
      es: { name: "Robo de Mente", text: "Descarta la carta más a la izquierda de tu mano. Si no puedes, pierdes 2 vidas." },
    },
    {
      id: "mass-illusion", color: "T", type: "spell", qty: 1, threat: true,
      art: "soldiers lost in a hall of mirrors, surrounded by their own illusory reflections",
      en: { name: "Mass Illusion", text: "Lower all your creatures." },
      es: { name: "Ilusión Masiva", text: "Baja todas tus criaturas." },
    },
  ],
};
