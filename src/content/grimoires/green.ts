import type { HalfGrimoire } from "../types";

export const WILDWOOD: HalfGrimoire = {
  id: "wildwood", color: "G",
  en: { name: "Wildwood" },
  es: { name: "Monteverde" },
  cards: [
    {
      id: "thicket-bear", color: "G", cost: 2, type: "creature", qty: 2, pt: "2/2",
      art: "an angry brown bear rearing up in a dense green thicket",
      en: { name: "Thicket Bear", sub: "Bear", text: "", flavor: "The forest does not need a reason to be angry." },
      es: { name: "Oso de la Espesura", sub: "Oso", text: "", flavor: "El bosque no necesita motivos para enfadarse." },
    },
    {
      id: "surge-of-vigor", color: "G", cost: 1, type: "instant", qty: 2,
      art: "roots and vines surging around a lone warrior who glows with green power",
      en: { name: "Surge of Vigor", text: "A creature gets +3/+3 until end of turn.", flavor: "Roots remember how to grow." },
      es: { name: "Oleada de Vigor", text: "Una criatura obtiene +3/+3 hasta el final del turno.", flavor: "Las raíces recuerdan cómo crecer." },
    },
    {
      id: "elvish-grovekeeper", color: "G", cost: 1, type: "creature", qty: 1, pt: "1/1",
      art: "an elf druid tending a glowing green sapling in a sacred forest grove",
      en: { name: "Elvish Grovekeeper", sub: "Elf Druid", text: "{T}: Add one mana." },
      es: { name: "Guardabosques Élfico", sub: "Druida elfo", text: "{T}: Añade un maná." },
    },
    {
      id: "wild-strength", color: "G", cost: 2, type: "aura", qty: 1,
      art: "a warrior with arms swollen by wild strength, wrapped in glowing green vines, lifting a boulder",
      en: { name: "Wild Strength", text: "Tuck behind a creature you control. It gets +2/+2 and has <b>Trample</b>." },
      es: { name: "Fuerza Salvaje", text: "Métela detrás de una criatura tuya. Obtiene +2/+2 y <b>Arrollar</b>." },
    },
    {
      id: "spider-of-the-canopy", color: "G", cost: 2, type: "creature", qty: 1, pt: "1/4",
      art: "a giant green spider spinning a vast web between the tops of tall forest trees",
      en: { name: "Spider of the Canopy", sub: "Spider", text: "<b>Reach</b>", flavor: "The sky is just a higher floor." },
      es: { name: "Araña del Dosel", sub: "Araña", text: "<b>Alcance</b>", flavor: "El cielo es solo un piso más alto." },
    },
    {
      id: "ironbark-wall", color: "G", cost: 2, type: "creature", qty: 1, pt: "0/5",
      art: "a living wall of thick iron-grey bark and twisted trunks blocking a forest path",
      en: { name: "Ironbark Wall", sub: "Plant Wall", text: "<b>Defender</b>" },
      es: { name: "Muro de Corteza Férrea", sub: "Muro planta", text: "<b>Defensor</b>" },
    },
    {
      id: "bloom-of-life", color: "G", cost: 2, type: "sorcery", qty: 1,
      art: "pink and white flowers blooming over a fallen tree in a sunlit forest clearing",
      en: { name: "Bloom of Life", text: "Gain 4 life.", flavor: "What fell, grows back." },
      es: { name: "Floración Vital", text: "Ganas 4 vidas.", flavor: "Lo que cayó, vuelve a crecer." },
    },
    {
      id: "mossback-boar", color: "G", cost: 3, type: "creature", qty: 1, pt: "3/3",
      art: "a huge wild boar with moss growing on its back charging through ferns",
      en: { name: "Mossback Boar", sub: "Boar", text: "<b>Trample</b>" },
      es: { name: "Jabalí Lomomusgo", sub: "Jabalí", text: "<b>Arrollar</b>" },
    },
    {
      id: "grovesinger-druid", color: "G", cost: 3, type: "creature", qty: 1, pt: "2/3",
      art: "an elf druid singing among swirling green leaves in an ancient grove",
      en: { name: "Grovesinger Druid", sub: "Elf Druid", text: "When Grovesinger Druid enters, gain 2 life." },
      es: { name: "Druida Cantoarboleda", sub: "Druida elfo", text: "Cuando el Druida Cantoarboleda entra, ganas 2 vidas." },
    },
    {
      id: "ancient-crashhorn", color: "G", cost: 3, type: "creature", qty: 1, pt: "6/6",
      art: "a colossal ancient horned beast covered in moss, trampling through a forest and smashing trees",
      en: { name: "Ancient Crashhorn", sub: "Beast", text: "<b>Trample</b>", flavor: "Older than the trees it tramples." },
      es: { name: "Cuernochoque Ancestral", sub: "Bestia", text: "<b>Arrollar</b>", flavor: "Más viejo que los árboles que pisotea." },
    },
  ],
};
