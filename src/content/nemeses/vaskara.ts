import type { Nemesis } from "../types";

export const VASKARA: Nemesis = {
  id: "vaskara", color: "G",
  en: { name: "Vaskara, the Brood Mother" },
  es: { name: "Vaskara, la Madre Enjambre" },
  threats: [
    {
      id: "ravenous-larva", color: "T", type: "creature", qty: 4, pt: "1/1", threat: true,
      art: "a giant pale larva with snapping jaws crawling out of an egg sac in a dark hive",
      en: { name: "Ravenous Larva", sub: "Insect", text: "" },
      es: { name: "Larva Voraz", sub: "Insecto", text: "" },
    },
    {
      id: "armored-drone", color: "T", type: "creature", qty: 2, pt: "2/2", threat: true,
      art: "a giant armored ant soldier with a dark green carapace marching out of a hive tunnel",
      en: { name: "Armored Drone", sub: "Insect", text: "" },
      es: { name: "Zángano Acorazado", sub: "Insecto", text: "" },
    },
    {
      id: "darting-wasp", color: "T", type: "creature", qty: 2, pt: "2/1", threat: true,
      art: "a giant wasp with a long stinger darting through a sickly green jungle",
      en: { name: "Darting Wasp", sub: "Insect", text: "<b>Flying</b>" },
      es: { name: "Avispa Lanzadera", sub: "Insecto", text: "<b>Volar</b>" },
    },
    {
      id: "shieldbreaker-beetle", color: "T", type: "creature", qty: 1, pt: "3/3", threat: true,
      art: "a huge horned beetle smashing through a wall of wooden shields",
      en: { name: "Shieldbreaker Beetle", sub: "Insect", text: "<b>Trample</b>" },
      es: { name: "Escarabajo Rompeescudos", sub: "Insecto", text: "<b>Arrollar</b>" },
    },
    {
      id: "mantis-queen", color: "T", type: "creature", qty: 1, pt: "4/4", threat: true,
      art: "a towering green mantis queen raising her scythe claws over a swarm of insects",
      en: { name: "Mantis Queen", sub: "Insect", text: "When it enters, other Nemesis creatures get +1/+0 until end of turn." },
      es: { name: "Mantis Reina", sub: "Insecto", text: "Cuando entra, las demás criaturas de la Némesis obtienen +1/+0 hasta el final del turno." },
    },
    {
      id: "pheromones", color: "T", type: "spell", qty: 2, threat: true,
      art: "glowing green pheromone mist driving a swarm of giant insects into a frenzy",
      en: { name: "Pheromones", text: "Nemesis creatures get +1/+1 until end of turn." },
      es: { name: "Feromonas", text: "Las criaturas de la Némesis obtienen +1/+1 hasta el final del turno." },
    },
    {
      id: "egg-laying", color: "T", type: "spell", qty: 2, threat: true,
      art: "a cavern full of glistening insect eggs, one cracking open under a sickly green glow",
      en: { name: "Egg Laying", text: "Reveal the next face-down card. If it is a creature, execute it. Otherwise put it face-down at the bottom." },
      es: { name: "Puesta de Huevos", text: "Revela la siguiente carta boca abajo. Si es una criatura, ejecútala. Si no, ponla boca abajo en el fondo." },
    },
    {
      id: "insect-plague", color: "T", type: "spell", qty: 1, threat: true,
      art: "a dark swarm of stinging insects descending on a group of terrified soldiers",
      en: { name: "Insect Plague", text: "Deal 1 damage to each of your creatures." },
      es: { name: "Plaga de Insectos", text: "Hace 1 de daño a cada una de tus criaturas." },
    },
  ],
};
