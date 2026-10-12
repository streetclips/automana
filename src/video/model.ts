export type Tone = "" | "bad" | "good";
export type Tag = string | [string, Tone];

export interface CreatureSlot {
  name: string;
  low: boolean;
  label: string;
  lowText: string;
}

export interface LandSlot {
  k: "M" | "F";
  low: boolean;
}

export interface BoardState {
  rnd: number;
  who: "you" | "nem";
  step: string | null;
  phase: 1 | 2;
  you: number;
  vor: number;
  kael: number;
  omen: string | null;
  grave: number;
  ruin: number;
  nem: CreatureSlot[];
  yours: CreatureSlot[];
  lands: LandSlot[];
  hand: string[];
}

export interface Overlay {
  hl: string[];
  tags: Record<string, Tag>;
  deltas: Record<string, string>;
  banner: string | null;
}

export type SceneId = "title" | "goal" | "faces" | "life" | "hold" | "turn" | "mind" | "kael" | "debrief" | "end";

export type Beat =
  | { kind: "scene"; scene: SceneId; k: number; say: string; sub: string }
  | { kind: "board"; state: BoardState & Overlay; say: string; sub: string };

export type BeatChanges = Partial<BoardState> & Partial<Overlay>;

const BASE: BoardState = {
  rnd: 0, who: "you", step: null, phase: 1, you: 20, vor: 14, kael: 1, omen: "Bruto Garrascua", grave: 0, ruin: 0,
  nem: [], yours: [], lands: [], hand: ["Trasgo Temerario", "Oso de la Espesura", "Oleada de Vigor", "Cuernochoque Ancestral"],
};

export function C(name: string, low = false, label = "", lowText = "↓ bajada"): CreatureSlot {
  return { name, low, label, lowText };
}

export function L(k: "M" | "F", low = false): LandSlot {
  return { k, low };
}

export class Script {
  readonly beats: Beat[] = [];
  private state: BoardState = structuredClone(BASE);

  scene(scene: SceneId, k: number, say: string): void {
    this.beats.push({ kind: "scene", scene, k, say, sub: say });
  }

  beat(say: string, changes: BeatChanges = {}): void {
    const { hl = [], tags = {}, deltas = {}, banner = null, ...board } = changes;
    Object.assign(this.state, board);
    this.beats.push({ kind: "board", state: { ...structuredClone(this.state), hl, tags, deltas, banner }, say, sub: say });
  }
}
