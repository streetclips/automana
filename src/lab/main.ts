import { setLocale } from "../i18n/locale";
import { renderCard } from "../render/card";
import { SAMPLE_IDS, SKINS } from "./catalog";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const DEFAULT_SKIN = SKINS.findIndex((s) => s.skin === "palm");
const state = { f: DEFAULT_SKIN };

setLocale("es");

const $ = (id: string) => document.getElementById(id) as HTMLElement;

function card(id: string, f: number): string {
  return renderCard(id, "lab", { skin: SKINS[f].skin, num: ROMAN[SAMPLE_IDS.indexOf(id)] });
}

function readHash(): void {
  const m = location.hash.match(/^#f(\d+)$/);
  if (!m) return;
  state.f = Math.min(SKINS.length - 1, Math.max(0, Number(m[1]) - 1));
}

function favs(): string[] {
  try {
    return JSON.parse(localStorage.getItem("pw-favs") ?? "[]") as string[];
  } catch {
    return [];
  }
}

function buildSkins(): void {
  $("frames").innerHTML = SKINS.map((s, i) => `
    <div class="tile">
      <div class="tile-head"><span class="badge">D${i + 1}</span><h3>${s.name}</h3></div>
      <p>${s.desc}</p>
      <div class="pair">${card("reckless-goblin", i)}${card("luminous-aegis", i)}</div>
      <button class="pick" data-f="${i}">Probar este diseño en el combinador</button>
    </div>`).join("");
}

function buildControls(): void {
  $("frame-opts").innerHTML = SKINS.map((x, i) => `<button class="opt" data-f="${i}" title="${x.name}">D${i + 1}<small>${x.name}</small></button>`).join("");
}

function renderCombiner(): void {
  document.querySelectorAll<HTMLElement>(".opt[data-f]").forEach((b) => b.classList.toggle("on", Number(b.dataset.f) === state.f));
  $("combo-label").textContent = `D${state.f + 1} ${SKINS[state.f].name}`;
  $("combo").innerHTML = SAMPLE_IDS.map((id) => card(id, state.f)).join("");
  const list = favs();
  const key = `D${state.f + 1}`;
  $("fav").textContent = list.includes(key) ? "★ En favoritos" : "☆ Añadir a favoritos";
  $("favs").innerHTML = list.length
    ? list.map((k) => `<button class="favchip" data-key="${k}">${k}</button>`).join("")
    : '<span class="muted">Todavía no hay favoritos. Marca los diseños que te gusten.</span>';
  history.replaceState(null, "", `#f${state.f + 1}`);
}

document.addEventListener("click", (e) => {
  const t = (e.target as HTMLElement).closest("button");
  if (!t) return;
  if (t.classList.contains("opt") || t.classList.contains("pick")) {
    if (t.dataset.f !== undefined) state.f = Number(t.dataset.f);
    renderCombiner();
    if (t.classList.contains("pick")) $("combinador").scrollIntoView({ behavior: "smooth" });
  } else if (t.id === "random") {
    state.f = Math.floor(Math.random() * SKINS.length);
    renderCombiner();
  } else if (t.id === "fav") {
    const key = `D${state.f + 1}`;
    const list = favs();
    localStorage.setItem("pw-favs", JSON.stringify(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
    renderCombiner();
  } else if (t.classList.contains("favchip")) {
    const m = (t.dataset.key ?? "").match(/^D(\d+)$/);
    if (!m) return;
    state.f = Number(m[1]) - 1;
    renderCombiner();
  }
});

readHash();
buildSkins();
buildControls();
renderCombiner();
