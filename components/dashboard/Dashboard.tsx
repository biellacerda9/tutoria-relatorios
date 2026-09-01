import { ReportData } from "@/lib/analysis/types";
import { SummaryCards } from "./SummaryCards";
import { SectionHeading } from "./SectionHeading";
import { RegiaoChart } from "./charts/RegiaoChart";
import { EstadoChart } from "./charts/EstadoChart";
import { ZonaJFChart } from "./charts/ZonaJFChart";
import { JfVsForaChart } from "./charts/JfVsForaChart";
import { MgVsForaChart } from "./charts/MgVsForaChart";
import { DisponibilidadeChart } from "./charts/DisponibilidadeChart";
import { DificuldadesChart } from "./charts/DificuldadesChart";
import { PerfilChart } from "./charts/PerfilChart";

interface DashboardProps {
  data: ReportData;
  reportElementId: string;
}

export function Dashboard({ data, reportElementId }: DashboardProps) {
  return (
    <div id={reportElementId} className="space-y-8 bg-[var(--chart-surface)]">
      <section data-pdf-block>
        <SectionHeading title="Visão geral" />
        <SummaryCards data={data} />
      </section>

      <section data-pdf-block>
        <SectionHeading title="Geografia" subtitle="apenas inscritos com CEP válido" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RegiaoChart data={data.porRegiao} />
          <JfVsForaChart data={data.jfVsForaDeJf} />
          <MgVsForaChart data={data.mgVsForaDeMg} />
          <ZonaJFChart data={data.porZonaJf} />
        </div>
      </section>

      <div data-pdf-block>
        <EstadoChart data={data.porEstado} />
      </div>

      <section data-pdf-block>
        <SectionHeading title="Disponibilidade" subtitle="para assistir às aulas" />
        <DisponibilidadeChart data={data.disponibilidadePorDia} />
      </section>

      <section data-pdf-block>
        <SectionHeading title="Perfil e dificuldades dos inscritos" />
        <DificuldadesChart data={data.porMateriaDificuldade} />
      </section>

      <div data-pdf-block>
        <PerfilChart perfil={data.perfil} />
      </div>
    </div>
  );
}
