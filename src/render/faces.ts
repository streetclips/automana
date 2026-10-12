import { t } from "../i18n/locale";

export type FaceSize = "sm" | "md" | "lg" | "vd";

export function walkerFace(face: "A" | "B", size: FaceSize = "lg"): string {
  const s = t();
  const states: [string, ("charge" | "discharge" | "ultimate")[]][] =
    face === "A" ? [["I", ["charge"]], ["II", ["charge"]]] : [["III", ["charge", "discharge"]], ["IV", ["discharge", "ultimate"]]];
  const halves = states
    .map(([num, abilities], i) => `
<div class="half ${i === 1 ? "flip" : ""}">
  <div class="hhead"><span class="state">${num}</span><span class="hname">${s.walkerName}</span></div>
  <div class="hbody">${abilities.map((a) => `<p>${s[a]}</p>`).join("")}</div>
</div>`)
    .join("");
  return `<div class="card walker ${size}"><div class="halves">${halves}</div><div class="facetag">${s.face} ${face}</div></div>`;
}

export function nemesisFace(face: "A" | "B", size: FaceSize = "lg"): string {
  const s = t();
  const [title, body] = face === "A" ? [s.phase1, s.nemA] : [s.phase2, s.nemB];
  const short = s.nemName.split(",")[0];
  return `
<div class="card nemesis ${size}">
  <div class="halves">
    <div class="half"><div class="hhead"><span class="state">${title}</span><span class="hname">${s.nemName}</span></div><div class="hbody">${body}</div></div>
    <div class="half flip"><div class="hhead"><span class="state">${title} · ${s.heroicTag}</span><span class="hname">${short}</span></div><div class="hbody">${s.heroic}</div></div>
  </div>
  <div class="facetag">${s.face} ${face}</div>
</div>`;
}

export function otherNemesis(name: string, emoji: string, color: string, p1: string, p2: string): string {
  const s = t();
  return `
<div class="card nemesis ${color} md">
  <div class="halves">
    <div class="half"><div class="hhead"><span class="state">${s.phase1}</span><span class="hname">${name}</span></div><div class="hbody"><div class="nemart">${emoji}</div><p>${p1}</p></div></div>
    <div class="half"><div class="hhead"><span class="state">${s.phase2}</span></div><div class="hbody"><p>${p2}</p></div></div>
  </div>
</div>`;
}

export function threatDeckBack(size: FaceSize, label: string): string {
  return `<div class="card threat ${size}" style="background:repeating-linear-gradient(45deg,#3a1d12,#3a1d12 2mm,#4a2618 2mm,#4a2618 4mm)"><div style="margin:auto;color:#ffb15c;font-family:Copperplate,serif;text-align:center;font-size:1.5em">${label}</div></div>`;
}
