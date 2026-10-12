import { findCardByName } from "../content";
import { land, renderCard, type CardSize } from "../render/card";
import { nemesisFace, threatDeckBack, walkerFace } from "../render/faces";
import { fan } from "../render/layout";
import { pips } from "../render/pips";
import type { SceneId } from "./model";

function card(name: string, size: CardSize): string {
  return renderCard(findCardByName(name, "es"), size);
}

const show = (cond: boolean) => (cond ? "" : " hide");
const on = (cond: boolean) => (cond ? " on" : "");

function title(): string {
  const f = fan([card("Oso de la Espesura", "lg"), walkerFace("B", "lg"), nemesisFace("A", "lg"), card("Descarga de Ascuas", "lg")], [-20, -7, 7, 20], 22);
  return `<div class="scene"><h1 style="font-size:110px; margin-top:30px">PALMWALKER</h1>
<h2 style="font-size:30px">GUÍA DE JUEGO · TU PRIMERA PARTIDA</h2>
<div class="zoomwrap" style="zoom:1.3"><div class="fan" style="height:100mm; width:150mm; margin-top:0">${f}</div></div></div>`;
}

function goal(k: number): string {
  return `<div class="scene"><h1>Tu objetivo</h1><h2>KAEL CONTRA VORTHRAX</h2>
<div style="display:flex; gap:60px; align-items:flex-start">
<div class="${show(k >= 0)}" style="text-align:center"><div class="zoomwrap" style="zoom:1.35">${walkerFace("B", "lg")}</div><div class="cap2">TÚ · KAEL, PIROMANTE ERRANTE</div></div>
<div style="display:flex; flex-direction:column; gap:22px; width:520px; margin-top:40px">
<div class="panel${show(k >= 2)}"><h3>Ganas si…</h3>Vorthrax se queda sin cartas de <b>Amenaza boca abajo</b>.</div>
<div class="panel dark${show(k >= 2)}"><h3>Pierdes si…</h3>tu <b>biblioteca</b> se queda sin cartas.</div>
</div>
<div class="${show(k >= 1)}" style="text-align:center"><div class="zoomwrap" style="zoom:1.35">${nemesisFace("A", "lg")}</div><div class="cap2">RIVAL · VORTHRAX, LA NÉMESIS</div></div>
</div></div>`;
}

function faces(k: number): string {
  return `<div class="scene"><h1>Cada carta es dos cartas</h1><h2>HECHIZO DELANTE · TIERRA DETRÁS</h2>
<div style="display:flex; gap:50px; align-items:center">
<div style="text-align:center">${card("Trasgo Temerario", "big")}<div class="cap2">FRENTE: HECHIZO</div></div>
<div class="arrowbig${show(k >= 1)}">⟲<div style="font-size:22px; font-family:Copperplate,serif">voltear</div></div>
<div class="${show(k >= 1)}" style="text-align:center">${land("Mountain", "big")}<div class="cap2">DORSO: TIERRA</div></div>
<div class="${show(k >= 2)}" style="display:flex; flex-direction:column; gap:16px; width:380px">
<div class="panel"><h3>Usar maná</h3>Para gastar una tierra, <b>bájala</b>. Es lo mismo que girarla.</div>
<div style="display:flex; gap:14px"><div class="lstrip M" style="flex:1">${pips("{R}")}Alzada</div><div class="lstrip M low" style="flex:1">${pips("{R}")}Bajada</div></div>
<div class="panel" style="font-size:22px">Se vuelve a alzar al empezar <b>tu</b> siguiente turno.</div>
</div></div></div>`;
}

function life(k: number): string {
  return `<div class="scene"><h1>Tu biblioteca es tu vida</h1><h2>20 CARTAS = 20 VIDAS</h2>
<div style="display:flex; gap:40px; align-items:center">
<div style="text-align:center">${card("Oleada de Vigor", "big")}<div class="cap2">MANO</div></div>
<div class="arrowbig">›</div>
<div style="text-align:center; position:relative">${land("Forest", "big")}
<div class="tagx" style="top:40%; font-size:46px">20 vidas</div><div class="cap2">BIBLIOTECA</div></div>
<div class="arrowbig">›</div>
<div style="text-align:center">${card("Prender", "big")}<div class="cap2">CEMENTERIO</div></div>
</div>
<div style="display:flex; gap:30px; margin-top:26px">
<div class="panel${show(k >= 1)}" style="width:560px"><b>Robar</b> = −1 vida.<br><b>Daño</b> = cartas de la biblioteca al cementerio.</div>
<div class="panel dark${show(k >= 2)}" style="width:620px">Vorthrax: sus <b>Amenazas boca abajo</b> son su vida. Tu daño las manda a su <b>Ruina</b>.</div>
</div></div>`;
}

function hold(k: number): string {
  const leftFan = fan(
    [threatDeckBack("sm", "MAZO DE<br>AMENAZA"), nemesisFace("A", "sm"), card("Bruto Garrascua", "sm"), card("Oso de la Espesura", "sm"), walkerFace("A", "sm")],
    [-16, -8, 0, 8, 16], 9,
  );
  return `<div class="scene"><h1>Cómo se sujeta</h1><h2>SIN MESA: TODO EN TUS MANOS</h2>
<div style="display:flex; gap:70px; align-items:flex-start">
<div class="${k === 1 ? "dim" : ""}" style="text-align:center"><div class="zoomwrap" style="zoom:1.9"><div class="fan" style="width:96mm; height:58mm">${leftFan}</div></div>
<div class="cap2">MANO IZQUIERDA · LA MESA</div><div style="font-size:22px; margin-top:6px">Amenaza · Vorthrax · criaturas · Kael con tus tierras detrás</div></div>
<div class="${show(k >= 1)}${k === 2 ? " dim" : ""}" style="text-align:center"><div style="display:flex; gap:12px; align-items:center; margin-top:40px">
${card("Descarga de Ascuas", "vd")}<div class="arrowbig">›</div>
${land("Mountain", "vd")}<div class="arrowbig">›</div>
${card("Prender", "vd")}</div>
<div class="cap2">MANO DERECHA · EL GRIMORIO</div><div style="font-size:22px; margin-top:6px">mano · biblioteca · cementerio</div></div>
</div>
<div class="panel${show(k >= 2)}" style="margin-top:20px; font-size:24px">En el vídeo lo verás <b>extendido como una mesa</b>. En tus manos es exactamente lo mismo.</div>
</div>`;
}

function turn(k: number): string {
  const steps = (items: string[], cls: string, lit: number[]) =>
    items.map((t, i) => `<div class="fstep ${cls}${on(lit.includes(i))}"><div class="n">${i + 1}</div>${t}</div>`).join("");
  const yours = steps(["<b>Enderezar</b>: alza todo", "<b>Robar</b> 1 carta (−1 vida)", "<b>Principal</b>: 1 tierra, hechizos, Kael", "<b>Combate</b>", "<b>Final</b>: mano máxima de 5"], "", k === 1 ? [2] : []);
  const nem = steps(["<b>Enderezar</b>", "<b>Ejecutar</b> el Presagio", "<b>Revelar</b> otro Presagio (−1 vida)", "<b>Atacar</b>", "<b>Final</b>: Rescoldo / Infierno"], "nem", k === 3 ? [1, 2] : []);
  return `<div class="scene"><h1>El turno</h1><h2>TÚ JUEGAS · ELLA RESPONDE</h2>
<div style="display:flex; gap:50px; align-items:flex-start">
<div style="width:600px"><div class="cap2" style="margin:0 0 12px">TU TURNO</div><div class="flowv">${yours}</div></div>
<div class="${show(k >= 2)}" style="width:600px"><div class="cap2" style="margin:0 0 12px">TURNO DE VORTHRAX</div><div class="flowv">${nem}</div></div>
<div class="${show(k >= 3)}" style="text-align:center"><div class="cap2" style="margin:0 0 12px">PRESAGIO</div>${card("Aliento Abrasador", "vd")}<div style="font-size:20px; margin-top:8px; width:200px">lo que hará en su próximo turno</div></div>
</div></div>`;
}

function mind(k: number): string {
  const rules: [string, string][] = [
    ["Ataca", "con todas sus criaturas, salvo con las que podrías <b>bloquear, matar y sobrevivir</b>."],
    ["Bloquea", "1. <b>Seguro</b>: mata sin morir. 2. <b>Intercambio</b>. 3. <b>Desesperación</b>, solo si el golpe es letal."],
    ["Apunta", "siempre a tu criatura de <b>mayor fuerza</b>. Si no tienes, a ti."],
  ];
  const items = rules.map(([t, d], i) => `<div class="panel dark${show(k >= i)}${on(k === i)}" style="width:1300px"><h3>${t}</h3>${d}</div>`).join("");
  return `<div class="scene"><h1>La mente de la Némesis</h1><h2>REGLAS FIJAS · TODO ES PREDECIBLE</h2>
<div style="display:flex; flex-direction:column; gap:20px">${items}</div></div>`;
}

function kael(k: number): string {
  return `<div class="scene"><h1>Kael, tu Caminante</h1><h2>CUATRO ESTADOS DE LEALTAD</h2>
<div style="display:flex; gap:50px; align-items:flex-start">
<div class="zoomwrap" style="zoom:1.3">${walkerFace("A", "lg")}</div>
<div class="zoomwrap" style="zoom:1.3">${walkerFace("B", "lg")}</div>
<div style="display:flex; flex-direction:column; gap:16px; width:640px">
<div class="panel${on(k === 0)}"><h3>Una vez por turno</h3>I → II → III → IV, girando y volteando la carta.</div>
<div class="panel${show(k >= 1)}${on(k === 1)}"><b>Cargar</b>: +1 estado y +1/+0 a una criatura.<br><b>Descargar</b>: −2 estados y 2 de daño a una criatura.</div>
<div class="panel dark${show(k >= 2)}${on(k === 2)}"><b>Definitiva</b> (desde IV): 3 de daño a Vorthrax y +1/+0 a tus criaturas.</div>
</div></div></div>`;
}

function debrief(k: number): string {
  const items = [
    "El <b>Cuernochoque</b> como tierra en el turno 1.",
    "Guardar el <b>Sabueso</b> para el Diablillo del Presagio.",
    "Dejar un <b>Bosque libre</b> contra el Aliento Abrasador.",
    "Esperar en <b>IV</b> hasta romper la Piel de Ceniza.",
    "La <b>Araña</b>: defender y rematar.",
  ];
  const visible = [0, 3, 5][k];
  const li = items.map((t, i) => `<div class="fstep${show(i < visible)}"><div class="n">${i + 1}</div>${t}</div>`).join("");
  return `<div class="scene"><h1>Las cinco claves</h1><h2>LO QUE GANÓ LA PARTIDA</h2><div class="flowv" style="width:1100px">${li}</div></div>`;
}

function end(): string {
  const cards = ["Trasgo Temerario", "Oso de la Espesura", "Descarga de Ascuas", "Araña del Dosel"].map((n) => card(n, "vd")).join("");
  return `<div class="scene"><h1 style="font-size:100px; margin-top:70px">¡TE TOCA!</h1>
<h2 style="font-size:30px">BARAJA · REVELA EL PRESAGIO · QUE TUS MANOS ARDAN</h2>
<div style="display:flex; gap:30px; margin-top:20px">${cards}</div>
<div class="cap2" style="margin-top:30px; font-size:26px">Reglas completas: palmwalker-reglamento-es.pdf</div></div>`;
}

export const SCENES: Record<SceneId, (k: number) => string> = { title, goal, faces, life, hold, turn, mind, kael, debrief, end };
