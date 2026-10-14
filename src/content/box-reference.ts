import type { Reference } from "./types";

export const BOX_REFERENCE: Reference = {
  en: [
    {
      title: "SETUP",
      items: [
        "Sort the Threats by tier (I, II, III) and shuffle each pile apart.",
        "Stack them: III at the bottom, then II, then I on top.",
        "Turn the top card face-up: the <b>Omen</b>. The Nemesis has 19 life, its face-down cards; at 0 you win.",
        "You: Magic rules, 20 life, 7 cards and mulligan. You start and skip that draw.",
      ],
    },
    {
      title: "NEMESIS TURN",
      items: [
        "Untap. Execute the Omen; the next card is the new Omen (−1 life).",
        "Creatures enter summoning sick, unless they have haste.",
        "Spells: you may respond; then face-down to the bottom.",
        "Attack by its mind.",
        "<b>Overflow:</b> a 5th creature deals you its power and goes to the bottom.",
      ],
    },
    {
      title: "NEMESIS MIND",
      items: [
        "<b>Attack</b> with every able creature, unless you could block it, kill it and survive.",
        "<b>Block:</b> safe block → trade → desperation (only if lethal).",
        "<b>Target:</b> your highest-power creature without hexproof or ward. None → you.",
        "It never responds or activates abilities.",
        "<b>Counterspell</b> waits sideways and counters your next spell.",
      ],
    },
    {
      title: "YOUR CARDS VS. THE NEMESIS",
      items: [
        "<b>Damage or life loss N:</b> N cards behind the Omen → Ruin.",
        "<b>It discards N:</b> the same.",
        "<b>It gains N life:</b> N Ruin cards → bottom, face-down.",
        "<b>Bounce:</b> its creature becomes the Omen; the old one goes face-down behind it.",
        "<b>Exile:</b> out of the game. Its turn is your opponent's turn.",
      ],
    },
  ],
  es: [
    {
      title: "PREPARACIÓN",
      items: [
        "Separa las Amenazas por nivel (I, II, III) y baraja cada montón aparte.",
        "Apílalos: III abajo, luego II, y I encima.",
        "Pon boca arriba la primera carta: el <b>Presagio</b>. La Némesis tiene 19 vidas, sus cartas boca abajo; con 0, ganas.",
        "Tú: reglas de Magic, 20 vidas, 7 cartas y mulligan. Empiezas tú y no robas ese turno.",
      ],
    },
    {
      title: "TURNO DE LA NÉMESIS",
      items: [
        "Enderezar. Ejecuta el Presagio; la carta siguiente es el nuevo Presagio (−1 vida).",
        "Las criaturas entran con mareo de invocación, salvo si tienen prisa.",
        "Hechizos: puedes responder; luego van boca abajo al fondo.",
        "Ataca según su mente.",
        "<b>Desbordamiento:</b> una 5.ª criatura te hace daño igual a su fuerza y va al fondo.",
      ],
    },
    {
      title: "MENTE DE LA NÉMESIS",
      items: [
        "<b>Ataca</b> con cada criatura que pueda, salvo si podrías bloquearla, matarla y sobrevivir.",
        "<b>Bloquea:</b> bloqueo seguro → intercambio → desesperación (solo si es letal).",
        "<b>Objetivo:</b> tu criatura de mayor fuerza sin antimaleficio ni custodia. Ninguna → tú.",
        "Nunca responde ni activa habilidades.",
        "<b>Contraconjuro</b> espera de lado y contrarresta tu siguiente hechizo.",
      ],
    },
    {
      title: "TUS CARTAS CONTRA LA NÉMESIS",
      items: [
        "<b>Daño o pérdida de N vidas:</b> N cartas tras el Presagio → Ruina.",
        "<b>Descarta N:</b> igual.",
        "<b>Gana N vidas:</b> N cartas de la Ruina → boca abajo al fondo.",
        "<b>A la mano:</b> su criatura pasa a ser el Presagio; el anterior va boca abajo detrás.",
        "<b>Exiliar:</b> fuera de la partida. Su turno es el de tu oponente.",
      ],
    },
  ],
};
