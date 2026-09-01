"use client";

import { CountEntry } from "@/lib/analysis/types";
import { DonutChart } from "./DonutChart";

export function ZonaJFChart({ data }: { data: CountEntry[] }) {
  return <DonutChart title="Inscritos de Juiz de Fora por Zona" data={data} colorOffset={2} />;
}
