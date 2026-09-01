"use client";

import { ReportData } from "@/lib/analysis/types";
import { RankedList } from "./RankedList";

export function PerfilChart({ perfil }: { perfil: ReportData["perfil"] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <RankedList title="Pessoa com deficiência (PCD)" data={perfil.pcd} colorIndex={4} />
      <RankedList
        title="Necessidade educacional especial"
        data={perfil.necessidadeEspecial}
        colorIndex={4}
      />
      <RankedList
        title="Participou de edições anteriores"
        data={perfil.participouAntes}
        colorIndex={5}
      />
      <RankedList title="Rede de ensino" data={perfil.redeEnsino} colorIndex={6} />
      <RankedList
        title="Como ficou sabendo do projeto"
        data={perfil.comoFicouSabendo}
        colorIndex={7}
        maxItems={10}
      />
    </div>
  );
}
