const PALETTES = {
  R: { p: "#d8452b", s: "#f2a541", d: "#3d0f05", l: "#ffe9d2", sky1: "#ffcf8a", sky2: "#e8643a" },
  G: { p: "#3c8d3f", s: "#a6d36b", d: "#10301a", l: "#eef8dc", sky1: "#e6f6c8", sky2: "#7cbf6a" },
  W: { p: "#c9a43c", s: "#fff1c4", d: "#5a4720", l: "#fffaf0", sky1: "#fffbe9", sky2: "#f3d98a" },
  U: { p: "#2f6fb5", s: "#7fc4f0", d: "#0b1f3a", l: "#e3f3ff", sky1: "#cfeaff", sky2: "#4b8fd1" },
  B: { p: "#5b3f78", s: "#a98bc9", d: "#120a18", l: "#efe6f7", sky1: "#4a3a5e", sky2: "#1d1426" },
  T: { p: "#9b1f0c", s: "#ff8a3d", d: "#1a0604", l: "#ffd7a8", sky1: "#ff9a52", sky2: "#5a0f05" },
};

const KANJI = { R: "火", G: "森", W: "光", U: "水", B: "影", T: "魔" };

const CARDS = [
  { id: "goblin", name: "Trasgo Temerario", color: "R", cost: ["R"], type: "Criatura", sub: "Trasgo", pt: "2/1",
    text: "<b>Prisa</b>", flavor: "El primero en entrar, el primero en salir, el primero en arder.",
    subject: "goblin", scene: "peaks", tint: "#7fae4e", detail: "#2b1406" },
  { id: "bear", name: "Oso de la Espesura", color: "G", cost: ["1", "G"], type: "Criatura", sub: "Oso", pt: "2/2",
    text: "", flavor: "El bosque no necesita motivos para enfadarse.",
    subject: "bear", scene: "forest", tint: "#8a5a34", detail: "#24140a" },
  { id: "bolt", name: "Descarga de Ascuas", color: "R", cost: ["R"], type: "Instantáneo",
    text: "Hace 3 de daño a una criatura o a la Némesis.", flavor: "Palabras rápidas, sílabas ardientes.",
    subject: "bolt", scene: "storm", tint: "#ffe36b", detail: "#ffffff" },
  { id: "surge", name: "Oleada de Vigor", color: "G", cost: ["G"], type: "Instantáneo",
    text: "Una criatura obtiene +3/+3 hasta el final del turno.", flavor: "Las raíces recuerdan cómo crecer.",
    subject: "sprout", scene: "sun", tint: "#4caf50", detail: "#1f5a24" },
  { id: "aegis", name: "Égida Luminosa", color: "W", cost: ["W"], type: "Instantáneo",
    text: "Previene todo el daño que se haría a una criatura tuya este turno.", flavor: "La luz no golpea: resiste.",
    subject: "shield", scene: "dawn", tint: "#efe8d4", detail: "#d9a520" },
  { id: "hawk", name: "Halcón de Bruma", color: "U", cost: ["1", "U"], type: "Criatura", sub: "Ave", pt: "2/1",
    text: "<b>Volar</b>", flavor: "Ve la tormenta antes de que nazca.",
    subject: "hawk", scene: "sea", tint: "#dce8f3", detail: "#1f3550" },
  { id: "whisper", name: "Susurro Letal", color: "B", cost: ["B"], type: "Instantáneo",
    text: "Una criatura de la Némesis obtiene −2/−2 hasta el final del turno.", flavor: "Basta una palabra al oído.",
    subject: "skull", scene: "crypt", tint: "#efe6d6", detail: "#1a1022" },
  { id: "brute", name: "Bruto Garrascua", color: "T", cost: [], type: "Amenaza · Criatura", sub: "Demonio", pt: "3/2",
    text: "", flavor: "Sus garras todavía humean.", threat: true,
    subject: "demon", scene: "lava", tint: "#b3261e", detail: "#ffd23f" },
  { id: "mountain", name: "Montaña", color: "R", cost: ["R"], type: "Tierra", land: true,
    text: "{T}: Añade {R}.", flavor: "Dorso de todas las cartas de Clan Ascua.",
    subject: "mountain", scene: "sky", tint: "#8a6a55", detail: "#ffffff" },
];

const SUBJECTS = {
  goblin: {
    body: [
      '<polygon points="31,46 3,27 26,64"/>',
      '<polygon points="69,46 97,27 74,64"/>',
      '<ellipse cx="50" cy="57" rx="23" ry="25"/>',
    ],
    detail: [
      '<ellipse cx="41" cy="52" rx="4.5" ry="3"/>',
      '<ellipse cx="59" cy="52" rx="4.5" ry="3"/>',
      '<path d="M37 66 Q50 78 63 66" fill="none" stroke-width="2.6" stroke-linecap="round"/>',
      '<path d="M45 59 L50 63 L55 59" fill="none" stroke-width="2" stroke-linejoin="round"/>',
    ],
  },
  bear: {
    body: [
      '<circle cx="27" cy="31" r="11"/>',
      '<circle cx="73" cy="31" r="11"/>',
      '<ellipse cx="50" cy="56" rx="30" ry="28"/>',
    ],
    detail: [
      '<circle cx="39" cy="50" r="3.4"/>',
      '<circle cx="61" cy="50" r="3.4"/>',
      '<ellipse cx="50" cy="66" rx="13" ry="9.5" fill-opacity=".3"/>',
      '<ellipse cx="50" cy="62" rx="5.5" ry="4"/>',
    ],
  },
  bolt: {
    body: ['<polygon points="60,4 24,54 46,54 36,96 78,40 55,40 68,4"/>'],
    detail: ['<polygon points="58,12 36,48 50,48 44,78 66,46 50,46" fill-opacity=".45"/>'],
  },
  sprout: {
    body: [
      '<rect x="47.5" y="48" width="5" height="44" rx="2"/>',
      '<path d="M50 62 C30 62 18 46 20 30 C38 30 52 42 50 62 Z"/>',
      '<path d="M50 54 C68 52 80 34 78 16 C58 18 46 34 50 54 Z"/>',
    ],
    detail: [
      '<path d="M50 60 C40 52 32 44 26 36" fill="none" stroke-width="1.6"/>',
      '<path d="M51 52 C60 42 68 32 74 22" fill="none" stroke-width="1.6"/>',
    ],
  },
  shield: {
    body: ['<path d="M50 8 L84 21 C84 55 72 78 50 93 C28 78 16 55 16 21 Z"/>'],
    detail: [
      '<circle cx="50" cy="46" r="10"/>',
      '<path d="M50 26 V32 M50 60 V66 M30 46 H36 M64 46 H70 M36 32 L40 36 M64 32 L60 36 M36 60 L40 56 M64 60 L60 56" fill="none" stroke-width="2.4" stroke-linecap="round"/>',
    ],
  },
  hawk: {
    body: [
      '<path d="M50 34 L6 24 L20 40 L6 44 L28 52 L40 58 L44 80 L50 72 L56 80 L60 58 L72 52 L94 44 L80 40 L94 24 Z"/>',
      '<circle cx="50" cy="32" r="8"/>',
    ],
    detail: [
      '<polygon points="50,35 46.5,39 53.5,39"/>',
      '<circle cx="46.5" cy="30" r="1.6"/>',
      '<circle cx="53.5" cy="30" r="1.6"/>',
    ],
  },
  skull: {
    body: ['<path d="M50 12 C29 12 18 27 18 44 C18 56 24 63 31 67 L31 80 L69 80 L69 67 C76 63 82 56 82 44 C82 27 71 12 50 12 Z"/>'],
    detail: [
      '<ellipse cx="38" cy="46" rx="8" ry="9"/>',
      '<ellipse cx="62" cy="46" rx="8" ry="9"/>',
      '<polygon points="50,55 45,64 55,64"/>',
      '<path d="M40 72 V80 M46 72 V80 M54 72 V80 M60 72 V80" fill="none" stroke-width="2"/>',
    ],
  },
  demon: {
    body: [
      '<path d="M33 42 C20 32 16 16 23 4 C27 20 37 28 44 33 Z"/>',
      '<path d="M67 42 C80 32 84 16 77 4 C73 20 63 28 56 33 Z"/>',
      '<path d="M50 30 C32 30 24 44 26 60 C28 76 40 90 50 92 C60 90 72 76 74 60 C76 44 68 30 50 30 Z"/>',
    ],
    detail: [
      '<polygon points="34,52 46,56 44,60 35,57"/>',
      '<polygon points="66,52 54,56 56,60 65,57"/>',
      '<path d="M38 74 L44 80 L50 74 L56 80 L62 74" fill="none" stroke-width="2.4" stroke-linejoin="round"/>',
    ],
  },
  mountain: {
    body: ['<polygon points="4,90 38,26 52,46 64,32 96,90"/>'],
    detail: [
      '<polygon points="38,26 30,41 37,38 43,45 47,40"/>',
      '<polygon points="64,32 59,41 64,39 69,43"/>',
    ],
  },
};

function trees(n, base, h, w, offset) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = offset + (i * 100) / (n - 1);
    out += `<polygon points="${x - w / 2},${base} ${x},${base - h} ${x + w / 2},${base}"/>`;
  }
  return out;
}

function rays(cx, cy, count, r) {
  let out = "";
  for (let k = 0; k < count; k++) {
    const a0 = Math.PI + (k * Math.PI) / count;
    const a1 = a0 + Math.PI / count / 2;
    out += `<polygon points="${cx},${cy} ${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}"/>`;
  }
  return out;
}

const SCENES = {
  peaks: [
    '<polygon points="0,62 14,40 26,54 44,30 62,52 78,36 100,56 100,100 0,100"/>',
    '<polygon points="0,78 18,60 36,74 58,56 78,72 100,60 100,100 0,100"/>',
    '<rect x="0" y="88" width="100" height="12"/>',
  ],
  forest: [
    trees(12, 66, 20, 10, 0) + '<rect x="0" y="64" width="100" height="36"/>',
    trees(7, 84, 30, 16, 0) + '<rect x="0" y="82" width="100" height="18"/>',
    '<rect x="0" y="91" width="100" height="9"/>',
  ],
  storm: [
    '<ellipse cx="18" cy="16" rx="24" ry="11"/><ellipse cx="46" cy="10" rx="22" ry="12"/><ellipse cx="78" cy="16" rx="28" ry="12"/>',
    '<path d="M0 80 Q25 66 50 78 T100 74 V100 H0 Z"/>',
    '<rect x="0" y="90" width="100" height="10"/>',
  ],
  sun: [
    '<circle cx="76" cy="24" r="15"/>',
    '<path d="M0 74 Q30 56 60 70 T100 66 V100 H0 Z"/>',
    '<path d="M0 88 Q50 80 100 88 V100 H0 Z"/>',
  ],
  dawn: [
    rays(50, 100, 9, 140),
    '<path d="M0 80 Q25 70 50 78 T100 76 V100 H0 Z"/>',
    '<rect x="0" y="91" width="100" height="9"/>',
  ],
  sea: [
    '<rect x="0" y="62" width="100" height="38"/>',
    '<path d="M0 72 Q6 68 12 72 T24 72 T36 72 T48 72 T60 72 T72 72 T84 72 T96 72 T108 72 V100 H0 Z"/>',
    '<path d="M0 86 Q8 80 16 86 T32 86 T48 86 T64 86 T80 86 T96 86 T112 86 V100 H0 Z"/>',
  ],
  crypt: [
    '<circle cx="78" cy="18" r="10"/>',
    '<path d="M8 86 V70 Q15 61 22 70 V86 Z"/><path d="M78 86 V66 Q85 57 92 66 V86 Z"/><rect x="62" y="70" width="3" height="16"/><rect x="58" y="74" width="11" height="3"/>',
    '<path d="M0 86 Q50 79 100 86 V100 H0 Z"/>',
  ],
  lava: [
    '<polygon points="8,72 38,30 48,34 58,30 92,72"/>',
    '<path d="M46 34 C44 50 54 60 46 76 C40 88 52 96 50 100 L58 100 C60 92 50 86 56 76 C62 62 52 50 52 34 Z"/>',
    '<path d="M0 86 L14 80 L26 88 L40 82 L44 100 L0 100 Z"/><path d="M60 100 L64 84 L78 80 L90 86 L100 82 L100 100 Z"/>',
  ],
  sky: [
    '<ellipse cx="22" cy="22" rx="16" ry="5.5"/><ellipse cx="78" cy="14" rx="18" ry="5.5"/>',
    '<path d="M0 86 Q20 78 40 84 T80 82 T100 84 V100 H0 Z"/>',
    "",
  ],
};

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

function seeded(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let UID = 0;
function uid() {
  UID += 1;
  return "u" + UID;
}
