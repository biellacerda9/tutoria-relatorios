"use client";

import { UploadZone } from "@/components/upload/UploadZone";

interface CompareUploadProps {
  onFileA: (file: File) => void;
  onFileB: (file: File) => void;
  disabled?: boolean;
  fileNameA?: string;
  fileNameB?: string;
}

export function CompareUpload({
  onFileA,
  onFileB,
  disabled,
  fileNameA,
  fileNameB,
}: CompareUploadProps) {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="flex flex-col items-center gap-2">
        <UploadZone label="Período A (mais antigo)" onFileSelected={onFileA} disabled={disabled} compact />
        {fileNameA && <p className="text-xs text-muted">{fileNameA}</p>}
      </div>
      <div className="flex flex-col items-center gap-2">
        <UploadZone label="Período B (mais recente)" onFileSelected={onFileB} disabled={disabled} compact />
        {fileNameB && <p className="text-xs text-muted">{fileNameB}</p>}
      </div>
    </div>
  );
}
