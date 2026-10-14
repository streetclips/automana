const KEY = "palmwalker-play";
const SPEED_KEY = "palmwalker-speed";
const SPEEDS = [1, 0.45, 0];
const MOVE = 520;
const HOLD = { you: 800, nemesis: 1300 };
const EASE = "cubic-bezier(.25, .8, .25, 1)";
const ORIGIN = { dx: 0, dy: 0 };
const table = document.getElementById("table");
const log = document.getElementById("log");
const zoom = document.getElementById("zoom");
const title = document.getElementById("title");
const setup = document.getElementById("setup");
const speedButton = document.getElementById("speed");
let game = load();
let speed = Number(localStorage.getItem(SPEED_KEY)) || 0;
let ask = null;
let picked = [];
let busy = false;
let playing = false;
let skipping = false;
let skipWait = null;
let zoomed = null;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(game));
}

function factor() {
  return SPEEDS[speed];
}

function showSpeed() {
  speedButton.textContent = UI.animation.replace("{speed}", UI.speeds[speed]);
}

function wait(ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    skipWait = () => {
      clearTimeout(timer);
      resolve();
    };
  });
}

function skip() {
  skipping = true;
  skipWait?.();
  for (const a of document.getAnimations()) a.finish();
}

function cardRect(el) {
  return (el.querySelector(":scope > .pw-card") ?? el).getBoundingClientRect();
}

function measure() {
  const keys = new Map();
  for (const el of table.querySelectorAll("[data-key]")) keys.set(el.dataset.key, { el, rect: cardRect(el), cls: el.className, data: { ...el.dataset } });
  const anchors = new Map();
  for (const el of table.querySelectorAll("[data-anchor]")) for (const name of el.dataset.anchor.split(" ")) anchors.set(name, cardRect(el));
  const counts = new Map();
  for (const el of table.querySelectorAll("[data-counter]")) counts.set(el.dataset.counter, { el, value: Number(el.dataset.count) });
  return { keys, anchors, counts };
}

function zoneRect(snap, zone) {
  return zone.startsWith("aura:") ? snap.keys.get(zone.slice(5))?.rect : snap.anchors.get(zone);
}

function quiet(animation) {
  animation.finished.catch(() => {});
  return animation;
}

function fly(el, from, duration, delay, base = ORIGIN) {
  const to = cardRect(el);
  if (!to.width || !from.width) return ORIGIN;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const x = dx - base.dx;
  const y = dy - base.dy;
  const scale = from.width / to.width;
  if (Math.abs(x) < 1 && Math.abs(y) < 1 && Math.abs(scale - 1) < 0.01) return { dx, dy };
  const box = el.getBoundingClientRect();
  el.style.transformOrigin = `${to.left + to.width / 2 - box.left}px ${to.top + to.height / 2 - box.top}px`;
  el.classList.add("flying");
  quiet(el.animate([{ transform: `translate(${x}px, ${y}px) scale(${scale})` }, { transform: "none" }], { duration, delay, easing: EASE, fill: "backwards" }))
    .finished.then(() => el.classList.remove("flying"), () => {});
  return { dx, dy };
}

function ghost(html, from, to, duration, delay) {
  const g = document.createElement("div");
  g.className = "ghost";
  g.innerHTML = html;
  g.firstElementChild.style.fontSize = `${from.width / 25}px`;
  g.style.left = `${from.left}px`;
  g.style.top = `${from.top}px`;
  document.body.append(g);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const end = `translate(${dx}px, ${dy}px) scale(${Math.max(to.width / from.width, 0.2)})`;
  const frames = [{ transform: "none", opacity: 1 }, { transform: end, opacity: 1, offset: 0.8 }, { transform: end, opacity: 0 }];
  g.animate(frames, { duration: duration * 1.3, delay, easing: EASE, fill: "both" }).finished.then(() => g.remove(), () => g.remove());
}

function pop(el, duration, delay) {
  quiet(el.animate([{ transform: "scale(.3)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration, delay, easing: EASE, fill: "backwards" }));
}

function float(el, delta, duration) {
  const r = cardRect(el);
  const f = document.createElement("div");
  f.className = `delta ${delta < 0 ? "minus" : "plus"}`;
  f.textContent = delta > 0 ? `+${delta}` : `−${-delta}`;
  f.style.left = `${r.left + r.width / 2}px`;
  f.style.top = `${r.top + r.height / 2}px`;
  document.body.append(f);
  const frames = [
    { transform: "translate(-50%, -50%) scale(.4)", opacity: 0 },
    { transform: "translate(-50%, -70%) scale(1.3)", opacity: 1, offset: 0.2 },
    { transform: "translate(-50%, -80%) scale(1.1)", opacity: 1, offset: 0.7 },
    { transform: "translate(-50%, -150%) scale(1)", opacity: 0 },
  ];
  f.animate(frames, { duration: Math.max(duration * 3, 900), easing: "ease-out" }).finished.then(() => f.remove(), () => f.remove());
  quiet(el.animate([{ transform: "none" }, { transform: "scale(1.1)" }, { transform: "none" }], { duration: duration * 0.8 }));
}

function react(el, old, duration) {
  const was = (c) => old.cls.split(" ").includes(c);
  const is = (c) => el.classList.contains(c);
  const card = el.querySelector(":scope > .pw-card");
  if (!card) return;
  const turn = getComputedStyle(card).transform;
  const turned = turn === "none" ? "" : ` ${turn}`;
  const animateCard = (frames, options) => quiet(card.animate(frames.map((f) => ({ ...f, transform: `${f.transform}${turned}` })), options));
  if (is("attacking") && !was("attacking")) {
    const dir = is("nem") ? 1 : -1;
    animateCard([{ transform: "translate(0px)" }, { transform: `translate(${dir * 34}px, -10px) scale(1.06)`, offset: 0.45 }, { transform: "translate(0px)" }], { duration: duration * 1.4, easing: "ease-in-out" });
  }
  if (is("frozen") !== was("frozen")) {
    const [from, to] = is("frozen") ? [0, 180] : [180, 0];
    quiet(card.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }], { duration: duration * 1.6, easing: "ease-in-out" }));
  }
  if (Number(el.dataset.damage) > Number(old.data.damage ?? 0)) {
    const hit = [
      { transform: "translate(0px)", filter: "none" },
      { transform: "translateX(-8px) rotate(-2deg)", filter: "drop-shadow(0 0 14px #ff2b2b)", offset: 0.2 },
      { transform: "translateX(7px) rotate(2deg)", filter: "drop-shadow(0 0 14px #ff2b2b)", offset: 0.45 },
      { transform: "translateX(-4px)", offset: 0.7 },
      { transform: "translate(0px)", filter: "none" },
    ];
    animateCard(hit, { duration: duration * 1.2 });
  }
  if (is("blocking") && !was("blocking")) animateCard([{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration });
  if (is("targeted") && !was("targeted")) quiet(el.animate([{ filter: "none" }, { filter: "drop-shadow(0 0 18px #ff3d6e)" }, { filter: "none" }], { duration: duration * 1.6, iterations: 2 }));
  const pt = el.querySelector(".pt");
  if (pt && el.dataset.pt !== old.data.pt) quiet(pt.animate([{ transform: "none" }, { transform: "scale(1.7)" }, { transform: "none" }], { duration: duration * 1.2 }));
  if (el.dataset.state !== old.data.state) {
    const state = Number(el.dataset.state);
    const options = { duration: duration * 1.6, easing: "ease-in-out" };
    if ((state <= 2) !== (Number(old.data.state) <= 2)) {
      animateCard([{ transform: "scaleX(1)" }, { transform: "scaleX(0)", offset: 0.5 }, { transform: "scaleX(1)" }], options);
    } else quiet(card.animate([{ transform: `rotate(${state % 2 ? 180 : 0}deg)` }, { transform: `rotate(${state % 2 ? 0 : 180}deg)` }], options));
  }
}

function animate(before, after, moves, duration) {
  const moved = new Set();
  const offsets = new Map();
  const parentOffset = (el) => offsets.get(el.parentElement?.closest("[data-key]")?.dataset.key) ?? ORIGIN;
  moves.forEach((m, i) => {
    const key = String(m.uid);
    moved.add(key);
    const delay = Math.min(i, 6) * 90;
    const src = before.keys.get(key)?.rect ?? zoneRect(before, m.from);
    const el = after.keys.get(key)?.el;
    if (!src) {
      if (el) pop(el, duration, delay);
      return;
    }
    if (el?.querySelector(":scope > .pw-card") && !el.classList.contains("tuck")) {
      offsets.set(key, fly(el, src, duration, delay));
      return;
    }
    const dst = el ? cardRect(el) : zoneRect(after, m.to);
    if (dst) ghost(m.card, src, dst, duration, delay);
    if (el) pop(el, duration * 0.5, delay + duration);
  });
  for (const [key, now] of after.keys) {
    const old = before.keys.get(key);
    if (!old || moved.has(key)) continue;
    offsets.set(key, fly(now.el, old.rect, duration, 0, parentOffset(now.el)));
    react(now.el, old, duration);
  }
  for (const [name, now] of after.counts) {
    const old = before.counts.get(name);
    if (old && old.value !== now.value) float(now.el, now.value - old.value, duration);
  }
}

function swap(html, moves, duration) {
  const before = duration ? measure() : null;
  table.innerHTML = html;
  if (before) animate(before, measure(), moves, duration);
}

function showLog(at) {
  for (const li of log.querySelectorAll("[data-at]")) li.hidden = Number(li.dataset.at) > at;
  log.scrollTop = log.scrollHeight;
}

async function play(frames, heading) {
  playing = true;
  skipping = false;
  for (const f of frames) {
    if (skipping) break;
    title.textContent = `${heading} · ${f.head}`;
    showLog(f.at);
    swap(f.table, f.moves, MOVE * factor());
    await wait(HOLD[f.nemesis ? "nemesis" : "you"] * factor());
  }
  playing = false;
}

async function refresh(animate) {
  if (!game) {
    table.innerHTML = `<section class="prompt"><h2>${UI.noGame}</h2><div class="buttons"><button data-cmd="new" data-primary>${UI.newGame}</button></div></section>`;
    return;
  }
  busy = true;
  skipping = false;
  try {
    const moving = animate && factor() > 0;
    const res = await fetch(`/api/view?lang=${document.documentElement.lang}${moving ? "&animate" : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(game) });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    game.decisions = data.decisions;
    save();
    log.innerHTML = data.log;
    if (moving) await play(data.frames, data.title);
    title.textContent = `${data.title} · ${data.turn}`;
    ask = data.ask;
    picked = ask?.preset ? ask.preset.slice() : [];
    swap(data.table, data.moves, moving && !skipping ? MOVE * factor() : 0);
    showLog(Infinity);
    markPicks();
  } catch (err) {
    playing = false;
    table.innerHTML = `<section class="prompt"><h2>${UI.broke}</h2><pre class="error"></pre><div class="buttons"><button data-cmd="undo" data-primary>${UI.undoLast}</button><button data-cmd="new">${UI.newGame}</button></div></section>`;
    table.querySelector(".error").textContent = err.message;
  } finally {
    busy = false;
  }
}

function decide(answer) {
  if (busy) return;
  game.decisions.push(answer);
  refresh(true);
}

function markPicks() {
  for (const el of document.querySelectorAll("[data-pick]")) {
    const i = picked.indexOf(Number(el.dataset.pick));
    el.classList.toggle("picked", i >= 0);
    if (ask?.ordered && i >= 0) el.dataset.order = String(i + 1);
    else delete el.dataset.order;
  }
  const confirm = table.querySelector("[data-confirm]");
  if (!confirm || ask?.kind !== "pick") return;
  confirm.disabled = picked.length < ask.min || picked.length > ask.max;
  confirm.textContent = picked.length || !ask.none ? `${ask.confirm}${ask.max > 1 && picked.length ? ` (${picked.length})` : ""}` : ask.none;
  const count = (ask.min === ask.max ? UI.picked : UI.pickedUpTo).replace("{n}", picked.length).replace("{max}", ask.max);
  table.querySelector(".buttons .count").textContent = ask.max > 1 ? count : "";
}

function togglePick(uid) {
  const i = picked.indexOf(uid);
  if (i >= 0) picked.splice(i, 1);
  else if (ask.max === 1) picked = [uid];
  else if (picked.length < ask.max) picked.push(uid);
  markPicks();
}

function blocks() {
  return [...table.querySelectorAll(".block-row")].map((row) => Number(row.querySelector("input:checked").value));
}

function closeMenus(except) {
  for (const el of document.querySelectorAll(".slot.open")) if (el !== except) el.classList.remove("open");
}

function openSetup() {
  const form = setup.querySelector("form");
  if (game) {
    form.pair.value = game.pair;
    form.nemesis.value = game.nemesis;
  }
  form.seed.value = "";
  setup.returnValue = "";
  setup.showModal();
}

function command(cmd) {
  if (cmd === "speed") {
    speed = (speed + 1) % SPEEDS.length;
    localStorage.setItem(SPEED_KEY, String(speed));
    showSpeed();
    return;
  }
  if (busy) return;
  if (cmd === "new") openSetup();
  else if (!game) return;
  else if (cmd === "undo" && game.decisions.length) {
    game.decisions.pop();
    refresh(false);
  } else if (cmd === "restart" && confirm(UI.restart)) {
    game.decisions = [];
    refresh(false);
  }
}

document.addEventListener("click", (e) => {
  if (playing) {
    if (e.target.closest("[data-cmd=speed]")) command("speed");
    else skip();
    return;
  }
  const list = e.target.closest(".pile-list");
  if (list) {
    list.closest("details").open = false;
    return;
  }
  const el = e.target.closest("[data-answer], [data-pick], [data-confirm], [data-blocks], [data-cmd], .has-menu");
  if (!el) {
    closeMenus();
    return;
  }
  if (el.matches("button")) el.blur();
  if (el.dataset.answer) decide(JSON.parse(el.dataset.answer));
  else if (el.dataset.pick !== undefined) togglePick(Number(el.dataset.pick));
  else if (el.hasAttribute("data-confirm")) decide(picked);
  else if (el.hasAttribute("data-blocks")) decide(blocks());
  else if (el.dataset.cmd) command(el.dataset.cmd);
  else {
    closeMenus(el);
    el.classList.toggle("open");
  }
});

document.addEventListener("change", (e) => {
  const input = e.target;
  if (!input.matches(".block-row input") || input.value === "-1") return;
  for (const other of table.querySelectorAll(`.block-row input[value="${input.value}"]:checked`)) {
    if (other !== input) other.closest(".block-row").querySelector('input[value="-1"]').checked = true;
  }
});

document.addEventListener("toggle", (e) => {
  if (!e.target.open) return;
  for (const d of document.querySelectorAll("details[open]")) if (d !== e.target) d.open = false;
}, true);

function showZoom(card) {
  zoomed = card;
  const holder = card.parentElement.closest("[data-title], .slot");
  zoom.replaceChildren();
  if (holder?.dataset.title) {
    const title = document.createElement("p");
    title.className = "zt";
    title.textContent = holder.dataset.title;
    zoom.append(title);
  }
  zoom.insertAdjacentHTML("beforeend", card.outerHTML);
  const tags = holder?.querySelector(":scope > .tags");
  if (tags) zoom.append(tags.cloneNode(true));
  zoom.classList.toggle("turned", card.parentElement.classList.contains("turned"));
}

document.addEventListener("mouseover", (e) => {
  const card = e.target.closest(".pw-card");
  if (card && card !== zoomed && !zoom.contains(card) && !card.closest(".ghost") && !card.classList.contains("empty")) showZoom(card);
  for (const el of document.querySelectorAll(".aim")) el.classList.remove("aim");
  const aim = e.target.closest("[data-target]");
  if (aim) document.querySelector(`.slot[data-uid="${aim.dataset.target}"]`)?.classList.add("aim");
});

document.addEventListener("keydown", (e) => {
  if (setup.open || e.metaKey || e.ctrlKey) return;
  if (playing) {
    if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
      e.preventDefault();
      skip();
    }
    return;
  }
  if (e.target.matches("select, textarea, input:not([type=radio]), button")) return;
  if (e.key === "Enter" || e.key === " ") {
    const primary = table.querySelector("[data-primary]:not(:disabled)");
    if (!primary) return;
    e.preventDefault();
    primary.click();
  } else if (e.key === "z" || e.key === "Z") command("undo");
  else if (e.key === "Escape") {
    closeMenus();
    for (const d of document.querySelectorAll("details[open]")) d.open = false;
  }
});

setup.addEventListener("close", () => {
  if (setup.returnValue !== "start") return;
  const form = new FormData(setup.querySelector("form"));
  const seed = Number.parseInt(String(form.get("seed")), 10);
  game = {
    pair: form.get("pair"),
    nemesis: form.get("nemesis"),
    seed: Number.isInteger(seed) ? seed : Math.floor(Math.random() * 1e6),
    decisions: [],
  };
  save();
  refresh(false);
});

showSpeed();
if (!game) openSetup();
refresh(false);
