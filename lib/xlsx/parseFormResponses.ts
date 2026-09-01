import * as XLSX from "xlsx";
import { RawRow } from "@/lib/analysis/types";
import {
  DAY_ORDER,
  extractDay,
  findAllColumnIndexes,
  findColumnIndex,
  normalizeHeader,
} from "@/lib/analysis/columns";

export class ParseError extends Error {}

function cellToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  const s = String(value).trim();
  return s.length ? s : null;
}

function splitMultiSelect(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function parseFormResponses(file: File): Promise<RawRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  const sheetName =
    workbook.SheetNames.find((n) => normalizeHeader(n).includes("resposta")) ??
    workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new ParseError("Não foi possível encontrar a aba de respostas na planilha.");

  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, dateNF: "yyyy-mm-dd" });
  if (grid.length < 2) throw new ParseError("A planilha não tem linhas de resposta.");

  const headers = (grid[0] as unknown[]).map((h) => (h == null ? "" : String(h)));

  const idxTimestamp = findColumnIndex(headers, (n) => n.startsWith("carimbo"));
  const idxEmail = findColumnIndex(headers, (n) => n.includes("e-mail") || n.includes("email"));
  const idxNome = findColumnIndex(headers, (n) => n.startsWith("nome completo"));
  const idxCidade = findColumnIndex(headers, (n) => n.startsWith("cidade"));
  const idxUf = findColumnIndex(headers, (n) => n.includes("uf") && n.includes("estado"));
  const idxCep = findColumnIndex(headers, (n) => n.startsWith("cep"));
  const idxPcd = findColumnIndex(headers, (n) => n.includes("pessoa com deficiencia"));
  const idxNecessidade = findColumnIndex(headers, (n) =>
    n.includes("necessidade educacional especial")
  );
  const idxParticipou = findColumnIndex(headers, (n) =>
    n.includes("participou deste curso")
  );
  const idxRede = findColumnIndex(headers, (n) =>
    n.includes("rede de ensino") && n.includes("cursou")
  );
  const idxPrimeiraVez = findColumnIndex(headers, (n) =>
    n.startsWith("primeira vez realizando a prova")
  );
  const idxMaterias = findColumnIndex(headers, (n) =>
    n.startsWith("materias que tem mais dificuldade")
  );
  const idxComoSoube = findColumnIndex(headers, (n) => n.startsWith("como ficou sabendo"));

  const idxAulas = findAllColumnIndexes(headers, (n) =>
    n.includes("disponibilidade para assistir as aulas")
  );
  const idxDuvidas = findAllColumnIndexes(headers, (n) =>
    n.includes("esclarecimento de duvidas")
  );

  if (idxCep === -1) {
    throw new ParseError(
      "Não encontrei a coluna de CEP nesta planilha. Verifique se é um export de respostas do Google Forms deste projeto."
    );
  }

  const rows: RawRow[] = [];
  for (let r = 1; r < grid.length; r++) {
    const row = grid[r] as unknown[];
    if (!row || row.every((c) => c === null || c === undefined || c === "")) continue;

    const disponibilidadeAulas: Record<string, string[]> = {};
    for (const idx of idxAulas) {
      const day = extractDay(headers[idx]) ?? headers[idx];
      disponibilidadeAulas[day] = splitMultiSelect(cellToString(row[idx]));
    }
    const disponibilidadeDuvidas: Record<string, string[]> = {};
    for (const idx of idxDuvidas) {
      const day = extractDay(headers[idx]) ?? headers[idx];
      disponibilidadeDuvidas[day] = splitMultiSelect(cellToString(row[idx]));
    }

    rows.push({
      id: `row-${r}`,
      timestamp: idxTimestamp >= 0 ? cellToString(row[idxTimestamp]) : null,
      email: idxEmail >= 0 ? cellToString(row[idxEmail]) : null,
      nomeCompleto: idxNome >= 0 ? cellToString(row[idxNome]) : null,
      cidade: idxCidade >= 0 ? cellToString(row[idxCidade]) : null,
      uf: idxUf >= 0 ? cellToString(row[idxUf]) : null,
      cep: idxCep >= 0 ? cellToString(row[idxCep]) : null,
      pcd: idxPcd >= 0 ? cellToString(row[idxPcd]) : null,
      necessidadeEspecial: idxNecessidade >= 0 ? cellToString(row[idxNecessidade]) : null,
      participouAntes: idxParticipou >= 0 ? cellToString(row[idxParticipou]) : null,
      redeEnsino: idxRede >= 0 ? cellToString(row[idxRede]) : null,
      primeiraVezProva: idxPrimeiraVez >= 0 ? cellToString(row[idxPrimeiraVez]) : null,
      materiasDificuldade: idxMaterias >= 0 ? splitMultiSelect(cellToString(row[idxMaterias])) : [],
      disponibilidadeAulas,
      disponibilidadeDuvidas,
      comoFicouSabendo: idxComoSoube >= 0 ? cellToString(row[idxComoSoube]) : null,
    });
  }

  return rows;
}

export { DAY_ORDER };
