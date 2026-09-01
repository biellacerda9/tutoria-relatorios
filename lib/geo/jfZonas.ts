import bairroZonaData from "./bairroZonaData.json";

const BAIRRO_TO_ZONA: Record<string, string> = bairroZonaData as Record<string, string>;

export const ZONA_ORDER = [
  "Zona Norte",
  "Zona Nordeste",
  "Zona Sul",
  "Zona Sudeste",
  "Zona Oeste",
  "Zona Leste",
  "Zona Central",
];

function normalizeBairro(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED_LOOKUP: Record<string, string> = Object.fromEntries(
  Object.entries(BAIRRO_TO_ZONA).map(([bairro, zona]) => [normalizeBairro(bairro), zona])
);

const KNOWN_BAIRROS = Object.keys(NORMALIZED_LOOKUP);

export function isJuizDeFora(cidade: string | null): boolean {
  if (!cidade) return false;
  return normalizeBairro(cidade) === "juiz de fora";
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - editDistance(a, b) / maxLen;
}

export type ZonaOrigem = "dicionario" | "similaridade" | "nao_classificado";

export interface ZonaMatch {
  zona: string | null;
  origem: ZonaOrigem;
  score: number | null;
}

/**
 * Sempre aplica a zona mais provável: bate exato no dicionário quando existe, senão usa o
 * bairro conhecido mais parecido (distância de edição). A margem de erro de um "quase igual"
 * (ex: "Serra D'Água" vs "Serra DÁgua") é pequena o suficiente pra não exigir revisão manual.
 * Só fica sem zona quando o ViaCEP não retornou nenhum texto de bairro pra comparar.
 */
export function matchZona(bairro: string | null): ZonaMatch {
  if (!bairro) return { zona: null, origem: "nao_classificado", score: null };

  const key = normalizeBairro(bairro);
  const exact = NORMALIZED_LOOKUP[key];
  if (exact) return { zona: exact, origem: "dicionario", score: 1 };

  let best: { name: string; score: number } | null = null;
  for (const known of KNOWN_BAIRROS) {
    const score = similarity(key, known);
    if (!best || score > best.score) best = { name: known, score };
  }

  if (!best) return { zona: null, origem: "nao_classificado", score: null };

  return { zona: NORMALIZED_LOOKUP[best.name], origem: "similaridade", score: best.score };
}
