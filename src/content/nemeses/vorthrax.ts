import type { Nemesis } from "../types";

export const VORTHRAX: Nemesis = {
  id: "vorthrax", color: "R",
  en: { name: "Vorthrax, the Ash Tyrant" },
  es: { name: "Vorthrax, el Tirano de Ceniza" },
  threats: [
    {
      id: "ash-imp", color: "T", type: "creature", qty: 3, pt: "1/1", threat: true,
      art: "a small grinning imp with bat wings flying through falling ash",
      en: { name: "Ash Imp", sub: "Imp", text: "<b>Flying</b>" },
      es: { name: "Diablillo de Ceniza", sub: "Diablillo", text: "<b>Volar</b>" },
    },
    {
      id: "cinderclaw-brute", color: "T", type: "creature", qty: 3, pt: "3/2", threat: true,
      art: "a hulking demon with glowing cinder claws smashing through a ruined wall",
      en: { name: "Cinderclaw Brute", sub: "Demon", text: "" },
      es: { name: "Bruto Garrascua", sub: "Demonio", text: "" },
    },
    {
      id: "magma-sentinel", color: "T", type: "creature", qty: 1, pt: "1/4", threat: true,
      art: "a hulking elemental of black rock and glowing magma guarding a volcanic pass",
      en: { name: "Magma Sentinel", sub: "Elemental", text: "<b>Defender</b>" },
      es: { name: "Centinela de Magma", sub: "Elemental", text: "<b>Defensor</b>" },
    },
    {
      id: "ember-wyrmling", color: "T", type: "creature", qty: 2, pt: "2/2", threat: true,
      art: "a young red dragon hatchling spreading its wings over a nest of embers",
      en: { name: "Ember Wyrmling", sub: "Dragon", text: "<b>Flying</b>" },
      es: { name: "Dragoncillo de Ascuas", sub: "Dragón", text: "<b>Volar</b>" },
    },
    {
      id: "scorch-fiend", color: "T", type: "creature", qty: 2, pt: "4/3", threat: true,
      art: "a horned fire demon charging through burning ruins and leaving scorched earth behind",
      en: { name: "Scorch Fiend", sub: "Demon", text: "<b>Trample</b>" },
      es: { name: "Demonio Abrasador", sub: "Demonio", text: "<b>Arrollar</b>" },
    },
    {
      id: "vorthraxs-herald", color: "T", type: "creature", qty: 2, pt: "3/3", threat: true,
      art: "a robed fire cultist blowing a great curved horn on a volcanic cliff, embers swirling around",
      en: { name: "Vorthrax's Herald", sub: "Cultist", text: "When it enters, it deals 1 damage to you." },
      es: { name: "Heraldo de Vorthrax", sub: "Sectario", text: "Cuando entra, te hace 1 de daño." },
    },
    {
      id: "lava-behemoth", color: "T", type: "creature", qty: 1, pt: "5/5", threat: true,
      art: "a mammoth-like behemoth of flowing lava rising out of a volcanic lake",
      en: { name: "Lava Behemoth", sub: "Elemental", text: "" },
      es: { name: "Behemot de Lava", sub: "Elemental", text: "" },
    },
    {
      id: "inferno-charger", color: "T", type: "creature", qty: 1, pt: "3/2", threat: true,
      art: "a horse of living flame galloping out of a volcanic fissure, leaving burning hoofprints in the ash",
      en: { name: "Inferno Charger", sub: "Elemental", text: "<b>Haste</b>" },
      es: { name: "Corcel del Infierno", sub: "Elemental", text: "<b>Prisa</b>" },
    },
    {
      id: "searing-breath", color: "T", type: "spell", qty: 2, threat: true,
      art: "a huge red dragon breathing a torrent of fire on a knight raising a shield",
      en: { name: "Searing Breath", text: "Deal 2 damage to your highest-power creature. If you have none, deal 2 damage to you." },
      es: { name: "Aliento Abrasador", text: "Hace 2 de daño a tu criatura de mayor fuerza. Si no tienes ninguna, te hace 2 de daño a ti." },
    },
    {
      id: "rain-of-cinders", color: "T", type: "spell", qty: 1, threat: true,
      art: "burning cinders and meteors raining from a dark red sky onto a battlefield",
      en: { name: "Rain of Cinders", text: "Deal 1 damage to each of your creatures and 1 damage to you." },
      es: { name: "Lluvia de Pavesas", text: "Hace 1 de daño a cada una de tus criaturas y 1 de daño a ti." },
    },
    {
      id: "tyrants-roar", color: "T", type: "spell", qty: 1, threat: true,
      art: "a colossal ash-grey dragon roaring on a volcanic peak as demons below raise their weapons",
      en: { name: "Tyrant's Roar", text: "Nemesis creatures get +1/+0 until end of turn." },
      es: { name: "Rugido del Tirano", text: "Las criaturas de la Némesis obtienen +1/+0 hasta el final del turno." },
    },
    {
      id: "cinder-rebirth", color: "T", type: "spell", qty: 1, threat: true,
      art: "a demon rising again from a pile of glowing ashes and cinders on a dark battlefield",
      en: { name: "Cinder Rebirth", text: "Return the highest-power creature from the Ruin to the Table. If there is none, deal 2 damage to you." },
      es: { name: "Renacer de Ceniza", text: "Devuelve a la Mesa la criatura de mayor fuerza de la Ruina. Si no hay ninguna, te hace 2 de daño." },
    },
  ],
};
