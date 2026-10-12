import type { HalfGrimoire } from "../types";

export const EMBERKIN: HalfGrimoire = {
  id: "emberkin", color: "R", land: "mountain",
  en: { name: "Emberkin" },
  es: { name: "Clan Ascua" },
  cards: [
    {
      id: "reckless-goblin", color: "R", cost: ["R"], type: "creature", qty: 2, pt: "2/1",
      emoji: "👺",
      en: { name: "Reckless Goblin", sub: "Goblin", text: "<b>Haste</b>", flavor: "First in, first out, first on fire." },
      es: { name: "Trasgo Temerario", sub: "Trasgo", text: "<b>Prisa</b>", flavor: "El primero en entrar, el primero en salir, el primero en arder." },
    },
    {
      id: "ember-bolt", color: "R", cost: ["R"], type: "instant", qty: 2,
      emoji: "⚡",
      en: { name: "Ember Bolt", text: "Ember Bolt deals 3 damage to a creature or to the Nemesis.", flavor: "Quick words, hot syllables." },
      es: { name: "Descarga de Ascuas", text: "Descarga de Ascuas hace 3 de daño a una criatura o a la Némesis.", flavor: "Palabras rápidas, sílabas ardientes." },
    },
    {
      id: "cinder-hound", color: "R", cost: ["1", "R"], type: "creature", qty: 1, pt: "2/2",
      emoji: "🐺",
      en: { name: "Cinder Hound", sub: "Hound", text: "When Cinder Hound enters, it deals 1 damage to a creature.", flavor: "It hunts by the smell of smoke." },
      es: { name: "Sabueso de Ceniza", sub: "Sabueso", text: "Cuando el Sabueso de Ceniza entra, hace 1 de daño a una criatura.", flavor: "Caza siguiendo el olor del humo." },
    },
    {
      id: "firebrand-raider", color: "R", cost: ["2", "R"], type: "creature", qty: 1, pt: "3/2",
      emoji: "🏇",
      en: { name: "Firebrand Raider", sub: "Human Warrior", text: "<b>Haste</b>", flavor: "Raids at dawn. Burns by noon." },
      es: { name: "Saqueador Incendiario", sub: "Guerrero humano", text: "<b>Prisa</b>", flavor: "Saquea al alba. Quema a mediodía." },
    },
    {
      id: "battle-fury", color: "R", cost: ["R"], type: "instant", qty: 1,
      emoji: "💢",
      en: { name: "Battle Fury", text: "A creature gets +3/+0 until end of turn.", flavor: "Rage is the cheapest weapon." },
      es: { name: "Furia de Batalla", text: "Una criatura obtiene +3/+0 hasta el final del turno.", flavor: "La rabia es el arma más barata." },
    },
    {
      id: "molten-blade", color: "R", cost: ["1", "R"], type: "aura", qty: 1,
      emoji: "🗡️",
      en: { name: "Molten Blade", text: "Tuck behind a creature you control. It gets +2/+0 and has <b>Trample</b>." },
      es: { name: "Hoja Fundida", text: "Métela detrás de una criatura tuya. Obtiene +2/+0 y <b>Arrollar</b>." },
    },
    {
      id: "kindle", color: "R", cost: ["R"], type: "sorcery", qty: 1,
      emoji: "🔥",
      en: { name: "Kindle", text: "Kindle deals 2 damage to a creature or to the Nemesis.", flavor: "Every wildfire starts small." },
      es: { name: "Prender", text: "Prender hace 2 de daño a una criatura o a la Némesis.", flavor: "Todo incendio empieza pequeño." },
    },
    {
      id: "volcanic-roar", color: "R", cost: ["2", "R"], type: "sorcery", qty: 1,
      emoji: "🌋",
      en: { name: "Volcanic Roar", text: "Volcanic Roar deals 2 damage to each Nemesis creature." },
      es: { name: "Rugido Volcánico", text: "Rugido Volcánico hace 2 de daño a cada criatura de la Némesis." },
    },
    {
      id: "ashwing-drake", color: "R", cost: ["3", "R"], type: "creature", qty: 1, pt: "3/3",
      emoji: "🐉",
      en: { name: "Ashwing Drake", sub: "Drake", text: "<b>Flying</b>", flavor: "Its shadow is warm." },
      es: { name: "Draco Alaceniza", sub: "Draco", text: "<b>Volar</b>", flavor: "Su sombra quema." },
    },
    {
      id: "pyre-titan", color: "R", cost: ["4", "R"], type: "creature", qty: 1, pt: "5/4",
      emoji: "🗿",
      en: { name: "Pyre Titan", sub: "Giant", text: "<b>Trample</b>. When Pyre Titan enters, it deals 2 damage to the Nemesis." },
      es: { name: "Titán de la Pira", sub: "Gigante", text: "<b>Arrollar</b>. Cuando el Titán de la Pira entra, hace 2 de daño a la Némesis." },
    },
  ],
};
