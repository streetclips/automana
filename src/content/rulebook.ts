import type { Locale, RulebookText } from "./types";

export const RULEBOOK: Record<Locale, RulebookText> = {
  en: {
    title: "Rulebook",
    tagline: "Seven Nemeses to fight alone with the Magic: The Gathering Foundations Beginner Box",
    facts: "1 player · 7 Nemeses · games of about 8 rounds",
    welcome: {
      title: "Welcome",
      intro: [
        "Automana turns the Foundations Beginner Box into a solo game. You play Magic as usual, with two of the box's decks. Across the table sits a Nemesis: a deck that plays itself.",
        "The Nemesis has no hand, no lands and no mana. Each turn it reveals its top card and casts it for free. Then it attacks and blocks by a few fixed rules: its mind. Bring its 20 life to 0 before it does the same to you.",
      ],
      need: {
        title: "What you need",
        items: [
          "The Automana cards: the rules card and the seven Nemesis decks.",
          "Two of the ten decks of the Beginner Box, shuffled together: 40 cards.",
          "A way to count 20 life for you and 20 for the Nemesis: dice, counters or paper.",
          "The box's tokens and counters, for the cards that make them.",
        ],
      },
      contents: "Contents",
    },
    game: {
      title: "How a game works",
      intro: "You take the first turn. Then you and the Nemesis take turns until one of you wins.",
      you: { title: "Your turn", items: ["Untap", "Draw", "Play a land, cast spells", "Attack: it blocks by its mind", "End"] },
      it: { title: "Its turn", items: ["Untap", "Reveal its top card and cast it for free", "Attack by its mind: you block", "End"] },
      win: { title: "You win", items: ["Its life reaches 0.", "A card says you win: the Revel King leaves the battlefield."] },
      lose: { title: "You lose", items: ["Your life reaches 0.", "You must draw from an empty library."] },
      run: {
        title: "You run the Nemesis",
        text: "The Nemesis can't move its own cards: you reveal them, cast them, and attack and block with them by the rules in this book. Everything it does is public and follows fixed rules, so you always know what it will do. When a rule leaves a choice open, you make it.",
      },
    },
    setup: {
      title: "Setup",
      steps: [
        "Choose a Nemesis. Take out its starting cards: the Revel King and 2 Drunken Throngs, or 2 of the Hydra's Lesser Heads. The other five start with none.",
        "Put its starting cards on its battlefield, in a row. Shuffle the rest face down: that is its library.",
        "Set its life to 20, and yours too.",
        "Shuffle your 40 cards and draw 7. You may mulligan as in Magic.",
        "You take the first turn and skip its draw.",
      ],
      row: {
        title: "Its row",
        text: "Its creatures stand in one row, in the order they arrive: the oldest at the left, each new one at the right end. A tapped creature keeps its place; when one leaves, close the gap. Its other permanents go above the row. The row sets the order of its blocks (page {p:blocks}).",
      },
      table: {
        nemesis: "The Nemesis",
        you: "You",
        library: "Library",
        graveyard: "Graveyard",
        life: "Life",
        permanents: "Artifacts, enchantments, reminders",
        row: "Its creatures, in a row",
        oldest: "oldest",
        newest: "newest",
        hand: "Hand",
        lands: "Lands",
        creatures: "Creatures",
      },
    },
    threats: {
      title: "The Threat cards",
      intro: "Every card of a Nemesis deck is a Threat: a Magic card with a few marks of its own.",
      parts: [
        "<b>Name.</b>",
        "<b>Threat burst,</b> where Magic shows the mana cost: the Nemesis pays nothing.",
        "<b>Type line:</b> creature, spell, sorcery, artifact or enchantment, as in Magic.",
        "<b>Nemesis symbol:</b> the deck it belongs to.",
        "<b>Rules text.</b> “You” means you, the player; “it” means the Nemesis.",
        "<b>Power and toughness.</b>",
        "<b>Number and code:</b> 12/20 is card 12 of a 20-card deck; VOR is Vorthrax.",
      ],
      symbols: "The seven decks",
      reference: {
        title: "The rules card",
        text: "The rules card sums up this book. Face A: setup and its turn. Face B: its mind and your cards against it.",
      },
    },
    yourTurn: {
      title: "Your turn",
      intro: "You play Magic with its normal rules. The Nemesis is your opponent: your cards that say “opponent” or “target player” can point at it.",
      head: ["When your card…", "against the Nemesis"],
      rows: [
        ["deals damage or makes it lose life", "its life goes down. It can gain life too, even above 20."],
        ["makes it draw or discard", "nothing happens: it has no hand."],
        ["returns its permanent to a hand", "put the card on top of its library: it comes back next turn."],
        ["destroys, exiles, taps or counters", "it works as in Magic. Its creatures are cast as spells, so you can counter them."],
        ["says “during an opponent's turn”", "that is the Nemesis turn."],
      ],
      never: {
        title: "It never answers",
        text: "The Nemesis never responds to your spells and never activates abilities. During your turn, only what its cards say happens: a waiting Counterspell, a Refraction Golem.",
      },
      attack: "When you attack, it blocks by its mind: see page {p:blocks}.",
    },
    itsTurn: {
      title: "The Nemesis turn",
      intro: "You play its turn for it, step by step.",
      steps: [
        { title: "Untap", text: "Untap its permanents." },
        {
          title: "Reveal",
          text: "In its draw step, turn its top card face up. In its main phase, cast it for free. It reveals more only when a card says so: War Drums, the Stampede's artifacts, the Revel King with three Revelers.",
        },
        {
          title: "Combat",
          text: "Beginning-of-combat effects come first, such as Bite. Then it attacks by its mind (page {p:attacks}) and you block as in Magic.",
        },
        { title: "End", text: "End-step effects happen, such as the Frenzied Charger's. Damage wears off." },
      ],
      cast: {
        title: "The card it casts",
        items: [
          "<b>Creature:</b> it enters at the right end of its row. It can't attack this turn unless it has haste.",
          "<b>Spell or sorcery:</b> it goes on the stack and you may respond. Then it goes to its graveyard.",
          "<b>Artifact or enchantment:</b> it enters above its row.",
          "<b>Revealed by another card:</b> cast it as soon as the stack is empty during its turn.",
        ],
      },
      empty: {
        title: "Empty library",
        text: "When it must reveal a card and its library is empty, shuffle its graveyard: that is its new library.",
      },
      example: {
        title: "Example",
        text: "Vorthrax reveals Vorthrax's Herald and casts it. The Herald enters at the right end of its row and deals 1 damage to you. It has summoning sickness: it won't attack this turn.",
      },
    },
    attacks: {
      title: "Its mind: attacks",
      intro: "The Nemesis doesn't plan. Its mind is a few fixed rules, and they are public: you can always tell what it will do.",
      rules: [
        "<b>Card text first.</b> A creature that “attacks each turn if able” attacks. One that “attacks only when a card says so” stays home unless a card says so.",
        "<b>Every other creature attacks</b> if it can: untapped, without summoning sickness and with power above 0…",
        "<b>…unless you could stop it:</b> you have an untapped creature that could block it alone, kill it and survive.",
      ],
      abilities: "To check, compare the two creatures as they are on the battlefield: power, toughness, damage already marked, flying and reach, first strike, deathtouch, indestructible. A creature that one creature alone can't block always attacks.",
      key: {
        title: "Each of its creatures is checked alone",
        text: "One of your creatures can keep several of its creatures home, even though it could block only one of them.",
      },
      example: {
        title: "Example",
        setup: "Vorthrax has two Cinderclaw Brutes (3/3), an Ember Wyrmling (2/3, flying) and a Scorch Fiend (4/4, trample). You have one untapped 4/4.",
        steps: [
          "Stays: your 4/4 would kill it and survive.",
          "Stays too: your 4/4 is checked again for each one.",
          "Attacks: your 4/4 can't block a flier.",
          "Attacks: your 4/4 would kill it, but die too.",
        ],
      },
    },
    blocks: {
      title: "Its mind: blocks",
      intro: "When you attack, the Nemesis blocks in three steps. It doesn't guess your instants: it looks only at the battlefield.",
      lineUp: {
        title: "First, line up",
        items: [
          "<b>Its blockers:</b> its untapped creatures, in the order of its row, from the left.",
          "<b>Your attackers:</b> strongest first. Strongest means highest power, then highest toughness. If two still tie, you choose.",
        ],
      },
      steps: [
        { title: "Safe block", text: "Going along its row from the left, each blocker blocks your strongest unblocked attacker that it can kill and survive." },
        { title: "Trade", text: "Going along its row again, each blocker still free blocks your strongest unblocked attacker that it can kill, even if it dies too." },
        {
          title: "Desperation",
          text: "Add up the damage of your unblocked attackers, trample included. Only if it would bring its life to 0, each blocker still free blocks your strongest unblocked attacker that it can block, even without killing it.",
        },
      ],
      always: {
        title: "Always",
        items: [
          "<b>One blocker per attacker.</b> It never puts two creatures in front of one attacker, even if together they would kill it.",
          "<b>Except menace:</b> one creature can't block an attacker with menace, so it is blocked only in desperation, by two.",
          "<b>Kill and survive</b> compare one blocker with one attacker: power, toughness, damage already marked, first strike, deathtouch, indestructible.",
          "<b>A blocker that can't block an attacker,</b> such as a flier, skips it and looks at the next one.",
          "<b>In desperation it blocks with every creature it can,</b> not just with enough to survive.",
        ],
      },
      examples: "Four worked examples follow, on pages {p:examples} to {p:desperation}.",
    },
    examples: {
      title: "Block examples",
      safe: {
        title: "Safe block and trade",
        setup: "Morwen has a Deathless Knight (3/6, lifelink) and, to its right, a Morwen's Ghoul (3/4, deathtouch). You attack with a 5/5 and a 3/3.",
        steps: [
          "<b>Safe block.</b> The Knight can't kill your 5/5, but it kills the 3/3 and survives: it blocks the 3/3. The Ghoul would kill the 5/5 but die: not safe.",
          "<b>Trade.</b> The Ghoul blocks the 5/5. Both die.",
          "<b>Desperation.</b> Nothing gets through: no need.",
        ],
      },
      order: {
        title: "Why the row matters",
        setup: "Vaskara has a Mantis Queen (3/6) and an Armored Drone (2/4). You attack with a 3/2 and a 1/3. Your 3/2 is the strongest.",
        steps: [
          "<b>The Queen is older.</b> She takes your 3/2. The Drone can't kill the 1/3, so it gets through.",
          "<b>The Drone is older.</b> It takes the 3/2: it deals 2, enough, and survives 3. The Queen takes the 1/3.",
          "Same creatures, different blocks. That is why each new creature goes to the right end of its row.",
        ],
      },
      double: {
        title: "Never two blockers",
        setup: "Vorthrax has two Cinderclaw Brutes (3/3). You attack with a 5/5.",
        steps: [
          "<b>At 20 life.</b> Neither Brute can kill your 5/5 alone, so neither blocks, though together they would kill it. It takes 5 damage.",
          "<b>At 5 life.</b> Your 5 damage would be lethal: desperation. The left Brute blocks. The other stays out: one blocker per attacker.",
        ],
      },
      desperation: {
        title: "Desperation",
        setup: "The Hydra is at 6 life, with two Lesser Heads (0/2) and a Fang Head (0/4). You attack with a 4/4, a 3/3 and a 2/2: 9 damage.",
        steps: [
          "<b>Safe block and trade.</b> Heads have no power: they can't kill anything, so they don't block yet.",
          "<b>Desperation.</b> 9 damage would be lethal, so every Head blocks, from the left, your strongest attacker still free. It takes no damage, though blocking the 4/4 alone would have kept it alive.",
          "The Lesser Heads die: each one Regrows, and you get its Hero's Reward.",
        ],
      },
    },
    walkthrough: {
      title: "A turn, step by step",
      setup: "Vorthrax has a Cinderclaw Brute (3/3) and an Ash Imp (1/3, flying), both ready to attack. You have an untapped 4/4 and 2/2, and 12 life.",
      steps: [
        "<b>Untap.</b> Nothing to untap.",
        "<b>Reveal:</b> Tyrant's Roar. You may respond; you don't. Its creatures get +1/+0 until end of turn: the Brute is a 4/3, the Imp a 2/3. The Roar goes to its graveyard.",
        "<b>Who attacks?</b> Your 4/4 would kill the Brute, but the Brute now deals 4: your 4/4 wouldn't survive. The Brute attacks. Nothing of yours can block the flying Imp: it attacks.",
        "<b>You block</b> as you like: your 4/4 blocks the Brute and both die. The Imp deals 2 damage to you: 10 life.",
        "<b>End.</b> The +1/+0 wears off.",
      ],
      moral: "Without Tyrant's Roar, your 4/4 would have kept the Brute home.",
    },
    targets: {
      title: "Targets and choices",
      rule: "When a Nemesis card targets one of your creatures, it takes your <b>highest-power creature</b> it can target: it skips creatures with hexproof or ward. On a tie, the higher toughness; if still tied, you choose. With no creature to target, the card hits you, as its text says.",
      timing: "It chooses as it casts the spell. If the target is gone or protected when the spell resolves, the spell does nothing and goes to its graveyard.",
      example: {
        title: "Example",
        setup: "Withering Touch gives −2/−2 to your highest-power creature. You have a 2/2, a 4/4 with hexproof and a 3/3.",
        steps: ["It skips the 4/4 and shrinks the 3/3."],
      },
      choices: {
        title: "Other choices",
        items: [
          "<b>It never responds</b> to your spells and <b>never activates abilities.</b>",
          "<b>A choice its card gives to “you”</b> is yours: Toxic Breath, Bait the Beast, Wild Smashing.",
          "<b>Any other choice it must make,</b> such as which Heads to tap, is yours too.",
          "<b>“At random”</b> (Mind Theft, Rebound): shuffle your hand face down and take a card without looking.",
        ],
      },
    },
    glossary: {
      title: "Glossary",
      entries: [
        ["Attacks each turn if able", "It attacks whenever it can, whatever its mind says."],
        ["Attacks only when a card says so", "It stays home unless a card sends it in: Reckless Rush, King's Scorn, Frenzied Piper, Panic Dance."],
        ["Bite", "Heads. At the beginning of its combat, each untapped Head deals 1 damage to you."],
        ["Counter reminder", "Counterspell waits on its battlefield. It counters the next spell you cast, as you cast it, then goes to its graveyard. Effects of casting, such as prowess, still happen."],
        ["Elite", "A stronger Head, with an ability in its end step. If Weak Spot destroys an Elite Head, the Nemesis takes an extra turn."],
        ["Hero's Reward", "Your reward when the card leaves the battlefield (Heads, Revelers) or goes to a graveyard (the Stampede's artifacts)."],
        ["Minotaur, Reveler, Head", "Creature types that other cards count or pump."],
        ["Regrow", "Heads. When a Head dies, reveal its top 2 cards: the Heads enter the battlefield, the rest go to its graveyard."],
        ["Reveal", "Turn its top card face up. A revealed card is cast for free, unless a card says otherwise."],
        ["Reveal one more card", "War Drums, the Stampede's artifacts and the Revel King with three Revelers: one more card each Nemesis turn, for each."],
        ["Row", "Its creatures, oldest at the left. It blocks in this order."],
        ["Threat", "Any card of a Nemesis deck. The burst where the mana cost would be means it costs nothing."],
      ],
    },
    faq: {
      title: "Questions and answers",
      items: [
        ["Two of its creatures could kill my attacker together. Do they block it together?", "No. It never blocks one attacker with two creatures. Only an attacker with menace gets two blockers, and only in desperation."],
        ["Which of its creatures blocks first?", "The oldest: the leftmost of its row. Each takes the strongest attacker it can; the next one looks at what is left."],
        ["In desperation, does it block only what it needs to survive?", "No. Every free creature blocks, even if fewer blocks would have kept it alive."],
        ["My 4/4 keeps two of its 3/3s home, but it could block only one. Is that right?", "Yes. It checks each of its creatures alone against yours."],
        ["Does it know my instants?", "No. It looks only at the battlefield."],
        ["Can a creature that just entered block?", "Yes. Summoning sickness only stops attacking."],
        ["Two of my attackers have the same power and toughness. Which is the strongest?", "You choose."],
        ["When does it decide to attack?", "In its declare attackers step, against your untapped creatures at that moment."],
        ["Its creature would return to its hand.", "It has no hand: put the card on top of its library. It comes back next turn."],
        ["Can I respond to the card it reveals?", "Yes. It casts it as a spell, so you can respond, and even counter it: then it goes to its graveyard."],
        ["Does a waiting Counterspell stop my land?", "No. Playing a land isn't casting a spell."],
        ["Does it lose when its library runs out?", "No. When it must reveal and its library is empty, shuffle its graveyard: that is its new library."],
      ],
    },
    nemeses: {
      title: "The seven Nemeses",
      intro: "Four Nemeses are Automana's own, with 20 cards each. The other three are inspired by the Challenge Decks that Wizards of the Coast made for Theros, and are bigger. All seven play by the rules in this book: their cards give each one its character.",
      head: ["Nemesis", "Cards", "Starts with", "Difficulty"],
      normal: "Normal",
      hard: "Hard",
      start: "New to Automana? Start with Vorthrax: simple cards and a fair fight.",
    },
    profile: {
      cards: "Cards",
      starts: "Starts with",
      nothing: "Nothing",
      difficulty: "Difficulty",
      watch: "Watch out for",
      key: "Key cards",
    },
    profiles: {
      vorthrax: {
        plays: "A volcano of demons, dragons and elementals. Vorthrax keeps up the pressure: fliers you can't block, a Scorch Fiend that tramples over chump blockers, and Searing Breath for your best creature. Its cards are simple: the best first Nemesis.",
        watch: [
          "<b>Searing Breath:</b> 2 damage to your highest-power creature.",
          "<b>Tyrant's Roar:</b> +1/+0 for its creatures this turn. Stronger, more of them attack.",
          "<b>Cinder Rebirth:</b> its highest-power creature comes back from its graveyard.",
        ],
      },
      vaskara: {
        plays: "A hive that never stops growing. Her insects are tough rather than strong: walls of 2/4 and 3/6 that block your attackers and kill them. Egg Laying and Brood put creatures straight onto the battlefield, and Pheromones or the Mantis Queen pump the whole swarm for one big attack.",
        watch: [
          "<b>Brood and Egg Laying:</b> one card becomes up to two creatures.",
          "<b>Pheromones:</b> +1/+1 for its creatures this turn. <b>Mantis Queen:</b> +1/+0 for the others as she enters.",
          "<b>Ravenous Larvae:</b> lifelink gives her life back.",
        ],
      },
      morwen: {
        plays: "The Lich Queen's dead don't stay dead. Exhume and Uprising bring back her strongest creatures, Wandering Skeletons go to the bottom of her library to return later, and lifelink and Soul Drain give her back the life you take. Withering Touch and Plague shrink your creatures.",
        watch: [
          "<b>Morwen's Ghouls:</b> deathtouch kills whatever blocks them or they block.",
          "<b>Exhume and Uprising:</b> the creatures you kill come back.",
          "<b>Lifelink:</b> Vampire Bats, Deathless Knights and Crypt Horrors heal her.",
        ],
      },
      "mirror-archmage": {
        plays: "The Archmage fights with tricks. Counterspell waits to counter your next spell, Rebound sends your best creature back to your hand, Mass Illusion taps all your creatures so its army attacks freely, and Mind Theft takes a card from your hand. Its fliers hit hard.",
        watch: [
          "<b>Counterspell:</b> your next spell is countered.",
          "<b>Mass Illusion:</b> with your creatures tapped, all of its creatures attack and you can't block.",
          "<b>Refraction Golem:</b> your first spell each turn costs 1 more.",
        ],
      },
      stampede: {
        plays: "A horde of Minotaurs with haste that attack every turn, whatever its mind says. Its sorceries make each attack worse: Blood Frenzy, Hunt the Weak, Venom Horns, Unbroken Charge. Its artifacts and War Drums reveal extra cards each turn.",
        special: {
          title: "Hero's Rewards",
          text: "When one of its artifacts goes to a graveyard from anywhere, even from its library, you get the reward written on it.",
        },
        watch: [
          "<b>Storm of Judgment:</b> 3 damage to each creature, on both sides, at the beginning of combat.",
          "<b>War Drums and its artifacts:</b> one more card each turn, each.",
          "<b>Warlord's Chosen:</b> a 5/4 that enters tapped and attacks from its next turn.",
        ],
      },
      revel: {
        plays: "A god of wine and his endless party. The Revel King can't block, and he and his Revelers stay home until a card sends them in. With three or more Revelers he reveals one more card each turn, and King's Strike deals 4 damage straight to you.",
        special: {
          title: "The King's victory",
          text: "The King can't leave the battlefield while there's a Reveler. When he leaves, you win, whatever its life.",
        },
        watch: [
          "<b>Three Revelers:</b> one more card each turn.",
          "<b>Reckless Rush:</b> all Revelers gain haste and attack.",
          "<b>King's Strike:</b> 4 damage to you. Five copies.",
        ],
      },
      hydra: {
        plays: "A beast with many heads, and they grow back. Heads have no power: they never attack and, when they block, kill nothing. They bite instead. Its sorceries do the rest: Toxic Breath, Divided Fury, All-Heads Lunge.",
        special: {
          title: "Bite and Regrow",
          text: "At the beginning of its combat, each untapped Head deals 1 damage to you. When a Head dies, reveal its top 2 cards: the Heads among them enter the battlefield.",
        },
        watch: [
          "<b>Bite:</b> 1 damage per untapped Head, every turn.",
          "<b>Toxic Breath:</b> 5 damage to you, or your tapped creatures die. You choose.",
          "<b>Dazing Gaze:</b> no spells until its next turn.",
        ],
      },
    },
    decks: {
      title: "Deck lists",
      intro: "Check each deck after printing. Every card shows its number in its bottom left corner: 12/20 is card 12 of 20.",
      starts: "starts on the battlefield",
    },
    credits: {
      title: "Credits",
      lines: [
        "Automana rulebook, version 0.3, October 2026.",
        "The Stampede, the Revel King and the Hydra are inspired by the Theros Challenge Decks by Wizards of the Coast.",
        "Card illustrations made with AI image models.",
      ],
      legal: "Automana is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.",
    },
    quick: {
      title: "Quick reference",
      sections: [
        {
          title: "Its turn",
          items: [
            "Untap.",
            "Reveal its top card and cast it for free. More only when a card says so.",
            "Combat: it attacks by its mind; you block.",
            "End.",
            "Empty library: shuffle its graveyard into a new one.",
          ],
        },
        {
          title: "It attacks",
          items: [
            "Card text first.",
            "With every creature that can, unless one of your untapped creatures could block it alone, kill it and survive. Each one is checked alone.",
          ],
        },
        {
          title: "It blocks",
          items: [
            "Its row from the left; your strongest attacker first.",
            "<b>1 · Safe block:</b> it kills and survives.",
            "<b>2 · Trade:</b> it kills.",
            "<b>3 · Desperation,</b> only if your attack is lethal: every free creature blocks.",
            "One blocker per attacker. Menace: two, only in desperation.",
          ],
        },
        {
          title: "Targets and choices",
          items: [
            "Your highest-power creature without hexproof or ward. None: you.",
            "It never responds or activates abilities. You make its other choices.",
          ],
        },
        {
          title: "Your cards against it",
          items: [
            "Damage and life loss lower its life.",
            "Draw and discard: nothing happens.",
            "Back to its hand: on top of its library.",
          ],
        },
      ],
    },
    diagram: {
      you: "You",
      life: "Life",
      damage: "{n} damage",
      attacks: "Attacks",
      stays: "Stays home",
      target: "Target",
      skipped: "Skipped",
      hexproof: "Hexproof",
    },
  },
  es: {
    title: "Reglamento",
    tagline: "Siete Némesis para jugar en solitario con la Beginner Box de Magic: The Gathering Foundations",
    facts: "1 jugador · 7 Némesis · partidas de unas 8 rondas",
    welcome: {
      title: "Bienvenida",
      intro: [
        "Automana convierte la Beginner Box de Foundations en un juego en solitario. Tú juegas a Magic como siempre, con dos mazos de la caja. Al otro lado de la mesa está la Némesis: un mazo que se juega solo.",
        "La Némesis no tiene mano, ni tierras, ni maná. Cada turno revela su primera carta y la lanza gratis. Después ataca y bloquea con unas pocas reglas fijas: su mente. Baja sus 20 vidas a 0 antes de que ella te lo haga a ti.",
      ],
      need: {
        title: "Qué necesitas",
        items: [
          "Las cartas de Automana: la carta de reglas y los siete mazos de Némesis.",
          "Dos de los diez mazos de la Beginner Box, barajados juntos: 40 cartas.",
          "Algo para contar 20 vidas tuyas y 20 de la Némesis: dados, contadores o papel.",
          "Las fichas y los contadores de la caja, para las cartas que los crean.",
        ],
      },
      contents: "Índice",
    },
    game: {
      title: "Cómo se juega una partida",
      intro: "Empiezas tú. Después, tú y la Némesis os turnáis hasta que una de las dos partes gana.",
      you: { title: "Tu turno", items: ["Enderezar", "Robar", "Jugar una tierra, lanzar hechizos", "Atacar: bloquea según su mente", "Final"] },
      it: { title: "Su turno", items: ["Enderezar", "Revelar su primera carta y lanzarla gratis", "Atacar según su mente: tú bloqueas", "Final"] },
      win: { title: "Ganas si", items: ["Sus vidas llegan a 0.", "Una carta dice que ganas: el Rey de la Juerga sale del campo de batalla."] },
      lose: { title: "Pierdes si", items: ["Tus vidas llegan a 0.", "Tienes que robar de una biblioteca vacía."] },
      run: {
        title: "Tú mueves a la Némesis",
        text: "La Némesis no puede mover sus cartas: tú las revelas, las lanzas y atacas y bloqueas con ellas según las reglas de este libro. Todo lo que hace es público y sigue reglas fijas, así que siempre sabes qué hará. Cuando una regla deja una decisión abierta, la tomas tú.",
      },
    },
    setup: {
      title: "Preparación",
      steps: [
        "Elige una Némesis. Saca sus cartas iniciales: el Rey de la Juerga y 2 Turbas Ebrias, o 2 Cabezas Menores de la Hidra. Las otras cinco no tienen.",
        "Pon sus cartas iniciales en su campo de batalla, en fila. Baraja el resto boca abajo: es su biblioteca.",
        "Pon sus vidas a 20, y las tuyas también.",
        "Baraja tus 40 cartas y roba 7. Puedes hacer mulligan como en Magic.",
        "Empiezas tú y no robas en ese turno.",
      ],
      row: {
        title: "Su fila",
        text: "Sus criaturas forman una fila, por orden de llegada: la más antigua a la izquierda y cada nueva al final, a la derecha. Una criatura girada no pierde su sitio; si una se va, cierra el hueco. Sus otros permanentes van encima de la fila. La fila marca el orden de sus bloqueos (página {p:blocks}).",
      },
      table: {
        nemesis: "La Némesis",
        you: "Tú",
        library: "Biblioteca",
        graveyard: "Cementerio",
        life: "Vidas",
        permanents: "Artefactos, encantamientos, recordatorios",
        row: "Sus criaturas, en fila",
        oldest: "más antigua",
        newest: "más nueva",
        hand: "Mano",
        lands: "Tierras",
        creatures: "Criaturas",
      },
    },
    threats: {
      title: "Las cartas de Amenaza",
      intro: "Cada carta de un mazo de Némesis es una Amenaza: una carta de Magic con unas pocas marcas propias.",
      parts: [
        "<b>Nombre.</b>",
        "<b>Estallido de Amenaza,</b> donde Magic pone el coste de maná: la Némesis no paga nada.",
        "<b>Línea de tipo:</b> criatura, hechizo, conjuro, artefacto o encantamiento, como en Magic.",
        "<b>Símbolo de la Némesis:</b> el mazo al que pertenece.",
        "<b>Texto de reglas.</b> «Tú» eres tú, el jugador; «la Némesis» es ella.",
        "<b>Fuerza y resistencia.</b>",
        "<b>Número y código:</b> 12/20 es la carta 12 de un mazo de 20; VOR es Vorthrax.",
      ],
      symbols: "Los siete mazos",
      reference: {
        title: "La carta de reglas",
        text: "La carta de reglas resume este libro. Cara A: preparación y su turno. Cara B: su mente y tus cartas contra ella.",
      },
    },
    yourTurn: {
      title: "Tu turno",
      intro: "Juegas a Magic con sus reglas de siempre. La Némesis es tu oponente: tus cartas que dicen «oponente» o «jugador objetivo» pueden apuntarla a ella.",
      head: ["Cuando tu carta…", "contra la Némesis"],
      rows: [
        ["hace daño o le hace perder vidas", "sus vidas bajan. También puede ganarlas, incluso por encima de 20."],
        ["le hace robar o descartar", "no pasa nada: no tiene mano."],
        ["devuelve su permanente a una mano", "pon la carta encima de su biblioteca: vuelve el turno siguiente."],
        ["destruye, exilia, gira o contrarresta", "funciona como en Magic. Sus criaturas se lanzan como hechizos, así que puedes contrarrestarlas."],
        ["dice «durante el turno de un oponente»", "es el turno de la Némesis."],
      ],
      never: {
        title: "Nunca contesta",
        text: "La Némesis nunca responde a tus hechizos ni activa habilidades. En tu turno solo pasa lo que dicen sus cartas: un Contraconjuro que espera, un Gólem de Refracción.",
      },
      attack: "Cuando atacas, bloquea según su mente: mira la página {p:blocks}.",
    },
    itsTurn: {
      title: "El turno de la Némesis",
      intro: "Juegas su turno por ella, paso a paso.",
      steps: [
        { title: "Enderezar", text: "Endereza sus permanentes." },
        {
          title: "Revelar",
          text: "En su paso de robar, pon boca arriba su primera carta. En su fase principal, lánzala gratis. Solo revela más si una carta lo dice: Tambores de Guerra, los artefactos de la Estampida, el Rey de la Juerga con tres Juerguistas.",
        },
        {
          title: "Combate",
          text: "Primero, los efectos del inicio del combate, como Muerde. Después ataca según su mente (página {p:attacks}) y tú bloqueas como en Magic.",
        },
        { title: "Final", text: "Pasan los efectos del paso final, como el del Embestidor Frenético. El daño desaparece." },
      ],
      cast: {
        title: "La carta que lanza",
        items: [
          "<b>Criatura:</b> entra al final de su fila, a la derecha. No puede atacar este turno, salvo si tiene prisa.",
          "<b>Hechizo o conjuro:</b> va a la pila y puedes responder. Después va a su cementerio.",
          "<b>Artefacto o encantamiento:</b> entra encima de su fila.",
          "<b>Revelada por otra carta:</b> lánzala en cuanto la pila esté vacía durante su turno.",
        ],
      },
      empty: {
        title: "Biblioteca vacía",
        text: "Si tiene que revelar y su biblioteca está vacía, baraja su cementerio: es su nueva biblioteca.",
      },
      example: {
        title: "Ejemplo",
        text: "Vorthrax revela el Heraldo de Vorthrax y lo lanza. El Heraldo entra al final de su fila y te hace 1 de daño. Tiene mareo de invocación: no atacará este turno.",
      },
    },
    attacks: {
      title: "Su mente: ataques",
      intro: "La Némesis no planea. Su mente son unas pocas reglas fijas, y son públicas: siempre puedes saber qué hará.",
      rules: [
        "<b>Primero, el texto de la carta.</b> Una criatura que «ataca cada turno si puede» ataca. Una que «solo ataca si una carta lo dice» se queda en casa, salvo si una carta lo dice.",
        "<b>Las demás criaturas atacan</b> si pueden: enderezadas, sin mareo de invocación y con fuerza mayor que 0…",
        "<b>…salvo si puedes pararlas:</b> tienes una criatura enderezada que podría bloquearla sola, matarla y sobrevivir.",
      ],
      abilities: "Para comprobarlo, compara las dos criaturas tal como están en el campo de batalla: fuerza, resistencia, daño ya marcado, vuela y alcance, daña primero, toque mortal, indestructible. Una criatura que no puede bloquear una sola criatura ataca siempre.",
      key: {
        title: "Cada criatura suya se comprueba sola",
        text: "Una sola criatura tuya puede dejar en casa a varias de las suyas, aunque solo pudiera bloquear a una.",
      },
      example: {
        title: "Ejemplo",
        setup: "Vorthrax tiene dos Brutos Garrascua (3/3), un Dragoncillo de Ascuas (2/3, vuela) y un Demonio Abrasador (4/4, arrolla). Tú tienes un 4/4 enderezado.",
        steps: [
          "Se queda: tu 4/4 lo mataría y sobreviviría.",
          "También se queda: tu 4/4 se comprueba otra vez con cada uno.",
          "Ataca: tu 4/4 no puede bloquear a un volador.",
          "Ataca: tu 4/4 lo mataría, pero también moriría.",
        ],
      },
    },
    blocks: {
      title: "Su mente: bloqueos",
      intro: "Cuando atacas, la Némesis bloquea en tres pasos. No adivina tus instantáneos: solo mira el campo de batalla.",
      lineUp: {
        title: "Antes, ordena",
        items: [
          "<b>Sus bloqueadores:</b> sus criaturas enderezadas, en el orden de su fila, desde la izquierda.",
          "<b>Tus atacantes:</b> el más fuerte primero. Más fuerte es más fuerza, y después más resistencia. Si dos siguen empatados, eliges tú.",
        ],
      },
      steps: [
        { title: "Bloqueo seguro", text: "Recorriendo su fila desde la izquierda, cada bloqueador bloquea a tu atacante sin bloquear más fuerte que pueda matar sobreviviendo." },
        { title: "Intercambio", text: "Recorriendo su fila otra vez, cada bloqueador aún libre bloquea a tu atacante sin bloquear más fuerte que pueda matar, aunque muera también." },
        {
          title: "Desesperación",
          text: "Suma el daño de tus atacantes sin bloquear, con el de arrollar. Solo si bajaría sus vidas a 0, cada bloqueador aún libre bloquea a tu atacante sin bloquear más fuerte que pueda bloquear, aunque no lo mate.",
        },
      ],
      always: {
        title: "Siempre",
        items: [
          "<b>Un bloqueador por atacante.</b> Nunca pone dos criaturas delante de un atacante, aunque juntas lo matarían.",
          "<b>Salvo la habilidad amenaza:</b> una sola criatura no puede bloquear a un atacante con amenaza, así que solo lo bloquea en desesperación, con dos.",
          "<b>Matar y sobrevivir</b> comparan un bloqueador con un atacante: fuerza, resistencia, daño ya marcado, daña primero, toque mortal, indestructible.",
          "<b>Un bloqueador que no puede bloquear a un atacante,</b> como un volador, se lo salta y mira el siguiente.",
          "<b>En desesperación bloquea con todas las criaturas que puede,</b> no solo con las justas para sobrevivir.",
        ],
      },
      examples: "A continuación, cuatro ejemplos resueltos, de la página {p:examples} a la {p:desperation}.",
    },
    examples: {
      title: "Ejemplos de bloqueo",
      safe: {
        title: "Bloqueo seguro e intercambio",
        setup: "Morwen tiene un Caballero Sin Muerte (3/6, vínculo vital) y, a su derecha, un Necrófago de Morwen (3/4, toque mortal). Atacas con un 5/5 y un 3/3.",
        steps: [
          "<b>Bloqueo seguro.</b> El Caballero no puede matar a tu 5/5, pero mata al 3/3 y sobrevive: bloquea al 3/3. El Necrófago mataría al 5/5, pero moriría: no es seguro.",
          "<b>Intercambio.</b> El Necrófago bloquea al 5/5. Mueren los dos.",
          "<b>Desesperación.</b> No pasa nada: no hace falta.",
        ],
      },
      order: {
        title: "Por qué importa la fila",
        setup: "Vaskara tiene una Mantis Reina (3/6) y un Zángano Acorazado (2/4). Atacas con un 3/2 y un 1/3. Tu 3/2 es el más fuerte.",
        steps: [
          "<b>La Reina es más antigua.</b> Se queda con tu 3/2. El Zángano no puede matar al 1/3, así que pasa.",
          "<b>El Zángano es más antiguo.</b> Se queda con el 3/2: le hace 2, suficiente, y aguanta 3. La Reina se queda con el 1/3.",
          "Mismas criaturas, otros bloqueos. Por eso cada criatura nueva va al final de su fila, a la derecha.",
        ],
      },
      double: {
        title: "Nunca dos bloqueadores",
        setup: "Vorthrax tiene dos Brutos Garrascua (3/3). Atacas con un 5/5.",
        steps: [
          "<b>Con 20 vidas.</b> Ningún Bruto puede matar solo a tu 5/5, así que ninguno bloquea, aunque juntos lo matarían. Recibe 5 de daño.",
          "<b>Con 5 vidas.</b> Tus 5 de daño serían letales: desesperación. Bloquea el Bruto de la izquierda. El otro se queda fuera: un bloqueador por atacante.",
        ],
      },
      desperation: {
        title: "Desesperación",
        setup: "La Hidra tiene 6 vidas, dos Cabezas Menores (0/2) y una Cabeza Colmillo (0/4). Atacas con un 4/4, un 3/3 y un 2/2: 9 de daño.",
        steps: [
          "<b>Bloqueo seguro e intercambio.</b> Las Cabezas no tienen fuerza: no matan nada, así que todavía no bloquean.",
          "<b>Desesperación.</b> 9 de daño serían letales, así que cada Cabeza bloquea, desde la izquierda, a tu atacante libre más fuerte. No recibe daño, aunque bloqueando solo al 4/4 habría sobrevivido.",
          "Las Cabezas Menores mueren: cada una rebrota y tú recibes su Recompensa del héroe.",
        ],
      },
    },
    walkthrough: {
      title: "Un turno, paso a paso",
      setup: "Vorthrax tiene un Bruto Garrascua (3/3) y un Diablillo de Ceniza (1/3, vuela), listos para atacar. Tú tienes un 4/4 y un 2/2 enderezados, y 12 vidas.",
      steps: [
        "<b>Enderezar.</b> No hay nada que enderezar.",
        "<b>Revelar:</b> Rugido del Tirano. Puedes responder; no lo haces. Sus criaturas obtienen +1/+0 hasta el final del turno: el Bruto es un 4/3 y el Diablillo un 2/3. El Rugido va a su cementerio.",
        "<b>¿Quién ataca?</b> Tu 4/4 mataría al Bruto, pero ahora el Bruto hace 4: tu 4/4 no sobreviviría. El Bruto ataca. Nada tuyo puede bloquear al Diablillo, que vuela: ataca.",
        "<b>Bloqueas</b> como quieras: tu 4/4 bloquea al Bruto y mueren los dos. El Diablillo te hace 2 de daño: te quedas con 10.",
        "<b>Final.</b> El +1/+0 desaparece.",
      ],
      moral: "Sin el Rugido del Tirano, tu 4/4 habría dejado al Bruto en casa.",
    },
    targets: {
      title: "Objetivos y decisiones",
      rule: "Cuando una carta de la Némesis tiene como objetivo una de tus criaturas, elige <b>tu criatura de mayor fuerza</b> que pueda ser objetivo: se salta las que tienen antimaleficio o custodia. Si empatan, la de más resistencia; si siguen empatadas, eliges tú. Si no hay ninguna, la carta te alcanza a ti, como dice su texto.",
      timing: "Elige al lanzar el hechizo. Si al resolverse el objetivo ya no está o está protegido, el hechizo no hace nada y va a su cementerio.",
      example: {
        title: "Ejemplo",
        setup: "Toque Marchito da −2/−2 a tu criatura de mayor fuerza. Tienes un 2/2, un 4/4 con antimaleficio y un 3/3.",
        steps: ["Se salta el 4/4 y encoge al 3/3."],
      },
      choices: {
        title: "Otras decisiones",
        items: [
          "<b>Nunca responde</b> a tus hechizos y <b>nunca activa habilidades.</b>",
          "<b>Una decisión que su carta te da a «ti»</b> es tuya: Aliento Tóxico, Cebo para la Bestia, Destrozo Salvaje.",
          "<b>Cualquier otra decisión que deba tomar,</b> como qué Cabezas girar, también es tuya.",
          "<b>«Al azar»</b> (Robo de Mente, Rebote): baraja tu mano boca abajo y coge una carta sin mirar.",
        ],
      },
    },
    glossary: {
      title: "Glosario",
      entries: [
        ["Amenaza", "Cualquier carta de un mazo de Némesis. El estallido donde iría el coste de maná indica que no cuesta nada."],
        ["Ataca cada turno si puede", "Ataca siempre que puede, diga lo que diga su mente."],
        ["Élite", "Una Cabeza más fuerte, con una habilidad en su paso final. Si Punto Débil destruye una Cabeza Élite, la Némesis juega un turno extra."],
        ["Fila", "Sus criaturas, la más antigua a la izquierda. Bloquea en este orden."],
        ["Minotauro, Juerguista, Cabeza", "Tipos de criatura que otras cartas cuentan o refuerzan."],
        ["Muerde", "Cabezas. Al comienzo de su combate, cada Cabeza enderezada te hace 1 de daño."],
        ["Rebrota", "Cabezas. Cuando una Cabeza muere, revela sus 2 primeras cartas: las Cabezas entran en el campo de batalla y el resto va a su cementerio."],
        ["Recompensa del héroe", "Tu premio cuando la carta sale del campo de batalla (Cabezas, Juerguistas) o va a un cementerio (los artefactos de la Estampida)."],
        ["Recordatorio de contraconjuro", "El Contraconjuro espera en su campo de batalla. Contrarresta el próximo hechizo que lances, al lanzarlo, y después va a su cementerio. Los efectos de lanzar, como destreza, siguen ocurriendo."],
        ["Revelar", "Poner boca arriba su primera carta. Una carta revelada se lanza gratis, salvo si una carta dice otra cosa."],
        ["Revela una carta más", "Tambores de Guerra, los artefactos de la Estampida y el Rey de la Juerga con tres Juerguistas: una carta más por turno de la Némesis, por cada uno."],
        ["Solo ataca si una carta lo dice", "Se queda en casa salvo si una carta la manda atacar: Carrera Temeraria, Desdén del Rey, Flautista Frenético, Danza del Pánico."],
      ],
    },
    faq: {
      title: "Preguntas y respuestas",
      items: [
        ["Dos criaturas suyas podrían matar juntas a mi atacante. ¿Lo bloquean juntas?", "No. Nunca bloquea a un atacante con dos criaturas. Solo un atacante con la habilidad amenaza recibe dos bloqueadores, y solo en desesperación."],
        ["¿Qué criatura suya bloquea primero?", "La más antigua: la de la izquierda de su fila. Cada una se queda con el atacante más fuerte que puede; la siguiente mira lo que queda."],
        ["En desesperación, ¿bloquea solo lo justo para sobrevivir?", "No. Bloquean todas sus criaturas libres, aunque con menos bloqueos habría sobrevivido."],
        ["Mi 4/4 deja en casa a dos 3/3 suyos, pero solo podría bloquear a uno. ¿Es correcto?", "Sí. Comprueba cada criatura suya sola contra las tuyas."],
        ["¿Conoce mis instantáneos?", "No. Solo mira el campo de batalla."],
        ["¿Puede bloquear una criatura que acaba de entrar?", "Sí. El mareo de invocación solo impide atacar."],
        ["Dos atacantes míos tienen la misma fuerza y resistencia. ¿Cuál es el más fuerte?", "Eliges tú."],
        ["¿Cuándo decide atacar?", "En su paso de declarar atacantes, contra tus criaturas enderezadas en ese momento."],
        ["Su criatura volvería a su mano.", "No tiene mano: pon la carta encima de su biblioteca. Vuelve el turno siguiente."],
        ["¿Puedo responder a la carta que revela?", "Sí. La lanza como un hechizo, así que puedes responder, e incluso contrarrestarla: entonces va a su cementerio."],
        ["¿Un Contraconjuro que espera detiene mi tierra?", "No. Jugar una tierra no es lanzar un hechizo."],
        ["¿Pierde si se queda sin biblioteca?", "No. Si tiene que revelar y su biblioteca está vacía, baraja su cementerio: es su nueva biblioteca."],
      ],
    },
    nemeses: {
      title: "Las siete Némesis",
      intro: "Cuatro Némesis son propias de Automana, con 20 cartas cada una. Las otras tres se inspiran en los Challenge Decks que Wizards of the Coast hizo para Theros, y son más grandes. Las siete juegan con las reglas de este libro: sus cartas le dan a cada una su carácter.",
      head: ["Némesis", "Cartas", "Empieza con", "Dificultad"],
      normal: "Normal",
      hard: "Difícil",
      start: "¿Primera vez? Empieza con Vorthrax: cartas sencillas y una pelea justa.",
    },
    profile: {
      cards: "Cartas",
      starts: "Empieza con",
      nothing: "Nada",
      difficulty: "Dificultad",
      watch: "Cuidado con",
      key: "Cartas clave",
    },
    profiles: {
      vorthrax: {
        plays: "Un volcán de demonios, dragones y elementales. Vorthrax no afloja: voladores que no puedes bloquear, un Demonio Abrasador que arrolla a quien se ponga delante y Aliento Abrasador para tu mejor criatura. Sus cartas son sencillas: la mejor Némesis para empezar.",
        watch: [
          "<b>Aliento Abrasador:</b> 2 de daño a tu criatura de mayor fuerza.",
          "<b>Rugido del Tirano:</b> +1/+0 para sus criaturas este turno. Con más fuerza, atacan más.",
          "<b>Renacer de Ceniza:</b> vuelve su criatura de mayor fuerza del cementerio.",
        ],
      },
      vaskara: {
        plays: "Una colmena que no deja de crecer. Sus insectos son más duros que fuertes: muros de 2/4 y 3/6 que bloquean a tus atacantes y los matan. Puesta de Huevos y Nidada meten criaturas directamente en el campo de batalla, y Feromonas o la Mantis Reina refuerzan a todo el enjambre para un gran ataque.",
        watch: [
          "<b>Nidada y Puesta de Huevos:</b> una carta se convierte hasta en dos criaturas.",
          "<b>Feromonas:</b> +1/+1 para sus criaturas este turno. <b>Mantis Reina:</b> +1/+0 para las demás al entrar.",
          "<b>Larvas Voraces:</b> el vínculo vital le devuelve vidas.",
        ],
      },
      morwen: {
        plays: "Los muertos de la Reina Liche no se quedan muertos. Exhumar y Levantamiento devuelven sus criaturas más fuertes, los Esqueletos Errantes van al fondo de su biblioteca para volver más tarde, y el vínculo vital y Drenar Alma le devuelven las vidas que le quitas. Toque Marchito y Plaga encogen a tus criaturas.",
        watch: [
          "<b>Necrófagos de Morwen:</b> el toque mortal mata a quien los bloquea o al que bloquean.",
          "<b>Exhumar y Levantamiento:</b> las criaturas que matas vuelven.",
          "<b>Vínculo vital:</b> los Murciélagos Vampiro, los Caballeros Sin Muerte y los Horrores de la Cripta la curan.",
        ],
      },
      "mirror-archmage": {
        plays: "El Archimago pelea con trucos. Contraconjuro espera para contrarrestar tu próximo hechizo, Rebote devuelve tu mejor criatura a tu mano, Ilusión Masiva gira todas tus criaturas para que su ejército ataque sin miedo y Robo de Mente te quita una carta de la mano. Sus voladores pegan fuerte.",
        watch: [
          "<b>Contraconjuro:</b> tu próximo hechizo es contrarrestado.",
          "<b>Ilusión Masiva:</b> con tus criaturas giradas, atacan todas las suyas y no puedes bloquear.",
          "<b>Gólem de Refracción:</b> tu primer hechizo de cada turno cuesta 1 más.",
        ],
      },
      stampede: {
        plays: "Una horda de Minotauros con prisa que atacan cada turno, diga lo que diga su mente. Sus conjuros empeoran cada ataque: Frenesí de Sangre, Caza al Débil, Cuernos Venenosos, Carga Imparable. Sus artefactos y los Tambores de Guerra revelan cartas extra cada turno.",
        special: {
          title: "Recompensas del héroe",
          text: "Cuando uno de sus artefactos va a un cementerio desde donde sea, incluso desde su biblioteca, recibes el premio que lleva escrito.",
        },
        watch: [
          "<b>Tormenta del Juicio:</b> 3 de daño a cada criatura, de los dos bandos, al comienzo del combate.",
          "<b>Tambores de Guerra y sus artefactos:</b> una carta más por turno, cada uno.",
          "<b>Elegido del Caudillo:</b> un 5/4 que entra girado y ataca desde su siguiente turno.",
        ],
      },
      revel: {
        plays: "Un dios del vino y su fiesta sin fin. El Rey de la Juerga no puede bloquear, y él y sus Juerguistas se quedan en casa hasta que una carta los manda atacar. Con tres o más Juerguistas revela una carta más cada turno, y Golpe del Rey te hace 4 de daño directamente.",
        special: {
          title: "La victoria del Rey",
          text: "El Rey no sale del campo de batalla mientras haya un Juerguista. Si sale, ganas, tenga las vidas que tenga.",
        },
        watch: [
          "<b>Tres Juerguistas:</b> una carta más cada turno.",
          "<b>Carrera Temeraria:</b> todos los Juerguistas ganan prisa y atacan.",
          "<b>Golpe del Rey:</b> 4 de daño. Tiene cinco copias.",
        ],
      },
      hydra: {
        plays: "Una bestia de muchas cabezas que vuelven a crecer. Las Cabezas no tienen fuerza: nunca atacan y, cuando bloquean, no matan nada. En su lugar, muerden. Sus conjuros hacen el resto: Aliento Tóxico, Furia Dividida, Embestida de Todas las Cabezas.",
        special: {
          title: "Muerde y Rebrota",
          text: "Al comienzo de su combate, cada Cabeza enderezada te hace 1 de daño. Cuando una Cabeza muere, revela sus 2 primeras cartas: las Cabezas que salgan entran en el campo de batalla.",
        },
        watch: [
          "<b>Muerde:</b> 1 de daño por cada Cabeza enderezada, cada turno.",
          "<b>Aliento Tóxico:</b> 5 de daño, o mueren tus criaturas giradas. Eliges tú.",
          "<b>Mirada Aturdidora:</b> no puedes lanzar hechizos hasta su próximo turno.",
        ],
      },
    },
    decks: {
      title: "Listas de mazos",
      intro: "Comprueba cada mazo después de imprimirlo. Cada carta lleva su número en la esquina inferior izquierda: 12/20 es la carta 12 de 20.",
      starts: "empieza en el campo de batalla",
    },
    credits: {
      title: "Créditos",
      lines: [
        "Reglamento de Automana, versión 0.3, octubre de 2026.",
        "La Estampida, el Rey de la Juerga y la Hidra se inspiran en los Challenge Decks de Theros de Wizards of the Coast.",
        "Ilustraciones de las cartas hechas con modelos de imagen de IA.",
      ],
      legal: "Automana es contenido de fans no oficial, permitido por la Fan Content Policy. No está aprobado ni respaldado por Wizards. Partes de los materiales usados son propiedad de Wizards of the Coast. ©Wizards of the Coast LLC.",
    },
    quick: {
      title: "Referencia rápida",
      sections: [
        {
          title: "Su turno",
          items: [
            "Enderezar.",
            "Revela su primera carta y lánzala gratis. Más solo si una carta lo dice.",
            "Combate: ataca según su mente; tú bloqueas.",
            "Final.",
            "Biblioteca vacía: baraja su cementerio como nueva biblioteca.",
          ],
        },
        {
          title: "Ataca",
          items: [
            "Primero, el texto de la carta.",
            "Con cada criatura que pueda, salvo si una criatura tuya enderezada podría bloquearla sola, matarla y sobrevivir. Cada una se comprueba sola.",
          ],
        },
        {
          title: "Bloquea",
          items: [
            "Su fila desde la izquierda; tu atacante más fuerte primero.",
            "<b>1 · Bloqueo seguro:</b> mata y sobrevive.",
            "<b>2 · Intercambio:</b> mata.",
            "<b>3 · Desesperación,</b> solo si tu ataque es letal: bloquean todas sus criaturas libres.",
            "Un bloqueador por atacante. Amenaza: dos, solo en desesperación.",
          ],
        },
        {
          title: "Objetivos y decisiones",
          items: [
            "Tu criatura de mayor fuerza sin antimaleficio ni custodia. Ninguna: tú.",
            "Nunca responde ni activa habilidades. Tú tomas sus demás decisiones.",
          ],
        },
        {
          title: "Tus cartas contra ella",
          items: [
            "El daño y la pérdida de vida le quitan vidas.",
            "Robar y descartar: no pasa nada.",
            "A su mano: encima de su biblioteca.",
          ],
        },
      ],
    },
    diagram: {
      you: "Tú",
      life: "Vidas",
      damage: "{n} de daño",
      attacks: "Ataca",
      stays: "Se queda",
      target: "Objetivo",
      skipped: "Se la salta",
      hexproof: "Antimaleficio",
    },
  },
};
