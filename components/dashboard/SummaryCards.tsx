import { ReportData } from "@/lib/analysis/types";

const ACCENTS = [
  { bar: "bg-[var(--chart-series-1)]", text: "text-[var(--chart-series-1)]" },
  { bar: "bg-accent", text: "text-accent-ink" },
  { bar: "bg-[var(--chart-series-6)]", text: "text-[var(--chart-series-6)]" },
  { bar: "bg-warn", text: "text-warn-ink" },
];

function Card({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: (typeof ACCENTS)[number];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper-raised shadow-sm">
      <div className={`h-1 ${accent.bar}`} />
      <div className="p-4">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-1 font-serif text-3xl text-ink">{value}</p>
        {sub && <p className={`mt-0.5 text-xs font-medium ${accent.text}`}>{sub}</p>}
      </div>
    </div>
  );
}

export function SummaryCards({ data }: { data: ReportData }) {
  const pct =
    data.totalInscritos === 0
      ? 0
      : Math.round((data.totalCepValido / data.totalInscritos) * 100);
  const jf = data.jfVsForaDeJf.find((e) => e.label === "Juiz de Fora")?.value ?? 0;
  const jfPct = data.totalCepValido === 0 ? 0 : Math.round((jf / data.totalCepValido) * 100);
  const zonaClassificada = data.porZonaJf.reduce((sum, e) => sum + e.value, 0);
  const zonaPct = jf === 0 ? 0 : Math.round((zonaClassificada / jf) * 100);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card label="Total de inscritos" value={String(data.totalInscritos)} accent={ACCENTS[0]} />
      <Card
        label="CEP válido"
        value={String(data.totalCepValido)}
        sub={`${pct}% do total`}
        accent={ACCENTS[1]}
      />
      <Card
        label="Inscritos de Juiz de Fora"
        value={String(jf)}
        sub={`${jfPct}% dos válidos`}
        accent={ACCENTS[2]}
      />
      <Card
        label="Zona de JF identificada"
        value={`${zonaClassificada}/${jf}`}
        sub={
          data.zonaClassificadaPorSimilaridade > 0
            ? `${zonaPct}% (${data.zonaClassificadaPorSimilaridade} por similaridade)`
            : `${zonaPct}%`
        }
        accent={ACCENTS[3]}
      />
    </div>
  );
}
