import html
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_HTML = ROOT / "rulebook.html"
OUT_PDF = ROOT / "palmwalker-rulebook.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

TYPE_GLYPH = {
    "Creature": "⚔",
    "Instant": "ϟ",
    "Sorcery": "✶",
    "Aura": "◈",
    "Spell": "✹",
}

RED = [
    dict(name="Reckless Goblin", cost="{R}", type="Creature", sub="Goblin", pt="2/1", art="👺",
         text="<b>Haste</b>", flavor="First in, first out, first on fire.", qty=2),
    dict(name="Ember Bolt", cost="{R}", type="Instant", art="⚡",
         text="Ember Bolt deals 3 damage to a creature or to the Nemesis.", flavor="Quick words, hot syllables.", qty=2),
    dict(name="Cinder Hound", cost="{1}{R}", type="Creature", sub="Hound", pt="2/2", art="🐺",
         text="When Cinder Hound enters, it deals 1 damage to a creature.", flavor="It hunts by the smell of smoke.", qty=1),
    dict(name="Firebrand Raider", cost="{2}{R}", type="Creature", sub="Human Warrior", pt="3/2", art="🏇",
         text="<b>Haste</b>", flavor="Raids at dawn. Burns by noon.", qty=1),
    dict(name="Battle Fury", cost="{R}", type="Instant", art="💢",
         text="A creature gets +3/+0 until end of turn.", flavor="Rage is the cheapest weapon.", qty=1),
    dict(name="Molten Blade", cost="{1}{R}", type="Aura", art="🗡️",
         text="Tuck behind a creature you control. It gets +2/+0 and has <b>Trample</b>.", flavor="", qty=1),
    dict(name="Kindle", cost="{R}", type="Sorcery", art="🔥",
         text="Kindle deals 2 damage to a creature or to the Nemesis.", flavor="Every wildfire starts small.", qty=1),
    dict(name="Volcanic Roar", cost="{2}{R}", type="Sorcery", art="🌋",
         text="Volcanic Roar deals 2 damage to each Nemesis creature.", flavor="", qty=1),
    dict(name="Ashwing Drake", cost="{3}{R}", type="Creature", sub="Drake", pt="3/3", art="🐉",
         text="<b>Flying</b>", flavor="Its shadow is warm.", qty=1),
    dict(name="Pyre Titan", cost="{4}{R}", type="Creature", sub="Giant", pt="5/4", art="🗿",
         text="<b>Trample</b>. When Pyre Titan enters, it deals 2 damage to the Nemesis.", flavor="", qty=1),
]

GREEN = [
    dict(name="Thicket Bear", cost="{1}{G}", type="Creature", sub="Bear", pt="2/2", art="🐻",
         text="", flavor="The forest does not need a reason to be angry.", qty=2),
    dict(name="Surge of Vigor", cost="{G}", type="Instant", art="🌿",
         text="A creature gets +3/+3 until end of turn.", flavor="Roots remember how to grow.", qty=2),
    dict(name="Elvish Grovekeeper", cost="{G}", type="Creature", sub="Elf Druid", pt="1/1", art="🧝",
         text="{T}: Add {G}.", flavor="", qty=1),
    dict(name="Wild Strength", cost="{1}{G}", type="Aura", art="💪",
         text="Tuck behind a creature you control. It gets +2/+2 and has <b>Trample</b>.", flavor="", qty=1),
    dict(name="Spider of the Canopy", cost="{1}{G}", type="Creature", sub="Spider", pt="1/4", art="🕷️",
         text="<b>Reach</b>", flavor="The sky is just a higher floor.", qty=1),
    dict(name="Ironbark Wall", cost="{1}{G}", type="Creature", sub="Plant Wall", pt="0/5", art="🌳",
         text="<b>Defender</b>", flavor="", qty=1),
    dict(name="Bloom of Life", cost="{1}{G}", type="Sorcery", art="🌸",
         text="Gain 4 life.", flavor="What fell, grows back.", qty=1),
    dict(name="Mossback Boar", cost="{2}{G}", type="Creature", sub="Boar", pt="3/3", art="🐗",
         text="<b>Trample</b>", flavor="", qty=1),
    dict(name="Grovesinger Druid", cost="{2}{G}", type="Creature", sub="Elf Druid", pt="2/3", art="🍃",
         text="When Grovesinger Druid enters, gain 2 life.", flavor="", qty=1),
    dict(name="Ancient Crashhorn", cost="{4}{G}", type="Creature", sub="Beast", pt="6/6", art="🦏",
         text="<b>Trample</b>", flavor="Older than the trees it tramples.", qty=1),
]

THREATS = [
    dict(name="Ash Imp", type="Creature", sub="Imp", pt="1/1", art="😈", text="<b>Flying</b>", qty=2),
    dict(name="Cinderclaw Brute", type="Creature", sub="Demon", pt="3/2", art="👹", text="", qty=2),
    dict(name="Magma Sentinel", type="Creature", sub="Elemental", pt="1/4", art="🪨", text="<b>Defender</b>", qty=2),
    dict(name="Ember Wyrmling", type="Creature", sub="Dragon", pt="2/2", art="🐲", text="<b>Flying</b>", qty=1),
    dict(name="Scorch Fiend", type="Creature", sub="Demon", pt="4/3", art="👿", text="<b>Trample</b>", qty=1),
    dict(name="Vorthrax's Herald", type="Creature", sub="Cultist", pt="3/3", art="📯",
         text="When it enters, it deals 1 damage to you.", qty=1),
    dict(name="Lava Behemoth", type="Creature", sub="Elemental", pt="5/5", art="🦣", text="", qty=1),
    dict(name="Searing Breath", type="Spell", art="🔥",
         text="Deal 2 damage to your highest-power creature. If you have none, deal 2 damage to you.", qty=2),
    dict(name="Rain of Cinders", type="Spell", art="☄️",
         text="Deal 1 damage to each of your creatures and 1 damage to you.", qty=1),
    dict(name="Tyrant's Roar", type="Spell", art="🗯️",
         text="Nemesis creatures get +1/+0 until end of turn.", qty=1),
    dict(name="Cinder Rebirth", type="Spell", art="🪦",
         text="Return the highest-power creature from the Ruin to the Table. If there is none, deal 2 damage to you.", qty=1),
]

for c in RED:
    c["color"] = "red"
for c in GREEN:
    c["color"] = "green"
for c in THREATS:
    c["color"] = "threat"

CARDS = {c["name"]: c for c in RED + GREEN + THREATS}


def pips(text):
    def repl(m):
        sym = m.group(1)
        if sym == "T":
            return '<span class="pip tap">↓</span>'
        cls = {"R": "r", "G": "g", "W": "w", "U": "u", "B": "b"}.get(sym, "n")
        return f'<span class="pip {cls}">{sym if cls == "n" else ""}</span>'
    return re.sub(r"\{([0-9RGWUBT])\}", repl, text)


def cost_column(cost):
    syms = re.findall(r"\{([0-9RGWUB])\}", cost)
    return "".join(pips("{" + s + "}") for s in syms)


TX = dict(
    type_label={"Creature": "Creature", "Instant": "Instant", "Sorcery": "Sorcery", "Aura": "Aura", "Spell": "Spell"},
    threat_prefix="Threat ",
    land_word="Land",
    add_word="Add",
    back_of="Back of every {family} card",
    lands={"Mountain": ("Mountain", "Emberkin"), "Forest": ("Forest", "Wildwood")},
    walker_name="Kael, Wandering Pyromancer",
    face="Face",
    charge="<b>CHARGE</b> (+1 state): a creature you control gets +1/+0 until end of turn.",
    discharge="<b>DISCHARGE</b> (−2 states): Kael deals 2 damage to a creature.",
    ultimate="<b>ULTIMATE</b> (go to I): Kael deals 3 damage to the Nemesis. Your creatures get +1/+0 until end of turn.",
    nem_name="Vorthrax, the Ash Tyrant",
    phase1="PHASE 1",
    phase2="PHASE 2",
    heroic_tag="HEROIC",
    nem_a=("<p><b>ASH HIDE</b> — Prevent the first 2 damage dealt to Vorthrax each turn.</p>"
           "<p><b>SMOLDER</b> — At the end of each Nemesis turn, Vorthrax deals 1 damage to you.</p>"
           "<p class='trig'>When the Threat deck has <b>7 or fewer</b> face-down cards, flip Vorthrax. "
           "<b>REKINDLE</b>: return the 3 rearmost Ruin cards face-down to the bottom.</p>"),
    nem_b=("<p><b>INFERNO</b> — Nemesis creatures have <b>Haste</b>.</p>"
           "<p>At the end of each Nemesis turn, Vorthrax deals 2 damage to you.</p>"
           "<p class='trig'>Ash Hide is gone. Defeat Vorthrax by emptying its face-down Threat cards.</p>"),
    heroic="<p><b>HEROIC</b> — Everything above, and Nemesis creatures get +1/+0.</p>",
    omen="OMEN",
    no_creatures="no creatures",
    you="You",
    hand="Hand",
    omen_label="Omen:",
    lowered="↓ lowered",
    why="Why?",
)


def card(name_or_dict, size="md", extra=""):
    c = CARDS[name_or_dict] if isinstance(name_or_dict, str) else name_or_dict
    color = c["color"]
    glyph = TYPE_GLYPH[c["type"]]
    typeline = TX["type_label"][c["type"]] + (f" — {c['sub']}" if c.get("sub") else "")
    if color == "threat":
        typeline = TX["threat_prefix"] + typeline
    cost = cost_column(c.get("cost", "")) if c.get("cost") else '<span class="free">0</span>'
    pt = f'<div class="ptx">{c["pt"]}</div>' if c.get("pt") else ""
    pt_box = f'<div class="ptbox">{c["pt"]}</div>' if c.get("pt") else ""
    flavor = f'<div class="flavor">{c["flavor"]}</div>' if c.get("flavor") else ""
    text = pips(c.get("text", ""))
    n = len(c["name"])
    fit = " xlong" if n > 20 else (" long" if n > 16 else "")
    return f"""
<div class="card {color} {size} {extra}{fit}">
  <div class="index"><div class="costcol">{cost}</div><div class="glyph">{glyph}</div>{pt}</div>
  <div class="body">
    <div class="title">{html.escape(c['name'])}</div>
    <div class="art"><span>{c['art']}</span></div>
    <div class="typeline">{typeline}</div>
    <div class="text">{text}{flavor}</div>
  </div>
  {pt_box}
</div>"""


def land(kind, size="md"):
    label, family = TX["lands"][kind]
    if kind == "Mountain":
        color, sym, art = "red", "{R}", "⛰️"
    else:
        color, sym, art = "green", "{G}", "🌲"
    return f"""
<div class="card landback {color} {size}">
  <div class="landstrip">{pips(sym)}<span>{label.upper()}</span>{pips(sym)}</div>
  <div class="landart"><span>{art}</span></div>
  <div class="landtext">{TX['land_word']}<br>{pips('{T}')}: {TX['add_word']} {pips(sym)}</div>
  <div class="landfoot">{TX['back_of'].format(family=family)}</div>
</div>"""


def walker_face(face, size="lg"):
    states = {
        "A": [("I", ["charge"]), ("II", ["charge"])],
        "B": [("III", ["charge", "discharge"]), ("IV", ["discharge", "ultimate"])],
    }[face]
    halves = []
    for i, (num, abil) in enumerate(states):
        body = "".join(f"<p>{TX[a]}</p>" for a in abil)
        halves.append(f"""
<div class="half {'flip' if i == 1 else ''}">
  <div class="hhead"><span class="state">{num}</span><span class="hname">{TX['walker_name']}</span></div>
  <div class="hbody">{body}</div>
</div>""")
    return f'<div class="card walker {size}"><div class="halves">{"".join(halves)}</div><div class="facetag">{TX["face"]} {face}</div></div>'


def nemesis_face(face, size="lg"):
    title, body = (TX["phase1"], TX["nem_a"]) if face == "A" else (TX["phase2"], TX["nem_b"])
    short = TX["nem_name"].split(",")[0]
    return f"""
<div class="card nemesis {size}">
  <div class="halves">
    <div class="half"><div class="hhead"><span class="state">{title}</span><span class="hname">{TX['nem_name']}</span></div><div class="hbody">{body}</div></div>
    <div class="half flip"><div class="hhead"><span class="state">{title} · {TX['heroic_tag']}</span><span class="hname">{short}</span></div><div class="hbody">{TX['heroic']}</div></div>
  </div>
  <div class="facetag">{TX['face']} {face}</div>
</div>"""


def other_nemesis(name, emoji, color, p1, p2):
    return f"""
<div class="card nemesis {color} md">
  <div class="halves">
    <div class="half"><div class="hhead"><span class="state">{TX['phase1']}</span><span class="hname">{name}</span></div><div class="hbody"><div class="nemart">{emoji}</div><p>{p1}</p></div></div>
    <div class="half"><div class="hhead"><span class="state">{TX['phase2']}</span></div><div class="hbody"><p>{p2}</p></div></div>
  </div>
</div>"""


def chip(name, pt="", side="you", low=False, note=""):
    cls = f"chip {side}{' low' if low else ''}"
    ptx = f'<span class="cpt">{pt}</span>' if pt else ""
    nt = f'<span class="cnote">{note}</span>' if note else ""
    lt = f'<span class="lowtag">{TX["lowered"]}</span>' if low else ""
    return f'<div class="{cls}"><span class="cname">{name}</span>{nt}{ptx}{lt}</div>'


def landchip(kind, low=False):
    sym = "{R}" if kind == "M" else "{G}"
    return f'<div class="lchip{" low" if low else ""}">{pips(sym)}</div>'


def board(title, you, vor, phase, kael, omen, nem_creatures, your_creatures, lands, hand):
    empty = f'<span class="empty">{TX["no_creatures"]}</span>'
    nem = "".join(nem_creatures) or empty
    yours = "".join(your_creatures) or empty
    lnd = "".join(lands)
    return f"""
<div class="board">
  <div class="btitle">{title}</div>
  <div class="brow nem">
    <div class="omen"><span>{TX['omen']}</span>{omen}</div>
    <div class="bslot"><div class="bossbadge">Vorthrax · {phase}</div>{nem}</div>
  </div>
  <div class="brow you">
    <div class="bslot">{yours}</div>
    <div class="walkerchip">Kael <b>{kael}</b><div class="lands">{lnd}</div></div>
  </div>
  <div class="meters"><span class="m you">📖 {TX['you']} <b>{you}</b></span><span class="m vor">🜂 Vorthrax <b>{vor}</b></span><span class="m hand">✋ {TX['hand']} {hand}</span></div>
</div>"""


def status(you, vor, phase, kael, omen):
    return (f'<div class="status"><span class="s you">📖 {TX["you"]} {you}</span><span class="s vor">🜂 Vorthrax {vor}</span>'
            f'<span class="s ph">{phase}</span><span class="s k">Kael {kael}</span><span class="s om">{TX["omen_label"]} {omen}</span></div>')


def turn(head, side, steps, why=""):
    lis = "".join(f"<li>{pips(s)}</li>" for s in steps)
    w = f'<div class="why"><b>{TX["why"]}</b> {why}</div>' if why else ""
    return f'<div class="turn {side}"><div class="thead">{head}</div><ol>{lis}</ol>{w}</div>'


def write_pdf(pages, out_html, out_pdf, lang, title):
    doc = f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>{title}</title><style>{CSS}</style></head>
<body>{''.join(pages)}</body></html>"""
    out_html.write_text(doc, encoding="utf-8")
    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--hide-scrollbars",
        f"--print-to-pdf={out_pdf}", out_html.as_uri(),
    ], check=True, capture_output=True)
    print(out_pdf)


CSS = r"""
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: "Palatino", "Book Antiqua", Georgia, serif; color: #2b2118; font-size: 10.2pt; line-height: 1.38;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 15mm 16mm 16mm; position: relative; overflow: hidden;
  page-break-after: always; break-after: page;
  background: radial-gradient(ellipse at 20% 0%, #fbf5e8 0%, #f3e8d2 55%, #ead9b9 100%); }
.page:last-child { page-break-after: auto; }
.page::before { content: ""; position: absolute; inset: 6mm; border: 0.6mm solid #b8955a; border-radius: 3mm; pointer-events: none; }
.page::after { content: ""; position: absolute; inset: 7.6mm; border: 0.25mm solid #cfb27c; border-radius: 2.4mm; pointer-events: none; }
.folio { position: absolute; bottom: 9mm; left: 0; right: 0; text-align: center; font-family: Copperplate, "Copperplate Gothic Light", serif; font-size: 8pt; color: #8a6a3a; letter-spacing: .15em; }
h1, h2, h3 { font-family: Copperplate, "Copperplate Gothic Bold", "Palatino", serif; color: #6b2d14; margin: 0; letter-spacing: .04em; }
h2 { font-size: 21pt; border-bottom: .5mm solid #b8955a; padding-bottom: 2mm; margin-bottom: 4mm; }
h2 small { font-size: 10pt; color: #8a6a3a; letter-spacing: .1em; margin-left: 3mm; }
h3 { font-size: 12.5pt; margin: 4mm 0 2mm; color: #7d3a18; }
p { margin: 0 0 2.4mm; }
b { color: #4a1c0a; }
.lead { font-size: 11.5pt; font-style: italic; color: #5a4128; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.cols3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; }
.row { display: flex; gap: 4mm; align-items: flex-start; flex-wrap: wrap; }
.center { justify-content: center; }
.box { background: rgba(255,250,238,.75); border: .35mm solid #c9a86a; border-radius: 2.5mm; padding: 3mm 4mm; margin: 2mm 0 3mm; }
.box.dark { background: #3a1d12; color: #f4e6cc; border-color: #8a4b22; }
.box.dark b { color: #ffcf7a; }
.box.dark h3 { color: #ffb15c; margin-top: 0; }
.box h3:first-child { margin-top: 0; }
ol, ul { margin: 0 0 2mm; padding-left: 6mm; }
li { margin-bottom: 1.2mm; }
table { width: 100%; border-collapse: collapse; font-size: 9.2pt; margin: 2mm 0 3mm; }
th { background: #6b2d14; color: #fbeed4; text-align: left; padding: 1.6mm 2.2mm; font-family: Copperplate, serif; font-weight: normal; letter-spacing: .05em; }
td { padding: 1.4mm 2.2mm; border-bottom: .25mm solid #d8c29a; vertical-align: top; background: rgba(255,250,238,.55); }
tr:nth-child(even) td { background: rgba(240,226,198,.55); }
.tag { display: inline-block; font-family: Copperplate, serif; font-size: 7.5pt; letter-spacing: .08em; padding: .4mm 2mm; border-radius: 1.5mm; background: #6b2d14; color: #fbeed4; }

.pip { display: inline-flex; align-items: center; justify-content: center; width: 1.3em; height: 1.3em; border-radius: 50%;
  font-size: .82em; font-weight: bold; font-family: Georgia, serif; vertical-align: -0.18em; margin: 0 .05em;
  border: .12em solid rgba(0,0,0,.45); box-shadow: inset 0 -.12em .2em rgba(0,0,0,.25); color: #222; }
.pip.r { background: radial-gradient(circle at 35% 30%, #ffb199, #e0492b 60%, #9c2412); }
.pip.g { background: radial-gradient(circle at 35% 30%, #c4f0bc, #3c9a48 60%, #1d5c27); }
.pip.n { background: radial-gradient(circle at 35% 30%, #fff, #cfc6b5 60%, #9b917f); }
.pip.tap { background: radial-gradient(circle at 35% 30%, #fff8e6, #d9c296 60%, #8f7444); color: #3a2a10; }

.card { position: relative; display: flex; border-radius: .9em; padding: .35em; flex: none;
  box-shadow: 0 .25em .7em rgba(40,20,5,.35), inset 0 0 0 .12em rgba(0,0,0,.55); color: #1d140c; }
.card.xs { width: 32mm; height: 44.7mm; font-size: 4.6pt; }
.card.sm { width: 34mm; height: 47.5mm; font-size: 4.9pt; }
.card.md { width: 46mm; height: 64.3mm; font-size: 6.6pt; }
.card.lg { width: 60mm; height: 83.8mm; font-size: 8.4pt; }
.card.red { background: linear-gradient(160deg, #f0866a, #b8321c 45%, #6e1a0c); }
.card.green { background: linear-gradient(160deg, #8fd08a, #2f7d3a 45%, #164020); }
.card.threat { background: linear-gradient(160deg, #6b5a55, #2a1612 45%, #120806); color: #f3e3d0; }
.card .index { width: 2.4em; display: flex; flex-direction: column; align-items: center; gap: .3em; padding-top: .35em; }
.card .costcol { display: flex; flex-direction: column; gap: .15em; align-items: center; }
.card .costcol .pip { font-size: 1.05em; }
.card .free { font-size: .9em; color: #f7d9a6; font-weight: bold; border: .12em solid #f7d9a6; border-radius: 50%; width: 1.4em; height: 1.4em; display: flex; align-items: center; justify-content: center; }
.card .glyph { font-size: 1.3em; color: #fff5dc; text-shadow: 0 0 .2em rgba(0,0,0,.8); }
.card .ptx { margin-top: auto; margin-bottom: .5em; writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 1.15em; color: #fff5dc; text-shadow: 0 0 .25em #000; letter-spacing: .1em; }
.card .body { flex: 1; display: flex; flex-direction: column; border-radius: .55em; overflow: hidden;
  background: linear-gradient(#fbf4e4, #efe1c4); box-shadow: inset 0 0 0 .1em rgba(0,0,0,.45); }
.card.threat .body { background: linear-gradient(#3b2a24, #24150f); box-shadow: inset 0 0 0 .1em #a1542c; }
.card .title { font-weight: bold; font-size: 1.12em; padding: .32em .45em; background: linear-gradient(#fffaf0, #e6d3ad); border-bottom: .1em solid rgba(0,0,0,.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card.long .title { font-size: 1em; }
.card.xlong .title { font-size: .86em; }
.card.threat .title { background: linear-gradient(#5a2b1b, #2e140b); color: #ffd7a8; border-bottom-color: #a1542c; }
.card .art { height: 40%; display: flex; align-items: center; justify-content: center; border-bottom: .1em solid rgba(0,0,0,.35); }
.card .art span { font-size: 3.6em; filter: drop-shadow(0 .1em .15em rgba(0,0,0,.45)); }
.card.red .art { background: radial-gradient(circle at 50% 60%, #ffe0a8, #f08a4b 55%, #a33a1c); }
.card.green .art { background: radial-gradient(circle at 50% 60%, #f1ffd2, #8cc66f 55%, #2f6b2f); }
.card.threat .art { background: radial-gradient(circle at 50% 65%, #ffb15c, #b33a12 50%, #2a0c05); }
.card .typeline { font-size: .86em; font-weight: bold; padding: .22em .45em; background: linear-gradient(#efe0bf, #dcc59b); border-bottom: .1em solid rgba(0,0,0,.3); }
.card.threat .typeline { background: linear-gradient(#4d2416, #351509); color: #ffcf96; }
.card .text { padding: .4em .5em; font-size: .95em; line-height: 1.22; flex: 1; }
.card .flavor { margin-top: .35em; font-style: italic; color: #6a5236; font-size: .92em; }
.card .ptbox { position: absolute; right: .55em; bottom: .5em; background: linear-gradient(#fffaf0, #d7bf92); border: .12em solid #3a2a10; border-radius: .4em; padding: .05em .45em; font-weight: bold; font-size: 1.2em; color: #1d140c; }
.card.threat .ptbox { background: linear-gradient(#ffcf96, #c2622a); }

.card.landback { flex-direction: column; padding: .4em; }
.card .landstrip { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(#fffaf0, #e6d3ad); border-radius: .45em; padding: .25em .4em; font-weight: bold; font-family: Copperplate, serif; letter-spacing: .1em; font-size: 1.05em; box-shadow: inset 0 0 0 .1em rgba(0,0,0,.4); }
.card .landstrip .pip { font-size: 1.15em; }
.card .landart { flex: 1; display: flex; align-items: center; justify-content: center; margin: .4em 0; border-radius: .45em; box-shadow: inset 0 0 0 .1em rgba(0,0,0,.4); }
.card.red .landart { background: radial-gradient(circle at 50% 70%, #ffd29a, #c45a2c 60%, #5a1a0b); }
.card.green .landart { background: radial-gradient(circle at 50% 70%, #e3ffc4, #4f9a45 60%, #173f1c); }
.card .landart span { font-size: 4.6em; }
.card .landtext { text-align: center; background: linear-gradient(#fbf4e4, #efe1c4); border-radius: .45em; padding: .35em; font-size: 1em; box-shadow: inset 0 0 0 .1em rgba(0,0,0,.4); }
.card .landfoot { text-align: center; color: #fff1d6; font-size: .8em; margin-top: .3em; font-style: italic; }

.card.walker, .card.nemesis { flex-direction: column; padding: .45em; }
.card.walker { background: linear-gradient(160deg, #ffe7a3, #c8952e 45%, #6f4a10); }
.card.nemesis { background: linear-gradient(160deg, #ff9a52, #7a1d0a 45%, #200604); color: #f6e6cf; }
.card.nemesis.black { background: linear-gradient(160deg, #a796b5, #3a2547 45%, #120a18); }
.card.nemesis.blue { background: linear-gradient(160deg, #a6d4ff, #2a5d9c 45%, #0b1d3a); }
.halves { flex: 1; display: flex; flex-direction: column; gap: .35em; }
.half { flex: 1; border-radius: .5em; overflow: hidden; background: linear-gradient(#fbf4e4, #ecdcbc); box-shadow: inset 0 0 0 .1em rgba(0,0,0,.5); display: flex; flex-direction: column; }
.card.nemesis .half { background: linear-gradient(#3d2219, #1f0f0a); box-shadow: inset 0 0 0 .1em #c0602b; }
.half.flip { transform: rotate(180deg); opacity: .93; }
.hhead { display: flex; align-items: center; gap: .4em; padding: .25em .45em; background: linear-gradient(#fff3d1, #e0c27e); border-bottom: .1em solid rgba(0,0,0,.35); }
.card.nemesis .hhead { background: linear-gradient(#7a2a12, #3e1207); color: #ffd7a8; border-bottom-color: #c0602b; }
.hhead .state { font-family: Copperplate, serif; font-weight: bold; font-size: 1.25em; color: #6b2d14; white-space: nowrap; }
.card.nemesis .hhead .state { color: #ffb15c; font-size: 1.05em; }
.hhead .hname { font-size: .85em; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hbody { padding: .35em .5em; font-size: .92em; line-height: 1.22; }
.hbody p { margin: 0 0 .3em; }
.card.nemesis .hbody b { color: #ffcf7a; }
.hbody .trig { border-top: .1em dashed rgba(255,200,140,.5); padding-top: .25em; font-size: .92em; }
.facetag { text-align: center; font-family: Copperplate, serif; font-size: .8em; color: #fff3d9; margin-top: .2em; letter-spacing: .12em; }
.nemart { font-size: 2.6em; text-align: center; line-height: 1.1; }

.cap { font-size: 8.4pt; text-align: center; color: #6a5236; margin-top: 1.5mm; font-style: italic; }
.fig { display: flex; flex-direction: column; align-items: center; width: min-content; }

.callout { position: absolute; font-size: 8.4pt; background: #fffaf0; border: .3mm solid #b8955a; border-radius: 1.6mm; padding: 1mm 2mm; box-shadow: 0 .6mm 1.4mm rgba(0,0,0,.15); width: 46mm; }
.callout b { color: #6b2d14; }
.callout::before { content: attr(data-n); position: absolute; left: -3.2mm; top: -2.6mm; width: 5mm; height: 5mm; border-radius: 50%; background: #6b2d14; color: #fff; font-size: 7.5pt; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.marker { position: absolute; width: 5mm; height: 5mm; border-radius: 50%; background: #6b2d14; color: #fff; font-size: 7.5pt; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 0 .5mm #fff; z-index: 3; }

.fan { position: relative; height: 66mm; width: 100mm; margin: 0 auto; }
.fan .card { position: absolute; bottom: 0; left: 30mm; transform-origin: 50% 120%; }
.handicon { font-size: 30pt; text-align: center; margin-top: -4mm; }

.exploded { display: flex; align-items: flex-end; gap: 3mm; justify-content: center; }
.layer { display: flex; flex-direction: column; align-items: center; }
.layer .lbl { font-family: Copperplate, serif; font-size: 8.5pt; color: #6b2d14; margin-top: 1.5mm; text-align: center; line-height: 1.2; }
.arrow { font-size: 16pt; color: #b8955a; align-self: center; }
.stack { position: relative; }
.stack .card + .card { position: absolute; }

.flow { display: flex; flex-direction: column; gap: 1.6mm; }
.step { display: flex; gap: 3mm; align-items: stretch; }
.step .num { flex: none; width: 9mm; border-radius: 2mm; background: #6b2d14; color: #fff3d9; font-family: Copperplate, serif; font-size: 13pt; display: flex; align-items: center; justify-content: center; }
.step .num.n { background: #2a1612; color: #ffb15c; }
.step .sbody { flex: 1; background: rgba(255,250,238,.8); border: .3mm solid #c9a86a; border-radius: 2mm; padding: 1.8mm 3mm; }
.step .sbody b:first-child { font-family: Copperplate, serif; color: #6b2d14; letter-spacing: .04em; }

.board { background: linear-gradient(#5a3a22, #3b2414); border-radius: 3mm; padding: 2.2mm; color: #f6e6cf; box-shadow: inset 0 0 0 .4mm #a77a45, 0 1mm 2mm rgba(0,0,0,.3); margin: 2mm 0; }
.btitle { font-family: Copperplate, serif; font-size: 8pt; color: #ffcf7a; letter-spacing: .1em; margin-bottom: 1.4mm; }
.brow { display: flex; gap: 2mm; align-items: flex-start; padding: 1.6mm; border-radius: 2mm; min-height: 17mm; }
.brow.nem { background: rgba(160,40,15,.28); margin-bottom: 1.4mm; }
.brow.you { background: rgba(60,120,60,.22); }
.bslot { flex: 1; display: flex; gap: 1.6mm; flex-wrap: wrap; align-items: flex-start; }
.bossbadge { width: 100%; font-size: 7pt; color: #ffb15c; font-family: Copperplate, serif; letter-spacing: .06em; }
.omen { flex: none; width: 25mm; font-size: 7pt; background: #1d0d08; border: .3mm dashed #ffb15c; border-radius: 1.5mm; padding: 1mm 1.4mm; color: #ffd7a8; line-height: 1.2; }
.omen span { display: block; font-family: Copperplate, serif; font-size: 6.2pt; color: #ffb15c; letter-spacing: .12em; }
.chip { position: relative; width: 25mm; height: 13mm; border-radius: 1.5mm; padding: .8mm 1.2mm; font-size: 6.6pt; line-height: 1.15; box-shadow: inset 0 0 0 .25mm rgba(0,0,0,.6); }
.chip.you { background: linear-gradient(#fbf4e4, #e0cda6); color: #2b2118; }
.chip.nem { background: linear-gradient(#5a2b1b, #2e140b); color: #ffd7a8; box-shadow: inset 0 0 0 .25mm #c0602b; }
.chip.low { transform: translateY(3mm); opacity: .78; }
.chip .lowtag { position: absolute; left: 1.2mm; bottom: .5mm; font-size: 5.6pt; font-style: italic; opacity: .8; }
.cname { font-weight: bold; display: block; }
.cnote { font-size: 5.8pt; font-style: italic; display: block; opacity: .85; }
.cpt { position: absolute; right: 1.2mm; bottom: .6mm; font-weight: bold; font-size: 7.6pt; }
.walkerchip { flex: none; width: 27mm; min-height: 14mm; background: linear-gradient(#ffe7a3, #c8952e); color: #3a2208; border-radius: 1.5mm; padding: 1mm 1.6mm; font-size: 7.5pt; box-shadow: inset 0 0 0 .25mm rgba(0,0,0,.6); }
.walkerchip .lands { display: flex; gap: .8mm; margin-top: 1mm; flex-wrap: wrap; }
.lchip { width: 5.6mm; height: 5.6mm; display: flex; align-items: center; justify-content: center; border-radius: 1mm; background: #fff6df; box-shadow: inset 0 0 0 .2mm #000; font-size: 8pt; }
.lchip.low { opacity: .45; transform: translateY(1.2mm); }
.empty { font-size: 7pt; font-style: italic; opacity: .6; align-self: center; }
.meters { display: flex; gap: 2mm; margin-top: 1.6mm; font-size: 7.8pt; }
.m { padding: .5mm 2mm; border-radius: 4mm; background: rgba(0,0,0,.35); }
.m.you b { color: #b9f0a8; } .m.vor b { color: #ffb15c; }

.status { display: flex; flex-wrap: wrap; gap: 1.2mm; margin: 0 0 1.6mm; }
.status .s { font-size: 7.6pt; padding: .4mm 2mm; border-radius: 3mm; background: #efe0bf; border: .25mm solid #c9a86a; }
.status .s.you { background: #dff0d3; } .status .s.vor { background: #f7d2bd; } .status .s.om { background: #2a1612; color: #ffcf96; border-color: #8a4b22; }
.turn { border-radius: 2.2mm; padding: 2mm 3mm 1.2mm; margin-bottom: 2.2mm; border: .3mm solid #c9a86a; background: rgba(255,250,238,.82); }
.turn.nem { background: rgba(58,29,18,.92); color: #f4e6cc; border-color: #8a4b22; }
.turn.nem b { color: #ffcf7a; }
.thead { font-family: Copperplate, serif; font-size: 10pt; color: #6b2d14; margin-bottom: 1mm; letter-spacing: .05em; }
.turn.nem .thead { color: #ffb15c; }
.turn ol { font-size: 8.9pt; margin-bottom: 1mm; padding-left: 5mm; }
.turn li { margin-bottom: .6mm; }
.why { font-size: 8.4pt; background: #fff3c9; color: #4a3010; border-left: 1mm solid #d9a520; padding: 1mm 2mm; border-radius: 1mm; margin: 1mm 0 1mm; font-style: italic; }
.why b { font-style: normal; }
.turn.nem .why { background: #4d2618; color: #ffe0b8; border-left-color: #ff8a3d; }
.page.dense .turn ol { font-size: 8.4pt; }
.page.dense .lists { font-size: 7.4pt; }
.page.dense .lists td, .page.dense .lists th { padding: .7mm 1.4mm; }
.page.dense h3 { margin: 3mm 0 1.5mm; }
.page.dense .why { font-size: 7.9pt; }
.page.dense .turn { margin-bottom: 1.8mm; }
.page.dense .board { margin: 1.4mm 0; }
.round { font-family: Copperplate, serif; color: #8a6a3a; letter-spacing: .25em; font-size: 9pt; text-align: center; margin: 1mm 0 1.5mm; }
.round::before, .round::after { content: " ✦ "; color: #b8955a; }

.cover { background: radial-gradient(ellipse at 50% 35%, #7a2a12 0%, #3a120a 45%, #12060a 100%); color: #f6e6cf; text-align: center; }
.cover::before { border-color: #d9a520; } .cover::after { border-color: #8a5a1a; }
.cover h1 { font-size: 46pt; color: #ffcf7a; letter-spacing: .14em; margin-top: 18mm; text-shadow: 0 .8mm 2mm #000, 0 0 8mm rgba(255,140,40,.45); }
.cover .sub { font-family: Copperplate, serif; letter-spacing: .3em; color: #ffb15c; font-size: 11pt; margin-top: 2mm; }
.cover .tagline { font-style: italic; font-size: 13pt; color: #f1d9b5; margin-top: 8mm; }
.cover .fan { height: 100mm; width: 150mm; margin-top: 14mm; }
.cover .fan .card { left: 50mm; }
.cover .meta { position: absolute; bottom: 22mm; left: 0; right: 0; display: flex; justify-content: center; gap: 8mm; font-family: Copperplate, serif; font-size: 9.5pt; color: #ffcf7a; letter-spacing: .1em; }
.cover .meta span { border: .3mm solid #8a5a1a; border-radius: 2mm; padding: 1.5mm 4mm; background: rgba(0,0,0,.3); }
.cover .ver { position: absolute; bottom: 12mm; left: 0; right: 0; font-size: 8pt; color: #b08a5a; letter-spacing: .2em; font-family: Copperplate, serif; }

.toc { columns: 2; column-gap: 8mm; font-size: 10pt; }
.toc div { display: flex; justify-content: space-between; border-bottom: .25mm dotted #b8955a; margin-bottom: 1.4mm; break-inside: avoid; }
.kw { display: grid; grid-template-columns: 20mm 1fr; gap: 1mm 3mm; font-size: 9.2pt; }
.kw .k { font-family: Copperplate, serif; color: #6b2d14; font-weight: bold; }
.mini { font-size: 8.6pt; }
.updown { display: flex; gap: 6mm; justify-content: center; align-items: flex-start; }
.updown .card.low { margin-top: 9mm; filter: brightness(.86); }
.quickref { font-size: 8.8pt; }
.lists { font-size: 7.8pt; margin: 1mm 0 2mm; }
.lists td, .lists th { padding: .9mm 1.6mm; }
.lists td:nth-child(2) { white-space: nowrap; }
.lists td:nth-child(4) { white-space: nowrap; }
.quickref .box { padding: 2.4mm 3.4mm; margin: 0 0 3mm; }
.quickref h3 { font-size: 11pt; margin: 0 0 1.4mm; }
.quickref ol { margin: 0; }
"""


def page(content, folio=None, cls=""):
    f = f'<div class="folio">— {folio} —</div>' if folio else ""
    return f'<section class="page {cls}">{content}{f}</section>'


def fan(cards_html, angles, spread=11):
    out = []
    n = len(cards_html)
    for i, (ch, a) in enumerate(zip(cards_html, angles)):
        dx = (i - (n - 1) / 2) * spread
        out.append(ch.replace('class="card', f'style="transform: translateX({dx}mm) rotate({a}deg); z-index:{i};" class="card', 1))
    return "".join(out)


def build():
    pages = []

    cover_fan = fan([card("Thicket Bear", "lg"), walker_face("B", "lg"), nemesis_face("A", "lg"), card("Ember Bolt", "lg")],
                    [-20, -7, 7, 20], spread=22)
    pages.append(page(f"""
<h1>PALMWALKER</h1>
<div class="sub">A SOLO DUELING CARD GAME YOU HOLD IN YOUR HANDS</div>
<div class="tagline">No table. No tokens. No opponent across the board.<br>Just your hands, your spells, and a Nemesis that wants your library to burn.</div>
<div class="fan">{cover_fan}</div>
<div class="meta"><span>1 PLAYER</span><span>15–20 MIN</span><span>39 CARDS</span><span>AGES 12+</span></div>
<div class="ver">RULEBOOK · PROTOTYPE v0.1</div>
""", cls="cover"))

    pages.append(page(f"""
<h2>Welcome, Walker</h2>
<p class="lead">Palmwalker takes the heart of a classic dueling card game — lands, creatures, instants, combat, a planeswalker at your side —
and folds it into something you can play standing on a train. Everything happens in your two hands.</p>
<div class="cols">
<div>
<h3>The duel in one paragraph</h3>
<p>You are <b>Kael</b>, a wandering pyromancer. Each turn you draw, play a land, cast creatures and spells, and attack.
Your foe is a <b>Nemesis</b> — an automated boss with its own deck of Threats. It summons creatures, casts spells, attacks and blocks
following a few simple rules, so you never have to make decisions for it.</p>
<h3>Three ideas that make it fit in your hands</h3>
<ol>
<li><b>Your library is your life.</b> You start with 20 cards in your library: that is 20 life. Damage throws cards from your library into your graveyard.</li>
<li><b>Every card is also a land.</b> The back of each card is a Mountain or a Forest. Each turn you choose: cast it, or turn it into mana.</li>
<li><b>Position is state.</b> Cards are tapped by lowering them in the fan. Zones are parts of a packet, not places on a table.</li>
</ol>
</div>
<div>
<h3>Contents</h3>
<div class="toc" style="columns:1">
<div><span>Components</span><span>3</span></div>
<div><span>Anatomy of a card</span><span>4</span></div>
<div><span>Card types &amp; keywords</span><span>5</span></div>
<div><span>Kael, your Walker</span><span>6</span></div>
<div><span>The Nemesis</span><span>7</span></div>
<div><span>Holding the game</span><span>8</span></div>
<div><span>Life, zones &amp; physical moves</span><span>9</span></div>
<div><span>Setup</span><span>10</span></div>
<div><span>Turn structure</span><span>11</span></div>
<div><span>Combat &amp; the Nemesis mind</span><span>12</span></div>
<div><span>Example game</span><span>13–16</span></div>
<div><span>Card gallery</span><span>17</span></div>
<div><span>Modes, other Nemeses &amp; tuning</span><span>18</span></div>
<div><span>Card lists</span><span>19</span></div>
<div><span>Quick reference</span><span>20</span></div>
</div>
<div class="box">
<h3>Inspired by</h3>
<p class="mini">The in-hand tradition on BoardGameGeek: <b>Palm Island</b> (4-state cards, sideways resources),
<b>Handy Brawl</b> (an enemy that acts on its own, damage as card state), <b>Maiden's Quest</b> (in-hand deckbuilding),
<b>Galdor's Grip</b> and <b>Loot the Loop</b> (order and orientation as game state), and <b>The Hand of Destiny</b> (hero vs. waves and a boss).</p>
</div>
</div>
</div>
""", 2))

    pages.append(page(f"""
<h2>Components <small>39 CARDS</small></h2>
<table>
<tr><th>Qty</th><th>Component</th><th>What it does</th></tr>
<tr><td>12</td><td><b>Emberkin</b> half-grimoire (red)</td><td>Fast creatures and burn. Every back is a <b>Mountain</b> {pips('{R}')}.</td></tr>
<tr><td>12</td><td><b>Wildwood</b> half-grimoire (green)</td><td>Big creatures and pump tricks. Every back is a <b>Forest</b> {pips('{G}')}.</td></tr>
<tr><td>1</td><td><b>Kael</b>, Wandering Pyromancer</td><td>Your Walker. A 4-state card that tracks loyalty by rotating and flipping.</td></tr>
<tr><td>1</td><td><b>Vorthrax</b>, the Ash Tyrant</td><td>The Nemesis. Face A = Phase 1, Face B = Phase 2. Rotate it for Heroic mode.</td></tr>
<tr><td>12+3</td><td><b>Threat</b> deck</td><td>15 cards: Vorthrax's creatures and spells. It is also Vorthrax's life.</td></tr>
<tr><td>1</td><td>Quick reference card</td><td>Turn order and the Nemesis rules.</td></tr>
</table>
<div class="row center" style="gap:6mm; margin-top:4mm">
<div class="fig">{card("Reckless Goblin", "md")}<div class="cap">Emberkin card (front)</div></div>
<div class="fig">{land("Mountain", "md")}<div class="cap">…and its back</div></div>
<div class="fig">{card("Thicket Bear", "md")}<div class="cap">Wildwood card (front)</div></div>
</div>
<div class="row center" style="gap:4mm; margin-top:4mm; flex-wrap:nowrap">
<div class="fig">{land("Forest", "sm")}<div class="cap">Wildwood back</div></div>
<div class="fig">{card("Cinderclaw Brute", "sm")}<div class="cap">Threat creature</div></div>
<div class="fig">{card("Searing Breath", "sm")}<div class="cap">Threat spell</div></div>
<div class="box" style="width:58mm; margin:0">
<h3>Half-grimoires</h3>
<p class="mini">Like a pre-built pack, each colour comes as a 12-card half. Shuffle any two halves together and you have a 24-card Grimoire.
Future halves (white, blue, black…) mix and match with these: 5 colours give 10 different decks.</p>
<h3>Threat cards have no back</h3>
<p class="mini">The Threat deck uses a plain back. Face-down Threats are Vorthrax's life; face-up ones are the <b>Omen</b> (front) and the <b>Ruin</b> (back).</p>
</div>
</div>
""", 3))

    pages.append(page(f"""
<h2>Anatomy of a Card</h2>
<p>Palmwalker cards are read in a <b>fan</b>. When cards overlap, only their left edge shows — just like the corner index of a deck of
playing cards. That is why every card carries its key information in the <b>index strip</b> down its left side.</p>
<div style="position:relative; height:118mm; margin-top:6mm">
  <div style="position:absolute; left:58mm; top:4mm">{card("Cinder Hound", "lg")}</div>
  <div class="callout" data-n="1" style="left:4mm; top:6mm"><b>Cost</b> — pay this much mana. {pips('{1}')} is any mana, {pips('{R}')} must be red.</div>
  <div class="callout" data-n="2" style="left:4mm; top:30mm"><b>Type glyph</b> — ⚔ creature, ϟ instant, ✶ sorcery, ◈ aura, ✹ Threat spell.</div>
  <div class="callout" data-n="3" style="left:4mm; top:56mm"><b>Index power/toughness</b> — readable even when the card is buried in the fan.</div>
  <div class="callout" data-n="4" style="left:126mm; top:6mm"><b>Name</b> and <b>art</b>.</div>
  <div class="callout" data-n="5" style="left:126mm; top:40mm"><b>Type line</b> — card type and creature type.</div>
  <div class="callout" data-n="6" style="left:126mm; top:62mm"><b>Rules text</b> — what the card does. Italic text is flavour.</div>
  <div class="callout" data-n="7" style="left:126mm; top:88mm"><b>Power / Toughness</b> — damage it deals / damage it can take in one turn.</div>
  <div class="marker" style="left:59mm; top:7mm">1</div>
  <div class="marker" style="left:59mm; top:22mm">2</div>
  <div class="marker" style="left:59mm; top:70mm">3</div>
  <div class="marker" style="left:112mm; top:6mm">4</div>
  <div class="marker" style="left:62mm; top:44mm">5</div>
  <div class="marker" style="left:112mm; top:58mm">6</div>
  <div class="marker" style="left:113mm; top:82mm">7</div>
</div>
<div class="cols">
<div class="box">
<h3>Double-faced: spell or land?</h3>
<p class="mini">The back of every Grimoire card is a land. Once per turn you may <b>flip a card from your hand to its land side</b> and play it.
A land is permanent; the spell on its front is gone for good. Choosing which cards to sacrifice as lands is the first decision of every turn.</p>
</div>
<div class="box">
<h3>Mana</h3>
<p class="mini">Each land produces one mana of its colour: Mountain {pips('{R}')}, Forest {pips('{G}')}.
To use it, <b>lower</b> the land (tap it). Lands rise again at the start of your turn — so mana spent on your turn is <b>not</b> available during the Nemesis turn.</p>
</div>
</div>
""", 4))

    pages.append(page(f"""
<h2>Card Types &amp; Keywords</h2>
<div class="row center" style="gap:4mm">
<div class="fig">{card("Mossback Boar", "md")}<div class="cap"><b>Creature</b> — stays on the Table. Attacks and blocks.</div></div>
<div class="fig">{card("Ember Bolt", "md")}<div class="cap"><b>Instant</b> — cast it any time, even on the Nemesis turn.</div></div>
<div class="fig">{card("Volcanic Roar", "md")}<div class="cap"><b>Sorcery</b> — only in your main phase.</div></div>
</div>
<div class="row center" style="gap:4mm; margin-top:3mm">
<div class="fig">{card("Wild Strength", "md")}<div class="cap"><b>Aura</b> — tuck it behind one of your creatures.</div></div>
<div class="fig">{land("Forest", "md")}<div class="cap"><b>Land</b> — the back of every card.</div></div>
<div class="box" style="width:56mm">
<h3>Creature rules</h3>
<ol class="mini">
<li><b>Summoning sickness:</b> a creature can't attack or use {pips('{T}')} abilities on the turn it enters, unless it has Haste. It <b>can</b> block.</li>
<li><b>Damage wears off</b> at the end of every turn. A creature dies only if it takes damage ≥ toughness in a single turn.</li>
<li><b>Limit:</b> 4 creatures per side, 5 lands.</li>
<li>An Aura goes to the graveyard with its creature.</li>
</ol>
</div>
</div>
<div class="box" style="margin-top:4mm">
<h3>Keywords</h3>
<div class="kw">
<div class="k">Flying</div><div>Can only be blocked by creatures with Flying or Reach.</div>
<div class="k">Reach</div><div>Can block creatures with Flying.</div>
<div class="k">Trample</div><div>Damage beyond what kills its blocker goes to the defending player or Nemesis.</div>
<div class="k">Haste</div><div>Ignores summoning sickness: can attack the turn it enters.</div>
<div class="k">Defender</div><div>Never attacks. Still blocks.</div>
</div>
</div>
""", 5))

    pages.append(page(f"""
<h2>Kael, your Walker</h2>
<p>Kael stands at the right end of your fan. His card has <b>four states</b> — one on each half of each face, Palm Island style.
The state that reads upright, facing you, is the active one. Each state lists the abilities you can use from it.</p>
<div class="row center" style="gap:10mm; margin:3mm 0 2mm">
<div class="fig">{walker_face("A")}<div class="cap">Face A: state I upright, state II upside-down</div></div>
<div class="fig">{walker_face("B")}<div class="cap">Face B: state III upright, state IV upside-down</div></div>
</div>
<div class="box" style="text-align:center; font-family:Copperplate,serif; color:#6b2d14; font-size:10pt">
I &nbsp;—<i>rotate 180°</i>→&nbsp; II &nbsp;—<i>flip over</i>→&nbsp; III &nbsp;—<i>rotate 180°</i>→&nbsp; IV
</div>
<div class="cols">
<div>
<h3>Using Kael</h3>
<ol>
<li>Once per turn, during one of <b>your main phases</b>, use one ability available in Kael's current state.</li>
<li><b>Charge</b> moves Kael 1 state forward (max IV). You may charge even if there is no creature to pump.</li>
<li><b>Discharge</b> moves Kael 2 states back (from III or IV).</li>
<li><b>Ultimate</b> needs state IV and returns Kael to I.</li>
</ol>
</div>
<div class="box">
<h3>The Walker's dilemma</h3>
<p class="mini">Charging is small but builds toward the Ultimate. Discharging removes a blocker now. Sitting at IV and waiting for the
right moment — for example, until Vorthrax loses its Ash Hide — can be the strongest play in the game. Kael can't be attacked.</p>
</div>
</div>
""", 6))

    pages.append(page(f"""
<h2>The Nemesis</h2>
<p>The Nemesis is your opponent. Its card sits at the left of your fan; its <b>Threat deck</b> sits behind it. It has no hand and no mana:
each turn it simply executes the face-up card on top of its deck, the <b>Omen</b>.</p>
<div class="row center" style="gap:10mm; margin:3mm 0">
<div class="fig">{nemesis_face("A")}<div class="cap">Face A — Phase 1 (rotate 180° for Heroic)</div></div>
<div class="fig">{nemesis_face("B")}<div class="cap">Face B — Phase 2</div></div>
</div>
<div class="cols">
<div>
<h3>The Threat deck is its life</h3>
<ol>
<li><b>Face-down</b> Threat cards = Vorthrax's life. At 0, you win.</li>
<li>The <b>Omen</b> is face-up on top. It shows what Vorthrax does next turn. It does not count as life.</li>
<li>The <b>Ruin</b> is face-up at the back: dead Threat creatures and cards destroyed by damage.</li>
<li><b>Damage to Vorthrax:</b> for each point, move the face-down card right behind the Omen to the Ruin.</li>
</ol>
</div>
<div>
<h3>Phases</h3>
<p>The moment the Threat deck has <b>7 or fewer</b> face-down cards, flip Vorthrax to Phase 2 — even in the middle of your turn.
<b>Rekindle</b> immediately returns the 3 rearmost Ruin cards face-down to the bottom of the Threat deck: a second health bar.</p>
<div class="box dark mini"><b>Phase 1</b> is armoured (Ash Hide) and patient. <b>Phase 2</b> loses the armour but its creatures gain Haste and its burn doubles.
Burst through the armour, then survive the fury.</div>
</div>
</div>
<div class="row center" style="gap:4mm">
{card("Ash Imp", "sm")}{card("Magma Sentinel", "sm")}{card("Scorch Fiend", "sm")}{card("Cinder Rebirth", "sm")}
</div>
""", 7))

    left_fan = fan([
        '<div class="card threat sm" style="background:repeating-linear-gradient(45deg,#3a1d12,#3a1d12 2mm,#4a2618 2mm,#4a2618 4mm)"><div style="margin:auto;color:#ffb15c;font-family:Copperplate,serif;text-align:center;font-size:1.5em">THREAT<br>DECK<br><span style="font-size:.7em">Omen on top</span></div></div>',
        nemesis_face("A", "sm"),
        card("Cinderclaw Brute", "sm"),
        card("Thicket Bear", "sm"),
        walker_face("A", "sm"),
    ], [-16, -8, 0, 8, 16], spread=9)

    pages.append(page(f"""
<h2>Holding the Game</h2>
<h3>Left hand — THE TABLE</h3>
<div class="row" style="align-items:center; gap:6mm; flex-wrap:nowrap">
<div class="fan" style="width:92mm; height:58mm; margin:0 0 0 8mm; flex:none">{left_fan}</div>
<div style="flex:1">
<p class="mini">A single fan, left to right:</p>
<ol class="mini">
<li><b>Threat deck</b> with the <b>Omen</b> face-up on top.</li>
<li><b>Vorthrax</b>, then its creatures (red-framed).</li>
<li>Your creatures, with Auras tucked behind them.</li>
<li><b>Kael</b> at the right end, with your <b>lands tucked behind him</b> so that only their top strips stick up.</li>
</ol>
<p class="mini">Only the left strip of each card shows — that is exactly where the index sits.</p>
</div>
</div>
<h3>Right hand — THE GRIMOIRE</h3>
<div class="row" style="align-items:center; gap:5mm; flex-wrap:nowrap">
<div class="exploded" style="flex:none">
<div class="layer">{card("Ember Bolt","sm")}<div class="lbl">HAND<br><span style="font-size:7pt">spell side · fanned</span></div></div>
<div class="arrow">›</div>
<div class="layer">{land("Mountain","sm")}<div class="lbl">LIBRARY = LIFE<br><span style="font-size:7pt">land side · squared</span></div></div>
<div class="arrow">›</div>
<div class="layer">{card("Kindle","sm")}<div class="lbl">GRAVEYARD<br><span style="font-size:7pt">spell side · at the back</span></div></div>
</div>
<div class="box mini" style="flex:1">One packet, three layers from <b>front</b> (facing you) to <b>back</b>.
The library shows its <b>land side</b>; hand and graveyard show the <b>spell side</b>, so the boundaries between zones are always visible,
even when the packet is squared. (Yes — you can see the colour of your next draw. That's a feature.)</div>
</div>
<h3>Up and lowered</h3>
<div class="row" style="align-items:center; gap:8mm; flex-wrap:nowrap">
<div class="updown" style="flex:none">{card("Thicket Bear","sm")}{card("Firebrand Raider","sm","low")}</div>
<div style="flex:1">
<p><b>Raised</b> (aligned with the fan) = untapped. <b>Lowered</b> (slid down about 2 cm) = tapped.</p>
<p>A lowered <b>land</b> disappears behind Kael — so the mana symbols you can see are exactly the mana you have left.</p>
<p class="mini">Prefer the classic 90° turn? It works for small fans. Lowering is easier to hold.</p>
</div>
</div>
""", 8))

    pages.append(page(f"""
<h2>Life, Zones &amp; Physical Moves</h2>
<div class="box dark">
<h3>Your library is your life</h3>
<p>You begin with <b>20 cards in your library = 20 life</b>. Drawing a card spends 1 life. Damage mills cards into your graveyard.
Gaining life brings cards back from the graveyard. <b>When your library reaches 0, you lose.</b></p>
<p style="margin:0">Vorthrax works the same way: its face-down Threat cards are its life. <b>When it reaches 0, you win.</b></p>
</div>
<table>
<tr><th style="width:30%">When you…</th><th>Do this with your hands</th></tr>
<tr><td><b>Draw</b></td><td>Take the front card of your library, flip it to the spell side, add it to your hand fan. (−1 life)</td></tr>
<tr><td><b>Take N damage</b></td><td>N times: take the front library card, flip it to the spell side, slide it to the very back (graveyard).</td></tr>
<tr><td><b>Gain N life</b></td><td>N times: take the rearmost graveyard card, flip it to the land side, slide it between library and graveyard. (Up to the size of your graveyard.)</td></tr>
<tr><td><b>Play a land</b></td><td>Flip a hand card to its land side and tuck it behind Kael, top strip sticking up. Max 1 per turn.</td></tr>
<tr><td><b>Cast a spell</b></td><td>Lower lands for the cost. Creature → into the Table fan, left of Kael. Instant/sorcery → resolve, then to your graveyard.</td></tr>
<tr><td><b>A creature dies</b></td><td>Yours → back of your graveyard. Vorthrax's → back of the Threat deck (Ruin).</td></tr>
<tr><td><b>Deal N damage to Vorthrax</b></td><td>N times: take the face-down card right behind the Omen, flip it face-up, slide it into the Ruin.</td></tr>
<tr><td><b>Vorthrax casts a spell</b></td><td>Resolve it, then put it face-down at the bottom of the Threat deck (in front of the Ruin). It will come back.</td></tr>
<tr><td><b>Discard</b> (hand limit)</td><td>Put the card at the back of your graveyard. This is not damage.</td></tr>
</table>
<div class="cols">
<div class="box mini"><h3>Why library = life?</h3>Damage is never just a number: every point costs you a real card you might have drawn.
Healing recovers spent spells. And because drawing costs life, waiting is never free — the duel always moves forward.</div>
<div class="box mini"><h3>Counting</h3>Life is a count of cards. Count your library whenever you need to; with 20 cards or fewer it takes seconds.
Advanced players simply track it in their head: −1 per draw, −N per hit.</div>
</div>
""", 9))

    pages.append(page(f"""
<h2>Setup <small>ABOUT ONE MINUTE</small></h2>
<div class="flow">
<div class="step"><div class="num">1</div><div class="sbody"><b>Build your Grimoire.</b> Pick two half-grimoires (this box: Emberkin + Wildwood), shuffle the 24 cards together. Hold them land side facing you.</div></div>
<div class="step"><div class="num">2</div><div class="sbody"><b>Draw your opening hand.</b> Draw 4 cards. Your library now has 20 cards: <b>you have 20 life.</b></div></div>
<div class="step"><div class="num">3</div><div class="sbody"><b>Mulligan (optional, once).</b> Shuffle your hand back, draw 4 new cards, then put 1 of them into your graveyard. Your life stays 20.</div></div>
<div class="step"><div class="num">4</div><div class="sbody"><b>Kael.</b> Place Kael at state <b>I</b> (Face A, upright) — he starts your Table fan.</div></div>
<div class="step"><div class="num n">5</div><div class="sbody"><b>The Nemesis.</b> Place Vorthrax on Face A (Phase 1) at the left of the fan. Upright = Normal; rotated 180° = Heroic.</div></div>
<div class="step"><div class="num n">6</div><div class="sbody"><b>The Threat deck.</b> Shuffle the 15 Threat cards face-down, put them behind Vorthrax, and turn the top card face-up: that is the first <b>Omen</b>. Vorthrax has <b>14 life</b>.</div></div>
<div class="step"><div class="num">7</div><div class="sbody"><b>Begin.</b> You take the first turn and skip your draw on that turn.</div></div>
</div>
<div class="row center" style="margin-top:6mm; gap:5mm; align-items:flex-end">
<div class="fig">{card("Reckless Goblin","sm")}</div>
<div class="fig">{card("Thicket Bear","sm")}</div>
<div class="fig">{card("Surge of Vigor","sm")}</div>
<div class="fig">{card("Ancient Crashhorn","sm")}</div>
<div class="box mini" style="width:60mm"><h3>A typical opening hand</h3>Four cards — and four potential lands.
Here only the Goblin is red, so turning it into a Mountain would mean losing your only one-drop. Decisions start before turn one.</div>
</div>
""", 10))

    pages.append(page(f"""
<h2>Turn Structure</h2>
<div class="cols">
<div>
<h3>Your turn</h3>
<div class="flow">
<div class="step"><div class="num">1</div><div class="sbody"><b>Untap.</b> Raise all your lowered creatures and lands.</div></div>
<div class="step"><div class="num">2</div><div class="sbody"><b>Draw.</b> Draw 1 card (−1 life). Skip it on turn 1.</div></div>
<div class="step"><div class="num">3</div><div class="sbody"><b>Main phase.</b> Play up to 1 land. Cast creatures, sorceries, auras and instants. Use Kael once.</div></div>
<div class="step"><div class="num">4</div><div class="sbody"><b>Combat.</b> Attack with any untapped creatures without summoning sickness. Vorthrax blocks by its rules.</div></div>
<div class="step"><div class="num">5</div><div class="sbody"><b>Second main.</b> Same as step 3 (if you didn't play a land or use Kael yet, you still can).</div></div>
<div class="step"><div class="num">6</div><div class="sbody"><b>End.</b> Discard down to 5 cards. Damage on creatures wears off.</div></div>
</div>
</div>
<div>
<h3>Nemesis turn</h3>
<div class="flow">
<div class="step"><div class="num n">1</div><div class="sbody"><b>Untap.</b> Raise all Nemesis creatures.</div></div>
<div class="step"><div class="num n">2</div><div class="sbody"><b>Execute the Omen.</b> A creature enters the Table (summoning sick unless it has Haste). A spell resolves and goes face-down to the bottom.</div></div>
<div class="step"><div class="num n">3</div><div class="sbody"><b>Reveal a new Omen.</b> Turn the next face-down card face-up (−1 Vorthrax life). Now you know next turn's threat.</div></div>
<div class="step"><div class="num n">4</div><div class="sbody"><b>Attack.</b> Its creatures attack by the Nemesis rules. You block and may cast instants.</div></div>
<div class="step"><div class="num n">5</div><div class="sbody"><b>End.</b> Resolve end-of-turn abilities (Smolder / Inferno). Damage wears off.</div></div>
</div>
</div>
</div>
<div class="cols" style="margin-top:3mm">
<div class="box mini"><h3>Instants &amp; responses</h3>You may cast instants at any moment, including during the Nemesis turn. When the Nemesis executes a spell,
its target is chosen first; then you may respond before it resolves. The Nemesis never responds to you.</div>
<div class="box mini"><h3>Overflow</h3>If the Omen is a creature but the Nemesis already has 4 creatures, the new creature instead deals damage equal to its power to you,
then goes face-down to the bottom of the Threat deck.</div>
</div>
""", 11))

    pages.append(page(f"""
<h2>Combat &amp; the Nemesis Mind</h2>
<div class="cols">
<div>
<h3>How combat works</h3>
<ol>
<li><b>Attack:</b> the attacker lowers its attacking creatures. Lowered creatures stay lowered until their controller's next untap — so <b>creatures that attack can't block on the next turn</b>.</li>
<li><b>Block:</b> each untapped defender may block one attacker. Each attacker can be blocked by at most one creature.</li>
<li><b>Tricks:</b> after blocks, you may cast instants.</li>
<li><b>Damage:</b> all at once. Each creature deals damage equal to its power. Unblocked attackers hit the player or Nemesis. Trample spills the excess.</li>
<li><b>Deaths:</b> creatures with damage ≥ toughness die.</li>
</ol>
<div class="box mini"><h3>Targets</h3>Nemesis effects that hit "your creature" choose your creature with the <b>highest power</b>; ties go to the highest toughness, then the leftmost.
If you have no creature, the damage hits you.</div>
</div>
<div>
<div class="box dark">
<h3>The Nemesis attacks…</h3>
<p class="mini">Each untapped Nemesis creature without Defender and without summoning sickness <b>attacks</b> — unless you have an untapped creature
that could block it, <b>kill it and survive</b>.</p>
<h3>The Nemesis blocks… (in this order)</h3>
<ol class="mini">
<li><b>Safe block.</b> Each untapped Nemesis creature that can block an attacker, kill it and survive, does so — choosing the highest-power such attacker.</li>
<li><b>Trade.</b> Each remaining blocker blocks the highest-power attacker it can kill, even if it dies.</li>
<li><b>Desperation.</b> If unblocked damage would reduce Vorthrax to 0, every remaining blocker blocks the highest-power unblocked attacker.</li>
<li><b>Ties:</b> the leftmost Nemesis creature chooses first.</li>
</ol>
</div>
<div class="box mini"><h3>Reading the Nemesis</h3>Because these rules are fixed, you can predict every block. The skill is in shaping the combat:
pump after blocks, kill the only safe blocker first, or attack with exactly the creature it can't handle.</div>
</div>
</div>
<h3>Example: a safe block, then a trick</h3>
{board("YOUR ATTACK · TURN 5 OF THE EXAMPLE GAME", 12, 8, "Phase 1", "IV", "Ember Wyrmling",
       [chip("Scorch Fiend", "4/3", "nem", note="Trample")],
       [chip("Cinder Hound", "2/2", "you", True, "attacking"), chip("Firebrand Raider", "3/2", "you", True, "attacking")],
       [landchip("F"), landchip("M"), landchip("F")], 1)}
<p class="mini">Scorch Fiend can kill the Hound and survive (2 &lt; 3), but not the Raider (3 ≥ 3): <b>safe block on the Hound</b>. You answer with Battle Fury: the Hound becomes 5/2 and takes the Fiend with it.</p>
""", 12))

    ex1 = f"""
<h2>Example Game <small>EMBERKIN + WILDWOOD vs. VORTHRAX</small></h2>
<p class="mini">Follow along with the cards if you like. Opening hand: <b>Reckless Goblin, Thicket Bear, Surge of Vigor, Ancient Crashhorn</b>.
First Omen: <b>Cinderclaw Brute</b>. You: 20 life · Vorthrax: 14 life.</p>
<div class="round">ROUND 1</div>
{status(20, 14, "Phase 1", "I", "Cinderclaw Brute")}
{turn("Turn 1 — You", "you", [
    "No draw on the first turn.",
    "Land: flip <b>Ancient Crashhorn</b> to its Forest side and tuck it behind Kael.",
    "Nothing to cast: the Goblin needs {R} and the Bear needs two mana.",
    "Kael: <b>Charge</b> (I → II). No creature to pump, but loyalty grows.",
], "A 5-mana creature in a deck with at most 5 lands is a dream for later. Lands now win games — and the Goblin and Bear are cheap.")}
{turn("Turn 1 — Vorthrax", "nem", [
    "Executes the Omen: <b>Cinderclaw Brute</b> (3/2) enters, summoning sick.",
    "Reveals the new Omen: <b>Ash Imp</b>. Vorthrax 14 → 13.",
    "No attack. <b>Smolder</b>: 1 damage — Ember Bolt is milled from your library. You 20 → 19.",
])}
{board("END OF ROUND 1", 19, 13, "Phase 1", "II", "Ash Imp<br>1/1 Flying",
       [chip("Cinderclaw Brute", "3/2", "nem", note="sick")], [], [landchip("F")], 3)}
<div class="round">ROUND 2</div>
{status(19, 13, "Phase 1", "II", "Ash Imp")}
{turn("Turn 2 — You", "you", [
    "Draw <b>Cinder Hound</b> (19 → 18).",
    "The Omen warns that an Ash Imp (1/1 flyer) is coming. The Hound's 1 damage on entry will kill it — so you <b>hold the Hound</b>.",
    "Land: Reckless Goblin → Mountain. Cast <b>Thicket Bear</b> {1}{G}.",
    "Kael: Charge (II → III).",
], "Reading the Omen one turn ahead tells you which card to keep. Holding the Hound turns it into a two-for-one next turn.")}
{turn("Turn 2 — Vorthrax", "nem", [
    "Executes <b>Ash Imp</b> (sick). New Omen: <b>Searing Breath</b>. 13 → 12.",
    "Attack check: could your Bear block the Brute, kill it <i>and survive</i>? It kills it but dies → <b>the Brute attacks</b>.",
    "You block with the Bear. Both die: Bear → your graveyard, Brute → Ruin.",
    "Smolder: you mill Reckless Goblin. 18 → 17.",
], "Your lands are still lowered from casting the Bear, so Surge of Vigor isn't castable. A 2-mana Bear for a 3-power Brute is a fine trade.")}
"""
    pages.append(page(ex1, 13))

    ex2 = f"""
{board("END OF ROUND 2", 17, 12, "Phase 1", "III", "Searing Breath<br>2 dmg to your best creature",
       [chip("Ash Imp", "1/1", "nem", note="Flying")], [], [landchip("F", True), landchip("M", True)], 2)}
<div class="round">ROUND 3</div>
{status(17, 12, "Phase 1", "III", "Searing Breath")}
{turn("Turn 3 — You", "you", [
    "Draw <b>Wild Strength</b> (17 → 16). Land: Wild Strength → Forest (3 lands).",
    "Cast <b>Cinder Hound</b> {1}{R}: its entry ping kills the Ash Imp → Ruin.",
    "Kael: Charge (III → IV).",
    "Leave <b>one Forest raised</b>: Searing Breath is coming, and you hold Surge of Vigor.",
], "Leaving mana up on purpose is the heart of instant-speed play. The Omen makes it a calculated choice, not a guess.")}
{turn("Turn 3 — Vorthrax", "nem", [
    "Executes <b>Searing Breath</b>: target = your highest-power creature, the Hound.",
    "You respond: <b>Surge of Vigor</b> {G}. The Hound becomes 5/5 and shrugs off 2 damage.",
    "Searing Breath goes face-down to the bottom of the Threat deck: 12 → 13. New Omen: <b>Scorch Fiend</b>: 13 → 12.",
    "No attackers. Smolder: you mill Thicket Bear. 16 → 15.",
])}
{board("END OF ROUND 3", 15, 12, "Phase 1", "IV", "Scorch Fiend<br>4/3 Trample",
       [], [chip("Cinder Hound", "2/2", "you")], [landchip("F", True), landchip("M", True), landchip("F", True)], 0)}
<div class="round">ROUND 4</div>
{status(15, 12, "Phase 1", "IV", "Scorch Fiend")}
{turn("Turn 4 — You", "you", [
    "Draw <b>Firebrand Raider</b> (15 → 14). It is your only card, so no land this turn.",
    "Cast the Raider {2}{R} (3/2 Haste).",
    "Attack with Hound and Raider. No blockers: 5 damage, <b>Ash Hide</b> prevents 2 → 3 damage.",
    "Magma Sentinel, Vorthrax's Herald and Rain of Cinders go to the Ruin. 12 → 9.",
    "Kael stays at IV: an Ultimate now would lose 2 of its 3 damage to Ash Hide.",
], "Ash Hide absorbs only the first 2 damage each turn. Hit it with everything at once — and save the Ultimate for when the armour is gone.")}
"""
    pages.append(page(ex2, 14))

    ex3 = f"""
{turn("Turn 4 — Vorthrax", "nem", [
    "Executes <b>Scorch Fiend</b> (4/3 Trample), summoning sick. New Omen: <b>Ember Wyrmling</b>. 9 → 8.",
    "No attackers. Smolder: you mill Mossback Boar. 14 → 13.",
])}
{board("END OF ROUND 4", 13, 8, "Phase 1", "IV", "Ember Wyrmling<br>2/2 Flying",
       [chip("Scorch Fiend", "4/3", "nem", note="Trample")],
       [chip("Cinder Hound", "2/2", "you", True), chip("Firebrand Raider", "3/2", "you", True)],
       [landchip("F", True), landchip("M", True), landchip("F", True)], 0)}
<div class="round">ROUND 5</div>
{status(13, 8, "Phase 1", "IV", "Ember Wyrmling")}
{turn("Turn 5 — You", "you", [
    "Draw <b>Battle Fury</b> (13 → 12). Attack with Hound (2/2) and Raider (3/2).",
    "Nemesis block, step 1 (safe block): Scorch Fiend can kill the Hound and survive, but not the Raider → <b>it blocks the Hound</b>.",
    "After blocks: <b>Battle Fury</b> {R} on the Hound → 5/2. Hound and Fiend kill each other.",
    "The Raider is unblocked: 3 damage − 2 (Ash Hide) = 1. Cinderclaw Brute is milled. 8 → 7.",
    "<b>PHASE 2!</b> Vorthrax flips. <b>Rekindle</b> returns the 3 rearmost Ruin cards (Cinderclaw Brute, Scorch Fiend, Rain of Cinders) face-down: 7 → 10. Ash Hide is gone.",
    "Second main phase: Kael <b>ULTIMATE</b> (IV → I) — 3 full damage. 10 → 7.",
], "Patience at IV paid off: the Ultimate landed the very turn the armour broke. All 3 damage counted.")}
{turn("Turn 5 — Vorthrax (Phase 2)", "nem", [
    "Executes <b>Ember Wyrmling</b> (2/2 Flying). Inferno gives it Haste. New Omen: <b>Magma Sentinel</b>. 7 → 6.",
    "Your Raider is lowered from attacking: nothing can block. The Wyrmling hits for 2 — Bloom of Life and Ashwing Drake are milled. 12 → 10.",
    "<b>Inferno</b>: 2 more damage — Kindle and Grovesinger Druid milled. 10 → 8.",
], "Phase 2 costs you 3–4 life per round. Damage also burned a Bloom of Life you'd have loved to draw. The race is on.")}
{board("END OF ROUND 5", 8, 6, "Phase 2", "I", "Magma Sentinel<br>1/4 Defender",
       [chip("Ember Wyrmling", "2/2", "nem", True, "Flying")],
       [chip("Firebrand Raider", "3/2", "you", True)],
       [landchip("F"), landchip("M", True), landchip("F")], 0)}
"""
    pages.append(page(ex3, 15))

    ex4 = f"""
<div class="round">ROUND 6</div>
{status(8, 6, "Phase 2", "I", "Magma Sentinel")}
{turn("Turn 6 — You", "you", [
    "Draw <b>Spider of the Canopy</b> (8 → 7). Cast it {1}{G}: a 1/4 with Reach to stop the Wyrmling.",
    "Kael: Charge (I → II): Raider +1/+0 → 4/2.",
    "Attack with the Raider. The Wyrmling is lowered (it attacked), so there are no blockers: 4 damage. 6 → 2.",
])}
{turn("Turn 6 — Vorthrax", "nem", [
    "Executes <b>Magma Sentinel</b> (1/4 Defender). New Omen: <b>Scorch Fiend</b> — the one Rekindle brought back. 2 → 1.",
    "Attack check for the Wyrmling: your Spider would survive but can't kill it → <b>the Wyrmling attacks</b>. You block with the Spider: nobody dies.",
    "Inferno: Volcanic Roar and Pyre Titan milled. 7 → 5.",
], "Next turn a hasty Scorch Fiend (4 trample) plus Inferno (2) means 6 damage. After your draw you'll have 4 life. This is your last turn.")}
{board("END OF ROUND 6", 5, 1, "Phase 2", "II", "Scorch Fiend<br>4/3 Trample",
       [chip("Ember Wyrmling", "2/2", "nem", True, "Flying"), chip("Magma Sentinel", "1/4", "nem", note="Defender")],
       [chip("Firebrand Raider", "3/2", "you", True), chip("Spider of the Canopy", "1/4", "you", note="Reach")],
       [landchip("F", True), landchip("M", True), landchip("F")], 0)}
<div class="round">ROUND 7</div>
{status(5, 1, "Phase 2", "II", "Scorch Fiend")}
{turn("Turn 7 — You", "you", [
    "Draw <b>Elvish Grovekeeper</b> (5 → 4). Attack with the Raider (3/2) and the Spider (1/4).",
    "Nemesis blocks: step 1 — the Sentinel can't kill either. Step 2 — no trade possible. Step 3 — <b>desperation</b>: 4 unblocked damage would finish Vorthrax, so the Sentinel blocks the highest-power attacker, the Raider.",
    "The Spider is unblocked: 1 damage. Rain of Cinders, Vorthrax's last face-down card, goes to the Ruin. 1 → 0.",
    "<b>VICTORY</b> — with 4 cards left in your library.",
])}
<div class="box dark">
<h3>Debrief: five decisions that won the duel</h3>
<ol class="mini" style="margin:0">
<li><b>Crashhorn as a land</b> on turn 1: tempo over a dream card.</li>
<li><b>Holding the Hound</b> for the Ash Imp the Omen announced.</li>
<li><b>Leaving one Forest up</b> to save the Hound from Searing Breath.</li>
<li><b>Waiting at IV</b> until Ash Hide broke, then a full-damage Ultimate.</li>
<li><b>The Spider</b>: a blocker on their turn, the finishing blow on yours.</li>
</ol>
</div>
"""
    pages.append(page(ex4, 16))

    gallery = "".join(card(n, "xs") for n in [
        "Reckless Goblin", "Ember Bolt", "Cinder Hound", "Firebrand Raider", "Battle Fury",
        "Molten Blade", "Kindle", "Volcanic Roar", "Ashwing Drake", "Pyre Titan",
        "Thicket Bear", "Surge of Vigor", "Elvish Grovekeeper", "Wild Strength", "Spider of the Canopy",
        "Ironbark Wall", "Bloom of Life", "Mossback Boar", "Grovesinger Druid", "Ancient Crashhorn",
    ])
    pages.append(page(f"""
<h2>Card Gallery <small>THE 20 DIFFERENT GRIMOIRE CARDS</small></h2>
<div class="row center" style="gap:2.5mm; padding:0 2mm">{gallery}</div>
<p class="cap" style="margin-top:3mm">Top two rows: Emberkin (red). Bottom two rows: Wildwood (green). Reckless Goblin, Ember Bolt, Thicket Bear and Surge of Vigor come in two copies.</p>
""", 17))

    pages.append(page(f"""
<h2>Modes, Other Nemeses &amp; Tuning</h2>
<div class="cols">
<div>
<h3>Heroic mode</h3>
<p>Rotate the Nemesis card 180° during setup. Its Heroic half adds: <b>Nemesis creatures get +1/+0</b>. Every safe block suddenly becomes a trade.</p>
<h3>Solo puzzle</h3>
<p class="mini">Set the first 6 Threat cards in a known order and try to win in as few turns as possible. Share your record.</p>
</div>
<div>
<h3>The Gauntlet (campaign)</h3>
<ol class="mini">
<li>Face three Nemeses in a row with the same Grimoire.</li>
<li>After each victory, look at 3 random cards from a half-grimoire you aren't using and swap one of them into your Grimoire.</li>
<li>Your life resets between duels. Lose once and the Gauntlet ends.</li>
</ol>
</div>
</div>
<h3>Coming Nemeses</h3>
<div class="row" style="gap:5mm; flex-wrap:nowrap; align-items:center">
{other_nemesis("Morwen, the Lich Queen", "💀", "black",
               "<b>GRAVE TITHE</b> — At the end of each turn, if the Ruin holds 3+ creatures, return the highest-power one to the Table.",
               "<b>WITHERING</b> — Your creatures get −1/−1.")}
{other_nemesis("The Mirror Archmage", "🪞", "blue",
               "<b>REFRACTION</b> — The first spell you cast each turn costs {1} more.".replace("{1}", pips("{1}")),
               "<b>MIRROR WARD</b> — The first spell you cast each turn is countered unless you pay {2}.".replace("{2}", pips("{2}")))}
<div class="box" style="flex:1">
<p><b>Vorthrax</b> is aggro: it races you with haste and burn.</p>
<p><b>Morwen</b> is attrition: her dead creatures keep coming back, so removal alone won't win.</p>
<p style="margin:0"><b>The Mirror Archmage</b> is control: it taxes and counters your spells, rewarding cheap cards and bluffing with lands.</p>
</div>
</div>
<div class="box">
<h3>Designer notes: tuning knobs for playtesting</h3>
<table style="margin:1mm 0 0">
<tr><th>Knob</th><th>Default</th><th>Turn it up if…</th><th>Turn it down if…</th></tr>
<tr><td>Threat deck size</td><td>15 (14 life)</td><td>you win before round 5</td><td>you never reach Phase 2</td></tr>
<tr><td>Ash Hide</td><td>2 per turn</td><td>early aggro is too strong</td><td>Phase 1 feels like a wall</td></tr>
<tr><td>Smolder / Inferno</td><td>1 / 2</td><td>you win with 10+ life left</td><td>you lose before casting 4 spells</td></tr>
<tr><td>Opening hand</td><td>4</td><td>you often miss land drops</td><td>turn 1–2 feel scripted</td></tr>
<tr><td>Rekindle</td><td>3 cards</td><td>Phase 2 ends in one turn</td><td>Phase 2 drags on</td></tr>
</table>
</div>
""", 18))

    def rows(cards, threat=False):
        out = []
        for c in cards:
            cost = pips(c["cost"]) if c.get("cost") else "—"
            t = c["type"] + (f" — {c['sub']}" if c.get("sub") else "")
            out.append(f"<tr><td>{c['qty']}</td><td><b>{c['name']}</b></td><td>{cost}</td><td>{t}</td><td>{c.get('pt','')}</td><td>{pips(c.get('text',''))}</td></tr>")
        return "".join(out)

    pages.append(page(f"""
<h2>Card Lists</h2>
<h3>Emberkin (red) — back: Mountain</h3>
<table class="lists"><tr><th>#</th><th>Name</th><th>Cost</th><th>Type</th><th>P/T</th><th>Text</th></tr>{rows(RED)}</table>
<h3>Wildwood (green) — back: Forest</h3>
<table class="lists"><tr><th>#</th><th>Name</th><th>Cost</th><th>Type</th><th>P/T</th><th>Text</th></tr>{rows(GREEN)}</table>
<h3>Vorthrax's Threat deck</h3>
<table class="lists"><tr><th>#</th><th>Name</th><th>Cost</th><th>Type</th><th>P/T</th><th>Text</th></tr>{rows(THREATS)}</table>
""", 19))

    pages.append(page(f"""
<h2>Quick Reference</h2>
<div class="quickref cols">
<div>
<div class="box"><h3>Your turn</h3><ol>
<li>Untap (raise everything).</li><li>Draw 1 (−1 life; skip on turn 1).</li>
<li>Main: 1 land, spells, Kael once.</li><li>Combat.</li><li>Second main.</li><li>End: hand ≤ 5, damage wears off.</li></ol></div>
<div class="box"><h3>Nemesis turn</h3><ol>
<li>Untap.</li><li>Execute the Omen.</li><li>Reveal a new Omen (−1 life).</li><li>Attack (you block, instants allowed).</li><li>End-of-turn ability. Damage wears off.</li></ol></div>
<div class="box"><h3>Win &amp; lose</h3><ol>
<li>Vorthrax has 0 face-down Threat cards → <b>you win</b>.</li><li>Your library has 0 cards → <b>you lose</b>.</li></ol></div>
</div>
<div>
<div class="box dark"><h3>Nemesis mind</h3><ol>
<li><b>Attack</b> with every able creature, unless you could block it, kill it and survive.</li>
<li><b>Block:</b> safe block → trade → desperation (only if lethal).</li>
<li><b>Target</b> your highest-power creature (then toughness, then leftmost); none → you.</li>
<li><b>Overflow:</b> 5th creature hits you for its power instead.</li></ol></div>
<div class="box"><h3>Hands</h3><ol>
<li><b>Lowered</b> = tapped. <b>Raised</b> = untapped.</li>
<li><b>Damage N</b>: N library cards → graveyard.</li>
<li><b>Gain N</b>: N graveyard cards → library bottom.</li>
<li><b>Hit Vorthrax N</b>: N cards behind the Omen → Ruin.</li></ol></div>
<div class="box"><h3>Kael</h3><ol>
<li>Charge +1 · Discharge −2 (III–IV) · Ultimate (IV → I).</li>
<li>Once per turn, in a main phase.</li></ol></div>
</div>
</div>
""", 20))

    write_pdf(pages, OUT_HTML, OUT_PDF, "en", "Palmwalker — Rulebook")


if __name__ == "__main__":
    build()
