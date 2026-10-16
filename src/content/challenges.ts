import type { CardType, DeckName, PrintedCard } from "./types";

const REWARD = { en: "<b>Hero's Reward</b> — When it leaves the battlefield,", es: "<b>Recompensa del héroe</b> — Al salir del campo de batalla," };
const RELIC = {
  en: "Reveal and cast one more card each Nemesis turn.<br><b>Hero's Reward</b> — When this goes to a graveyard from anywhere,",
  es: "Revela y lanza una carta más por turno.<br><b>Recompensa del héroe</b> — Al ir a un cementerio desde donde sea,",
};
const ATTACKS = { en: "<b>Haste</b>. Attacks each turn if able.", es: "<b>Prisa</b>. Ataca cada turno si puede." };
const ELITE = { en: "<b>Elite</b>.", es: "<b>Élite</b>." };
const HEAD = { en: "<b>Bite</b>, <b>Regrow</b>", es: "<b>Muerde</b>, <b>Rebrota</b>" };
const PASSIVE = { en: "Attacks only when a card says so.", es: "Solo ataca si una carta lo dice." };
const MINOTAUR = { en: "Minotaur", es: "Minotauro" };

function reward(en: string, es: string): { en: string; es: string } {
  return { en: `${REWARD.en} ${en}`, es: `${REWARD.es} ${es}` };
}

function card(type: CardType, en: [string, string, string?], es: [string, string, string?]): PrintedCard {
  return { type, en: { name: en[0], text: en[1], sub: en[2] }, es: { name: es[0], text: es[1], sub: es[2] } };
}

const gain2 = reward("you gain 2 life.", "ganas 2 vidas.");
const gain3 = reward("you gain 3 life.", "ganas 3 vidas.");
const draw = reward("you draw a card.", "robas una carta.");
const gain2Draw = reward("you gain 2 life and draw a card.", "ganas 2 vidas y robas una carta.");
const gain4Draw = reward("you gain 4 life and draw a card.", "ganas 4 vidas y robas una carta.");

export const CHALLENGE_CARDS: Record<string, PrintedCard> = {
  ch_hornbound_raider: card("creature", ["Hornbound Raider", ATTACKS.en, MINOTAUR.en], ["Asaltante Astado", ATTACKS.es, MINOTAUR.es]),
  ch_hornbound_whelp: card("creature", ["Hornbound Whelp", ATTACKS.en, MINOTAUR.en], ["Cachorro Astado", ATTACKS.es, MINOTAUR.es]),
  ch_warlords_chosen: card(
    "creature",
    ["Warlord's Chosen", "Enters tapped. Attacks each turn if able.", MINOTAUR.en],
    ["Elegido del Caudillo", "Entra girado. Ataca cada turno si puede.", MINOTAUR.es],
  ),
  ch_hornbound_reaver: card("creature", ["Hornbound Reaver", ATTACKS.en, MINOTAUR.en], ["Segador Astado", ATTACKS.es, MINOTAUR.es]),
  ch_frenzied_charger: card(
    "creature",
    ["Frenzied Charger", `${ATTACKS.en} At the beginning of the end step, destroy it.`, MINOTAUR.en],
    ["Embestidor Frenético", `${ATTACKS.es} Al comienzo del paso final, destrúyelo.`, MINOTAUR.es],
  ),
  ch_blood_frenzy: card(
    "sorcery",
    ["Blood Frenzy", "Whenever a Minotaur attacks this turn, it gets +2/+0 until end of turn. Destroy it at end of combat."],
    ["Frenesí de Sangre", "Siempre que un Minotauro ataque este turno, obtiene +2/+0 hasta el final del turno. Destrúyelo al final del combate."],
  ),
  ch_hunt_the_weak: card(
    "sorcery",
    ["Hunt the Weak", "Whenever a Minotaur attacks this turn, it gains <b>first strike</b> until end of turn and must be blocked this turn if able."],
    ["Caza al Débil", "Siempre que un Minotauro ataque este turno, gana <b>daña primero</b> hasta el final del turno y debe ser bloqueado este turno si es posible."],
  ),
  ch_storm_of_judgment: card(
    "sorcery",
    ["Storm of Judgment", "At the beginning of combat this turn, deal 3 damage to each creature."],
    ["Tormenta del Juicio", "Al comienzo del combate de este turno, haz 3 puntos de daño a cada criatura."],
  ),
  ch_venom_horns: card(
    "sorcery",
    ["Venom Horns", "Whenever a Minotaur attacks this turn, it gains <b>deathtouch</b> until end of turn."],
    ["Cuernos Venenosos", "Siempre que un Minotauro ataque este turno, gana <b>toque mortal</b> hasta el final del turno."],
  ),
  ch_unbroken_charge: card(
    "sorcery",
    ["Unbroken Charge", "Each Minotaur can't be blocked this turn except by two or more creatures."],
    ["Carga Imparable", "Cada Minotauro no puede ser bloqueado este turno excepto por dos o más criaturas."],
  ),
  ch_war_altar: card("artifact", ["War Altar", `${RELIC.en} the Nemesis sacrifices two Minotaurs.`], ["Altar de Guerra", `${RELIC.es} la Némesis sacrifica dos Minotauros.`]),
  ch_skull_totem: card(
    "artifact",
    ["Skull Totem", `${RELIC.en} mill the Nemesis's top seven cards.`],
    ["Tótem de Calaveras", `${RELIC.es} muele las siete primeras cartas de la Némesis.`],
  ),
  ch_looted_idol: card("artifact", ["Looted Idol", `${RELIC.en} you draw a card.`], ["Ídolo Saqueado", `${RELIC.es} robas una carta.`]),
  ch_spring_draught: card("artifact", ["Spring Draught", `${RELIC.en} you gain 5 life.`], ["Trago de Manantial", `${RELIC.es} ganas 5 vidas.`]),
  ch_war_drums: card(
    "enchantment",
    ["War Drums", "The Nemesis reveals one more card each turn."],
    ["Tambores de Guerra", "La Némesis revela una carta más cada turno."],
  ),
  ch_healing_balm: card(
    "artifact",
    ["Healing Balm", `${RELIC.en} each of you returns a creature card from your graveyard to the battlefield.`],
    ["Bálsamo Curativo", `${RELIC.es} cada uno devuelve una criatura de su cementerio al campo.`],
  ),

  ch_revel_king: card(
    "creature",
    ["The Revel King", `Can't block. ${PASSIVE.en} With 3+ Revelers, the Nemesis reveals one more card each turn.<br>Can't leave the battlefield while there's a Reveler. When it leaves, you win.`, "Enchantment God"],
    ["El Rey de la Juerga", `No puede bloquear. ${PASSIVE.es} Con 3+ Juerguistas, la Némesis revela una carta más por turno.<br>No sale del campo de batalla mientras haya un Juerguista. Si sale, ganas.`, "Dios encantamiento"],
  ),
  ch_crazed_nymph: card(
    "creature",
    ["Crazed Nymph", `Attacks each turn if able while there are five or more Revelers, and only then.<br>${gain3.en}`, "Nymph Reveler"],
    ["Ninfa Enloquecida", `Ataca cada turno si puede mientras haya cinco o más Juerguistas, y solo entonces.<br>${gain3.es}`, "Ninfa Juerguista"],
  ),
  ch_frenzied_piper: card(
    "creature",
    ["Frenzied Piper", `${PASSIVE.en} When it enters, the Revel King attacks this turn if able.<br>${gain2.en}`, "Satyr Reveler"],
    ["Flautista Frenético", `${PASSIVE.es} Cuando entre, el Rey de la Juerga ataca este turno si puede.<br>${gain2.es}`, "Sátiro Juerguista"],
  ),
  ch_wildband_centaur: card(
    "creature",
    ["Wildband Centaur", `${PASSIVE.en}<br>${draw.en}`, "Centaur Reveler"],
    ["Centauro de la Banda Salvaje", `${PASSIVE.es}<br>${draw.es}`, "Centauro Juerguista"],
  ),
  ch_drunken_throng: card(
    "creature",
    ["Drunken Throng", `${PASSIVE.en} When it enters, reveal the Nemesis's top card and cast it. (Not for the starting Throngs.)`, "Human Reveler"],
    ["Turba Ebria", `${PASSIVE.es} Cuando entre, revela la primera carta de la Némesis y lánzala. (No para las Turbas iniciales.)`, "Humano Juerguista"],
  ),
  ch_viper_dancers: card(
    "creature",
    ["Viper Dancers", `<b>Deathtouch</b>. ${PASSIVE.en}<br>${draw.en}`, "Human Reveler"],
    ["Danzantes Víbora", `<b>Toque mortal</b>. ${PASSIVE.es}<br>${draw.es}`, "Humano Juerguista"],
  ),
  ch_howling_maenads: card(
    "creature",
    ["Howling Maenads", `<b>First strike</b>. ${PASSIVE.en}<br>${gain3.en}`, "Human Reveler"],
    ["Ménades Aulladoras", `<b>Daña primero</b>. ${PASSIVE.es}<br>${gain3.es}`, "Humano Juerguista"],
  ),
  ch_reckless_rush: card(
    "sorcery",
    ["Reckless Rush", "At the beginning of combat this turn, all Revelers gain <b>haste</b> until end of turn and attack this combat if able."],
    ["Carrera Temeraria", "Al comienzo del combate de este turno, todos los Juerguistas ganan <b>prisa</b> hasta el final del turno y atacan en este combate si pueden."],
  ),
  ch_wild_smashing: card(
    "sorcery",
    ["Wild Smashing", "You may sacrifice an artifact or enchantment. If you don't, deal 3 damage to you."],
    ["Destrozo Salvaje", "Puedes sacrificar un artefacto o encantamiento. Si no lo haces, te hace 3 puntos de daño."],
  ),
  ch_encore: card(
    "sorcery",
    ["Encore", "Return two Frenzied Pipers from its graveyard to the battlefield. At the beginning of combat this turn, it deals 1 damage to you for each Reveler."],
    ["Bis", "Devuelve dos Flautistas Frenéticos de su cementerio al campo de batalla. Al comienzo del combate de este turno, te hace 1 punto de daño por cada Juerguista."],
  ),
  ch_tear_apart: card(
    "sorcery",
    ["Tear Apart", "At the beginning of combat this turn, each Reveler deals 1 damage to you and to each creature you control."],
    ["Despedazar", "Al comienzo del combate de este turno, cada Juerguista te hace 1 punto de daño a ti y a cada criatura que controlas."],
  ),
  ch_kings_scorn: card(
    "sorcery",
    ["King's Scorn", "The Revel King gains <b>trample</b> until end of turn and attacks this turn if able."],
    ["Desdén del Rey", "El Rey de la Juerga gana <b>arrolla</b> hasta el final del turno y ataca este turno si puede."],
  ),
  ch_kings_strike: card("sorcery", ["King's Strike", "Deal 4 damage to you."], ["Golpe del Rey", "Te hace 4 puntos de daño."]),
  ch_fire_dance: card("enchantment", ["Fire Dance", "Whenever a Reveler attacks, deal 1 damage to you."], ["Danza del Fuego", "Siempre que un Juerguista ataque, te hace 1 punto de daño."]),
  ch_panic_dance: card(
    "enchantment",
    ["Panic Dance", "While there are five or more Revelers on the battlefield, all Revelers have <b>haste</b> and attack each turn if able."],
    ["Danza del Pánico", "Mientras haya cinco o más Juerguistas en el campo de batalla, todos los Juerguistas tienen <b>prisa</b> y atacan cada turno si pueden."],
  ),

  ch_lesser_head: card("creature", ["Lesser Head", `${HEAD.en}<br>${gain2.en}`, "Head"], ["Cabeza Menor", `${HEAD.es}<br>${gain2.es}`, "Cabeza"]),
  ch_brute_head: card("creature", ["Brute Head", `${ELITE.en} ${HEAD.en}<br>${gain2Draw.en}`, "Head"], ["Cabeza Bruta", `${ELITE.es} ${HEAD.es}<br>${gain2Draw.es}`, "Cabeza"]),
  ch_frenzy_head: card(
    "creature",
    ["Frenzy Head", `${ELITE.en} ${HEAD.en}. Its end step: reveal and cast its top card.<br>${gain4Draw.en}`, "Head"],
    ["Cabeza Frenética", `${ELITE.es} ${HEAD.es}. Su paso final: revela y lanza su primera carta.<br>${gain4Draw.es}`, "Cabeza"],
  ),
  ch_screaming_head: card(
    "creature",
    ["Screaming Head", `${ELITE.en} ${HEAD.en}. Its end step: you discard a card.<br>${gain4Draw.en}`, "Head"],
    ["Cabeza Chillona", `${ELITE.es} ${HEAD.es}. Su paso final: descartas una carta.<br>${gain4Draw.es}`, "Cabeza"],
  ),
  ch_fang_head: card(
    "creature",
    ["Fang Head", `${ELITE.en} ${HEAD.en}. Its end step: it deals 1 damage to you.<br>${gain4Draw.en}`, "Head"],
    ["Cabeza Colmillo", `${ELITE.es} ${HEAD.es}. Su paso final: te hace 1 de daño.<br>${gain4Draw.es}`, "Cabeza"],
  ),
  ch_dazing_gaze: card("sorcery", ["Dazing Gaze", "You can't cast spells until the Nemesis's next turn."], ["Mirada Aturdidora", "No puedes lanzar hechizos hasta el próximo turno de la Némesis."]),
  ch_bait_the_beast: card(
    "sorcery",
    ["Bait the Beast", "You may sacrifice a creature. If you do, tap a Head. If you don't, you lose 3 life."],
    ["Cebo para la Bestia", "Puedes sacrificar una criatura. Si lo haces, gira una Cabeza. Si no, pierdes 3 vidas."],
  ),
  ch_regrowth: card(
    "sorcery",
    ["Regrowth", "Put two Lesser Heads from the Nemesis's graveyard onto the battlefield. If you can't, reveal cards from its library until a Head; put it onto the battlefield and the rest into its graveyard."],
    ["Rebrote", "Pon dos Cabezas Menores del cementerio de la Némesis en el campo de batalla. Si no puedes, revela cartas de su biblioteca hasta una Cabeza; ponla en el campo de batalla y el resto en su cementerio."],
  ),
  ch_iron_scales: card(
    "sorcery",
    ["Iron Scales", "Each Head gains <b>indestructible</b> until the end of the Nemesis's next turn."],
    ["Escamas de Hierro", "Cada Cabeza gana <b>indestructible</b> hasta el final del próximo turno de la Némesis."],
  ),
  ch_tangled_necks: card(
    "sorcery",
    ["Tangled Necks", "If there are five or more Heads, tap two of them; they don't untap during the Nemesis's next untap step. Otherwise, reveal the Nemesis's top card and cast it."],
    ["Cuellos Enredados", "Si hay cinco o más Cabezas, gira dos; no se enderezan en el próximo paso de enderezar de la Némesis. Si no, revela la primera carta de la Némesis y lánzala."],
  ),
  ch_toxic_breath: card(
    "sorcery",
    ["Toxic Breath", "Choose one — It deals 5 damage to you; or destroy each tapped creature you control."],
    ["Aliento Tóxico", "Elige uno: te hace 5 puntos de daño; o destruye cada criatura girada que controlas."],
  ),
  ch_weak_spot: card(
    "sorcery",
    ["Weak Spot", "Destroy a Head. If it was Elite, the Nemesis takes an extra turn after this one."],
    ["Punto Débil", "Destruye una Cabeza. Si era Élite, la Némesis juega un turno extra después de este."],
  ),
  ch_swallowed_whole: card(
    "sorcery",
    ["Swallowed Whole", "Exile a creature you control. Until the Nemesis's next turn, when a Head leaves the battlefield, return it to the battlefield."],
    ["Tragado Entero", "Exilia una criatura que controlas. Hasta el próximo turno de la Némesis, cuando una Cabeza salga del campo de batalla, devuélvela al campo de batalla."],
  ),
  ch_divided_fury: card(
    "sorcery",
    ["Divided Fury", "Tap up to two Heads. They don't untap during the Nemesis's next untap step. It deals 5 damage to you."],
    ["Furia Dividida", "Gira hasta dos Cabezas. No se enderezan en el próximo paso de enderezar de la Némesis. Te hace 5 puntos de daño."],
  ),
  ch_all_heads_lunge: card(
    "sorcery",
    ["All-Heads Lunge", "It deals X damage to you, where X is the number of Heads on the battlefield."],
    ["Embestida de Todas las Cabezas", "Te hace X puntos de daño, donde X es el número de Cabezas en el campo de batalla."],
  ),
};

export const CHALLENGE_DECKS: Record<string, DeckName> = {
  stampede: { en: { name: "The Stampede" }, es: { name: "La Estampida" } },
  revel: { en: { name: "The Revel King" }, es: { name: "El Rey de la Juerga" } },
  hydra: { en: { name: "The Hydra" }, es: { name: "La Hidra" } },
};
