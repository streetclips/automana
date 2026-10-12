import type { ArtStyleId } from "../render/art/styles";
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

export interface ArtOption {
  id: ArtStyleId;
  name: string;
  desc: string;
}

export const ARTS: ArtOption[] = [
  { id: "oil", name: "Óleo épico", desc: "Degradados cálidos, luz de borde y pinceladas suaves. El aspecto de una carta de fantasía clásica." },
  { id: "engraving", name: "Grabado", desc: "Tinta sepia con tramas de líneas, como un grabado en madera de un bestiario antiguo." },
  { id: "stained-glass", name: "Vitral", desc: "Teselas de cristal de colores con plomo negro. Brilla como una vidriera al trasluz." },
  { id: "watercolor", name: "Acuarela", desc: "Manchas húmedas sobre papel, bordes irregulares y salpicaduras. Suave y luminoso." },
  { id: "pixel", name: "Pixel art", desc: "Bloques gruesos y paleta corta, como un juego de 16 bits." },
  { id: "neon", name: "Neón", desc: "Líneas luminosas sobre noche violeta, rejilla en perspectiva y sol a franjas. Retro-futurista." },
  { id: "paper", name: "Papel recortado (elegido)", desc: "Capas de cartulina superpuestas con sombras reales. Cálido y artesanal." },
  { id: "flat", name: "Plano minimal", desc: "Formas planas, sin contornos y con tres colores. Se lee de un vistazo incluso en pequeño." },
  { id: "sumi", name: "Tinta sumi-e", desc: "Pincel japonés: aguadas grises, trazo negro con textura y sello rojo del color." },
  { id: "deco", name: "Art déco", desc: "Oro sobre negro, abanicos de rayos y arcos concéntricos. Lujo de los años veinte." },
];

export const SAMPLE_IDS = [
  "reckless-goblin", "thicket-bear", "ember-bolt", "surge-of-vigor", "luminous-aegis", "mist-hawk", "lethal-whisper", "cinderclaw-brute", "mountain",
];
