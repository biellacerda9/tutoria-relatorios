import { CountEntry } from "./types";

export function capToTopN(data: CountEntry[], maxItems: number): CountEntry[] {
  if (data.length <= maxItems) return data;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, maxItems - 1);
  const rest = sorted.slice(maxItems - 1);
  const outros = rest.reduce((sum, e) => sum + e.value, 0);
  return [...top, { label: `Outros (${rest.length})`, value: outros }];
}
