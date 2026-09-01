"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  label?: string;
  compact?: boolean;
}

const MAX_SIZE_BYTES = 25 * 1024 * 1024;

export function UploadZone({ onFileSelected, disabled, label, compact }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSend = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const isXlsx =
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (!isXlsx) {
        setError("Envie um arquivo .xlsx (exportado das respostas do Google Forms).");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("Arquivo muito grande (limite de 25MB).");
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div className="w-full max-w-xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          validateAndSend(e.dataTransfer.files[0]);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center shadow-sm transition-colors cursor-pointer ${
          compact ? "px-6 py-10" : "px-8 py-14"
        } ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line hover:border-accent bg-paper-raised"
        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      >
        {label && (
          <span className="text-xs font-semibold tracking-wide text-accent-ink uppercase">
            {label}
          </span>
        )}
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-7 w-7 text-accent-ink"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 8.25 12 3.75m0 0L7.5 8.25M12 3.75v12.75"
            />
          </svg>
        </span>
        <p className="font-serif text-base text-ink">
          Arraste o .xlsx de respostas do formulário aqui
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) inputRef.current?.click();
          }}
          className="rounded-lg border border-line bg-paper px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-accent-soft"
        >
          Selecionar arquivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => validateAndSend(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
