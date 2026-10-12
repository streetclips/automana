import { getCard } from "../content";
import { setLocale } from "../i18n/locale";
import { ART_STYLES } from "../render/art/styles";
import { renderCard } from "../render/card";
import { ARTS, SAMPLE_IDS, SKINS } from "./catalog";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const DEFAULT_SKIN = SKINS.findIndex((s) => s.skin === "palm");
const DEFAULT_ART = ARTS.findIndex((a) => a.id === "paper");
const state = { f: DEFAULT_SKIN, a: DEFAULT_ART, matrixCard: "reckless-goblin" };

setLocale("es");

const $ = (id: string) => document.getElementById(id) as HTMLElement;

function card(id: string, f: number, a: number): string {
  return renderCard(id, "lab", { skin: SKINS[f].skin, art: ARTS[a].id, num: ROMAN[SAMPLE_IDS.indexOf(id)] });
}

function hydratePixels(root: HTMLElement): void {
  root.querySelectorAll<HTMLImageElement>("img.pixel-art[data-svg]").forEach((img) => {
    const src = new Image();
    src.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = 30;
      cv.height = 30;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, 30, 30);
      img.src = cv.toDataURL();
    };
    src.src = "data:image/svg+xml;charset=utf-8," + img.dataset.svg;
    img.removeAttribute("data-svg");
  });
}

function fill(id: string, html: string): void {
  const el = $(id);
  el.innerHTML = html;
  hydratePixels(el);
}

function readHash(): void {
  const m = location.hash.match(/^#f(\d+)a(\d+)$/);
  if (!m) return;
  state.f = Math.min(SKINS.length - 1, Math.max(0, Number(m[1]) - 1));
  state.a = Math.min(ARTS.length - 1, Math.max(0, Number(m[2]) - 1));
}

function favs(): string[] {
  try {
    return JSON.parse(localStorage.getItem("pw-favs") ?? "[]") as string[];
  } catch {
    return [];
  }
}

function buildSkins(): void {
  fill("frames", SKINS.map((s, i) => `
    <div class="tile">
      <div class="tile-head"><span class="badge">D${i + 1}</span><h3>${s.name}</h3></div>
      <p>${s.desc}</p>
      <div class="pair">${card("reckless-goblin", i, DEFAULT_ART)}${card("luminous-aegis", i, DEFAULT_ART)}</div>
      <button class="pick" data-f="${i}">Probar este diseño en el combinador</button>
    </div>`).join(""));
}

function buildArts(): void {
  fill("arts", ARTS.map((art, i) => `
    <div class="tile">
      <div class="tile-head"><span class="badge art">A${i + 1}</span><h3>${art.name}</h3></div>
      <p>${art.desc}</p>
      <div class="arts3">${["reckless-goblin", "thicket-bear", "cinderclaw-brute"].map((id) => `<div class="artbox">${ART_STYLES[art.id](getCard(id))}</div>`).join("")}</div>
      <button class="pick" data-a="${i}">Probar este arte en el combinador</button>
    </div>`).join(""));
}

function buildControls(): void {
  const btns = (list: { name: string }[], key: string, prefix: string) =>
    list.map((x, i) => `<button class="opt" data-${key}="${i}" title="${x.name}">${prefix}${i + 1}<small>${x.name}</small></button>`).join("");
  $("frame-opts").innerHTML = btns(SKINS, "f", "D");
  $("art-opts").innerHTML = btns(ARTS, "a", "A");
}

function renderCombiner(): void {
  document.querySelectorAll<HTMLElement>(".opt[data-f]").forEach((b) => b.classList.toggle("on", Number(b.dataset.f) === state.f));
  document.querySelectorAll<HTMLElement>(".opt[data-a]").forEach((b) => b.classList.toggle("on", Number(b.dataset.a) === state.a));
  $("combo-label").textContent = `D${state.f + 1} ${SKINS[state.f].name}  +  A${state.a + 1} ${ARTS[state.a].name}`;
  fill("combo", SAMPLE_IDS.map((id) => card(id, state.f, state.a)).join(""));
  const list = favs();
  const key = `D${state.f + 1}+A${state.a + 1}`;
  $("fav").textContent = list.includes(key) ? "★ En favoritos" : "☆ Añadir a favoritos";
  $("favs").innerHTML = list.length
    ? list.map((k) => `<button class="favchip" data-key="${k}">${k}</button>`).join("")
    : '<span class="muted">Todavía no hay favoritos. Marca las combinaciones que te gusten.</span>';
  history.replaceState(null, "", `#f${state.f + 1}a${state.a + 1}`);
}

function renderMatrix(): void {
  let html = '<div class="mx-corner"></div>' + ARTS.map((a, i) => `<div class="mx-col">A${i + 1}<small>${a.name}</small></div>`).join("");
  SKINS.forEach((s, f) => {
    html += `<div class="mx-row">D${f + 1}<small>${s.name}</small></div>`;
    ARTS.forEach((_, a) => {
      html += `<button class="mx-cell" data-mf="${f}" data-ma="${a}" title="D${f + 1} + A${a + 1}"><div class="mx-scale">${card(state.matrixCard, f, a)}</div></button>`;
    });
  });
  fill("matrix", html);
}

function goCombiner(): void {
  renderCombiner();
  $("combinador").scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("click", (e) => {
  const t = (e.target as HTMLElement).closest("button");
  if (!t) return;
  if (t.classList.contains("opt") || t.classList.contains("pick")) {
    if (t.dataset.f !== undefined) state.f = Number(t.dataset.f);
    if (t.dataset.a !== undefined) state.a = Number(t.dataset.a);
    if (t.classList.contains("pick")) goCombiner();
    else renderCombiner();
  } else if (t.id === "random") {
    state.f = Math.floor(Math.random() * SKINS.length);
    state.a = Math.floor(Math.random() * ARTS.length);
    renderCombiner();
  } else if (t.id === "fav") {
    const key = `D${state.f + 1}+A${state.a + 1}`;
    const list = favs();
    localStorage.setItem("pw-favs", JSON.stringify(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
    renderCombiner();
  } else if (t.classList.contains("favchip")) {
    const m = (t.dataset.key ?? "").match(/D(\d+)\+A(\d+)/);
    if (!m) return;
    state.f = Number(m[1]) - 1;
    state.a = Number(m[2]) - 1;
    renderCombiner();
  } else if (t.classList.contains("mx-cell")) {
    state.f = Number(t.dataset.mf);
    state.a = Number(t.dataset.ma);
    goCombiner();
  }
});

$("matrix-card").addEventListener("change", (e) => {
  state.matrixCard = (e.target as HTMLSelectElement).value;
  renderMatrix();
});

readHash();
$("matrix-card").innerHTML = SAMPLE_IDS.map((id) => `<option value="${id}">${getCard(id).es.name}</option>`).join("");
buildSkins();
buildArts();
buildControls();
renderCombiner();
renderMatrix();
