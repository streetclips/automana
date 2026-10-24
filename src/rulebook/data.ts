import type { BlockStep, PlayerCreature } from "../box/nemesis/examples";

export interface AttackExample {
  nemesis: string[];
  yours: PlayerCreature[];
  attackers: number[];
}

export interface BlockExample {
  nemesis: string[];
  yours: PlayerCreature[];
  life: number;
  blocks: [blocker: number, attacker: number, step: BlockStep][];
}

export interface TargetExample {
  spell: string;
  yours: PlayerCreature[];
  target: number;
}

export interface NemesisPage {
  difficulty: "normal" | "hard";
  banner: string;
  key: [string, string, string];
}

const BRUTE = "nm_cinderclaw_brute";

export const ATTACK_EXAMPLE: AttackExample = {
  nemesis: [BRUTE, BRUTE, "nm_ember_wyrmling", "nm_scorch_fiend"],
  yours: [{ pt: [4, 4] }],
  attackers: [2, 3],
};

export const BLOCK_EXAMPLES: Record<"safe" | "queenFirst" | "droneFirst" | "atTwenty" | "atFive" | "desperation", BlockExample> = {
  safe: {
    nemesis: ["nm_deathless_knight", "nm_morwens_ghoul"],
    yours: [{ pt: [5, 5] }, { pt: [3, 3] }],
    life: 20,
    blocks: [
      [0, 1, "safe"],
      [1, 0, "trade"],
    ],
  },
  queenFirst: {
    nemesis: ["nm_mantis_queen", "nm_armored_drone"],
    yours: [{ pt: [3, 2] }, { pt: [1, 3] }],
    life: 20,
    blocks: [[0, 0, "safe"]],
  },
  droneFirst: {
    nemesis: ["nm_armored_drone", "nm_mantis_queen"],
    yours: [{ pt: [3, 2] }, { pt: [1, 3] }],
    life: 20,
    blocks: [
      [0, 0, "safe"],
      [1, 1, "safe"],
    ],
  },
  atTwenty: { nemesis: [BRUTE, BRUTE], yours: [{ pt: [5, 5] }], life: 20, blocks: [] },
  atFive: { nemesis: [BRUTE, BRUTE], yours: [{ pt: [5, 5] }], life: 5, blocks: [[0, 0, "desperation"]] },
  desperation: {
    nemesis: ["ch_lesser_head", "ch_lesser_head", "ch_fang_head"],
    yours: [{ pt: [4, 4] }, { pt: [3, 3] }, { pt: [2, 2] }],
    life: 6,
    blocks: [
      [0, 0, "desperation"],
      [1, 1, "desperation"],
      [2, 2, "desperation"],
    ],
  },
};

export const TARGET_EXAMPLE: TargetExample = {
  spell: "nm_withering_touch",
  yours: [{ pt: [2, 2] }, { pt: [4, 4], keywords: ["hexproof"] }, { pt: [3, 3] }],
  target: 2,
};

export const NEMESIS_PAGES: Record<string, NemesisPage> = {
  vorthrax: { difficulty: "normal", banner: "nm_tyrants_roar", key: ["nm_scorch_fiend", "nm_ember_wyrmling", "nm_cinder_rebirth"] },
  vaskara: { difficulty: "normal", banner: "nm_brood", key: ["nm_egg_laying", "nm_pheromones", "nm_mantis_queen"] },
  morwen: { difficulty: "hard", banner: "nm_uprising", key: ["nm_morwens_ghoul", "nm_exhume", "nm_crypt_horror"] },
  "mirror-archmage": { difficulty: "hard", banner: "nm_mind_theft", key: ["nm_counterspell", "nm_mass_illusion", "nm_refraction_golem"] },
  stampede: { difficulty: "hard", banner: "ch_unbroken_charge", key: ["ch_warlords_chosen", "ch_storm_of_judgment", "ch_war_drums"] },
  revel: { difficulty: "normal", banner: "ch_fire_dance", key: ["ch_revel_king", "ch_reckless_rush", "ch_kings_strike"] },
  hydra: { difficulty: "hard", banner: "ch_all_heads_lunge", key: ["ch_lesser_head", "ch_toxic_breath", "ch_dazing_gaze"] },
};

export const COVER_CARDS = ["nm_scorch_fiend", "ch_frenzy_head", "nm_deathless_knight", "ch_revel_king", "nm_fragile_illusion", "nm_mantis_queen", "ch_warlords_chosen"];

export const VIGNETTES = { game: "nm_searing_breath", yourTurn: "ch_weak_spot", glossary: "nm_guardian_sphinx", faq: "nm_tide_serpent", nemeses: "ch_hunt_the_weak" };

export interface TurnExample {
  nemesis: string[];
  hand: string[];
  yours: PlayerCreature[];
  attackers: number[];
  without: number[];
  life: number;
}

export const TURN_EXAMPLE: TurnExample = {
  nemesis: [BRUTE, "nm_ash_imp"],
  hand: ["nm_tyrants_roar"],
  yours: [{ pt: [4, 4] }, { pt: [2, 2] }],
  attackers: [0, 1],
  without: [1],
  life: 12,
};
