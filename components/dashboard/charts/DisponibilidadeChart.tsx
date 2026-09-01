"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ReportData } from "@/lib/analysis/types";
import { CATEGORICAL_COLORS, CHART_TOKENS } from "@/lib/charts/theme";

interface DisponibilidadeChartProps {
  data: ReportData["disponibilidadePorDia"];
}

const SERIES = [
  { key: "manha", label: "Manhã", color: CATEGORICAL_COLORS[0] },
  { key: "tarde", label: "Tarde", color: CATEGORICAL_COLORS[1] },
  { key: "noite", label: "Noite", color: CATEGORICAL_COLORS[2] },
];

export function DisponibilidadeChart({ data }: DisponibilidadeChartProps) {
  return (
    <div className="rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">
          Disponibilidade para aulas por dia e período
        </h3>
        <div className="flex gap-3">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 8, left: 8, bottom: 0 }} barGap={4}>
          <XAxis
            dataKey="dia"
            tick={{ fill: CHART_TOKENS.inkSecondary, fontSize: 11 }}
            axisLine={{ stroke: CHART_TOKENS.baseline }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: CHART_TOKENS.gridline }}
            contentStyle={{
              background: CHART_TOKENS.surface,
              border: `1px solid ${CHART_TOKENS.gridline}`,
              fontSize: 12,
            }}
          />
          {SERIES.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={22}>
              <LabelList
                dataKey={s.key}
                position="top"
                style={{ fill: CHART_TOKENS.inkMuted, fontSize: 10 }}
                formatter={(v: unknown) => (typeof v === "number" && v > 0 ? v : "")}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
