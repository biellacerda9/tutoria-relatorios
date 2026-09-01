"use client";

import { CountEntry } from "@/lib/analysis/types";
import { DonutChart } from "./DonutChart";

export function MgVsForaChart({ data }: { data: CountEntry[] }) {
  return <DonutChart title="Minas Gerais vs. Fora de MG" data={data} colorOffset={1} />;
}
