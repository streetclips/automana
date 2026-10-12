import type { Nemesis } from "../types";

export const VASKARA: Nemesis = {
  id: "vaskara", color: "G",
  en: {
    name: "Vaskara, the Brood Mother",
    phase1: [
      "<b>BROOD</b> — At the end of each Nemesis turn, if Vaskara has 2 or fewer creatures, she also executes the new Omen and reveals another.",
    ],
    flip: "<b>HATCHING</b>: execute the Omen at once and reveal another.",
    phase2: [
      "<b>FRENZY</b> — Nemesis creatures get +1/+0 and have <b>Trample</b>.",
      "<b>Brood</b> stays active.",
    ],
  },
  es: {
    name: "Vaskara, la Madre Enjambre",
    phase1: [
      "<b>NIDADA</b> — Al final de cada turno de la Némesis, si Vaskara tiene 2 criaturas o menos, ejecuta también el nuevo Presagio y revela otro.",
    ],
    flip: "<b>ECLOSIÓN</b>: ejecuta el Presagio en el acto y revela otro.",
    phase2: [
      "<b>FRENESÍ</b> — Las criaturas de la Némesis obtienen +1/+0 y tienen <b>Arrollar</b>.",
      "<b>Nidada</b> sigue activa.",
    ],
  },
  threats: [
    {
      id: "ravenous-larva", color: "T", cost: [], type: "creature", qty: 4, pt: "1/1", threat: true,
      emoji: "🐛",
      art: "a giant pale larva with snapping jaws crawling out of an egg sac in a dark hive",
      en: { name: "Ravenous Larva", sub: "Insect", text: "" },
      es: { name: "Larva Voraz", sub: "Insecto", text: "" },
    },
    {
      id: "armored-drone", color: "T", cost: [], type: "creature", qty: 2, pt: "2/2", threat: true,
      emoji: "🐜",
      art: "a giant armored ant soldier with a dark green carapace marching out of a hive tunnel",
      en: { name: "Armored Drone", sub: "Insect", text: "" },
      es: { name: "Zángano Acorazado", sub: "Insecto", text: "" },
    },
    {
      id: "darting-wasp", color: "T", cost: [], type: "creature", qty: 2, pt: "2/1", threat: true,
      emoji: "🐝",
      art: "a giant wasp with a long stinger darting through a sickly green jungle",
      en: { name: "Darting Wasp", sub: "Insect", text: "<b>Flying</b>" },
      es: { name: "Avispa Lanzadera", sub: "Insecto", text: "<b>Volar</b>" },
    },
    {
      id: "shieldbreaker-beetle", color: "T", cost: [], type: "creature", qty: 1, pt: "3/3", threat: true,
      emoji: "🪲",
      art: "a huge horned beetle smashing through a wall of wooden shields",
      en: { name: "Shieldbreaker Beetle", sub: "Insect", text: "<b>Trample</b>" },
      es: { name: "Escarabajo Rompeescudos", sub: "Insecto", text: "<b>Arrollar</b>" },
    },
    {
      id: "mantis-queen", color: "T", cost: [], type: "creature", qty: 1, pt: "4/4", threat: true,
      emoji: "🦗",
      art: "a towering green mantis queen raising her scythe claws over a swarm of insects",
      en: { name: "Mantis Queen", sub: "Insect", text: "When it enters, other Nemesis creatures get +1/+0 until end of turn." },
      es: { name: "Mantis Reina", sub: "Insecto", text: "Cuando entra, las demás criaturas de la Némesis obtienen +1/+0 hasta el final del turno." },
    },
    {
      id: "pheromones", color: "T", cost: [], type: "spell", qty: 2, threat: true,
      emoji: "💨",
      art: "glowing green pheromone mist driving a swarm of giant insects into a frenzy",
      en: { name: "Pheromones", text: "Nemesis creatures get +1/+1 until end of turn." },
      es: { name: "Feromonas", text: "Las criaturas de la Némesis obtienen +1/+1 hasta el final del turno." },
    },
    {
      id: "egg-laying", color: "T", cost: [], type: "spell", qty: 2, threat: true,
      emoji: "🥚",
      art: "a cavern full of glistening insect eggs, one cracking open under a sickly green glow",
      en: { name: "Egg Laying", text: "Reveal the next face-down card. If it is a creature, execute it. Otherwise put it face-down at the bottom." },
      es: { name: "Puesta de Huevos", text: "Revela la siguiente carta boca abajo. Si es una criatura, ejecútala. Si no, ponla boca abajo en el fondo." },
    },
    {
      id: "insect-plague", color: "T", cost: [], type: "spell", qty: 1, threat: true,
      emoji: "🦟",
      art: "a dark swarm of stinging insects descending on a group of terrified soldiers",
      en: { name: "Insect Plague", text: "Deal 1 damage to each of your creatures." },
      es: { name: "Plaga de Insectos", text: "Hace 1 de daño a cada una de tus criaturas." },
    },
  ],
};
