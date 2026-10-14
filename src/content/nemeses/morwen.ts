import type { Nemesis } from "../types";

export const MORWEN: Nemesis = {
  id: "morwen", color: "B",
  en: { name: "Morwen, the Lich Queen" },
  es: { name: "Morwen, la Reina Liche" },
  threats: [
    {
      id: "wandering-skeleton", color: "T", type: "creature", qty: 4, pt: "2/1", threat: true,
      art: "a lone skeleton warrior with a rusty sword wandering through a misty graveyard",
      en: { name: "Wandering Skeleton", sub: "Skeleton", text: "When it dies, put it face-down at the bottom of the Threat deck (Morwen gains 1 life)." },
      es: { name: "Esqueleto Errante", sub: "Esqueleto", text: "Cuando muere, ponlo boca abajo en el fondo del mazo de Amenaza (Morwen gana 1 vida)." },
    },
    {
      id: "rotting-zombie", color: "T", type: "creature", qty: 1, pt: "2/3", threat: true,
      art: "a rotting zombie shambling out of a swamp at night",
      en: { name: "Rotting Zombie", sub: "Zombie", text: "" },
      es: { name: "Zombi Putrefacto", sub: "Zombi", text: "" },
    },
    {
      id: "vampire-bat", color: "T", type: "creature", qty: 3, pt: "1/2", threat: true,
      art: "a giant vampire bat with red eyes swooping under a full moon",
      en: { name: "Vampire Bat", sub: "Bat", text: "<b>Flying</b>, <b>Lifelink</b>" },
      es: { name: "Murciélago Vampiro", sub: "Murciélago", text: "<b>Volar</b>, <b>Vínculo vital</b>" },
    },
    {
      id: "morwens-ghoul", color: "T", type: "creature", qty: 2, pt: "3/2", threat: true,
      art: "a ghoul with venomous black claws crouching on a tomb in the crypt of a lich queen",
      en: { name: "Morwen's Ghoul", sub: "Zombie", text: "<b>Deathtouch</b>" },
      es: { name: "Necrófago de Morwen", sub: "Zombi", text: "<b>Toque mortal</b>" },
    },
    {
      id: "deathless-knight", color: "T", type: "creature", qty: 2, pt: "4/4", threat: true,
      art: "an undead knight in rusted black armor riding a skeletal horse",
      en: { name: "Deathless Knight", sub: "Zombie Knight", text: "" },
      es: { name: "Caballero Sin Muerte", sub: "Caballero zombi", text: "" },
    },
    {
      id: "crypt-horror", color: "T", type: "creature", qty: 2, pt: "5/4", threat: true,
      art: "a monstrous many-eyed horror crawling out of a crypt doorway",
      en: { name: "Crypt Horror", sub: "Horror", text: "When it enters, you lose 1 life." },
      es: { name: "Horror de la Cripta", sub: "Horror", text: "Cuando entra, pierdes 1 vida." },
    },
    {
      id: "withering-touch", color: "T", type: "spell", qty: 2, threat: true,
      art: "a bony hand touching a warrior who withers and turns grey",
      en: { name: "Withering Touch", text: "Your highest-power creature gets −2/−2 until end of turn. If you have none, you lose 2 life." },
      es: { name: "Toque Marchito", text: "Tu criatura de mayor fuerza obtiene −2/−2 hasta el final del turno. Si no tienes ninguna, pierdes 2 vidas." },
    },
    {
      id: "exhume", color: "T", type: "spell", qty: 1, threat: true,
      art: "a coffin pulled up from an open grave by ghostly purple chains in a moonlit cemetery",
      en: { name: "Exhume", text: "Return the highest-power creature from the Ruin to the Table. If there is none, you lose 2 life." },
      es: { name: "Exhumar", text: "Devuelve a la Mesa la criatura de mayor fuerza de la Ruina. Si no hay ninguna, pierdes 2 vidas." },
    },
    {
      id: "soul-drain", color: "T", type: "spell", qty: 1, threat: true,
      art: "a crowned lich queen tearing a pale ghostly soul out of a fallen warrior into her raised hand",
      en: { name: "Soul Drain", text: "You lose 2 life. Return 2 Ruin cards face-down to the bottom of the Threat deck." },
      es: { name: "Drenar Alma", text: "Pierdes 2 vidas. Devuelve 2 cartas de la Ruina boca abajo al fondo del mazo de Amenaza." },
    },
    {
      id: "plague", color: "T", type: "spell", qty: 1, threat: true,
      art: "a sickly green plague fog rolling through a deserted medieval town littered with skulls",
      en: { name: "Plague", text: "All creatures (both sides) get −1/−1 until end of turn." },
      es: { name: "Plaga", text: "Todas las criaturas (de los dos bandos) obtienen −1/−1 hasta el final del turno." },
    },
    {
      id: "uprising", color: "T", type: "spell", qty: 1, threat: true,
      art: "skeletons and zombies clawing their way out of cracked graves under a sickly green moon as a lich queen raises her staff",
      en: { name: "Uprising", text: "Return the 2 highest-power creatures from the Ruin to the Table. If there are none, you lose 2 life." },
      es: { name: "Levantamiento", text: "Devuelve a la Mesa las 2 criaturas de mayor fuerza de la Ruina. Si no hay ninguna, pierdes 2 vidas." },
    },
  ],
};
