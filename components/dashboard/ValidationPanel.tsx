import { EnrichedRow } from "@/lib/analysis/types";

export function ValidationPanel({ rows }: { rows: EnrichedRow[] }) {
  const invalidCep = rows.filter((r) => !r.cepValido);

  return (
    <div className="rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <h3 className="font-serif text-lg text-ink">CEPs inválidos ou não localizados</h3>
      <p className="mt-1 text-sm text-muted">
        {invalidCep.length === 0
          ? "Nenhum CEP precisou de revisão."
          : `${invalidCep.length} inscrito(s) com CEP em branco, mal formatado ou não encontrado no ViaCEP.`}
      </p>
      {invalidCep.length > 0 && (
        <div className="mt-4 max-h-[560px] overflow-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-paper">
              <tr>
                <th className="px-3 py-2 font-semibold text-muted">Nome</th>
                <th className="px-3 py-2 font-semibold text-muted">CEP informado</th>
                <th className="px-3 py-2 font-semibold text-muted">Cidade informada</th>
              </tr>
            </thead>
            <tbody>
              {invalidCep.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-3 py-2">{r.nomeCompleto || "—"}</td>
                  <td className="px-3 py-2">{r.cep || "(em branco)"}</td>
                  <td className="px-3 py-2">{r.cidade || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
