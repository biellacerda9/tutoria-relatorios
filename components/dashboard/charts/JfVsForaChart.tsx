"use client";

import { CountEntry } from "@/lib/analysis/types";
import { DonutChart } from "./DonutChart";

export function JfVsForaChart({ data }: { data: CountEntry[] }) {
  return <DonutChart title="Juiz de Fora vs. Fora de JF" data={data} colorOffset={0} />;
}
