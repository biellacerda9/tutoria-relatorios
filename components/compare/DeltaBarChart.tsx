"use client";

import { DeltaEntry } from "@/lib/analysis/compare";
import { CATEGORICAL_COLORS } from "@/lib/charts/theme";

interface DeltaBarChartProps {
  title: string;
  data: DeltaEntry[];
  labelA: string;
  labelB: string;
}

const COLOR_A = CATEGORICAL_COLORS[0];
const COLOR_B = CATEGORICAL_COLORS[1];

export function DeltaBarChart({ title, data, labelA, labelB }: DeltaBarChartProps) {
  const filtered = data.filter((d) => d.a > 0 || d.b > 0);
  const max = filtered.reduce((m, e) => Math.max(m, e.a, e.b), 0) || 1;

  return (
    <div className="rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <div className="flex gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_A }} />
            {labelA}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_B }} />
            {labelB}
          </span>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Sem dados para exibir.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((e) => (
            <li key={e.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink">{e.label}</span>
                <span className="shrink-0 text-xs text-muted">
                  {e.a} → {e.b}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(e.a / max) * 100}%`, background: COLOR_A }}
                  />
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(e.b / max) * 100}%`, background: COLOR_B }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
