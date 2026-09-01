import * as XLSX from "xlsx";
import { CountEntry, ReportData } from "@/lib/analysis/types";
import { capToTopN } from "@/lib/analysis/capToTopN";
import { postProcessWorkbook, ChartSpec, StyleSpec } from "./postProcessWorkbook";

interface Block {
  headerRow: number;
  firstRow: number;
  lastRow: number;
}

class ResultSheetBuilder {
  rows: unknown[][] = [];
  headerRows: number[] = [];

  addBlock(title: string, entries: CountEntry[], maxItems?: number): Block {
    const capped = maxItems ? capToTopN(entries, maxItems) : entries;
    const headerRow = this.rows.length + 1;
    this.headerRows.push(headerRow);
    this.rows.push([title, "Quantidade"]);
    const firstRow = headerRow + 1;
    for (const e of capped) this.rows.push([e.label, e.value]);
    const lastRow = Math.max(firstRow, headerRow + capped.length);
    this.rows.push([]);
    return { headerRow, firstRow, lastRow };
  }

  addHeaderRow(...cells: unknown[]) {
    this.headerRows.push(this.rows.length + 1);
    this.rows.push(cells);
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
    ]),
  ];
  const dadosWs = XLSX.utils.aoa_to_sheet(dadosAoa);
  dadosWs["!cols"] = [
    { wch: 28 },
    { wch: 26 },
    { wch: 18 },
    { wch: 8 },
    { wch: 10 },
    { wch: 10 },
    { wch: 18 },
    { wch: 8 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
  ];
  dadosWs["!autofilter"] = { ref: `A1:L${dadosAoa.length}` };
  XLSX.utils.book_append_sheet(wb, dadosWs, "Dados");

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
  const analiseWs = XLSX.utils.aoa_to_sheet(analiseAoa);
  analiseWs["!cols"] = [{ wch: 46 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, analiseWs, "Análise");

  const builder = new ResultSheetBuilder();
  const regiaoBlock = builder.addBlock("Região", data.porRegiao);
  const estadoBlock = builder.addBlock("Estado (UF)", data.porEstado);
  const jfBlock = builder.addBlock("JF vs Fora de JF", data.jfVsForaDeJf);
  const mgBlock = builder.addBlock("MG vs Fora de MG", data.mgVsForaDeMg);
  const zonaBlock = builder.addBlock("Zona de JF", data.porZonaJf);
  builder.addBlock("Matérias com mais dificuldade", data.porMateriaDificuldade, 20);
  builder.addHeaderRow("Disponibilidade por dia", "", "", "");
  builder.addHeaderRow("Dia", "Manhã", "Tarde", "Noite");
  for (const d of data.disponibilidadePorDia) builder.rows.push([d.dia, d.manha, d.tarde, d.noite]);
  builder.rows.push([]);
  builder.addBlock("PCD", data.perfil.pcd);
  builder.addBlock("Necessidade educacional especial", data.perfil.necessidadeEspecial);
  builder.addBlock("Participou de edições anteriores", data.perfil.participouAntes);
  builder.addBlock("Rede de ensino", data.perfil.redeEnsino);
  builder.addBlock("Como ficou sabendo do projeto", data.perfil.comoFicouSabendo, 10);

  const resultadosWs = XLSX.utils.aoa_to_sheet(builder.rows);
  resultadosWs["!cols"] = [{ wch: 34 }, { wch: 12 }, { wch: 10 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, resultadosWs, "Resultados");

  const charts: ChartSpec[] = [
    { type: "pie", title: "Região", sheetName: "Resultados", ...regiaoBlock },
    { type: "pie", title: "Estado (UF)", sheetName: "Resultados", ...estadoBlock },
    { type: "pie", title: "Juiz de Fora vs. Fora de JF", sheetName: "Resultados", ...jfBlock },
    { type: "pie", title: "Minas Gerais vs. Fora de MG", sheetName: "Resultados", ...mgBlock },
    { type: "pie", title: "Zona de Juiz de Fora", sheetName: "Resultados", ...zonaBlock },
  ];

  const styles: StyleSpec[] = [
    { sheetName: "Dados", boldRows: [1], freezeHeaderRow: true },
    { sheetName: "Análise", boldRows: [1] },
    { sheetName: "Resultados", boldRows: builder.headerRows },
  ];

  const workbookBytes = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const blob = await postProcessWorkbook(workbookBytes, charts, styles);
  downloadBlob(blob, filename);
}
