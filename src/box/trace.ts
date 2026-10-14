import { setLocale } from './i18n/locale';
import { playerDecks } from './nemesis/decks';
import { playNemesisGame } from './nemesis/game';
import { getNemesis } from './nemesis/threats';

const [seedArg = '1', deckArg, nemesisArg = 'vorthrax'] = process.argv.slice(2);
const decks = playerDecks();
const deck = decks.find((candidate) => candidate.key === deckArg) ?? decks[0];
if (!deck) throw new Error('no player decks');
setLocale('en');
const log: string[] = [];
const result = playNemesisGame(Number(seedArg), deck.cards, getNemesis(nemesisArg), log);
console.log(log.join('\n'));
console.log(`\n${deck.key} vs ${nemesisArg}, seed ${seedArg}:`, result);
