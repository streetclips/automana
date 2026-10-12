import type { Color, Palette } from "./types";

export const PALETTES: Record<Color, Palette> = {
  R: { p: "#d8452b", s: "#f2a541", d: "#3d0f05", l: "#ffe9d2", sky1: "#ffcf8a", sky2: "#e8643a" },
  G: { p: "#3c8d3f", s: "#a6d36b", d: "#10301a", l: "#eef8dc", sky1: "#e6f6c8", sky2: "#7cbf6a" },
  W: { p: "#c9a43c", s: "#fff1c4", d: "#5a4720", l: "#fffaf0", sky1: "#fffbe9", sky2: "#f3d98a" },
  U: { p: "#2f6fb5", s: "#7fc4f0", d: "#0b1f3a", l: "#e3f3ff", sky1: "#cfeaff", sky2: "#4b8fd1" },
  B: { p: "#5b3f78", s: "#a98bc9", d: "#120a18", l: "#efe6f7", sky1: "#4a3a5e", sky2: "#1d1426" },
  T: { p: "#9b1f0c", s: "#ff8a3d", d: "#1a0604", l: "#ffd7a8", sky1: "#ff9a52", sky2: "#5a0f05" },
};

export const KANJI: Record<Color, string> = { R: "火", G: "森", W: "光", U: "水", B: "影", T: "魔" };
