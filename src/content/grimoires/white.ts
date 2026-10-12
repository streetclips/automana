import type { HalfGrimoire } from "../types";

export const DAWNWARD: HalfGrimoire = {
  id: "dawnward-order", color: "W", land: "plains",
  en: { name: "Dawnward Order" },
  es: { name: "Orden del Alba" },
  cards: [
    {
      id: "dawn-squire", color: "W", cost: ["W"], type: "creature", qty: 2, pt: "1/2",
      emoji: "🧑‍✈️",
      art: "a young female squire in white and gold armor keeping watch with a spear on a castle wall at dawn",
      en: { name: "Dawn Squire", sub: "Human Soldier", text: "<b>Vigilance</b>", flavor: "She keeps watch so the knights can sleep." },
      es: { name: "Escudera del Alba", sub: "Soldado humano", text: "<b>Vigilancia</b>", flavor: "Ella vela para que los caballeros duerman." },
    },
    {
      id: "luminous-aegis", color: "W", cost: ["W"], type: "instant", qty: 2,
      emoji: "🛡️",
      art: "a knight protected by a dome of radiant golden light as arrows and flames shatter against it",
      en: { name: "Luminous Aegis", text: "Prevent all damage that would be dealt to a creature you control this turn.", flavor: "Light does not strike: it endures." },
      es: { name: "Égida Luminosa", text: "Previene todo el daño que se haría a una criatura tuya este turno.", flavor: "La luz no golpea: resiste." },
    },
    {
      id: "dawn-cleric", color: "W", cost: ["1", "W"], type: "creature", qty: 1, pt: "1/3",
      emoji: "🙏",
      art: "a female cleric in white robes healing a wounded soldier with glowing hands in a sunlit chapel",
      en: { name: "Dawn Cleric", sub: "Human Cleric", text: "<b>Lifelink</b>", flavor: "Every wound she closes is a page restored." },
      es: { name: "Clérigo del Alba", sub: "Clérigo humano", text: "<b>Vínculo vital</b>", flavor: "Cada herida que cierra es una página recuperada." },
    },
    {
      id: "serene-judgment", color: "W", cost: ["1", "W"], type: "aura", qty: 1,
      emoji: "⚖️",
      art: "a fierce beast kneeling in peace, bound by ribbons of white light beneath a radiant golden scale of justice",
      en: { name: "Serene Judgment", text: "<b>Pacify</b>: tuck behind a Nemesis creature. It can't attack or block." },
      es: { name: "Juicio Sereno", text: "<b>Pacificar</b>: métela detrás de una criatura de la Némesis. No puede atacar ni bloquear." },
    },
    {
      id: "prayer-of-restoration", color: "W", cost: ["1", "W"], type: "sorcery", qty: 1,
      emoji: "🕯️",
      art: "monks praying among lit candles as warm golden light pours down from a tall cathedral window",
      en: { name: "Prayer of Restoration", text: "Gain 3 life. You may put one of those cards into your hand instead of your library." },
      es: { name: "Plegaria de Restauración", text: "Ganas 3 vidas. Puedes poner una de esas cartas en tu mano en vez de en tu biblioteca." },
    },
    {
      id: "sky-griffin", color: "W", cost: ["2", "W"], type: "creature", qty: 1, pt: "2/2",
      emoji: "🪽",
      art: "a white and gold griffin circling the towers of a castle at dusk",
      en: { name: "Sky Griffin", sub: "Griffin", text: "<b>Flying</b>, <b>Vigilance</b>", flavor: "It circles the walls from dusk to dawn." },
      es: { name: "Grifo Celeste", sub: "Grifo", text: "<b>Volar</b>, <b>Vigilancia</b>", flavor: "Rodea las murallas del ocaso al alba." },
    },
    {
      id: "sworn-paladin", color: "W", cost: ["2", "W"], type: "creature", qty: 1, pt: "3/2",
      emoji: "🤺",
      art: "a paladin in shining plate armor and a white tabard raising a sword before a sunlit fortress gate",
      en: { name: "Sworn Paladin", sub: "Human Knight", text: "<b>Vigilance</b>" },
      es: { name: "Paladín Juramentado", sub: "Caballero humano", text: "<b>Vigilancia</b>" },
    },
    {
      id: "shield-formation", color: "W", cost: ["2", "W"], type: "instant", qty: 1,
      emoji: "🧱",
      art: "a line of soldiers locking white shields into a wall against a charging horde",
      en: { name: "Shield Formation", text: "Creatures you control get +1/+1 until end of turn.", flavor: "One shield breaks. A wall of them holds." },
      es: { name: "Formación de Escudos", text: "Tus criaturas obtienen +1/+1 hasta el final del turno.", flavor: "Un escudo se rompe. Un muro de ellos aguanta." },
    },
    {
      id: "banish-into-light", color: "W", cost: ["1", "W"], type: "instant", qty: 1,
      emoji: "✨",
      art: "a charging demon dissolving into a blinding column of white light falling from the sky",
      en: { name: "Banish into Light", text: "Put an attacking Nemesis creature face-down at the bottom of the Threat deck. (The Nemesis gains 1 life and that creature will return later.)" },
      es: { name: "Exiliar en Luz", text: "Pon una criatura atacante de la Némesis boca abajo en el fondo del mazo de Amenaza. (La Némesis gana 1 vida y esa criatura volverá más tarde.)" },
    },
    {
      id: "vigil-angel", color: "W", cost: ["4", "W"], type: "creature", qty: 1, pt: "4/4",
      emoji: "👼",
      art: "a radiant female angel with white wings and a sword landing on a hill as the night sky breaks into dawn",
      en: { name: "Vigil Angel", sub: "Angel", text: "<b>Flying</b>, <b>Lifelink</b>", flavor: "Where she lands, the night retreats." },
      es: { name: "Ángel de la Vigilia", sub: "Ángel", text: "<b>Volar</b>, <b>Vínculo vital</b>", flavor: "Donde se posa, la noche retrocede." },
    },
  ],
};
