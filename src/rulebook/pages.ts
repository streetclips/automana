import { ALL_NEMESES } from "../box/nemesis/all";
import { exampleAttackers, exampleBlocks, exampleTarget, exampleTurnAttackers } from "../box/nemesis/examples";
import { BOX_REFERENCE, DECK_NAMES } from "../content";
import { RULEBOOK } from "../content/rulebook";
import type { Locale, RulebookBox, RulebookList, RulebookText } from "../content/types";
import { setLocale } from "../i18n/locale";
import { readCss } from "../lib/paths";
import { BOX_DECKS } from "../pnp/box";
import { SETS } from "../render/card";
import { referenceFace } from "../render/faces";
import { collectionIcon, icon } from "../render/icons";
import { bookletCoverCss, textureCss } from "../render/textures";
import { ATTACK_EXAMPLE, BLOCK_EXAMPLES, COVER_CARDS, NEMESIS_PAGES, TARGET_EXAMPLE, TURN_EXAMPLE, VIGNETTES, type BlockExample } from "./data";
import {
  anatomyFigure,
  attackFigure,
  cardName,
  combatFigure,
  cycleFigure,
  mm,
  nemesisCard,
  revealFigure,
  stepBadge,
  tableFigure,
  targetFigure,
  threatBack,
  turnFigure,
} from "./diagrams";

interface Page {
  id: string;
  title: string;
  render: () => string;
}

const sorted = (blocks: unknown[][]): string => JSON.stringify(blocks.map((block) => JSON.stringify(block)).sort());

function checkExamples(): void {
  const problems: string[] = [];
  const expect = (name: string, got: unknown, want: unknown) => {
    if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  };
  expect("attack", exampleAttackers(ATTACK_EXAMPLE.nemesis, ATTACK_EXAMPLE.yours), ATTACK_EXAMPLE.attackers);
  for (const [name, ex] of Object.entries(BLOCK_EXAMPLES)) expect(name, sorted(exampleBlocks(ex.nemesis, ex.yours, ex.life)), sorted(ex.blocks));
  expect("turn", exampleTurnAttackers(TURN_EXAMPLE.nemesis, TURN_EXAMPLE.hand, TURN_EXAMPLE.yours), TURN_EXAMPLE.attackers);
  expect("turn without the pump", exampleAttackers(TURN_EXAMPLE.nemesis, TURN_EXAMPLE.yours), TURN_EXAMPLE.without);
  expect("target", exampleTarget(TARGET_EXAMPLE.spell, TARGET_EXAMPLE.yours), TARGET_EXAMPLE.target);
  if (problems.length > 0) throw new Error(`The rulebook examples no longer match the Nemesis mind:\n${problems.join("\n")}`);
}

const ol = (items: string[], cls = "") => `<ol class="rb-ol ${cls}">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
const ul = (items: string[], cls = "") => `<ul class="rb-ul ${cls}">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
const box = ({ title, text }: RulebookBox, cls = "") => `<div class="rb-box ${cls}"><h3>${title}</h3><p>${text}</p></div>`;
const listBox = ({ title, items }: RulebookList, cls = "", ordered = false) => `<div class="rb-box ${cls}"><h3>${title}</h3>${ordered ? ol(items) : ul(items)}</div>`;
const vignette = (id: string, height: number, position = "50% 50%") => `<div class="rb-vignette art-${id}" style="height:${mm(height)};background-position:${position}"></div>`;
const kicker = (text: string) => `<div class="rb-kicker">${text}</div>`;

function cardCount(collection: string): number {
  const deck = BOX_DECKS.find((d) => d.id === collection);
  if (!deck) throw new Error(`No deck ${collection}`);
  return deck.cards.reduce((sum, c) => sum + c.qty, 0);
}

function startingCards(collection: string, tx: RulebookText): string {
  const nemesis = ALL_NEMESES.find((n) => n.id === collection);
  const counts = new Map<string, number>();
  for (const id of nemesis?.battlefield ?? []) counts.set(id, (counts.get(id) ?? 0) + 1);
  if (counts.size === 0) return tx.profile.nothing;
  return [...counts].map(([id, qty]) => (qty > 1 ? `${qty} × ${cardName(id)}` : cardName(id))).join(", ");
}

function medallion(collection: string, size: number): string {
  const set = SETS[collection];
  return `<span class="rb-medal k-${set.color}" style="font-size:${mm(size)}">${collectionIcon(collection)}</span>`;
}

function difficulty(collection: string, tx: RulebookText): string {
  return NEMESIS_PAGES[collection].difficulty === "normal" ? tx.nemeses.normal : tx.nemeses.hard;
}

function blockSteps(steps: string[], badges: (string | null)[]): string {
  return `<ul class="rb-steps-list">${steps.map((step, i) => `<li><span class="rb-markers">${badges[i] ?? ""}</span><div>${step}</div></li>`).join("")}</ul>`;
}

function pagesOf(tx: RulebookText, locale: Locale): Page[] {
  const d = tx.diagram;
  const nemesisPages: Page[] = ALL_NEMESES.map(({ id }) => ({ id, title: DECK_NAMES[id][locale].name, render: () => profile(id, tx, locale) }));
  const pages: Page[] = [
    { id: "cover", title: "", render: () => cover(tx) },
    { id: "welcome", title: tx.welcome.title, render: () => welcomePage(tx, pages) },
    {
      id: "game",
      title: tx.game.title,
      render: () => `<h1>${tx.game.title}</h1>
${vignette(VIGNETTES.game, 42, "50% 62%")}
<p class="rb-lead">${tx.game.intro}</p>
${cycleFigure(tx.game.you, tx.game.it)}
<div class="rb-split">${listBox(tx.game.win, "rb-win")}${listBox(tx.game.lose, "rb-lose")}</div>
${box(tx.game.run, "rb-key")}`,
    },
    {
      id: "setup",
      title: tx.setup.title,
      render: () => `<h1>${tx.setup.title}</h1>
${tableFigure(tx.setup.table, d)}
${ol(tx.setup.steps)}
${box(tx.setup.row, "rb-key")}`,
    },
    {
      id: "threats",
      title: tx.threats.title,
      render: () => `<h1>${tx.threats.title}</h1>
<p class="rb-lead">${tx.threats.intro}</p>
<div class="rb-anatomy">${anatomyFigure("nm_scorch_fiend", 56)}${ol(tx.threats.parts, "rb-parts")}</div>
<div class="rb-split rb-split-wide">
  <div><h2>${tx.threats.symbols}</h2>${symbolLegend(locale)}</div>
  <div><h2>${tx.threats.reference.title}</h2><div class="rb-faces">${face("A")}${face("B")}</div><p class="rb-small">${tx.threats.reference.text}</p></div>
</div>`,
    },
    {
      id: "yourTurn",
      title: tx.yourTurn.title,
      render: () => `<h1>${tx.yourTurn.title}</h1>
<p class="rb-lead">${tx.yourTurn.intro}</p>
<table class="rb-table"><thead><tr><th>${tx.yourTurn.head[0]}</th><th>${tx.yourTurn.head[1]}</th></tr></thead>
<tbody>${tx.yourTurn.rows.map(([when, then]) => `<tr><td>${when}</td><td>${then}</td></tr>`).join("")}</tbody></table>
${box(tx.yourTurn.never)}
<p class="rb-note">${tx.yourTurn.attack}</p>
${vignette(VIGNETTES.yourTurn, 46, "50% 30%")}`,
    },
    {
      id: "itsTurn",
      title: tx.itsTurn.title,
      render: () => `<h1>${tx.itsTurn.title}</h1>
<p class="rb-lead">${tx.itsTurn.intro}</p>
<div class="rb-timeline">${tx.itsTurn.steps.map((step, i) => `<div class="tl-step"><span class="tl-num">${i + 1}</span><div><h3>${step.title}</h3><p>${step.text}</p></div></div>`).join("")}</div>
${listBox(tx.itsTurn.cast)}
<div class="rb-split">${box(tx.itsTurn.empty)}<div class="rb-box rb-example"><h3>${tx.itsTurn.example.title}</h3>${revealFigure("nm_vorthraxs_herald")}<p>${tx.itsTurn.example.text}</p></div></div>`,
    },
    {
      id: "attacks",
      title: tx.attacks.title,
      render: () => `<h1>${tx.attacks.title}</h1>
<p class="rb-lead">${tx.attacks.intro}</p>
${ol(tx.attacks.rules)}
<p class="rb-small">${tx.attacks.abilities}</p>
${box(tx.attacks.key, "rb-key")}
<h2>${tx.attacks.example.title}</h2>
<p>${tx.attacks.example.setup}</p>
${attackFigure(ATTACK_EXAMPLE, d, tx.attacks.example.steps, 22, 8)}`,
    },
    {
      id: "blocks",
      title: tx.blocks.title,
      render: () => `<h1>${tx.blocks.title}</h1>
<p class="rb-lead">${tx.blocks.intro}</p>
${listBox(tx.blocks.lineUp)}
<div class="rb-ladder">${tx.blocks.steps
        .map((step, i) => {
          const kind = (["safe", "trade", "desperation"] as const)[i];
          return `<div class="ld-step ${kind}">${stepBadge(kind)}<div><h3>${step.title}</h3><p>${step.text}</p></div></div>`;
        })
        .join("")}</div>
${listBox(tx.blocks.always, "rb-key")}
<p class="rb-note">${tx.blocks.examples}</p>`,
    },
    {
      id: "examples",
      title: tx.examples.title,
      render: () => examplePage(tx, tx.examples.safe, combatFigure(BLOCK_EXAMPLES.safe, d, { cardW: 28, gap: 18, rise: 20 }), blockSteps(tx.examples.safe.steps, [stepBadge("safe"), stepBadge("trade"), stepBadge("desperation")]), 1),
    },
    {
      id: "order",
      title: tx.examples.order.title,
      render: () =>
        examplePage(
          tx,
          tx.examples.order,
          `<div class="rb-pair">${pairFigure(BLOCK_EXAMPLES.queenFirst, tx.examples.order.steps[0], d)}${pairFigure(BLOCK_EXAMPLES.droneFirst, tx.examples.order.steps[1], d)}</div>`,
          `<div class="rb-box rb-key"><p>${tx.examples.order.steps[2]}</p></div>`,
          2,
        ),
    },
    {
      id: "double",
      title: tx.examples.double.title,
      render: () =>
        examplePage(
          tx,
          tx.examples.double,
          `<div class="rb-pair">${pairFigure(BLOCK_EXAMPLES.atTwenty, tx.examples.double.steps[0], d)}${pairFigure(BLOCK_EXAMPLES.atFive, tx.examples.double.steps[1], d)}</div>`,
          "",
          3,
        ),
    },
    {
      id: "desperation",
      title: tx.examples.desperation.title,
      render: () =>
        examplePage(
          tx,
          tx.examples.desperation,
          combatFigure(BLOCK_EXAMPLES.desperation, d, { cardW: 28, gap: 9 }),
          blockSteps(tx.examples.desperation.steps, [stepBadge("safe") + stepBadge("trade"), stepBadge("desperation"), null]),
          4,
        ),
    },
    {
      id: "walkthrough",
      title: tx.walkthrough.title,
      render: () => `<h1>${tx.walkthrough.title}</h1>
<p class="rb-lead">${tx.walkthrough.setup}</p>
${turnFigure(TURN_EXAMPLE, d)}
${ol(tx.walkthrough.steps, "rb-turn")}
<div class="rb-box rb-key"><p>${tx.walkthrough.moral}</p></div>`,
    },
    {
      id: "targets",
      title: tx.targets.title,
      render: () => `<h1>${tx.targets.title}</h1>
<p class="rb-lead">${tx.targets.rule}</p>
<p class="rb-small">${tx.targets.timing}</p>
<h2>${tx.targets.example.title}</h2>
<p>${tx.targets.example.setup}</p>
${targetFigure(TARGET_EXAMPLE, d, 30, 21, 5)}
<p class="rb-note">${tx.targets.example.steps[0]}</p>
${listBox(tx.targets.choices)}`,
    },
    {
      id: "glossary",
      title: tx.glossary.title,
      render: () => `<h1>${tx.glossary.title}</h1>
<dl class="rb-glossary">${tx.glossary.entries.map(([term, text]) => `<div><dt>${term}</dt><dd>${text}</dd></div>`).join("")}</dl>
${vignette(VIGNETTES.glossary, 52, "50% 40%")}`,
    },
    {
      id: "faq",
      title: tx.faq.title,
      render: () => `<h1>${tx.faq.title}</h1>
<div class="rb-faq">${tx.faq.items.map(([q, a]) => `<div><p class="q">${q}</p><p class="a">${a}</p></div>`).join("")}</div>
${vignette(VIGNETTES.faq, 32, "50% 50%")}`,
    },
    {
      id: "nemeses",
      title: tx.nemeses.title,
      render: () => nemesesPage(tx, locale),
    },
    ...nemesisPages,
    {
      id: "decks",
      title: tx.decks.title,
      render: () => `<h1>${tx.decks.title}</h1>
<p class="rb-lead">${tx.decks.intro}</p>
${deckLists(tx, locale)}
<div class="rb-credits"><h3>${tx.credits.title}</h3>${tx.credits.lines.map((l) => `<p>${l}</p>`).join("")}<p class="rb-legal">${tx.credits.legal}</p></div>`,
    },
    {
      id: "quick",
      title: tx.quick.title,
      render: () => `<h1>${tx.quick.title}</h1>
<div class="rb-quick">${tx.quick.sections.map((s) => `<div class="rb-box">${`<h3>${s.title}</h3>`}${ul(s.items)}</div>`).join("")}</div>`,
    },
    { id: "back", title: "", render: () => back(tx, locale) },
  ];
  return pages;
}

function examplePage(tx: RulebookText, ex: { title: string; setup: string }, fig: string, after: string, n: number): string {
  return `${kicker(`${tx.examples.title} · ${n}/4`)}<h1>${ex.title}</h1>
<p class="rb-lead">${ex.setup}</p>
<div class="rb-center">${fig}</div>
${after}`;
}

function pairFigure(ex: BlockExample, text: string, d: RulebookText["diagram"]): string {
  return `<div class="rb-pair-item"><div class="rb-center">${combatFigure(ex, d, { cardW: 26, gap: 6, width: 58 })}</div><p>${text}</p></div>`;
}

function face(side: "A" | "B"): string {
  return `<div class="rb-card" style="font-size:${mm(28 / 25)}">${referenceFace(side, BOX_REFERENCE)}</div>`;
}

function symbolLegend(locale: Locale): string {
  return `<ul class="rb-symbols">${ALL_NEMESES.map(
    ({ id }) => `<li>${medallion(id, 6)}<span><b>${DECK_NAMES[id][locale].name}</b><small>${SETS[id].code} · ${cardCount(id)}</small></span></li>`,
  ).join("")}</ul>`;
}

function welcomePage(tx: RulebookText, pages: Page[]): string {
  const number = (id: string) => pages.findIndex((p) => p.id === id) + 1;
  const skip = new Set(["cover", "welcome", "back", "order", "double", "desperation", ...ALL_NEMESES.map((n) => n.id)]);
  const rows = pages
    .filter((p) => !skip.has(p.id))
    .map((p) => {
      const row = `<div class="toc-row"><span>${p.title}</span><i></i><b>${number(p.id)}</b></div>`;
      if (p.id !== "nemeses") return row;
      return row + ALL_NEMESES.map((n) => `<div class="toc-row sub"><span>${pages[number(n.id) - 1].title}</span><i></i><b>${number(n.id)}</b></div>`).join("");
    });
  return `<h1>${tx.welcome.title}</h1>
<div class="rb-lead">${tx.welcome.intro.map((p) => `<p>${p}</p>`).join("")}</div>
${listBox(tx.welcome.need, "", true)}
<div class="rb-toc"><h2>${tx.welcome.contents}</h2>${rows.join("")}</div>`;
}

function nemesesPage(tx: RulebookText, locale: Locale): string {
  const rows = ALL_NEMESES.map(
    ({ id }) => `<tr><td>${medallion(id, 5)}</td><td><b>${DECK_NAMES[id][locale].name}</b></td><td>${cardCount(id)}</td><td>${startingCards(id, tx)}</td><td>${difficulty(id, tx)}</td></tr>`,
  ).join("");
  const [name, cards, starts, level] = tx.nemeses.head;
  return `<h1>${tx.nemeses.title}</h1>
<p class="rb-lead">${tx.nemeses.intro}</p>
<table class="rb-table rb-nemeses"><thead><tr><th></th><th>${name}</th><th>${cards}</th><th>${starts}</th><th>${level}</th></tr></thead><tbody>${rows}</tbody></table>
<div class="rb-box rb-key"><p>${tx.nemeses.start}</p></div>
${vignette(VIGNETTES.nemeses, 50, "50% 40%")}`;
}

function deckLists(tx: RulebookText, locale: Locale): string {
  const decks = BOX_DECKS.map((deck) => {
    const starting = new Set(ALL_NEMESES.find((n) => n.id === deck.id)?.battlefield ?? []);
    let first = 1;
    const rows = deck.cards.map((card) => {
      const numbers = card.qty > 1 ? `${first}–${first + card.qty - 1}` : String(first);
      first += card.qty;
      const mark = starting.has(card.id) ? ` <span class="dl-star">★</span>` : "";
      return `<li><span class="dl-n">${numbers}</span><span class="dl-q">${card.qty}×</span><span>${card[locale].name}${mark}</span></li>`;
    });
    return `<div class="dl-deck"><h3>${medallion(deck.id, 4.2)}<span>${DECK_NAMES[deck.id][locale].name.split(",")[0]}</span><small>${SETS[deck.id].code} · ${first - 1}</small></h3><ul>${rows.join("")}</ul></div>`;
  });
  return `<div class="rb-decks">${decks.join("")}</div><p class="rb-small"><span class="dl-star">★</span> ${tx.decks.starts}</p>`;
}

function profile(id: string, tx: RulebookText, locale: Locale): string {
  const stats = NEMESIS_PAGES[id];
  const p = tx.profiles[id];
  const set = SETS[id];
  const facts = [
    [tx.profile.cards, String(cardCount(id))],
    [tx.profile.starts, startingCards(id, tx)],
    [tx.profile.difficulty, difficulty(id, tx)],
  ];
  return `<div class="pf-banner art-${stats.banner}"></div>
<div class="pf-band k-${set.color}">${medallion(id, 11)}<div><h1>${DECK_NAMES[id][locale].name}</h1></div></div>
<div class="pf-body">
<div class="pf-facts">${facts.map(([label, value]) => `<div><small>${label}</small><span>${value}</span></div>`).join("")}</div>
<div class="pf-cols">
  <div><p>${p.plays}</p>${p.special ? box(p.special, "rb-key") : ""}</div>
  <div><h3>${tx.profile.watch}</h3>${ul(p.watch)}</div>
</div>
<div class="pf-key"><h3>${tx.profile.key}</h3><div class="pf-cards">${stats.key.map((card) => nemesisCard(card, 37)).join("")}</div></div>
</div>`;
}

function cover(tx: RulebookText): string {
  const fan = COVER_CARDS.map((id, i) => `<div class="cv-slot" style="transform:rotate(${(i - 3) * 7}deg)">${nemesisCard(id, 42)}</div>`).join("");
  return `<div class="cv-seal">${icon("X")}</div>
<div class="cv-word">Automana</div>
<div class="cv-title">${tx.title}</div>
<div class="cv-fan">${fan}</div>
<p class="cv-tag">${tx.tagline}</p>
<p class="cv-facts">${tx.facts}</p>`;
}

function back(tx: RulebookText, locale: Locale): string {
  const medals = ALL_NEMESES.map(({ id }) => `<li>${medallion(id, 9)}<span>${DECK_NAMES[id][locale].name.split(",")[0]}</span></li>`).join("");
  return `<div class="bk-seal">${icon("X")}</div>
<div class="cv-word">Automana</div>
<p class="bk-tag">${tx.tagline}</p>
<ul class="bk-medals">${medals}</ul>
<div class="bk-back">${threatBack(30)}</div>
<p class="cv-facts">${tx.facts}</p>`;
}

function fillPages(html: string, pages: Page[]): string {
  return html.replace(/\{p:(\w+)\}/g, (_, id: string) => {
    const n = pages.findIndex((p) => p.id === id) + 1;
    if (n === 0) throw new Error(`No rulebook page ${id}`);
    return String(n);
  });
}

function folio(n: number, title: string): string {
  return `<div class="rb-folio"><b>${n}</b><span class="rb-folio-mark">${icon("X")}</span><span>${title}</span></div>`;
}

export function rulebookPages(locale: Locale): string[] {
  setLocale(locale);
  checkExamples();
  const tx = RULEBOOK[locale];
  const pages = pagesOf(tx, locale);
  if (pages.length % 4 !== 0) throw new Error(`The rulebook has ${pages.length} pages; a stapled booklet needs a multiple of 4`);
  return pages.map((p, i) => {
    const n = i + 1;
    const side = n % 2 ? "recto" : "verso";
    const body = fillPages(p.render(), pages);
    if (p.id === "cover" || p.id === "back") return `<section class="rb-page rb-dark rb-${p.id}">${body}</section>`;
    if (ALL_NEMESES.some((nemesis) => nemesis.id === p.id)) return `<section class="rb-page rb-profile ${side}">${body}${folio(n, p.title)}</section>`;
    return `<section class="rb-page ${side}"><div class="rb-body">${body}</div>${folio(n, p.title)}</section>`;
  });
}

export function rulebookCss(): string {
  return [readCss("render/card.css", "render/faces.css", "rulebook/rulebook.css"), textureCss(), bookletCoverCss()].join("\n");
}
