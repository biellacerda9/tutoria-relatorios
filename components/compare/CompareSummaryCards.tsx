import { DeltaEntry } from "@/lib/analysis/compare";

function DeltaBadge({ delta, deltaPct }: { delta: number; deltaPct: number | null }) {
  if (delta === 0) return <span className="text-xs font-medium text-muted">sem variação</span>;
  const up = delta > 0;
  const pct = deltaPct !== null ? ` (${up ? "+" : ""}${Math.round(deltaPct)}%)` : "";
  return (
    <span className={`text-xs font-medium ${up ? "text-accent-ink" : "text-warn-ink"}`}>
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {delta}
      {pct}
    </span>
  );
}

export function CompareSummaryCards({ entries }: { entries: DeltaEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {entries.map((e) => (
        <div key={e.label} className="rounded-xl border border-line bg-paper-raised p-4 shadow-sm">
          <p className="text-xs font-medium text-muted">{e.label}</p>
          <p className="mt-1 font-serif text-2xl text-ink">
            {e.a} <span className="text-base text-muted">→</span> {e.b}
          </p>
          <div className="mt-0.5">
            <DeltaBadge delta={e.delta} deltaPct={e.deltaPct} />
          </div>
        </div>
      ))}
    </div>
  );
}
