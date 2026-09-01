"use client";

import { useCallback, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CompareUpload } from "@/components/compare/CompareUpload";
import { CompareSummaryCards } from "@/components/compare/CompareSummaryCards";
import { DeltaBarChart } from "@/components/compare/DeltaBarChart";
import { parseFormResponses, ParseError } from "@/lib/xlsx/parseFormResponses";
import { enrichRows, aggregate } from "@/lib/analysis/aggregate";
import { compareReports } from "@/lib/analysis/compare";
import { ReportData } from "@/lib/analysis/types";

type FileState =
  | { kind: "idle" }
  | { kind: "loading"; done: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: ReportData; fileName: string };

function useFileSlot() {
  const [state, setState] = useState<FileState>({ kind: "idle" });

  const load = useCallback(async (file: File) => {
    setState({ kind: "loading", done: 0, total: 0 });
    try {
      const rawRows = await parseFormResponses(file);
      setState({ kind: "loading", done: 0, total: rawRows.length });
      const enriched = await enrichRows(rawRows, (done, total) =>
        setState({ kind: "loading", done, total })
      );
      setState({ kind: "ready", data: aggregate(enriched), fileName: file.name });
    } catch (err) {
      const message =
        err instanceof ParseError
          ? err.message
          : "Não foi possível processar o arquivo. Verifique se é um .xlsx válido.";
      setState({ kind: "error", message });
    }
  }, []);

  return { state, load };
}

export default function ComparePage() {
  const slotA = useFileSlot();
  const slotB = useFileSlot();

  const comparison = useMemo(() => {
    if (slotA.state.kind !== "ready" || slotB.state.kind !== "ready") return null;
    return compareReports(slotA.state.data, slotB.state.data);
  }, [slotA.state, slotB.state]);

  const busy = slotA.state.kind === "loading" || slotB.state.kind === "loading";

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader description="Compare as inscrições de dois períodos diferentes — por exemplo, uma edição anterior do curso contra a atual. Envie os dois .xlsx de respostas do Google Forms." />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {!comparison && (
          <div className="flex flex-col items-center gap-6 py-10">
            <CompareUpload
              onFileA={slotA.load}
              onFileB={slotB.load}
              disabled={busy}
              fileNameA={slotA.state.kind === "ready" ? slotA.state.fileName : undefined}
              fileNameB={slotB.state.kind === "ready" ? slotB.state.fileName : undefined}
            />
            <div className="flex w-full max-w-4xl justify-around text-sm text-muted">
              <SlotStatus state={slotA.state} />
              <SlotStatus state={slotB.state} />
            </div>
          </div>
        )}

        {comparison && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-accent-ink hover:underline"
                >
                  ← Comparar outros arquivos
                </button>
                <p className="mt-1 text-xs text-muted">
                  <span className="font-medium text-ink">
                    {slotA.state.kind === "ready" && slotA.state.fileName}
                  </span>{" "}
                  vs.{" "}
                  <span className="font-medium text-ink">
                    {slotB.state.kind === "ready" && slotB.state.fileName}
                  </span>
                </p>
              </div>
            </div>

            <CompareSummaryCards
              entries={[comparison.totalInscritos, comparison.totalCepValido]}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DeltaBarChart
                title="Por Região"
                data={comparison.porRegiao}
                labelA="Período A"
                labelB="Período B"
              />
              <DeltaBarChart
                title="Juiz de Fora vs. Fora de JF"
                data={comparison.jfVsForaDeJf}
                labelA="Período A"
                labelB="Período B"
              />
            </div>

            <DeltaBarChart
              title="Por Estado (UF)"
              data={comparison.porEstado}
              labelA="Período A"
              labelB="Período B"
            />

            <DeltaBarChart
              title="Por Zona de Juiz de Fora"
              data={comparison.porZonaJf}
              labelA="Período A"
              labelB="Período B"
            />

            <DeltaBarChart
              title="Matérias com mais dificuldade"
              data={comparison.porMateriaDificuldade}
              labelA="Período A"
              labelB="Período B"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DeltaBarChart
                title="Pessoa com deficiência (PCD)"
                data={comparison.perfil.pcd}
                labelA="Período A"
                labelB="Período B"
              />
              <DeltaBarChart
                title="Rede de ensino"
                data={comparison.perfil.redeEnsino}
                labelA="Período A"
                labelB="Período B"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SlotStatus({ state }: { state: FileState }) {
  if (state.kind === "idle") return <span />;
  if (state.kind === "loading")
    return (
      <span>
        Processando... {state.done}/{state.total || "?"}
      </span>
    );
  if (state.kind === "error") return <span className="text-red-600">{state.message}</span>;
  return <span className="text-accent-ink">{state.fileName} pronto</span>;
}
