import * as XLSX from "xlsx";
import { CountEntry, ReportData } from "@/lib/analysis/types";
import { embedPieCharts, PieChartSpec } from "./embedPieCharts";

interface Block {
  headerRow: number;
  firstRow: number;
  lastRow: number;
}

class ResultSheetBuilder {
  rows: unknown[][] = [];

  addBlock(title: string, entries: CountEntry[]): Block {
    const headerRow = this.rows.length + 1;
    this.rows.push([title, "Quantidade"]);
    const firstRow = headerRow + 1;
    for (const e of entries) this.rows.push([e.label, e.value]);
    const lastRow = Math.max(firstRow, headerRow + entries.length);
    this.rows.push([]);
    return { headerRow, firstRow, lastRow };
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportXlsx(data: ReportData, filename: string) {
  const wb = XLSX.utils.book_new();

  const dadosAoa: unknown[][] = [
    [
      "Nome completo",
      "E-mail",
      "Cidade informada",
      "UF informada",
      "CEP",
      "CEP válido?",
      "Cidade (ViaCEP)",
      "UF (ViaCEP)",
      "Bairro (ViaCEP)",
      "Região",
      "É Juiz de Fora?",
      "Zona de JF",
      "Zona de JF - origem",
    ],
    ...data.rows.map((r) => [
      r.nomeCompleto ?? "",
      r.email ?? "",
      r.cidade ?? "",
      r.uf ?? "",
      r.cep ?? "",
      r.cepValido,
      r.cidadeViaCep ?? "",
      r.ufViaCep ?? "",
      r.bairroViaCep ?? "",
      r.regiao ?? "",
      r.ehJuizDeFora,
      r.zonaJf ?? "",
      r.ehJuizDeFora ? r.zonaOrigem : "",
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dadosAoa), "Dados");

  const jf = data.jfVsForaDeJf.find((e) => e.label === "Juiz de Fora")?.value ?? 0;
  const zonaClassificada = data.porZonaJf.reduce((sum, e) => sum + e.value, 0);
  const analiseAoa: unknown[][] = [
    ["Indicadores", ""],
    ["Total de inscritos", data.totalInscritos],
    ["Total de inscritos com CEP válido", data.totalCepValido],
    ["Inscritos de Juiz de Fora", jf],
    ["Juiz de Fora com zona identificada", zonaClassificada],
    ["...classificados por similaridade de nome do bairro", data.zonaClassificadaPorSimilaridade],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(analiseAoa), "Análise");

  const builder = new ResultSheetBuilder();
  const regiaoBlock = builder.addBlock("Região", data.porRegiao);
  const estadoBlock = builder.addBlock("Estado (UF)", data.porEstado);
  const jfBlock = builder.addBlock("JF vs Fora de JF", data.jfVsForaDeJf);
  const mgBlock = builder.addBlock("MG vs Fora de MG", data.mgVsForaDeMg);
  const zonaBlock = builder.addBlock("Zona de JF", data.porZonaJf);
  builder.addBlock("Matérias com mais dificuldade", data.porMateriaDificuldade);
  builder.rows.push(["Disponibilidade por dia", "", "", ""], ["Dia", "Manhã", "Tarde", "Noite"]);
  for (const d of data.disponibilidadePorDia) builder.rows.push([d.dia, d.manha, d.tarde, d.noite]);
  builder.rows.push([]);
  builder.addBlock("PCD", data.perfil.pcd);
  builder.addBlock("Necessidade educacional especial", data.perfil.necessidadeEspecial);
  builder.addBlock("Participou de edições anteriores", data.perfil.participouAntes);
  builder.addBlock("Rede de ensino", data.perfil.redeEnsino);
  builder.addBlock("Como ficou sabendo do projeto", data.perfil.comoFicouSabendo);

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(builder.rows), "Resultados");

  const chartSpecs: PieChartSpec[] = [
    { title: "Região", sheetName: "Resultados", ...regiaoBlock },
    { title: "Estado (UF)", sheetName: "Resultados", ...estadoBlock },
    { title: "Juiz de Fora vs. Fora de JF", sheetName: "Resultados", ...jfBlock },
    { title: "Minas Gerais vs. Fora de MG", sheetName: "Resultados", ...mgBlock },
    { title: "Zona de Juiz de Fora", sheetName: "Resultados", ...zonaBlock },
  ];

  const workbookBytes = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const blob = await embedPieCharts(workbookBytes, chartSpecs);
  downloadBlob(blob, filename);
}
