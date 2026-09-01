export const UF_TO_REGIAO: Record<string, string> = {
  AC: "Norte",
  AP: "Norte",
  AM: "Norte",
  PA: "Norte",
  RO: "Norte",
  RR: "Norte",
  TO: "Norte",
  AL: "Nordeste",
  BA: "Nordeste",
  CE: "Nordeste",
  MA: "Nordeste",
  PB: "Nordeste",
  PE: "Nordeste",
  PI: "Nordeste",
  RN: "Nordeste",
  SE: "Nordeste",
  PR: "Sul",
  RS: "Sul",
  SC: "Sul",
  ES: "Sudeste",
  MG: "Sudeste",
  RJ: "Sudeste",
  SP: "Sudeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  DF: "Centro-Oeste",
  GO: "Centro-Oeste",
};

export const ALL_UFS = Object.keys(UF_TO_REGIAO);

export function ufToRegiao(uf: string | null): string | null {
  if (!uf) return null;
  return UF_TO_REGIAO[uf.toUpperCase().trim()] ?? null;
}
