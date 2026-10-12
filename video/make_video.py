import copy
import json
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

import build as b
import build_es
from build import card, fan, land, nemesis_face, pips, walker_face

WORK = HERE / "work"
OUT = HERE.parent / "palmwalker-guia.mp4"
SHELLS = sorted(Path.home().glob("Library/Caches/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell"))
CHROME = str(SHELLS[-1]) if SHELLS else b.CHROME
FPS = 30
PAD = 0.75
XFADE = 0.3
VOICE = "Mónica"
RATE = "182"

VIDEO_CSS = r"""
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; }
body { font-size: 22px; color: #f6e6cf; font-family: "Palatino", Georgia, serif;
  background: radial-gradient(ellipse at 40% 35%, #5a3520 0%, #34190d 55%, #160904 100%); }
.frame { position: relative; width: 1920px; height: 1080px; }
.card.vd { width: 190px; height: 265px; font-size: 9.4px; }
.card.hd { width: 128px; height: 179px; font-size: 6.4px; }
.card.big { width: 300px; height: 419px; font-size: 14.5px; }
.hdr { position: absolute; left: 40px; right: 40px; top: 22px; height: 56px; display: flex; align-items: center; gap: 22px; }
.hdr .rnd { font-family: Copperplate, serif; font-size: 30px; color: #ffcf7a; letter-spacing: .08em; white-space: nowrap; }
.hdr .steps { display: flex; gap: 8px; flex: 1; justify-content: center; }
.hdr .st { font-family: Copperplate, serif; font-size: 16px; padding: 7px 14px; border-radius: 20px; background: rgba(0,0,0,.35); color: #b59a77; border: 1px solid #6b4a2a; }
.hdr .st.on { background: #ffcf7a; color: #3a1d0a; border-color: #ffe6b0; box-shadow: 0 0 18px rgba(255,200,100,.7); }
.hdr .ph { font-family: Copperplate, serif; font-size: 20px; padding: 8px 18px; border-radius: 10px; background: #7a1d0a; color: #ffd7a8; border: 2px solid #ff9a52; }
.hdr .ph.p2 { background: #ff5a1f; color: #fff; box-shadow: 0 0 22px rgba(255,90,31,.8); }
.zone { position: absolute; left: 40px; width: 1330px; border-radius: 18px; padding: 14px 18px; box-sizing: border-box; }
.zone.nem { top: 92px; height: 345px; background: linear-gradient(rgba(150,30,10,.35), rgba(90,15,5,.35)); border: 2px solid rgba(255,140,60,.35); }
.zone.you { top: 452px; height: 380px; background: linear-gradient(rgba(40,100,40,.28), rgba(20,60,25,.3)); border: 2px solid rgba(150,220,130,.3); }
.zlabel { font-family: Copperplate, serif; font-size: 16px; letter-spacing: .12em; color: #ffb15c; margin-bottom: 8px; }
.zone.you .zlabel { color: #b9f0a8; }
.zrow { display: flex; gap: 20px; align-items: flex-start; }
.slot { position: relative; flex: none; transition: none; }
.slot .lbl { font-family: Copperplate, serif; font-size: 13px; letter-spacing: .1em; color: #ffcf7a; text-align: center; margin-bottom: 4px; height: 16px; }
.slot.low { transform: translateY(34px); }
.slot.low > .card { filter: brightness(.72); }
.slot .lowlbl { position: absolute; left: 0; right: 0; bottom: -26px; text-align: center; font-size: 15px; font-style: italic; color: #e8cfa8; }
.hl > .card, .hl > .inner { filter: drop-shadow(0 0 10px #ffd36b) drop-shadow(0 0 22px #ffb000); }
.slot.low.hl > .card { filter: brightness(.85) drop-shadow(0 0 10px #ffd36b) drop-shadow(0 0 22px #ffb000); }
.tagx { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%) rotate(-4deg); z-index: 20; white-space: nowrap;
  font-family: Copperplate, serif; font-size: 30px; font-weight: bold; padding: 8px 18px; border-radius: 12px;
  background: #ffcf7a; color: #3a1405; border: 3px solid #fff3d1; box-shadow: 0 6px 18px rgba(0,0,0,.6); }
.tagx.bad { background: #c21d0a; color: #fff; border-color: #ffb59c; }
.tagx.good { background: #2f8f3a; color: #fff; border-color: #c8ffbe; }
.pile { width: 170px; height: 265px; position: relative; margin-top: 20px; }
.pile .bk { position: absolute; width: 160px; height: 224px; border-radius: 12px; border: 2px solid #8a4b22;
  background: repeating-linear-gradient(45deg,#3a1d12,#3a1d12 8px,#4a2618 8px,#4a2618 16px); box-shadow: 0 4px 10px rgba(0,0,0,.6); }
.pile .cnt { position: absolute; left: 0; right: 10px; top: 70px; text-align: center; font-family: Copperplate, serif; color: #ffcf7a; text-shadow: 0 2px 6px #000; }
.pile .cnt b { display: block; font-size: 64px; color: #fff3d1; line-height: 1; }
.pile .cnt span { font-size: 15px; letter-spacing: .08em; }
.pile.hl .bk { box-shadow: 0 0 0 4px #ffd36b, 0 0 30px #ffb000; }
.ruin { font-family: Copperplate, serif; font-size: 15px; color: #e8cfa8; margin-top: 8px; text-align: center; }
.empty2 { font-style: italic; color: rgba(255,240,220,.45); font-size: 20px; align-self: center; margin-top: 110px; }
.lands { display: flex; flex-direction: column; gap: 8px; margin-top: 22px; width: 150px; }
.lstrip { display: flex; align-items: center; gap: 10px; height: 46px; border-radius: 10px; padding: 0 12px; font-family: Copperplate, serif; font-size: 17px; color: #2b1a0a;
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.5), 0 3px 8px rgba(0,0,0,.4); }
.lstrip .pip { font-size: 22px; }
.lstrip.F { background: linear-gradient(90deg, #cfeec2, #7cbf6a); }
.lstrip.M { background: linear-gradient(90deg, #ffd8c2, #e0805a); }
.lstrip.low { opacity: .38; transform: translateX(26px); }
.lands.hl .lstrip:not(.low), .lstrip.hl { box-shadow: inset 0 0 0 2px rgba(0,0,0,.5), 0 0 0 3px #ffd36b, 0 0 22px #ffb000; }
.kael { width: 236px; height: 300px; border-radius: 16px; padding: 14px; box-sizing: border-box; margin-top: 4px;
  background: linear-gradient(160deg, #ffe7a3, #c8952e 50%, #6f4a10); color: #3a2208; box-shadow: 0 6px 18px rgba(0,0,0,.6); }
.kael.hl { box-shadow: 0 0 0 4px #ffd36b, 0 0 34px #ffb000; }
.kael .kt { font-family: Copperplate, serif; font-size: 24px; text-align: center; }
.kael .ks { font-size: 14px; text-align: center; font-style: italic; margin-bottom: 10px; }
.kael .states { display: flex; justify-content: space-between; margin: 0 4px 12px; }
.kael .s { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: Copperplate, serif; font-size: 18px;
  background: rgba(255,255,255,.35); border: 2px solid rgba(60,30,5,.5); }
.kael .s.on { background: #7a2a12; color: #ffe6b0; border-color: #ffe6b0; box-shadow: 0 0 14px rgba(122,42,18,.8); }
.kael .ab { font-size: 15px; line-height: 1.3; background: rgba(255,250,235,.7); border-radius: 10px; padding: 8px 10px; }
.kael .ab div { opacity: .4; } .kael .ab div.ok { opacity: 1; font-weight: bold; }
.hud { position: absolute; left: 1392px; top: 92px; width: 488px; height: 740px; }
.life { display: flex; gap: 14px; }
.lbox { flex: 1; border-radius: 16px; padding: 12px 14px; text-align: center; position: relative; box-shadow: 0 6px 18px rgba(0,0,0,.5); }
.lbox.you { background: linear-gradient(#2f6b33, #173f1c); border: 2px solid #9fdc8e; }
.lbox.vor { background: linear-gradient(#7a1d0a, #3a0c04); border: 2px solid #ff9a52; }
.lbox .lt { font-family: Copperplate, serif; font-size: 17px; letter-spacing: .1em; color: #fff3d9; }
.lbox .lv { font-size: 76px; font-weight: bold; line-height: 1.05; color: #fff; text-shadow: 0 3px 8px #000; }
.lbox .ls { font-size: 14px; color: #f3dcc0; font-style: italic; }
.lbox.hl { box-shadow: 0 0 0 4px #ffd36b, 0 0 34px #ffb000; }
.delta { position: absolute; right: 12px; top: 58px; font-size: 30px; font-weight: bold; padding: 2px 12px; border-radius: 14px; background: #c21d0a; color: #fff; border: 2px solid #ffb59c; }
.delta.up { background: #2f8f3a; border-color: #c8ffbe; }
.handbox { margin-top: 16px; border-radius: 16px; padding: 12px 14px; background: rgba(0,0,0,.3); border: 2px solid #6b4a2a; min-height: 250px; box-sizing: border-box; }
.handbox .hl2 { font-family: Copperplate, serif; font-size: 16px; color: #ffcf7a; letter-spacing: .1em; margin-bottom: 8px; }
.handcards { display: flex; gap: 10px; flex-wrap: wrap; }
.handcards .slot.hl > .card { filter: drop-shadow(0 0 8px #ffd36b) drop-shadow(0 0 16px #ffb000); }
.handcards .empty2 { margin-top: 60px; }
.misc { margin-top: 14px; display: flex; gap: 12px; font-size: 18px; }
.misc div { flex: 1; border-radius: 12px; padding: 10px 12px; background: rgba(0,0,0,.3); border: 1px solid #6b4a2a; text-align: center; }
.misc b { font-size: 26px; color: #ffcf7a; display: block; }
.sub { position: absolute; left: 40px; right: 40px; bottom: 34px; min-height: 150px; border-radius: 18px; padding: 20px 34px; box-sizing: border-box;
  background: rgba(10,4,2,.82); border: 2px solid #8a5a1a; display: flex; align-items: center; justify-content: center; text-align: center;
  font-size: 34px; line-height: 1.32; color: #fff6e6; }
.sub b { color: #ffcf7a; }
.prog { position: absolute; left: 40px; right: 40px; bottom: 14px; height: 8px; border-radius: 4px; background: rgba(255,255,255,.12); overflow: hidden; }
.prog i { display: block; height: 100%; background: linear-gradient(90deg, #ff9a52, #ffcf7a); }
.banner { position: absolute; left: 0; right: 0; top: 330px; text-align: center; z-index: 50; }
.banner span { display: inline-block; font-family: Copperplate, serif; font-size: 86px; letter-spacing: .1em; padding: 18px 60px; border-radius: 24px;
  background: rgba(20,5,2,.88); color: #ffcf7a; border: 4px solid #ffb15c; text-shadow: 0 0 24px rgba(255,150,40,.9); box-shadow: 0 0 60px rgba(255,120,30,.6); }
.scene { position: absolute; left: 60px; right: 60px; top: 40px; bottom: 210px; display: flex; flex-direction: column; align-items: center; }
.scene h1 { font-family: Copperplate, serif; color: #ffcf7a; font-size: 64px; letter-spacing: .08em; margin: 10px 0 6px; text-shadow: 0 4px 14px #000; }
.scene h2 { font-family: Copperplate, serif; color: #ffb15c; font-size: 26px; letter-spacing: .25em; margin: 0 0 24px; font-weight: normal; border: none; }
.reveal { transition: none; }
.hide { opacity: 0; }
.dim { opacity: .35; }
.panel { background: rgba(255,248,232,.94); color: #2b2118; border-radius: 18px; padding: 22px 28px; box-shadow: 0 8px 26px rgba(0,0,0,.5); font-size: 26px; line-height: 1.35; }
.panel.dark { background: rgba(30,10,5,.92); color: #f6e6cf; border: 2px solid #ff9a52; }
.panel h3 { font-family: Copperplate, serif; color: #7d3a18; font-size: 28px; margin: 0 0 10px; }
.panel.dark h3 { color: #ffb15c; }
.panel b { color: #6b2d14; } .panel.dark b { color: #ffcf7a; }
.panel.on { box-shadow: 0 0 0 4px #ffd36b, 0 0 40px #ffb000; }
.arrowbig { font-size: 64px; color: #ffcf7a; align-self: center; }
.cap2 { font-family: Copperplate, serif; color: #ffcf7a; font-size: 22px; letter-spacing: .1em; text-align: center; margin-top: 12px; }
.flowv { display: flex; flex-direction: column; gap: 10px; }
.fstep { display: flex; gap: 14px; align-items: center; font-size: 25px; background: rgba(255,248,232,.92); color: #2b2118; border-radius: 12px; padding: 10px 16px; }
.fstep .n { width: 44px; height: 44px; border-radius: 10px; background: #6b2d14; color: #fff3d9; display: flex; align-items: center; justify-content: center; font-family: Copperplate, serif; flex: none; }
.fstep.nem .n { background: #2a1612; color: #ffb15c; }
.fstep.on { box-shadow: 0 0 0 4px #ffd36b, 0 0 30px #ffb000; }
.zoomwrap { zoom: 1.55; }
"""

YOUR_STEPS = ["Enderezar", "Robar", "Principal", "Combate", "Final"]
NEM_STEPS = ["Enderezar", "Presagio", "Revelar", "Ataque", "Final"]

BASE = dict(
    kind="board", rnd=0, who="you", step=None, phase=1,
    you=20, vor=14, kael=1, omen="Bruto Garrascua", grave=0, ruin=0,
    nem=[], yours=[], lands=[], hand=["Trasgo Temerario", "Oso de la Espesura", "Oleada de Vigor", "Cuernochoque Ancestral"],
    hl=[], tags={}, deltas={}, banner=None, low_label={},
)


class Script:
    def __init__(self):
        self.beats = []
        self.state = copy.deepcopy(BASE)

    def scene(self, fn, k, say, sub=None):
        self.beats.append(dict(kind="scene", fn=fn, k=k, say=say, sub=sub or say))

    def beat(self, say, sub=None, hl=(), tags=None, deltas=None, banner=None, **changes):
        self.state.update(changes)
        st = copy.deepcopy(self.state)
        st.update(hl=list(hl), tags=tags or {}, deltas=deltas or {}, banner=banner)
        self.beats.append(dict(kind="board", st=st, say=say, sub=sub or say))


def slot(inner, key, st, label="", low=False, low_text="↓ bajada"):
    cls = "slot" + (" low" if low else "") + (" hl" if key in st["hl"] else "")
    tag = ""
    if key in st["tags"]:
        text, tone = st["tags"][key] if isinstance(st["tags"][key], tuple) else (st["tags"][key], "")
        tag = f'<div class="tagx {tone}">{text}</div>'
    lbl = f'<div class="lbl">{label}</div>'
    lowlbl = f'<div class="lowlbl">{st["low_label"].get(key, low_text)}</div>' if low else ""
    return f'<div class="{cls}">{lbl}{inner}{tag}{lowlbl}</div>'


def kael_panel(st):
    k = st["kael"]
    states = "".join(f'<div class="s{" on" if i == k else ""}">{r}</div>' for i, r in enumerate(["I", "II", "III", "IV"], 1))
    ab = (f'<div class="ok">Cargar (+1)</div>'
          f'<div class="{"ok" if k >= 3 else ""}">Descargar (−2)</div>'
          f'<div class="{"ok" if k == 4 else ""}">Definitiva (IV → I)</div>')
    return f'<div class="kael{" hl" if "kael" in st["hl"] else ""}"><div class="kt">KAEL</div><div class="ks">Piromante Errante</div><div class="states">{states}</div><div class="ab">{ab}</div></div>'


def board_html(st):
    if st["who"] == "you":
        rnd = f"RONDA {st['rnd']} · TU TURNO" if st["rnd"] else "PREPARACIÓN"
        steps = YOUR_STEPS
    else:
        rnd = f"RONDA {st['rnd']} · TURNO DE VORTHRAX"
        steps = NEM_STEPS
    pills = "".join(f'<div class="st{" on" if st["step"] == s else ""}">{s}</div>' for s in steps) if st["rnd"] else ""
    ph = f'<div class="ph{" p2" if st["phase"] == 2 else ""}">FASE {st["phase"]}</div>'
    hdr = f'<div class="hdr"><div class="rnd">{rnd}</div><div class="steps">{pills}</div>{ph}</div>'

    backs = "".join(f'<div class="bk" style="left:{i * 5}px; top:{20 - i * 5}px"></div>' for i in range(3))
    pile = (f'<div class="slot"><div class="lbl">MAZO DE AMENAZA</div><div class="pile{" hl" if "pile" in st["hl"] else ""}">{backs}'
            f'<div class="cnt"><b>{st["vor"]}</b><span>BOCA ABAJO</span></div></div><div class="ruin">Ruina: {st["ruin"]}</div></div>')
    omen = slot(card(st["omen"], "vd"), "omen", st, "PRESAGIO") if st["omen"] else slot('<div class="empty2">—</div>', "omen", st, "PRESAGIO")
    vor = slot(nemesis_face("A" if st["phase"] == 1 else "B", "vd"), "vor", st, "LA NÉMESIS")
    nem = "".join(slot(card(n["name"], "vd"), "nem:" + n["name"], st, n.get("label", ""), n.get("low", False), n.get("low_text", "↓ bajada")) for n in st["nem"])
    if not st["nem"]:
        nem = '<div class="empty2">sin criaturas</div>'
    zone_nem = f'<div class="zone nem"><div class="zrow">{pile}{omen}{vor}<div style="width:14px"></div>{nem}</div></div>'

    yours = "".join(slot(card(c["name"], "vd"), "you:" + c["name"], st, c.get("label", ""), c.get("low", False), c.get("low_text", "↓ bajada")) for c in st["yours"])
    if not st["yours"]:
        yours = '<div class="empty2">sin criaturas</div>'
    strips = "".join(
        f'<div class="lstrip {l["k"]}{" low" if l.get("low") else ""}">{pips("{R}" if l["k"] == "M" else "{G}")}{"Montaña" if l["k"] == "M" else "Bosque"}</div>'
        for l in st["lands"]) or '<div style="font-style:italic; opacity:.5; font-size:18px">sin tierras</div>'
    lands = f'<div class="lands{" hl" if "lands" in st["hl"] else ""}"><div class="lbl" style="font-family:Copperplate,serif;font-size:13px;color:#b9f0a8;letter-spacing:.1em">TIERRAS</div>{strips}</div>'
    zone_you = (f'<div class="zone you"><div class="zrow" style="justify-content:space-between"><div class="zrow">{yours}</div>'
                f'<div class="zrow" style="gap:18px">{lands}{kael_panel(st)}</div></div></div>')

    def lbox(key, cls, title, val, sub):
        d = st["deltas"].get(key)
        delta = f'<div class="delta{" up" if d and d.startswith("+") else ""}">{d}</div>' if d else ""
        return f'<div class="lbox {cls}{" hl" if key in st["hl"] else ""}">{delta}<div class="lt">{title}</div><div class="lv">{val}</div><div class="ls">{sub}</div></div>'

    hand = "".join(slot(card(n, "hd"), "hand:" + n, st) for n in st["hand"]) or '<div class="empty2">mano vacía</div>'
    hud = (f'<div class="hud"><div class="life">{lbox("you_life", "you", "TÚ · VIDA", st["you"], "cartas en tu biblioteca")}'
           f'{lbox("vor_life", "vor", "VORTHRAX · VIDA", st["vor"], "Amenazas boca abajo")}</div>'
           f'<div class="handbox"><div class="hl2">TU MANO</div><div class="handcards">{hand}</div></div>'
           f'<div class="misc"><div>Cementerio<b>{st["grave"]}</b></div><div>Ruina de Vorthrax<b>{st["ruin"]}</b></div></div></div>')
    banner = f'<div class="banner"><span>{st["banner"]}</span></div>' if st["banner"] else ""
    return hdr + zone_nem + zone_you + hud + banner


def show(cond):
    return "" if cond else " hide"


def sc_title(k):
    f = fan([card("Oso de la Espesura", "lg"), walker_face("B", "lg"), nemesis_face("A", "lg"), card("Descarga de Ascuas", "lg")],
            [-20, -7, 7, 20], spread=22)
    return f"""<div class="scene"><h1 style="font-size:110px; margin-top:30px">PALMWALKER</h1>
<h2 style="font-size:30px">GUÍA DE JUEGO · TU PRIMERA PARTIDA</h2>
<div class="zoomwrap" style="zoom:1.3"><div class="fan" style="height:100mm; width:150mm; margin-top:0">{f}</div></div></div>"""


def sc_goal(k):
    return f"""<div class="scene"><h1>Tu objetivo</h1><h2>KAEL CONTRA VORTHRAX</h2>
<div style="display:flex; gap:60px; align-items:flex-start">
<div class="{show(k >= 0)}" style="text-align:center"><div class="zoomwrap" style="zoom:1.35">{walker_face("B", "lg")}</div><div class="cap2">TÚ · KAEL, PIROMANTE ERRANTE</div></div>
<div style="display:flex; flex-direction:column; gap:22px; width:520px; margin-top:40px">
<div class="panel{show(k >= 2)}"><h3>Ganas si…</h3>Vorthrax se queda sin cartas de <b>Amenaza boca abajo</b>.</div>
<div class="panel dark{show(k >= 2)}"><h3>Pierdes si…</h3>tu <b>biblioteca</b> se queda sin cartas.</div>
</div>
<div class="{show(k >= 1)}" style="text-align:center"><div class="zoomwrap" style="zoom:1.35">{nemesis_face("A", "lg")}</div><div class="cap2">RIVAL · VORTHRAX, LA NÉMESIS</div></div>
</div></div>"""


def sc_faces(k):
    return f"""<div class="scene"><h1>Cada carta es dos cartas</h1><h2>HECHIZO DELANTE · TIERRA DETRÁS</h2>
<div style="display:flex; gap:50px; align-items:center">
<div style="text-align:center">{card("Trasgo Temerario", "big")}<div class="cap2">FRENTE: HECHIZO</div></div>
<div class="arrowbig{show(k >= 1)}">⟲<div style="font-size:22px; font-family:Copperplate,serif">voltear</div></div>
<div class="{show(k >= 1)}" style="text-align:center"><div class="zoomwrap" style="zoom:1.63">{land("Mountain", "md")}</div><div class="cap2">DORSO: TIERRA</div></div>
<div class="{show(k >= 2)}" style="display:flex; flex-direction:column; gap:16px; width:380px">
<div class="panel"><h3>Usar maná</h3>Para gastar una tierra, <b>bájala</b>. Es lo mismo que girarla.</div>
<div style="display:flex; gap:14px"><div class="lstrip M" style="flex:1">{pips("{R}")}Alzada</div><div class="lstrip M low" style="flex:1">{pips("{R}")}Bajada</div></div>
<div class="panel" style="font-size:22px">Se vuelve a alzar al empezar <b>tu</b> siguiente turno.</div>
</div></div></div>"""


def sc_life(k):
    return f"""<div class="scene"><h1>Tu biblioteca es tu vida</h1><h2>20 CARTAS = 20 VIDAS</h2>
<div style="display:flex; gap:40px; align-items:center">
<div style="text-align:center">{card("Oleada de Vigor", "big")}<div class="cap2">MANO</div></div>
<div class="arrowbig">›</div>
<div style="text-align:center; position:relative"><div class="zoomwrap" style="zoom:1.63">{land("Forest", "md")}</div>
<div class="tagx" style="top:40%; font-size:46px">20 vidas</div><div class="cap2">BIBLIOTECA</div></div>
<div class="arrowbig">›</div>
<div style="text-align:center">{card("Prender", "big")}<div class="cap2">CEMENTERIO</div></div>
</div>
<div style="display:flex; gap:30px; margin-top:26px">
<div class="panel{show(k >= 1)}" style="width:560px"><b>Robar</b> = −1 vida.<br><b>Daño</b> = cartas de la biblioteca al cementerio.</div>
<div class="panel dark{show(k >= 2)}" style="width:620px">Vorthrax: sus <b>Amenazas boca abajo</b> son su vida. Tu daño las manda a su <b>Ruina</b>.</div>
</div></div>"""


def sc_hold(k):
    left_fan = fan([
        '<div class="card threat sm" style="background:repeating-linear-gradient(45deg,#3a1d12,#3a1d12 2mm,#4a2618 2mm,#4a2618 4mm)"><div style="margin:auto;color:#ffb15c;font-family:Copperplate,serif;text-align:center;font-size:1.5em">MAZO DE<br>AMENAZA</div></div>',
        nemesis_face("A", "sm"), card("Bruto Garrascua", "sm"), card("Oso de la Espesura", "sm"), walker_face("A", "sm"),
    ], [-16, -8, 0, 8, 16], spread=9)
    return f"""<div class="scene"><h1>Cómo se sujeta</h1><h2>SIN MESA: TODO EN TUS MANOS</h2>
<div style="display:flex; gap:70px; align-items:flex-start">
<div class="{'' if k != 1 else 'dim'}" style="text-align:center"><div class="zoomwrap" style="zoom:1.9"><div class="fan" style="width:96mm; height:58mm">{left_fan}</div></div>
<div class="cap2">MANO IZQUIERDA · LA MESA</div><div style="font-size:22px; margin-top:6px">Amenaza · Vorthrax · criaturas · Kael con tus tierras detrás</div></div>
<div class="{show(k >= 1)}{' dim' if k == 2 else ''}" style="text-align:center"><div style="display:flex; gap:12px; align-items:center; margin-top:40px">
<div class="zoomwrap" style="zoom:1.45">{card("Descarga de Ascuas", "sm")}</div><div class="arrowbig">›</div>
<div class="zoomwrap" style="zoom:1.45">{land("Mountain", "sm")}</div><div class="arrowbig">›</div>
<div class="zoomwrap" style="zoom:1.45">{card("Prender", "sm")}</div></div>
<div class="cap2">MANO DERECHA · EL GRIMORIO</div><div style="font-size:22px; margin-top:6px">mano · biblioteca · cementerio</div></div>
</div>
<div class="panel{show(k >= 2)}" style="margin-top:20px; font-size:24px">En el vídeo lo verás <b>extendido como una mesa</b>. En tus manos es exactamente lo mismo.</div>
</div>"""


def sc_turn(k):
    def steps(items, cls, on):
        return "".join(f'<div class="fstep {cls}{" on" if i in on else ""}"><div class="n">{i + 1}</div>{t}</div>' for i, t in enumerate(items))
    yours = steps(["<b>Enderezar</b>: alza todo", "<b>Robar</b> 1 carta (−1 vida)", "<b>Principal</b>: 1 tierra, hechizos, Kael", "<b>Combate</b>", "<b>Final</b>: mano máxima de 5"], "", {2} if k == 1 else set())
    nem = steps(["<b>Enderezar</b>", "<b>Ejecutar</b> el Presagio", "<b>Revelar</b> otro Presagio (−1 vida)", "<b>Atacar</b>", "<b>Final</b>: Rescoldo / Infierno"], "nem", {1, 2} if k == 3 else set())
    return f"""<div class="scene"><h1>El turno</h1><h2>TÚ JUEGAS · ELLA RESPONDE</h2>
<div style="display:flex; gap:50px; align-items:flex-start">
<div style="width:600px"><div class="cap2" style="margin:0 0 12px">TU TURNO</div><div class="flowv">{yours}</div></div>
<div class="{show(k >= 2)}" style="width:600px"><div class="cap2" style="margin:0 0 12px">TURNO DE VORTHRAX</div><div class="flowv">{nem}</div></div>
<div class="{show(k >= 3)}" style="text-align:center"><div class="cap2" style="margin:0 0 12px">PRESAGIO</div>{card("Aliento Abrasador", "vd")}<div style="font-size:20px; margin-top:8px; width:200px">lo que hará en su próximo turno</div></div>
</div></div>"""


def sc_mind(k):
    rules = [
        ("Ataca", "con todas sus criaturas, salvo con las que podrías <b>bloquear, matar y sobrevivir</b>."),
        ("Bloquea", "1. <b>Seguro</b>: mata sin morir. 2. <b>Intercambio</b>. 3. <b>Desesperación</b>, solo si el golpe es letal."),
        ("Apunta", "siempre a tu criatura de <b>mayor fuerza</b>. Si no tienes, a ti."),
    ]
    items = "".join(f'<div class="panel dark{show(k >= i)}{" on" if k == i else ""}" style="width:1300px"><h3>{t}</h3>{d}</div>' for i, (t, d) in enumerate(rules))
    return f"""<div class="scene"><h1>La mente de la Némesis</h1><h2>REGLAS FIJAS · TODO ES PREDECIBLE</h2>
<div style="display:flex; flex-direction:column; gap:20px">{items}</div></div>"""


def sc_kael(k):
    return f"""<div class="scene"><h1>Kael, tu Caminante</h1><h2>CUATRO ESTADOS DE LEALTAD</h2>
<div style="display:flex; gap:50px; align-items:flex-start">
<div class="zoomwrap" style="zoom:1.3">{walker_face("A", "lg")}</div>
<div class="zoomwrap" style="zoom:1.3">{walker_face("B", "lg")}</div>
<div style="display:flex; flex-direction:column; gap:16px; width:640px">
<div class="panel{" on" if k == 0 else ""}"><h3>Una vez por turno</h3>I → II → III → IV, girando y volteando la carta.</div>
<div class="panel{show(k >= 1)}{" on" if k == 1 else ""}"><b>Cargar</b>: +1 estado y +1/+0 a una criatura.<br><b>Descargar</b>: −2 estados y 2 de daño a una criatura.</div>
<div class="panel dark{show(k >= 2)}{" on" if k == 2 else ""}"><b>Definitiva</b> (desde IV): 3 de daño a Vorthrax y +1/+0 a tus criaturas.</div>
</div></div></div>"""


def sc_debrief(k):
    items = [
        "El <b>Cuernochoque</b> como tierra en el turno 1.",
        "Guardar el <b>Sabueso</b> para el Diablillo del Presagio.",
        "Dejar un <b>Bosque libre</b> contra el Aliento Abrasador.",
        "Esperar en <b>IV</b> hasta romper la Piel de Ceniza.",
        "La <b>Araña</b>: defender y rematar.",
    ]
    vis = {0: 0, 1: 3, 2: 5}[k]
    li = "".join(f'<div class="fstep{show(i < vis)}"><div class="n">{i + 1}</div>{t}</div>' for i, t in enumerate(items))
    return f"""<div class="scene"><h1>Las cinco claves</h1><h2>LO QUE GANÓ LA PARTIDA</h2><div class="flowv" style="width:1100px">{li}</div></div>"""


def sc_end(k):
    return f"""<div class="scene"><h1 style="font-size:100px; margin-top:70px">¡TE TOCA!</h1>
<h2 style="font-size:30px">BARAJA · REVELA EL PRESAGIO · QUE TUS MANOS ARDAN</h2>
<div style="display:flex; gap:30px; margin-top:20px">{card("Trasgo Temerario", "vd")}{card("Oso de la Espesura", "vd")}{card("Descarga de Ascuas", "vd")}{card("Araña del Dosel", "vd")}</div>
<div class="cap2" style="margin-top:30px; font-size:26px">Reglas completas: palmwalker-reglamento.pdf</div></div>"""


SCENES = {f.__name__: f for f in [sc_title, sc_goal, sc_faces, sc_life, sc_hold, sc_turn, sc_mind, sc_kael, sc_debrief, sc_end]}


def C(name, low=False, label="", low_text="↓ bajada"):
    return dict(name=name, low=low, label=label, low_text=low_text)


def L(k, low=False):
    return dict(k=k, low=low)


def script():
    s = Script()
    sc = s.scene
    sc("sc_title", 0, "Bienvenido a Palmwalker, un duelo de cartas en solitario que se juega entero en tus manos, sin mesa.")
    sc("sc_title", 0, "En este vídeo vas a aprender a jugar viendo una partida real, turno a turno, de principio a fin.")
    sc("sc_goal", 0, "Tú eres Kael, un piromante errante. Lanzas criaturas y hechizos usando maná, como en los juegos de cartas de duelo clásicos.")
    sc("sc_goal", 1, "Tu rival es Vorthrax, el Tirano de Ceniza: una Némesis que juega sola, siguiendo reglas fijas.")
    sc("sc_goal", 2, "Ganas si dejas a Vorthrax sin cartas de Amenaza boca abajo. Pierdes si tu biblioteca se queda sin cartas.")
    sc("sc_faces", 0, "Cada carta de tu Grimorio tiene dos caras. Delante, un hechizo.")
    sc("sc_faces", 1, "Detrás, una tierra. Una vez por turno puedes voltear una carta de tu mano y jugarla como tierra. Ganas maná para siempre, pero pierdes ese hechizo.")
    sc("sc_faces", 2, "Para gastar el maná de una tierra, la bajas. Es lo mismo que girarla. Vuelve a subir al empezar tu siguiente turno.")
    sc("sc_life", 0, "Y esta es la idea clave: tu biblioteca es tu vida. Empiezas con veinte cartas, es decir, con veinte vidas.")
    sc("sc_life", 1, "Robar una carta te cuesta una vida. Y cada punto de daño que recibes manda una carta de tu biblioteca al cementerio.")
    sc("sc_life", 2, "Con Vorthrax pasa lo mismo: sus cartas de Amenaza boca abajo son su vida. Cada punto de daño que le haces manda una a su Ruina.")
    sc("sc_hold", 0, "En la mano izquierda sujetas la Mesa: un abanico con el mazo de Amenaza, Vorthrax, las criaturas de los dos bandos, y Kael con tus tierras detrás.")
    sc("sc_hold", 1, "En la mano derecha, el Grimorio: tu mano delante, la biblioteca en medio y el cementerio al fondo.")
    sc("sc_hold", 2, "En este vídeo lo verás extendido como si fuera una mesa, para que se lea mejor. Pero en tus manos es exactamente lo mismo.")
    sc("sc_turn", 0, "Tu turno tiene cinco pasos: enderezar, robar, fase principal, combate y final.")
    sc("sc_turn", 1, "En la fase principal juegas una tierra, lanzas hechizos y usas a Kael una vez.")
    sc("sc_turn", 2, "El turno de Vorthrax es automático: endereza, ejecuta el Presagio, revela el siguiente, ataca y aplica su efecto de final de turno.")
    sc("sc_turn", 3, "El Presagio es la carta boca arriba de su mazo, y te dice qué hará Vorthrax en su próximo turno. Úsalo para planificar.")
    sc("sc_mind", 0, "Vorthrax ataca con todas sus criaturas, salvo con las que tú podrías bloquear, matar y sobrevivir.")
    sc("sc_mind", 1, "Al bloquear, primero busca bloqueos seguros, en los que mata sin morir. Después, intercambios. Y solo bloquea a la desesperada si el golpe le mataría.")
    sc("sc_mind", 2, "Sus hechizos apuntan siempre a tu criatura de mayor fuerza. Como sus reglas son fijas, puedes predecir todo lo que hará.")
    sc("sc_kael", 0, "Kael tiene cuatro estados de lealtad, del uno al cuatro. Una vez por turno puedes usar una de sus habilidades.")
    sc("sc_kael", 1, "Cargar le sube un estado y da más uno de fuerza a una criatura. Descargar le baja dos estados y hace dos de daño a una criatura.")
    sc("sc_kael", 2, "Y desde el estado cuatro, la Definitiva: tres de daño directo a Vorthrax. Ya lo tienes todo. Vamos a jugar.")

    B = s.beat
    B("Preparación. Barajas los medios grimorios Clan Ascua y Monteverde, robas cuatro cartas, y te quedan veinte en la biblioteca: veinte vidas.", hl=["you_life"])
    B("Vorthrax empieza en Fase 1. Barajamos su mazo y revelamos el primer Presagio: un Bruto Garrascua. Vorthrax tiene catorce vidas.", hl=["omen", "vor_life", "pile"])
    B("Tu mano inicial: Trasgo Temerario, Oso de la Espesura, Oleada de Vigor y Cuernochoque Ancestral.", hl=["hand:Trasgo Temerario", "hand:Oso de la Espesura", "hand:Oleada de Vigor", "hand:Cuernochoque Ancestral"])

    B("Ronda uno. En tu primer turno no robas.", rnd=1, who="you", step="Robar")
    B("El Trasgo necesita maná rojo, y la única carta roja es el propio Trasgo. El Oso necesita dos manás.", step="Principal", hl=["hand:Trasgo Temerario", "hand:Oso de la Espesura"])
    B("Así que conviertes el Cuernochoque, una criatura de cinco manás, en un Bosque. Es un sueño para más adelante: ahora necesitas tierras.",
      lands=[L("F")], hand=["Trasgo Temerario", "Oso de la Espesura", "Oleada de Vigor"], hl=["lands"])
    B("Con Kael, usas Cargar: pasa del estado uno al dos. No hay criatura que reforzar, pero la lealtad sube.", kael=2, hl=["kael"])
    B("Turno de Vorthrax. Ejecuta el Presagio: entra el Bruto Garrascua, un tres-dos. Acaba de llegar, así que este turno no puede atacar.",
      who="nem", step="Presagio", nem=[C("Bruto Garrascua", label="MAREO")], hl=["nem:Bruto Garrascua"])
    B("Revela el nuevo Presagio: un Diablillo de Ceniza. Revelar le cuesta una vida, así que baja a trece.",
      step="Revelar", omen="Diablillo de Ceniza", vor=13, hl=["omen", "vor_life"], deltas={"vor_life": "−1"})
    B("Al final de su turno, Rescoldo te hace un punto de daño. Tu Descarga de Ascuas pasa de la biblioteca al cementerio. Bajas a diecinueve.",
      step="Final", you=19, grave=1, nem=[C("Bruto Garrascua")], hl=["you_life", "vor"], deltas={"you_life": "−1"})

    B("Ronda dos. Enderezas y robas un Sabueso de Ceniza. Dieciocho vidas.", rnd=2, who="you", step="Robar", you=18,
      hand=["Trasgo Temerario", "Oso de la Espesura", "Oleada de Vigor", "Sabueso de Ceniza"], hl=["hand:Sabueso de Ceniza", "you_life"], deltas={"you_life": "−1"})
    B("Mira el Presagio: viene un Diablillo, un uno-uno volador. El Sabueso hace un punto de daño al entrar. Si esperas un turno, lo matará nada más llegar.",
      step="Principal", hl=["omen", "hand:Sabueso de Ceniza"])
    B("Así que guardas el Sabueso. Conviertes el Trasgo en una Montaña…", lands=[L("F"), L("M")],
      hand=["Oso de la Espesura", "Oleada de Vigor", "Sabueso de Ceniza"], hl=["lands"])
    B("…y lanzas el Oso de la Espesura bajando tus dos tierras.", lands=[L("F", True), L("M", True)],
      hand=["Oleada de Vigor", "Sabueso de Ceniza"], yours=[C("Oso de la Espesura")], hl=["you:Oso de la Espesura"])
    B("Kael vuelve a cargar: estado tres.", kael=3, hl=["kael"])
    B("Turno de Vorthrax. Ejecuta el Diablillo y revela su siguiente Presagio: Aliento Abrasador. Baja a doce.",
      who="nem", step="Revelar", nem=[C("Bruto Garrascua"), C("Diablillo de Ceniza", label="MAREO")], omen="Aliento Abrasador", vor=12,
      hl=["nem:Diablillo de Ceniza", "omen", "vor_life"], deltas={"vor_life": "−1"})
    B("Ahora ataca. ¿Podría tu Oso bloquear al Bruto, matarlo y sobrevivir? Lo mataría, pero moriría. Así que el Bruto ataca.",
      step="Ataque", nem=[C("Bruto Garrascua", True, low_text="⚔️ ataca"), C("Diablillo de Ceniza", label="MAREO")],
      hl=["nem:Bruto Garrascua", "you:Oso de la Espesura"])
    B("Tus tierras siguen bajadas porque las usaste para el Oso: no puedes lanzar Oleada de Vigor. Aun así, decides bloquear.",
      hl=["lands", "hand:Oleada de Vigor"], tags={"you:Oso de la Espesura": "🛡 BLOQUEA"})
    B("Los dos se golpean a la vez y mueren. Un Oso de dos manás por un tres-dos es un buen cambio.",
      tags={"you:Oso de la Espesura": ("✖ MUERE", "bad"), "nem:Bruto Garrascua": ("✖ MUERE", "bad")})
    B("El Oso va a tu cementerio y el Bruto, a la Ruina de Vorthrax.", yours=[], nem=[C("Diablillo de Ceniza")], grave=2, ruin=1)
    B("Rescoldo: pierdes el segundo Trasgo de tu biblioteca. Diecisiete vidas.", step="Final", you=17, grave=3, hl=["you_life"], deltas={"you_life": "−1"})

    B("Ronda tres. Enderezas y robas Fuerza Salvaje. Dieciséis vidas.", rnd=3, who="you", step="Robar", you=16, lands=[L("F"), L("M")],
      hand=["Oleada de Vigor", "Sabueso de Ceniza", "Fuerza Salvaje"], hl=["hand:Fuerza Salvaje", "you_life"], deltas={"you_life": "−1"})
    B("La juegas como tierra. Ya tienes tres.", step="Principal", lands=[L("F"), L("M"), L("F")], hand=["Oleada de Vigor", "Sabueso de Ceniza"], hl=["lands"])
    B("Lanzas el Sabueso. Al entrar hace un punto de daño al Diablillo, que muere. Justo como habías planeado.",
      lands=[L("F", True), L("M", True), L("F")], hand=["Oleada de Vigor"], yours=[C("Sabueso de Ceniza")],
      hl=["you:Sabueso de Ceniza"], tags={"nem:Diablillo de Ceniza": ("✖ MUERE", "bad")})
    B("Kael carga hasta el estado cuatro. Ya tiene disponible la Definitiva.", nem=[], ruin=2, kael=4, hl=["kael"])
    B("El Presagio anuncia un Aliento Abrasador: dos de daño a tu mejor criatura. Por eso dejas un Bosque sin usar, y guardas la Oleada de Vigor.",
      hl=["omen", "hand:Oleada de Vigor"], tags={})
    B("Turno de Vorthrax. Ejecuta el Aliento Abrasador. Su objetivo es tu criatura de mayor fuerza: el Sabueso.",
      who="nem", step="Presagio", hl=["omen", "you:Sabueso de Ceniza"], tags={"you:Sabueso de Ceniza": ("🎯 2 DE DAÑO", "bad")})
    B("Respondes con Oleada de Vigor, bajando el Bosque libre. El Sabueso pasa a cinco-cinco y aguanta los dos de daño.",
      lands=[L("F", True), L("M", True), L("F", True)], hand=[], grave=4, tags={"you:Sabueso de Ceniza": ("5/5 ✔", "good")})
    B("El hechizo vuelve boca abajo al fondo de su mazo, y Vorthrax sube a trece. Luego revela al Demonio Abrasador y baja a doce.",
      step="Revelar", omen="Demonio Abrasador", vor=12, hl=["omen", "vor_life", "pile"])
    B("Rescoldo: pierdes un Oso de tu biblioteca. Quince vidas.", step="Final", you=15, grave=5, hl=["you_life"], deltas={"you_life": "−1"})

    B("Ronda cuatro. Robas el Saqueador Incendiario. Catorce vidas.", rnd=4, who="you", step="Robar", you=14, lands=[L("F"), L("M"), L("F")],
      hand=["Saqueador Incendiario"], hl=["hand:Saqueador Incendiario", "you_life"], deltas={"you_life": "−1"})
    B("Es tu única carta, así que hoy no juegas tierra. Lanzas el Saqueador con tus tres tierras. Tiene Prisa: puede atacar ya.",
      step="Principal", lands=[L("F", True), L("M", True), L("F", True)], hand=[], yours=[C("Sabueso de Ceniza"), C("Saqueador Incendiario", label="PRISA")],
      hl=["you:Saqueador Incendiario"])
    B("Atacas con el Sabueso y el Saqueador. Vorthrax no tiene criaturas: nadie bloquea.", step="Combate",
      yours=[C("Sabueso de Ceniza", True, low_text="⚔️ ataca"), C("Saqueador Incendiario", True, low_text="⚔️ ataca")],
      hl=["you:Sabueso de Ceniza", "you:Saqueador Incendiario"])
    B("Son cinco de daño, pero la Piel de Ceniza de Vorthrax previene los dos primeros. Entran tres: tres Amenazas van a la Ruina. Vorthrax baja a nueve.",
      vor=9, ruin=5, hl=["vor", "vor_life"], deltas={"vor_life": "−3"})
    B("Kael se queda en el estado cuatro. Si lanzara la Definitiva ahora, la Piel de Ceniza se comería dos de sus tres puntos de daño. Mejor esperar.",
      step="Final", hl=["kael", "vor"])
    B("Turno de Vorthrax. Ejecuta al Demonio Abrasador, un cuatro-tres con Arrollar, y revela un Dragoncillo de Ascuas. Baja a ocho.",
      who="nem", step="Revelar", nem=[C("Demonio Abrasador", label="MAREO")], omen="Dragoncillo de Ascuas", vor=8,
      hl=["nem:Demonio Abrasador", "omen", "vor_life"], deltas={"vor_life": "−1"})
    B("El Demonio acaba de llegar, así que no ataca. Rescoldo: trece vidas.", step="Final", you=13, grave=6, nem=[C("Demonio Abrasador")],
      hl=["you_life"], deltas={"you_life": "−1"})

    B("Ronda cinco. Robas Furia de Batalla. Doce vidas.", rnd=5, who="you", step="Robar", you=12, lands=[L("F"), L("M"), L("F")],
      yours=[C("Sabueso de Ceniza"), C("Saqueador Incendiario")], hand=["Furia de Batalla"], hl=["hand:Furia de Batalla", "you_life"], deltas={"you_life": "−1"})
    B("Atacas otra vez con los dos. Ahora Vorthrax sí tiene un bloqueador: el Demonio Abrasador.", step="Combate",
      yours=[C("Sabueso de Ceniza", True, low_text="⚔️ ataca"), C("Saqueador Incendiario", True, low_text="⚔️ ataca")], hl=["nem:Demonio Abrasador"])
    B("Busca un bloqueo seguro. Al Sabueso puede matarlo sin morir; al Saqueador, no. Así que bloquea al Sabueso.",
      hl=["nem:Demonio Abrasador", "you:Sabueso de Ceniza"], tags={"nem:Demonio Abrasador": "🛡 BLOQUEA AL SABUESO"})
    B("Tras los bloqueos, lanzas Furia de Batalla sobre el Sabueso. Pasa a cinco-dos.", lands=[L("F"), L("M", True), L("F")], hand=[], grave=7,
      tags={"you:Sabueso de Ceniza": ("5/2", "good")}, hl=["you:Sabueso de Ceniza"])
    B("El Sabueso y el Demonio se matan entre sí.", tags={"you:Sabueso de Ceniza": ("✖ MUERE", "bad"), "nem:Demonio Abrasador": ("✖ MUERE", "bad")})
    B("El Saqueador no está bloqueado: tres de daño, menos dos de la Piel de Ceniza. Entra uno. Vorthrax baja a siete.",
      yours=[C("Saqueador Incendiario", True, low_text="⚔️ ataca")], nem=[], grave=8, ruin=7, vor=7, hl=["vor_life", "you:Saqueador Incendiario"], deltas={"vor_life": "−1"})
    B("¡Siete o menos! Vorthrax pasa a la Fase 2. Reavivar le devuelve tres cartas de la Ruina, y sube a diez. Pero pierde la Piel de Ceniza.",
      phase=2, vor=10, ruin=4, hl=["vor", "vor_life"], deltas={"vor_life": "+3"}, banner="¡FASE 2!")
    B("Es el momento. En tu segunda fase principal, Kael lanza su Definitiva: tres de daño completos. Vorthrax cae a siete.",
      step="Final", kael=1, vor=7, ruin=7, hl=["kael", "vor_life"], deltas={"vor_life": "−3"}, banner="DEFINITIVA")
    B("Fase 2. Vorthrax ejecuta el Dragoncillo de Ascuas, y con Infierno sus criaturas tienen Prisa. Revela un Centinela de Magma: seis vidas.",
      who="nem", step="Revelar", nem=[C("Dragoncillo de Ascuas", label="PRISA")], omen="Centinela de Magma", vor=6,
      hl=["nem:Dragoncillo de Ascuas", "omen", "vor_life"], deltas={"vor_life": "−1"})
    B("El Dragoncillo ataca. Tu Saqueador sigue bajado porque atacó en tu turno: no puede bloquear.", step="Ataque",
      nem=[C("Dragoncillo de Ascuas", True, low_text="⚔️ ataca")], yours=[C("Saqueador Incendiario", True)], hl=["nem:Dragoncillo de Ascuas", "you:Saqueador Incendiario"])
    B("Dos de daño: pierdes Floración Vital y el Draco Alaceniza. Diez vidas.", you=10, grave=10, hl=["you_life"], deltas={"you_life": "−2"})
    B("Y al final del turno, Infierno te hace dos más. Ocho vidas. Ahora es una carrera.", step="Final", you=8, grave=12, hl=["you_life", "vor"], deltas={"you_life": "−2"})

    B("Ronda seis. Robas la Araña del Dosel. Siete vidas.", rnd=6, who="you", step="Robar", you=7, lands=[L("F"), L("M"), L("F")],
      yours=[C("Saqueador Incendiario")], hand=["Araña del Dosel"], hl=["hand:Araña del Dosel", "you_life"], deltas={"you_life": "−1"})
    B("La lanzas: una uno-cuatro con Alcance, perfecta para frenar al Dragoncillo volador.", step="Principal", lands=[L("F", True), L("M", True), L("F")],
      hand=[], yours=[C("Saqueador Incendiario"), C("Araña del Dosel", label="ALCANCE")], hl=["you:Araña del Dosel"])
    B("Kael carga: estado dos, y el Saqueador pasa a cuatro-dos.", kael=2, hl=["kael", "you:Saqueador Incendiario"], tags={"you:Saqueador Incendiario": ("4/2", "good")})
    B("Atacas con el Saqueador. El Dragoncillo está bajado porque atacó: no hay bloqueadores. Cuatro de daño. Vorthrax baja a dos.",
      step="Combate", vor=2, ruin=11, yours=[C("Saqueador Incendiario", True, low_text="⚔️ ataca"), C("Araña del Dosel")],
      hl=["vor_life"], deltas={"vor_life": "−4"}, tags={"you:Saqueador Incendiario": ("4/2", "good")})
    B("Turno de Vorthrax. Ejecuta al Centinela de Magma, y revela de nuevo al Demonio Abrasador, el que volvió con Reavivar. Le queda una sola carta.",
      who="nem", step="Revelar", nem=[C("Dragoncillo de Ascuas"), C("Centinela de Magma", label="DEFENSOR")], omen="Demonio Abrasador", vor=1,
      hl=["omen", "vor_life"], deltas={"vor_life": "−1"})
    B("El Dragoncillo ataca: tu Araña lo aguantaría, pero no puede matarlo. Lo bloqueas y no muere nadie.", step="Ataque",
      nem=[C("Dragoncillo de Ascuas", True, low_text="⚔️ ataca"), C("Centinela de Magma")], hl=["nem:Dragoncillo de Ascuas", "you:Araña del Dosel"],
      tags={"you:Araña del Dosel": "🛡 BLOQUEA"})
    B("Infierno: cinco vidas. Atención: el próximo turno el Demonio llegará con Prisa. Cuatro de Arrollar más dos de Infierno. Este es tu último turno.",
      step="Final", you=5, grave=14, hl=["you_life", "omen"], deltas={"you_life": "−2"})

    B("Ronda siete. Robas el Guardabosques Élfico. Cuatro vidas. Solo necesitas un punto de daño.", rnd=7, who="you", step="Robar", you=4,
      lands=[L("F"), L("M"), L("F")], yours=[C("Saqueador Incendiario"), C("Araña del Dosel")], hand=["Guardabosques Élfico"],
      hl=["you_life", "vor_life"], deltas={"you_life": "−1"})
    B("Atacas con el Saqueador y la Araña.", step="Combate",
      yours=[C("Saqueador Incendiario", True, low_text="⚔️ ataca"), C("Araña del Dosel", True, low_text="⚔️ ataca")])
    B("El Centinela no puede matar a ninguno. Pero cuatro de daño acabarían con Vorthrax, así que bloquea a la desesperada al de mayor fuerza: el Saqueador.",
      hl=["nem:Centinela de Magma", "you:Saqueador Incendiario"], tags={"nem:Centinela de Magma": "🛡 DESESPERACIÓN"})
    B("La Araña pasa sin bloquear. Un punto de daño. La última carta de Vorthrax va a la Ruina. ¡Victoria, con cuatro vidas!",
      vor=0, ruin=12, hl=["vor_life", "you:Araña del Dosel"], deltas={"vor_life": "−1"}, banner="¡VICTORIA!")

    sc("sc_debrief", 0, "Repasemos las cinco decisiones que ganaron la partida.")
    sc("sc_debrief", 1, "Usar el Cuernochoque como tierra. Guardar el Sabueso para el Diablillo. Y dejar un Bosque libre contra el Aliento Abrasador.")
    sc("sc_debrief", 2, "Esperar en el estado cuatro hasta romper la Piel de Ceniza. Y usar la Araña para defender y para rematar.")
    sc("sc_end", 0, "Ya sabes jugar a Palmwalker. Baraja tu Grimorio, revela el primer Presagio, y que tus manos ardan. ¡Suerte, Caminante!")
    return s.beats


def frame_html(beat, i, total):
    inner = SCENES[beat["fn"]](beat["k"]) if beat["kind"] == "scene" else board_html(beat["st"])
    prog = f'<div class="prog"><i style="width:{(i + 1) / total * 100:.2f}%"></i></div>'
    return (f'<!doctype html><html lang="es"><head><meta charset="utf-8"><style>{b.CSS}{VIDEO_CSS}</style></head>'
            f'<body><div class="frame">{inner}<div class="sub">{beat["sub"]}</div>{prog}</div></body></html>')


def run(cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         check=True, capture_output=True, text=True).stdout
    return float(out.strip())


def render_frame(i, beat, total):
    html_path = WORK / f"f{i:03d}.html"
    png = WORK / f"f{i:03d}.png"
    html_path.write_text(frame_html(beat, i, total), encoding="utf-8")
    subprocess.run([CHROME, "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1920,1080",
                    f"--screenshot={png}", html_path.as_uri()], check=True, capture_output=True, timeout=60)
    return png


def render_audio(i, beat):
    aiff = WORK / f"a{i:03d}.aiff"
    run(["say", "-v", VOICE, "-r", RATE, "-o", str(aiff), beat["say"]])
    return duration(aiff)


def render_segment(i, dur):
    prev = WORK / f"f{max(i - 1, 0):03d}.png"
    cur = WORK / f"f{i:03d}.png"
    seg = WORK / f"s{i:03d}.mp4"
    run(["ffmpeg", "-y", "-loop", "1", "-framerate", str(FPS), "-t", f"{XFADE + 0.1:.3f}", "-i", str(prev),
         "-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.4f}", "-i", str(cur),
         "-filter_complex", f"[0:v][1:v]xfade=transition=fade:duration={XFADE}:offset=0,format=yuv420p[v]",
         "-map", "[v]", "-r", str(FPS), "-frames:v", str(round(dur * FPS)),
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-tune", "stillimage", str(seg)])
    wav = WORK / f"p{i:03d}.wav"
    run(["ffmpeg", "-y", "-i", str(WORK / f"a{i:03d}.aiff"), "-af", f"adelay=200:all=1,apad=whole_dur={dur:.4f},atrim=0:{dur:.4f}",
         "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(wav)])
    return seg, wav


def main():
    if WORK.exists():
        shutil.rmtree(WORK)
    WORK.mkdir(parents=True)
    beats = script()
    total = len(beats)
    print(f"{total} beats")
    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(lambda a: render_frame(a[0], a[1], total), enumerate(beats)))
    print("frames ok")
    with ThreadPoolExecutor(max_workers=6) as ex:
        audio = list(ex.map(lambda a: render_audio(a[0], a[1]), enumerate(beats)))
    durs = [round((a + 0.2 + PAD) * FPS) / FPS for a in audio]
    print(f"audio ok · {sum(durs) / 60:.1f} min")
    with ThreadPoolExecutor(max_workers=4) as ex:
        segs = list(ex.map(lambda a: render_segment(a[0], a[1]), enumerate(durs)))
    (WORK / "v.txt").write_text("".join(f"file '{s.name}'\n" for s, _ in segs))
    (WORK / "a.txt").write_text("".join(f"file '{w.name}'\n" for _, w in segs))
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(WORK / "v.txt"), "-c", "copy", str(WORK / "video.mp4")])
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(WORK / "a.txt"), "-c", "copy", str(WORK / "audio.wav")])
    run(["ffmpeg", "-y", "-i", str(WORK / "video.mp4"), "-i", str(WORK / "audio.wav"), "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", str(OUT)])
    (WORK / "durations.json").write_text(json.dumps(durs))
    print(OUT)


if __name__ == "__main__":
    main()
