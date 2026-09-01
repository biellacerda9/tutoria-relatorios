export const CATEGORICAL_COLORS = [
  "var(--chart-series-1)",
  "var(--chart-series-2)",
  "var(--chart-series-3)",
  "var(--chart-series-4)",
  "var(--chart-series-5)",
  "var(--chart-series-6)",
  "var(--chart-series-7)",
  "var(--chart-series-8)",
];

export const SEQUENTIAL_HUE = "var(--chart-series-1)";

export const CHART_TOKENS = {
  surface: "var(--chart-surface)",
  inkPrimary: "var(--chart-ink-primary)",
  inkSecondary: "var(--chart-ink-secondary)",
  inkMuted: "var(--chart-ink-muted)",
  gridline: "var(--chart-gridline)",
  baseline: "var(--chart-baseline)",
};

export function colorForIndex(index: number): string {
  return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
}
