import type { Card } from "../types";

export const WILDWOOD: Card[] = [
  {
    id: "thicket-bear", color: "G", cost: ["1", "G"], type: "creature", qty: 2, pt: "2/2",
    art: { subject: { shape: "bear" }, scene: "forest", tint: "#8a5a34", detail: "#24140a" },
    en: { name: "Thicket Bear", sub: "Bear", text: "", flavor: "The forest does not need a reason to be angry." },
    es: { name: "Oso de la Espesura", sub: "Oso", text: "", flavor: "El bosque no necesita motivos para enfadarse." },
  },
  {
    id: "surge-of-vigor", color: "G", cost: ["G"], type: "instant", qty: 2,
    art: { subject: { shape: "sprout" }, scene: "sun", tint: "#4caf50", detail: "#1f5a24" },
    en: { name: "Surge of Vigor", text: "A creature gets +3/+3 until end of turn.", flavor: "Roots remember how to grow." },
    es: { name: "Oleada de Vigor", text: "Una criatura obtiene +3/+3 hasta el final del turno.", flavor: "Las raíces recuerdan cómo crecer." },
  },
  {
    id: "elvish-grovekeeper", color: "G", cost: ["G"], type: "creature", qty: 1, pt: "1/1",
    art: { subject: { emoji: "🧝" }, scene: "forest" },
    en: { name: "Elvish Grovekeeper", sub: "Elf Druid", text: "{T}: Add {G}." },
    es: { name: "Guardabosques Élfico", sub: "Druida elfo", text: "{T}: Añade {G}." },
  },
  {
    id: "wild-strength", color: "G", cost: ["1", "G"], type: "aura", qty: 1,
    art: { subject: { emoji: "💪" }, scene: "sun" },
    en: { name: "Wild Strength", text: "Tuck behind a creature you control. It gets +2/+2 and has <b>Trample</b>." },
    es: { name: "Fuerza Salvaje", text: "Métela detrás de una criatura tuya. Obtiene +2/+2 y <b>Arrollar</b>." },
  },
  {
    id: "spider-of-the-canopy", color: "G", cost: ["1", "G"], type: "creature", qty: 1, pt: "1/4",
    art: { subject: { emoji: "🕷️" }, scene: "forest" },
    en: { name: "Spider of the Canopy", sub: "Spider", text: "<b>Reach</b>", flavor: "The sky is just a higher floor." },
    es: { name: "Araña del Dosel", sub: "Araña", text: "<b>Alcance</b>", flavor: "El cielo es solo un piso más alto." },
  },
  {
    id: "ironbark-wall", color: "G", cost: ["1", "G"], type: "creature", qty: 1, pt: "0/5",
    art: { subject: { emoji: "🌳" }, scene: "forest" },
    en: { name: "Ironbark Wall", sub: "Plant Wall", text: "<b>Defender</b>" },
    es: { name: "Muro de Corteza Férrea", sub: "Muro planta", text: "<b>Defensor</b>" },
  },
  {
    id: "bloom-of-life", color: "G", cost: ["1", "G"], type: "sorcery", qty: 1,
    art: { subject: { emoji: "🌸" }, scene: "sun" },
    en: { name: "Bloom of Life", text: "Gain 4 life.", flavor: "What fell, grows back." },
    es: { name: "Floración Vital", text: "Ganas 4 vidas.", flavor: "Lo que cayó, vuelve a crecer." },
  },
  {
    id: "mossback-boar", color: "G", cost: ["2", "G"], type: "creature", qty: 1, pt: "3/3",
    art: { subject: { emoji: "🐗" }, scene: "forest" },
    en: { name: "Mossback Boar", sub: "Boar", text: "<b>Trample</b>" },
    es: { name: "Jabalí Lomomusgo", sub: "Jabalí", text: "<b>Arrollar</b>" },
  },
  {
    id: "grovesinger-druid", color: "G", cost: ["2", "G"], type: "creature", qty: 1, pt: "2/3",
    art: { subject: { emoji: "🍃" }, scene: "sun" },
    en: { name: "Grovesinger Druid", sub: "Elf Druid", text: "When Grovesinger Druid enters, gain 2 life." },
    es: { name: "Druida Cantoarboleda", sub: "Druida elfo", text: "Cuando el Druida Cantoarboleda entra, ganas 2 vidas." },
  },
  {
    id: "ancient-crashhorn", color: "G", cost: ["4", "G"], type: "creature", qty: 1, pt: "6/6",
    art: { subject: { emoji: "🦏" }, scene: "peaks" },
    en: { name: "Ancient Crashhorn", sub: "Beast", text: "<b>Trample</b>", flavor: "Older than the trees it tramples." },
    es: { name: "Cuernochoque Ancestral", sub: "Bestia", text: "<b>Arrollar</b>", flavor: "Más viejo que los árboles que pisotea." },
  },
];
