import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { withLocale } from './i18n/locale';
import { allCardDefs, formatCost, getCost, rulesText, typeLine, type CardDef } from './engine';

interface Oracle {
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
}

const CACHE = resolve(import.meta.dirname, '../../dist/box/oracle.json');
const API = 'https://api.scryfall.com/cards/collection';
const BATCH = 75;

function checked(def: CardDef): boolean {
  return !def.token && !def.supertypes?.includes('Basic');
}

async function fetchOracle(names: string[]): Promise<Oracle[]> {
  const cards: Oracle[] = [];
  for (let i = 0; i < names.length; i += BATCH) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'automana-box/0.1' },
      body: JSON.stringify({ identifiers: names.slice(i, i + BATCH).map((name) => ({ name })) }),
    });
    const json = (await res.json()) as { data: Oracle[]; not_found?: { name: string }[] };
    if (json.not_found?.length) throw new Error(`Scryfall has no card named ${json.not_found.map((c) => c.name).join(', ')}`);
    cards.push(...json.data);
  }
  return cards;
}

async function loadOracle(names: string[]): Promise<Map<string, Oracle>> {
  let cards: Oracle[] = existsSync(CACHE) ? (JSON.parse(readFileSync(CACHE, 'utf8')) as Oracle[]) : [];
  const missing = names.filter((name) => !cards.some((card) => card.name === name));
  if (missing.length > 0) {
    cards = [...cards, ...(await fetchOracle(missing))];
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify(cards, null, 1));
  }
  return new Map(cards.map((card) => [card.name, card]));
}

function normalize(line: string): string {
  return line
    .replace(/\([^)]*\)/g, '')
    .replace(/^raid — /i, '')
    .replace(/\s+/g, ' ')
    .replace(/[.\s]+$/, '')
    .trim()
    .toLowerCase();
}

function oracleLines(card: Oracle): string[] {
  return (card.oracle_text ?? '').split('\n').map(normalize).filter(Boolean);
}

function engineLines(def: CardDef): string[] {
  return withLocale('en', () => rulesText(def))
    .flatMap((line) => (def.keywords?.length && line === rulesText(def)[0] ? line.split(', ') : [line]))
    .map(normalize)
    .filter(Boolean);
}

function without(lines: string[], other: string[]): string[] {
  const rest = [...other];
  return lines.filter((line) => {
    const index = rest.indexOf(line);
    if (index < 0) return true;
    rest.splice(index, 1);
    return false;
  });
}

const defs = allCardDefs().filter(checked);
const oracle = await loadOracle(defs.map((def) => def.name));
let mismatches = 0;
for (const def of defs) {
  const card = oracle.get(def.name);
  if (!card) throw new Error(`No oracle text for ${def.name}`);
  const problems: string[] = [];
  const cost = def.cost ? formatCost(getCost(def.id)) : '';
  if ((card.mana_cost ?? '') !== cost) problems.push(`cost ${cost || '—'} ≠ ${card.mana_cost || '—'}`);
  const type = withLocale('en', () => typeLine(def));
  if (type !== card.type_line) problems.push(`type "${type}" ≠ "${card.type_line}"`);
  if (def.power !== undefined && `${def.power}/${def.toughness}` !== `${card.power}/${card.toughness}`)
    problems.push(`P/T ${def.power}/${def.toughness} ≠ ${card.power}/${card.toughness}`);
  const ours = withLocale('en', () => engineLines(def));
  const theirs = oracleLines(card);
  for (const line of without(ours, theirs)) problems.push(`  engine: ${line}`);
  for (const line of without(theirs, ours)) problems.push(`  oracle: ${line}`);
  if (problems.length === 0) continue;
  mismatches += 1;
  console.log(`${def.name}\n${problems.map((problem) => `  ${problem}`).join('\n')}`);
}
console.log(`\n${defs.length - mismatches} of ${defs.length} cards match their oracle text; ${mismatches} differ.`);
