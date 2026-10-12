import type { HalfGrimoire } from "../types";

export const GRIM_PACT: HalfGrimoire = {
  id: "grim-pact", color: "B", land: "swamp",
  en: { name: "Grim Pact" },
  es: { name: "Pacto Sombrío" },
  cards: [
    {
      id: "crypt-rat", color: "B", cost: ["B"], type: "creature", qty: 2, pt: "1/1",
      emoji: "🐀",
      art: "a diseased rat with sickly glowing eyes crawling over skulls in a dark crypt",
      en: { name: "Crypt Rat", sub: "Rat", text: "<b>Deathtouch</b>", flavor: "Small bite, long fever." },
      es: { name: "Rata de Cripta", sub: "Rata", text: "<b>Toque mortal</b>", flavor: "Mordisco pequeño, fiebre larga." },
    },
    {
      id: "lethal-whisper", color: "B", cost: ["B"], type: "instant", qty: 2,
      emoji: "💀",
      art: "a hooded shadow whispering into the ear of a terrified warrior, purple smoke curling from its lips",
      en: { name: "Lethal Whisper", text: "A Nemesis creature gets −2/−2 until end of turn.", flavor: "One word in the ear is enough." },
      es: { name: "Susurro Letal", text: "Una criatura de la Némesis obtiene −2/−2 hasta el final del turno.", flavor: "Basta una palabra al oído." },
    },
    {
      id: "blood-acolyte", color: "B", cost: ["1", "B"], type: "creature", qty: 1, pt: "2/2",
      emoji: "🩸",
      art: "a pale hooded acolyte cutting a palm over a black altar as the blood rises into red mist",
      en: { name: "Blood Acolyte", sub: "Human Cleric", text: "When Blood Acolyte enters, you lose 1 life and it deals 1 damage to the Nemesis." },
      es: { name: "Acólito Sangriento", sub: "Clérigo humano", text: "Cuando el Acólito Sangriento entra, pierdes 1 vida y hace 1 de daño a la Némesis." },
    },
    {
      id: "forbidden-pact", color: "B", cost: ["1", "B"], type: "sorcery", qty: 1,
      emoji: "📕",
      art: "a shadowy clawed hand offering a quill dripping with blood over an open black grimoire by purple candlelight",
      en: { name: "Forbidden Pact", text: "Draw 2 cards.", flavor: "The ink is still wet. So is the blood." },
      es: { name: "Pacto Prohibido", text: "Roba 2 cartas.", flavor: "La tinta aún está fresca. La sangre también." },
    },
    {
      id: "assassinate", color: "B", cost: ["2", "B"], type: "instant", qty: 1,
      emoji: "🔪",
      art: "a cloaked assassin with a dagger dropping from the shadows onto an unsuspecting monster at night",
      en: { name: "Assassinate", text: "Destroy a Nemesis creature.", flavor: "No duel. No warning. No witness." },
      es: { name: "Asesinar", text: "Destruye una criatura de la Némesis.", flavor: "Sin duelo. Sin aviso. Sin testigos." },
    },
    {
      id: "reanimate", color: "B", cost: ["2", "B"], type: "sorcery", qty: 1,
      emoji: "⚰️",
      art: "a skeletal hand bursting out of a grave as purple necromantic energy swirls in a moonlit cemetery",
      en: { name: "Reanimate", text: "Put a creature card from your graveyard onto the Table." },
      es: { name: "Reanimar", text: "Pon en la Mesa una carta de criatura de tu cementerio." },
    },
    {
      id: "hungry-ghoul", color: "B", cost: ["2", "B"], type: "creature", qty: 1, pt: "3/2",
      emoji: "🧟",
      art: "a hunched gaunt ghoul gnawing on a bone in a foggy graveyard",
      en: { name: "Hungry Ghoul", sub: "Zombie", text: "When Hungry Ghoul dies, return a card from your graveyard to your hand." },
      es: { name: "Necrófago Hambriento", sub: "Zombi", text: "Cuando el Necrófago Hambriento muere, devuelve una carta de tu cementerio a tu mano." },
    },
    {
      id: "drain-essence", color: "B", cost: ["2", "B"], type: "sorcery", qty: 1,
      emoji: "🫀",
      art: "a dark sorcerer pulling a stream of glowing red life essence out of a screaming monster",
      en: { name: "Drain Essence", text: "Drain Essence deals 2 damage to the Nemesis and you gain 2 life." },
      es: { name: "Drenar Esencia", text: "Drenar Esencia hace 2 de daño a la Némesis y ganas 2 vidas." },
    },
    {
      id: "night-specter", color: "B", cost: ["3", "B"], type: "creature", qty: 1, pt: "3/3",
      emoji: "👻",
      art: "a hooded specter with tattered black wings drifting over a sleeping village under a purple moon",
      en: { name: "Night Specter", sub: "Specter", text: "<b>Flying</b>", flavor: "It feeds on the dreams you forget." },
      es: { name: "Espectro Nocturno", sub: "Espectro", text: "<b>Volar</b>", flavor: "Se alimenta de los sueños que olvidas." },
    },
    {
      id: "crypt-lord", color: "B", cost: ["4", "B"], type: "creature", qty: 1, pt: "4/5",
      emoji: "🧛",
      art: "a regal vampire lord in a black and crimson cloak rising from a stone coffin in a vast crypt",
      en: { name: "Crypt Lord", sub: "Vampire", text: "When Crypt Lord enters, put a creature card with cost 2 or less from your graveyard onto the Table." },
      es: { name: "Señor de la Cripta", sub: "Vampiro", text: "Cuando el Señor de la Cripta entra, pon en la Mesa una carta de criatura de coste 2 o menos de tu cementerio." },
    },
  ],
};
