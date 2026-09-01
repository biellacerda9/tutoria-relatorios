export interface RawRow {
  id: string;
  timestamp: string | null;
  email: string | null;
  nomeCompleto: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  pcd: string | null;
  necessidadeEspecial: string | null;
  participouAntes: string | null;
  redeEnsino: string | null;
  primeiraVezProva: string | null;
  materiasDificuldade: string[];
  disponibilidadeAulas: Record<string, string[]>;
  disponibilidadeDuvidas: Record<string, string[]>;
  comoFicouSabendo: string | null;
}

export interface EnrichedRow extends RawRow {
  cepValido: boolean;
  cidadeViaCep: string | null;
  ufViaCep: string | null;
  bairroViaCep: string | null;
  logradouroViaCep: string | null;
  regiao: string | null;
  ehJuizDeFora: boolean;
  zonaJf: string | null;
  zonaOrigem: "dicionario" | "similaridade" | "nao_classificado";
}

export interface CountEntry {
  label: string;
  value: number;
}

export interface ReportData {
  totalInscritos: number;
  totalCepValido: number;
  porRegiao: CountEntry[];
  porEstado: CountEntry[];
  jfVsForaDeJf: CountEntry[];
  mgVsForaDeMg: CountEntry[];
  porZonaJf: CountEntry[];
  zonaClassificadaPorSimilaridade: number;
  porMateriaDificuldade: CountEntry[];
  disponibilidadePorDia: { dia: string; manha: number; tarde: number; noite: number }[];
  perfil: {
    pcd: CountEntry[];
    necessidadeEspecial: CountEntry[];
    participouAntes: CountEntry[];
    redeEnsino: CountEntry[];
    comoFicouSabendo: CountEntry[];
  };
  rows: EnrichedRow[];
}
