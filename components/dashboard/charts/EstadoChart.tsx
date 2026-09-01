"use client";

import { CountEntry } from "@/lib/analysis/types";
import { RankedList } from "./RankedList";

export function EstadoChart({ data }: { data: CountEntry[] }) {
  return (
    <RankedList title="Inscritos por Estado (UF)" data={data} hideZero colorIndex={0} />
  );
}
