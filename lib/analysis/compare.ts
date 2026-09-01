import { CountEntry, ReportData } from "./types";

export interface DeltaEntry {
  label: string;
  a: number;
  b: number;
  delta: number;
  deltaPct: number | null;
}

export interface ComparisonData {
  totalInscritos: DeltaEntry;
  totalCepValido: DeltaEntry;
  porRegiao: DeltaEntry[];
  porEstado: DeltaEntry[];
  jfVsForaDeJf: DeltaEntry[];
  porZonaJf: DeltaEntry[];
  porMateriaDificuldade: DeltaEntry[];
  perfil: {
    pcd: DeltaEntry[];
    necessidadeEspecial: DeltaEntry[];
    participouAntes: DeltaEntry[];
    redeEnsino: DeltaEntry[];
  };
}

function toDelta(label: string, a: number, b: number): DeltaEntry {
  return { label, a, b, delta: b - a, deltaPct: a === 0 ? null : ((b - a) / a) * 100 };
}

function buildDelta(
  aEntries: CountEntry[],
  bEntries: CountEntry[],
  opts: { order?: string[]; topN?: number } = {}
): DeltaEntry[] {
  const aMap = new Map(aEntries.map((e) => [e.label, e.value]));
  const bMap = new Map(bEntries.map((e) => [e.label, e.value]));

  if (opts.order) {
    return opts.order.map((label) => toDelta(label, aMap.get(label) ?? 0, bMap.get(label) ?? 0));
  }

  const labels = new Set([...aMap.keys(), ...bMap.keys()]);
  let entries = Array.from(labels).map((label) =>
    toDelta(label, aMap.get(label) ?? 0, bMap.get(label) ?? 0)
  );
  entries.sort((x, y) => y.a + y.b - (x.a + x.b));

  if (opts.topN && entries.length > opts.topN) {
    const top = entries.slice(0, opts.topN - 1);
    const rest = entries.slice(opts.topN - 1);
    const outros = rest.reduce(
      (acc, e) => ({ a: acc.a + e.a, b: acc.b + e.b }),
      { a: 0, b: 0 }
    );
    entries = [...top, toDelta(`Outros (${rest.length})`, outros.a, outros.b)];
  }

  return entries;
}

const REGIAO_ORDER = ["Norte", "Nordeste", "Sul", "Sudeste", "Centro-Oeste"];

export function compareReports(a: ReportData, b: ReportData): ComparisonData {
  return {
    totalInscritos: toDelta("Total de inscritos", a.totalInscritos, b.totalInscritos),
    totalCepValido: toDelta("CEP válido", a.totalCepValido, b.totalCepValido),
    porRegiao: buildDelta(a.porRegiao, b.porRegiao, { order: REGIAO_ORDER }),
    porEstado: buildDelta(a.porEstado, b.porEstado, { topN: 10 }),
    jfVsForaDeJf: buildDelta(a.jfVsForaDeJf, b.jfVsForaDeJf, {
      order: ["Juiz de Fora", "Fora de Juiz de Fora"],
    }),
    porZonaJf: buildDelta(a.porZonaJf, b.porZonaJf),
    porMateriaDificuldade: buildDelta(a.porMateriaDificuldade, b.porMateriaDificuldade, {
      topN: 10,
    }),
    perfil: {
      pcd: buildDelta(a.perfil.pcd, b.perfil.pcd),
      necessidadeEspecial: buildDelta(a.perfil.necessidadeEspecial, b.perfil.necessidadeEspecial),
      participouAntes: buildDelta(a.perfil.participouAntes, b.perfil.participouAntes),
      redeEnsino: buildDelta(a.perfil.redeEnsino, b.perfil.redeEnsino),
    },
  };
}
