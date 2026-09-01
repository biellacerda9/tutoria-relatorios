"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CountEntry } from "@/lib/analysis/types";
import { CATEGORICAL_COLORS, CHART_TOKENS } from "@/lib/charts/theme";

interface DonutChartProps {
  title: string;
  data: CountEntry[];
  colorOffset?: number;
}

export function DonutChart({ title, data, colorOffset = 0 }: DonutChartProps) {
  const filtered = data.filter((d) => d.value > 0);
  const total = filtered.reduce((sum, d) => sum + d.value, 0);

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
        <p className="text-sm text-muted">Sem dados para exibir.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-ink">{title}</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={filtered}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              stroke={CHART_TOKENS.surface}
              strokeWidth={2}
            >
              {filtered.map((entry, i) => (
                <Cell
                  key={entry.label}
                  fill={CATEGORICAL_COLORS[(i + colorOffset) % CATEGORICAL_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${Math.round((Number(value) / total) * 100)}%)`,
                name,
              ]}
              contentStyle={{
                background: CHART_TOKENS.surface,
                border: `1px solid ${CHART_TOKENS.gridline}`,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink font-serif">{total}</span>
          <span className="text-[11px] text-muted">total</span>
        </div>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-muted">
        {filtered.map((entry, i) => (
          <li key={entry.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background: CATEGORICAL_COLORS[(i + colorOffset) % CATEGORICAL_COLORS.length],
              }}
            />
            <span className="min-w-0 flex-1 truncate">{entry.label}</span>
            <span className="shrink-0 font-medium text-ink">
              {entry.value} · {Math.round((entry.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
