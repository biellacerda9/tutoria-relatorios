"use client";

import { useCallback, useMemo, useState } from "react";
import { UploadZone } from "@/components/upload/UploadZone";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { StudentsTable } from "@/components/dashboard/StudentsTable";
import { ValidationPanel } from "@/components/dashboard/ValidationPanel";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { Tabs } from "@/components/layout/Tabs";
import { AppHeader } from "@/components/layout/AppHeader";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeatureHighlights } from "@/components/home/FeatureHighlights";
import { parseFormResponses, ParseError } from "@/lib/xlsx/parseFormResponses";
import { enrichRows, aggregate } from "@/lib/analysis/aggregate";
import { EnrichedRow } from "@/lib/analysis/types";

type Status =
  | { kind: "idle" }
  | { kind: "parsing" }
  | { kind: "enriching"; done: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "ready"; rows: EnrichedRow[]; fileName: string };

type TabId = "geral" | "alunos" | "validacao";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [tab, setTab] = useState<TabId>("geral");

  const handleFile = useCallback(async (file: File) => {
    setStatus({ kind: "parsing" });
    setTab("geral");
    try {
      const rawRows = await parseFormResponses(file);
      setStatus({ kind: "enriching", done: 0, total: rawRows.length });
      const enriched = await enrichRows(rawRows, (done, total) =>
        setStatus({ kind: "enriching", done, total })
      );
      setStatus({ kind: "ready", rows: enriched, fileName: file.name });
    } catch (err) {
      const message =
        err instanceof ParseError
          ? err.message
          : "Não foi possível processar o arquivo. Verifique se é um .xlsx válido.";
      setStatus({ kind: "error", message });
    }
  }, []);

  const data = useMemo(() => {
    if (status.kind !== "ready") return null;
    return aggregate(status.rows);
  }, [status]);

  const busy = status.kind === "parsing" || status.kind === "enriching";
  const progress =
    status.kind === "enriching" && status.total > 0 ? status.done / status.total : 0;

  const tabs = [
    { id: "geral", label: "Visão geral" },
    { id: "alunos", label: "Alunos e endereços" },
    {
      id: "validacao",
      label: "Validação de CEP",
      badge: data ? data.rows.filter((r) => !r.cepValido).length : 0,
    },
  ];

  const ensureGeralTabForCapture = useCallback(async () => {
    if (tab !== "geral") {
      setTab("geral");
      await wait(900);
    } else {
      await wait(50);
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader description="Envie o .xlsx de respostas do Google Forms para gerar o relatório automaticamente. Tudo roda no seu navegador — nenhum dado pessoal é enviado a servidores, apenas o CEP é consultado na API pública ViaCEP." />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {status.kind !== "ready" && (
          <div className="flex flex-col items-center gap-10 py-10">
            <div className="flex flex-col items-center gap-5">
              <UploadZone onFileSelected={handleFile} disabled={busy} />

              {status.kind === "parsing" && (
                <p className="text-sm text-muted">Lendo planilha...</p>
              )}

              {status.kind === "enriching" && (
                <div className="w-full max-w-xl">
                  <p className="mb-1.5 text-sm text-muted">
                    Consultando CEPs... {status.done}/{status.total}
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {status.kind === "error" && (
                <p className="max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                  {status.message}
                </p>
              )}
            </div>

            {!busy && (
              <>
                <div className="h-px w-full max-w-3xl bg-line" />
                <HowItWorks />
                <div className="h-px w-full max-w-3xl bg-line" />
                <FeatureHighlights />
              </>
            )}
          </div>
        )}

        {status.kind === "ready" && data && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <button
                  onClick={() => setStatus({ kind: "idle" })}
                  className="text-sm font-medium text-accent-ink hover:underline"
                >
                  ← Enviar outro arquivo
                </button>
                <p className="mt-1 text-xs text-muted">
                  Relatório de <span className="font-medium text-ink">{status.fileName}</span>
                </p>
              </div>
              <ExportButtons
                data={data}
                reportElementId="report-root"
                baseFilename="relatorio-tutoria"
                pdfTitle={`Relatório de Inscrições — ${status.fileName}`}
                onBeforeCapture={ensureGeralTabForCapture}
              />
            </div>

            <Tabs tabs={tabs} active={tab} onChange={(id) => setTab(id as TabId)} />

            {tab === "geral" && <Dashboard data={data} reportElementId="report-root" />}
            {tab === "alunos" && <StudentsTable rows={data.rows} />}
            {tab === "validacao" && <ValidationPanel rows={data.rows} />}
          </div>
        )}
      </main>
    </div>
  );
}
