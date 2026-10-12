const FRAMES = [
  { name: "Pergamino clásico", desc: "La evolución del diseño actual: marco de color, pergamino e índice lateral. Familiar y legible." },
  { name: "Índice audaz", desc: "Franja de color con el coste total en grande. Pensado para leerse en abanico, a un dedo de distancia." },
  { name: "Arte completo", desc: "La ilustración ocupa toda la carta; el texto flota sobre cristal esmerilado." },
  { name: "Art déco", desc: "Negro y oro, ventana octogonal y tipografía de cartel de los años veinte." },
  { name: "Códice iluminado", desc: "Manuscrito medieval: arco en la ventana, capitular de color y florones en las esquinas." },
  { name: "Suizo minimal", desc: "Blanco, rejilla estricta y Helvetica. Moderno, limpio y muy fácil de imprimir." },
  { name: "Tarot", desc: "Ventana en arco, cinta con el nombre y número romano. Místico y elegante." },
  { name: "Vitral gótico", desc: "Arco ojival, plomo oscuro y panel de texto como un cristal tintado." },
  { name: "Holo foil", desc: "Borde iridiscente y brillo de carta especial. Fantasía con aire tecnológico." },
  { name: "Cómic pulp", desc: "Contornos gruesos, trama de puntos, estallido para la fuerza y bocadillo de texto." },
];

const GLYPHS = { "Criatura": "⚔", "Instantáneo": "ϟ", "Conjuro": "✶", "Aura": "◈", "Tierra": "▲" };
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function pipHtml(sym) {
  if (sym === "T") return '<span class="pip pip-T">↓</span>';
  return /^\d$/.test(sym) ? `<span class="pip pip-N">${sym}</span>` : `<span class="pip pip-${sym}"></span>`;
}

function richText(text) {
  return text.replace(/\{([0-9RGWUBT])\}/g, (_, s) => pipHtml(s));
}

function renderCard(card, f, a) {
  const cost = card.threat ? '<span class="pip pip-X">✹</span>' : card.cost.map(pipHtml).join("");
  const cmc = card.land ? "▲" : card.threat ? "—" : card.cost.reduce((n, c) => n + (/^\d$/.test(c) ? Number(c) : 1), 0);
  const glyph = card.threat ? "✹" : GLYPHS[card.type] || "✶";
  const typeline = card.type + (card.sub ? ` — ${card.sub}` : "");
  const cls = [`pw-card`, `f${f + 1}`, `col-${card.color}`, card.pt ? "" : "no-pt", card.flavor ? "" : "no-flavor"].join(" ");
  const num = ROMAN[CARDS.indexOf(card)] || "";
  return `<div class="${cls}">
    <div class="c-deco"><i>❦</i><i>❦</i><i>❦</i><i>❦</i></div>
    <div class="c-art">${ART_STYLES[a].render(card)}</div>
    <div class="c-index"><div class="c-cmc">${cmc}</div><div class="c-cost">${cost}</div><div class="c-glyph">${glyph}</div><div class="c-ipt">${card.pt || ""}</div></div>
    <div class="c-name"><span>${card.name}</span></div>
    <div class="c-num">${num}</div>
    <div class="c-type">${typeline}</div>
    <div class="c-text"><p class="c-rules">${richText(card.text || "&nbsp;")}</p><p class="c-flavor">${card.flavor || ""}</p></div>
    <div class="c-pt"><span>${card.pt || ""}</span></div>
  </div>`;
}

const byId = (id) => CARDS.find((c) => c.id === id);
const state = { f: 0, a: 0, matrixCard: "goblin" };

function readHash() {
  const m = location.hash.match(/^#f(\d+)a(\d+)$/);
  if (m) {
    state.f = Math.min(9, Math.max(0, Number(m[1]) - 1));
    state.a = Math.min(9, Math.max(0, Number(m[2]) - 1));
  }
}

function buildFrames() {
  const el = document.getElementById("frames");
  el.innerHTML = FRAMES.map((fr, i) => `
    <div class="tile">
      <div class="tile-head"><span class="badge">D${i + 1}</span><h3>${fr.name}</h3></div>
      <p>${fr.desc}</p>
      <div class="pair">${renderCard(byId("goblin"), i, 0)}${renderCard(byId("aegis"), i, 0)}</div>
      <button class="pick" data-f="${i}">Probar este diseño en el combinador</button>
    </div>`).join("");
  hydratePixels(el);
}

function buildArts() {
  const el = document.getElementById("arts");
  el.innerHTML = ART_STYLES.map((st, i) => `
    <div class="tile">
      <div class="tile-head"><span class="badge art">A${i + 1}</span><h3>${st.name}</h3></div>
      <p>${st.desc}</p>
      <div class="arts3">${["goblin", "bear", "brute"].map((id) => `<div class="artbox">${st.render(byId(id))}</div>`).join("")}</div>
      <button class="pick" data-a="${i}">Probar este arte en el combinador</button>
    </div>`).join("");
  hydratePixels(el);
}

function buildControls() {
  const btns = (list, key, prefix) => list.map((x, i) => `<button class="opt" data-${key}="${i}" title="${x.name}">${prefix}${i + 1}<small>${x.name}</small></button>`).join("");
  document.getElementById("frame-opts").innerHTML = btns(FRAMES, "f", "D");
  document.getElementById("art-opts").innerHTML = btns(ART_STYLES, "a", "A");
}

function favs() {
  try { return JSON.parse(localStorage.getItem("pw-favs") || "[]"); } catch { return []; }
}

function saveFavs(list) {
  localStorage.setItem("pw-favs", JSON.stringify(list));
}

function renderCombiner() {
  document.querySelectorAll("[data-f].opt").forEach((b) => b.classList.toggle("on", Number(b.dataset.f) === state.f));
  document.querySelectorAll("[data-a].opt").forEach((b) => b.classList.toggle("on", Number(b.dataset.a) === state.a));
  document.getElementById("combo-label").textContent = `D${state.f + 1} ${FRAMES[state.f].name}  +  A${state.a + 1} ${ART_STYLES[state.a].name}`;
  const combo = document.getElementById("combo");
  combo.innerHTML = CARDS.map((c) => renderCard(c, state.f, state.a)).join("");
  hydratePixels(combo);
  const list = favs();
  const key = `D${state.f + 1}+A${state.a + 1}`;
  document.getElementById("fav").textContent = list.includes(key) ? "★ En favoritos" : "☆ Añadir a favoritos";
  document.getElementById("favs").innerHTML = list.length
    ? list.map((k) => `<button class="favchip" data-key="${k}">${k}</button>`).join("")
    : '<span class="muted">Todavía no hay favoritos. Marca las combinaciones que te gusten.</span>';
  history.replaceState(null, "", `#f${state.f + 1}a${state.a + 1}`);
}

function renderMatrix() {
  const card = byId(state.matrixCard);
  let html = '<div class="mx-corner"></div>' + ART_STYLES.map((s, i) => `<div class="mx-col">A${i + 1}<small>${s.name}</small></div>`).join("");
  FRAMES.forEach((fr, f) => {
    html += `<div class="mx-row">D${f + 1}<small>${fr.name}</small></div>`;
    ART_STYLES.forEach((_, a) => {
      html += `<button class="mx-cell" data-mf="${f}" data-ma="${a}" title="D${f + 1} + A${a + 1}"><div class="mx-scale">${renderCard(card, f, a)}</div></button>`;
    });
  });
  const mx = document.getElementById("matrix");
  mx.innerHTML = html;
  hydratePixels(mx);
}

function goCombiner() {
  renderCombiner();
  document.getElementById("combinador").scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.classList.contains("opt") || t.classList.contains("pick")) {
    if (t.dataset.f !== undefined) state.f = Number(t.dataset.f);
    if (t.dataset.a !== undefined) state.a = Number(t.dataset.a);
    t.classList.contains("pick") ? goCombiner() : renderCombiner();
  } else if (t.id === "random") {
    state.f = Math.floor(Math.random() * 10);
    state.a = Math.floor(Math.random() * 10);
    renderCombiner();
  } else if (t.id === "fav") {
    const key = `D${state.f + 1}+A${state.a + 1}`;
    const list = favs();
    saveFavs(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);
    renderCombiner();
  } else if (t.classList.contains("favchip")) {
    const m = t.dataset.key.match(/D(\d+)\+A(\d+)/);
    state.f = Number(m[1]) - 1;
    state.a = Number(m[2]) - 1;
    renderCombiner();
  } else if (t.classList.contains("mx-cell")) {
    state.f = Number(t.dataset.mf);
    state.a = Number(t.dataset.ma);
    goCombiner();
  }
});

document.getElementById("matrix-card").addEventListener("change", (e) => {
  state.matrixCard = e.target.value;
  renderMatrix();
});

readHash();
document.getElementById("matrix-card").innerHTML = CARDS.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
buildFrames();
buildArts();
buildControls();
renderCombiner();
renderMatrix();
