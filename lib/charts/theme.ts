// Literal hex values (not CSS var()) on purpose: these feed SVG `fill`/`stroke`
// attributes in Recharts, and html2canvas (used for the PDF export) has unreliable
// support for CSS custom properties inside SVG presentation attributes — it can
// silently paint nothing. The app has no dark-mode toggle, so there's no need for
// these to be theme-reactive; literal values render correctly everywhere.
export const CATEGORICAL_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948",
];

export const SEQUENTIAL_HUE = "#2a78d6";

export const CHART_TOKENS = {
  surface: "#fcfcfb",
  inkPrimary: "#0b0b0b",
  inkSecondary: "#52514e",
  inkMuted: "#898781",
  gridline: "#e1e0d9",
  baseline: "#c3c2b7",
};

export function colorForIndex(index: number): string {
  return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
}
