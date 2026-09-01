"use client";

import { useEffect, useState } from "react";
import { CountEntry } from "@/lib/analysis/types";
import { colorForIndex } from "@/lib/charts/theme";

interface RankedListProps {
  title: string;
  data: CountEntry[];
  hideZero?: boolean;
  colorIndex?: number;
  maxItems?: number;
}

function capToTopN(data: CountEntry[], maxItems: number): CountEntry[] {
  if (data.length <= maxItems) return data;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, maxItems - 1);
  const rest = sorted.slice(maxItems - 1);
  const outros = rest.reduce((sum, e) => sum + e.value, 0);
  return [...top, { label: `Outros (${rest.length})`, value: outros }];
}

export function RankedList({
  title,
  data,
  hideZero = true,
  colorIndex = 0,
  maxItems,
}: RankedListProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const zeroFiltered = hideZero ? data.filter((d) => d.value > 0) : data;
  const filtered = maxItems ? capToTopN(zeroFiltered, maxItems) : zeroFiltered;
  const max = filtered.reduce((m, e) => Math.max(m, e.value), 0) || 1;
  const color = colorForIndex(colorIndex);

  return (
    <div className="rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Sem dados para exibir.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => (
            <li key={entry.label} className="group rounded-md px-1 py-0.5 transition-colors hover:bg-paper">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-ink">{entry.label}</span>
                <span className="shrink-0 font-serif text-lg text-ink">{entry.value}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: mounted ? `${(entry.value / max) * 100}%` : "0%",
                    background: color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
