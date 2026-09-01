import { CountEntry, EnrichedRow, RawRow, ReportData } from "./types";
import { ViaCepResult, lookupCepsWithConcurrency } from "@/lib/cep/viacep";
import { ufToRegiao, ALL_UFS } from "@/lib/geo/ufRegiao";
import { matchZona, isJuizDeFora, ZONA_ORDER } from "@/lib/geo/jfZonas";
import { DAY_ORDER } from "./columns";

const CEP_CONCURRENCY = 6;

export async function enrichRows(
  rows: RawRow[],
  onProgress?: (done: number, total: number) => void
): Promise<EnrichedRow[]> {
  const results = await lookupCepsWithConcurrency(
    rows,
    (row) => row.cep,
    CEP_CONCURRENCY,
    onProgress
  );

  return rows.map((row) => {
    const cepResult: ViaCepResult = results.get(row) ?? {
      cepValido: false,
      cidade: null,
      uf: null,
      bairro: null,
      logradouro: null,
    };

    const ehJuizDeFora = isJuizDeFora(cepResult.cidade);
    const zonaMatch = ehJuizDeFora
      ? matchZona(cepResult.bairro)
      : { zona: null, origem: "nao_classificado" as const };

    return {
      ...row,
      cepValido: cepResult.cepValido,
      cidadeViaCep: cepResult.cidade,
      ufViaCep: cepResult.uf,
      bairroViaCep: cepResult.bairro,
      logradouroViaCep: cepResult.logradouro,
      regiao: ufToRegiao(cepResult.uf),
      ehJuizDeFora,
      zonaJf: zonaMatch.zona,
      zonaOrigem: zonaMatch.origem,
    };
  });
}

function countBy<T>(items: T[], key: (item: T) => string | null): CountEntry[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function orderedCount(entries: CountEntry[], order: string[]): CountEntry[] {
  const map = new Map(entries.map((e) => [e.label, e.value]));
  return order.map((label) => ({ label, value: map.get(label) ?? 0 }));
}

function classifyPeriod(value: string): "manha" | "tarde" | "noite" | null {
  const v = value.toLowerCase();
  if (v.includes("manh")) return "manha";
  if (v.includes("tard")) return "tarde";
  if (v.includes("noite")) return "noite";
  return null;
}

export function aggregate(rows: EnrichedRow[]): ReportData {
  const validRows = rows.filter((r) => r.cepValido);

  const disponibilidadePorDia = DAY_ORDER.map((dia) => {
    let manha = 0,
      tarde = 0,
      noite = 0;
    for (const row of rows) {
      const values = row.disponibilidadeAulas[dia] ?? [];
      for (const v of values) {
        const period = classifyPeriod(v);
        if (period === "manha") manha++;
        else if (period === "tarde") tarde++;
        else if (period === "noite") noite++;
      }
    }
    return { dia, manha, tarde, noite };
  });

  const materiasFlat = rows.flatMap((r) => r.materiasDificuldade);
  const porMateriaDificuldade = countBy(
    materiasFlat.map((m) => ({ m })),
    (item) => item.m
  );

  const jfCount = validRows.filter((r) => r.ehJuizDeFora).length;
  const mgCount = validRows.filter((r) => r.ufViaCep === "MG").length;

  return {
    totalInscritos: rows.length,
    totalCepValido: validRows.length,
    porRegiao: orderedCount(
      countBy(validRows, (r) => r.regiao),
      ["Norte", "Nordeste", "Sul", "Sudeste", "Centro-Oeste"]
    ),
    porEstado: orderedCount(
      countBy(validRows, (r) => r.ufViaCep),
      ALL_UFS
    ),
    jfVsForaDeJf: [
      { label: "Juiz de Fora", value: jfCount },
      { label: "Fora de Juiz de Fora", value: validRows.length - jfCount },
    ],
    mgVsForaDeMg: [
      { label: "Minas Gerais", value: mgCount },
      { label: "Fora de Minas Gerais", value: validRows.length - mgCount },
    ],
    porZonaJf: orderedCount(
      countBy(
        validRows.filter((r) => r.ehJuizDeFora),
        (r) => r.zonaJf
      ),
      ZONA_ORDER
    ),
    zonaClassificadaPorSimilaridade: validRows.filter((r) => r.zonaOrigem === "similaridade")
      .length,
    porMateriaDificuldade,
    disponibilidadePorDia,
    perfil: {
      pcd: countBy(rows, (r) => r.pcd),
      necessidadeEspecial: countBy(rows, (r) => r.necessidadeEspecial),
      participouAntes: countBy(rows, (r) => r.participouAntes),
      redeEnsino: countBy(rows, (r) => r.redeEnsino),
      comoFicouSabendo: countBy(rows, (r) => r.comoFicouSabendo),
    },
    rows,
  };
}
