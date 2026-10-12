import type { Card } from "../types";

export const VORTHRAX_THREATS: Card[] = [
  {
    id: "ash-imp", color: "T", cost: [], type: "creature", qty: 2, pt: "1/1", threat: true,
    emoji: "😈",
    en: { name: "Ash Imp", sub: "Imp", text: "<b>Flying</b>" },
    es: { name: "Diablillo de Ceniza", sub: "Diablillo", text: "<b>Volar</b>" },
  },
  {
    id: "cinderclaw-brute", color: "T", cost: [], type: "creature", qty: 2, pt: "3/2", threat: true,
    emoji: "👹",
    en: { name: "Cinderclaw Brute", sub: "Demon", text: "" },
    es: { name: "Bruto Garrascua", sub: "Demonio", text: "" },
  },
  {
    id: "magma-sentinel", color: "T", cost: [], type: "creature", qty: 2, pt: "1/4", threat: true,
    emoji: "🪨",
    en: { name: "Magma Sentinel", sub: "Elemental", text: "<b>Defender</b>" },
    es: { name: "Centinela de Magma", sub: "Elemental", text: "<b>Defensor</b>" },
  },
  {
    id: "ember-wyrmling", color: "T", cost: [], type: "creature", qty: 1, pt: "2/2", threat: true,
    emoji: "🐲",
    en: { name: "Ember Wyrmling", sub: "Dragon", text: "<b>Flying</b>" },
    es: { name: "Dragoncillo de Ascuas", sub: "Dragón", text: "<b>Volar</b>" },
  },
  {
    id: "scorch-fiend", color: "T", cost: [], type: "creature", qty: 1, pt: "4/3", threat: true,
    emoji: "👿",
    en: { name: "Scorch Fiend", sub: "Demon", text: "<b>Trample</b>" },
    es: { name: "Demonio Abrasador", sub: "Demonio", text: "<b>Arrollar</b>" },
  },
  {
    id: "vorthraxs-herald", color: "T", cost: [], type: "creature", qty: 1, pt: "3/3", threat: true,
    emoji: "📯",
    en: { name: "Vorthrax's Herald", sub: "Cultist", text: "When it enters, it deals 1 damage to you." },
    es: { name: "Heraldo de Vorthrax", sub: "Sectario", text: "Cuando entra, te hace 1 de daño." },
  },
  {
    id: "lava-behemoth", color: "T", cost: [], type: "creature", qty: 1, pt: "5/5", threat: true,
    emoji: "🦣",
    en: { name: "Lava Behemoth", sub: "Elemental", text: "" },
    es: { name: "Behemot de Lava", sub: "Elemental", text: "" },
  },
  {
    id: "searing-breath", color: "T", cost: [], type: "spell", qty: 2, threat: true,
    emoji: "🔥",
    en: { name: "Searing Breath", text: "Deal 2 damage to your highest-power creature. If you have none, deal 2 damage to you." },
    es: { name: "Aliento Abrasador", text: "Hace 2 de daño a tu criatura de mayor fuerza. Si no tienes ninguna, te hace 2 de daño a ti." },
  },
  {
    id: "rain-of-cinders", color: "T", cost: [], type: "spell", qty: 1, threat: true,
    emoji: "☄️",
    en: { name: "Rain of Cinders", text: "Deal 1 damage to each of your creatures and 1 damage to you." },
    es: { name: "Lluvia de Pavesas", text: "Hace 1 de daño a cada una de tus criaturas y 1 de daño a ti." },
  },
  {
    id: "tyrants-roar", color: "T", cost: [], type: "spell", qty: 1, threat: true,
    emoji: "🗯️",
    en: { name: "Tyrant's Roar", text: "Nemesis creatures get +1/+0 until end of turn." },
    es: { name: "Rugido del Tirano", text: "Las criaturas de la Némesis obtienen +1/+0 hasta el final del turno." },
  },
  {
    id: "cinder-rebirth", color: "T", cost: [], type: "spell", qty: 1, threat: true,
    emoji: "🪦",
    en: { name: "Cinder Rebirth", text: "Return the highest-power creature from the Ruin to the Table. If there is none, deal 2 damage to you." },
    es: { name: "Renacer de Ceniza", text: "Devuelve a la Mesa la criatura de mayor fuerza de la Ruina. Si no hay ninguna, te hace 2 de daño." },
  },
];
