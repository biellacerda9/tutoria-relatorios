"use client";

import { CountEntry } from "@/lib/analysis/types";
import { RankedList } from "./RankedList";

export function DificuldadesChart({ data }: { data: CountEntry[] }) {
  return (
    <RankedList
      title="Matérias com mais dificuldade"
      data={data}
      hideZero
      colorIndex={3}
      maxItems={15}
    />
  );
}
