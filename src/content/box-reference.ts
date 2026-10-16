import type { Reference } from "./types";

export const BOX_REFERENCE: Reference = {
  en: [
    {
      title: "SETUP",
      items: [
        "Shuffle the Nemesis deck: its library. The Nemesis has 20 life on a counter.",
        "Starting cards: the Revel King and 2 Drunken Throngs; the Hydra's 2 Lesser Heads.",
        "You: Magic rules, 20 life, 7 cards and mulligan. You start and skip that draw.",
      ],
    },
    {
      title: "NEMESIS TURN",
      items: [
        "Untap. Reveal its top card and cast it for free; more only when a card says so.",
        "Creatures enter summoning sick, unless they have haste.",
        "Spells: you may respond; then to its graveyard.",
        "Attack by its mind.",
        "Empty library: shuffle its graveyard into a new one.",
      ],
    },
    {
      title: "NEMESIS MIND",
      items: [
        "<b>Attack</b> with every able creature with power, unless you could block it, kill it and survive. Card text comes first.",
        "<b>Block:</b> safe block → trade → desperation (only if lethal).",
        "<b>Target:</b> your highest-power creature without hexproof or ward. None → you.",
        "It never responds or activates abilities. You make its other choices.",
      ],
    },
    {
      title: "YOUR CARDS VS. THE NEMESIS",
      items: [
        "Damage and life loss lower its life; it can gain life. At 0 you win.",
        "It ignores draw and discard. <b>Bounce:</b> its card goes on top of its library.",
        "<b>Bite:</b> at the start of its combat, if untapped, it deals 1 damage to you.",
        "<b>Regrow:</b> when it dies, reveal its top 2 cards: Heads enter, the rest go to its graveyard.",
      ],
    },
  ],
  es: [
    {
      title: "PREPARACIÓN",
      items: [
        "Baraja el mazo de la Némesis: su biblioteca. La Némesis tiene 20 vidas en un contador.",
        "Cartas iniciales: el Rey de la Juerga y 2 Turbas Ebrias; 2 Cabezas Menores de la Hidra.",
        "Tú: reglas de Magic, 20 vidas, 7 cartas y mulligan. Empiezas tú y no robas ese turno.",
      ],
    },
    {
      title: "TURNO DE LA NÉMESIS",
      items: [
        "Enderezar. Revela su primera carta y lánzala gratis; más solo si una carta lo dice.",
        "Las criaturas entran con mareo de invocación, salvo si tienen prisa.",
        "Hechizos: puedes responder; luego a su cementerio.",
        "Ataca según su mente.",
        "Biblioteca vacía: baraja su cementerio como nueva biblioteca.",
      ],
    },
    {
      title: "MENTE DE LA NÉMESIS",
      items: [
        "<b>Ataca</b> con cada criatura con fuerza que pueda, salvo si podrías bloquearla, matarla y sobrevivir. Manda el texto de la carta.",
        "<b>Bloquea:</b> bloqueo seguro → intercambio → desesperación (solo si es letal).",
        "<b>Objetivo:</b> tu criatura de mayor fuerza sin antimaleficio ni custodia. Ninguna → tú.",
        "Nunca responde ni activa habilidades. Tú tomas sus demás decisiones.",
      ],
    },
    {
      title: "TUS CARTAS CONTRA LA NÉMESIS",
      items: [
        "El daño y la pérdida de vida le quitan vidas; puede ganarlas. Con 0, ganas.",
        "Ignora robar y descartar. <b>A la mano:</b> su carta va encima de su biblioteca.",
        "<b>Muerde:</b> al comienzo de su combate, si está enderezada, te hace 1 de daño.",
        "<b>Rebrota:</b> al morir, revela sus 2 primeras cartas: las Cabezas entran, el resto a su cementerio.",
      ],
    },
  ],
};
