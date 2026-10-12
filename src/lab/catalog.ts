import type { Skin } from "../render/card";

export interface SkinOption {
  skin: Skin;
  name: string;
  desc: string;
}

export const SKINS: SkinOption[] = [
  { skin: "f1", name: "Pergamino clásico", desc: "La evolución del diseño original: marco de color, pergamino e índice lateral. Familiar y legible." },
  { skin: "f2", name: "Índice audaz", desc: "Franja de color con el coste total en grande. Pensado para leerse en abanico, a un dedo de distancia." },
  { skin: "f3", name: "Arte completo", desc: "La ilustración ocupa toda la carta; el texto flota sobre cristal esmerilado." },
  { skin: "f4", name: "Art déco", desc: "Negro y oro, ventana octogonal y tipografía de cartel de los años veinte." },
  { skin: "f5", name: "Códice iluminado", desc: "Manuscrito medieval: arco en la ventana, capitular de color y florones en las esquinas." },
  { skin: "f6", name: "Suizo minimal", desc: "Blanco, rejilla estricta y Helvetica. Moderno, limpio y muy fácil de imprimir." },
  { skin: "f7", name: "Tarot", desc: "Ventana en arco, cinta con el nombre y número romano. Místico y elegante." },
  { skin: "f8", name: "Vitral gótico", desc: "Arco ojival, plomo oscuro y panel de texto como un cristal tintado." },
  { skin: "f9", name: "Holo foil", desc: "Borde iridiscente y brillo de carta especial. Fantasía con aire tecnológico." },
  { skin: "f10", name: "Cómic pulp", desc: "Contornos gruesos, trama de puntos, estallido para la fuerza y bocadillo de texto." },
  { skin: "palm", name: "Palmwalker (elegido)", desc: "D3 + franja lateral de D2: arte a sangre, panel de cristal y una franja de color con coste y fuerza bien visibles." },
];

export const SAMPLE_IDS = [
  "reckless-goblin", "thicket-bear", "ember-bolt", "surge-of-vigor", "luminous-aegis", "mist-hawk", "lethal-whisper", "cinderclaw-brute", "mountain",
];
