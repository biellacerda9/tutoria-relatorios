"use client";

import { useState } from "react";
import { ReportData } from "@/lib/analysis/types";
import { exportXlsx } from "@/lib/xlsx/exportXlsx";
import { exportReportToPdf } from "@/lib/export/pdf";

interface ExportButtonsProps {
  data: ReportData;
  reportElementId: string;
  baseFilename: string;
  pdfTitle?: string;
  onBeforeCapture?: () => Promise<void>;
}

export function ExportButtons({
  data,
  reportElementId,
  baseFilename,
  pdfTitle,
  onBeforeCapture,
}: ExportButtonsProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingXlsx, setGeneratingXlsx] = useState(false);

  async function handlePdf() {
    setGeneratingPdf(true);
    try {
      await onBeforeCapture?.();
      const element = document.getElementById(reportElementId);
      if (!element) return;
      await exportReportToPdf(element, `${baseFilename}.pdf`, pdfTitle);
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleXlsx() {
    setGeneratingXlsx(true);
    try {
      await exportXlsx(data, `${baseFilename}.xlsx`);
    } finally {
      setGeneratingXlsx(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handlePdf}
        disabled={generatingPdf}
        className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper-raised shadow-sm transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {generatingPdf ? "Gerando PDF..." : "Baixar PDF"}
      </button>
      <button
        onClick={handleXlsx}
        disabled={generatingXlsx}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper-raised px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-paper disabled:opacity-60"
      >
        {generatingXlsx ? "Gerando .xlsx..." : "Baixar .xlsx"}
      </button>
    </div>
  );
}
