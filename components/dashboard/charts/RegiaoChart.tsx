"use client";

import { CountEntry } from "@/lib/analysis/types";
import { DonutChart } from "./DonutChart";

export function RegiaoChart({ data }: { data: CountEntry[] }) {
  return <DonutChart title="Inscritos por Região" data={data} colorOffset={0} />;
}
