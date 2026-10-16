import { CHALLENGES } from './challenges';
import { NEMESES, type NemesisDeck } from './threats';

export const ALL_NEMESES: NemesisDeck[] = [...NEMESES, ...CHALLENGES];

export function findNemesis(id: string): NemesisDeck {
  const nemesis = ALL_NEMESES.find((candidate) => candidate.id === id);
  if (!nemesis) throw new Error(`Unknown Nemesis "${id}"`);
  return nemesis;
}
