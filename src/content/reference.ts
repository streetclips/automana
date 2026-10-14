import type { Reference } from "./types";

export const REFERENCE: Reference = {
  en: [
    {
      title: "YOUR TURN",
      items: [
        "Untap: raise everything. Mana back to 3.",
        "Draw 1 (−1 life). Skip it on turn 1.",
        "Main: cast spells.",
        "Combat.",
        "Second main.",
        "End: damage wears off.",
      ],
    },
    {
      title: "NEMESIS TURN",
      items: [
        "Untap.",
        "Execute the Omen.",
        "Reveal a new Omen (−1 life).",
        "Attack: you block.",
        "End: damage wears off.",
        "Instants any time, with the mana you kept.",
      ],
    },
    {
      title: "NEMESIS MIND",
      items: [
        "<b>Attack</b> with every able creature, unless you could block it, kill it and survive.",
        "<b>Block:</b> safe block → trade → desperation (only if lethal).",
        "<b>Target</b> your highest-power creature (then toughness, then leftmost). None → you.",
        "<b>Overflow:</b> a 5th creature hits you for its power instead.",
      ],
    },
    {
      title: "IN YOUR HANDS",
      items: [
        "<b>Lowered</b> = tapped.",
        "<b>Damage N:</b> N library cards → graveyard.",
        "<b>Gain N:</b> N graveyard cards → library bottom.",
        "<b>Hit the Nemesis N:</b> N cards behind the Omen → Ruin.",
        "<b>Sideways Threat</b> = Counterspell waiting.",
      ],
    },
  ],
  es: [
    {
      title: "TU TURNO",
      items: [
        "Enderezar: levanta todo. El maná vuelve a 3.",
        "Roba 1 (−1 vida). En el turno 1 no robas.",
        "Principal: lanza hechizos.",
        "Combate.",
        "Segunda principal.",
        "Final: el daño desaparece.",
      ],
    },
    {
      title: "TURNO DE LA NÉMESIS",
      items: [
        "Enderezar.",
        "Ejecuta el Presagio.",
        "Revela un nuevo Presagio (−1 vida).",
        "Ataque: tú bloqueas.",
        "Final: el daño desaparece.",
        "Instantáneos cuando quieras, con el maná que guardaste.",
      ],
    },
    {
      title: "MENTE DE LA NÉMESIS",
      items: [
        "<b>Ataca</b> con cada criatura que pueda, salvo si podrías bloquearla, matarla y sobrevivir.",
        "<b>Bloquea:</b> bloqueo seguro → intercambio → desesperación (solo si es letal).",
        "<b>Objetivo:</b> tu criatura de mayor fuerza (luego resistencia, luego la de más a la izquierda). Ninguna → tú.",
        "<b>Desbordamiento:</b> una 5.ª criatura te hace daño igual a su fuerza.",
      ],
    },
    {
      title: "EN TUS MANOS",
      items: [
        "<b>Bajada</b> = girada.",
        "<b>Daño N:</b> N cartas de la biblioteca → cementerio.",
        "<b>Ganar N:</b> N cartas del cementerio → fondo de la biblioteca.",
        "<b>Daño N a la Némesis:</b> N cartas tras el Presagio → Ruina.",
        "<b>Amenaza de lado</b> = Contraconjuro pendiente.",
      ],
    },
  ],
};
