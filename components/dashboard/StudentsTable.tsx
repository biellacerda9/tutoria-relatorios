import { EnrichedRow } from "@/lib/analysis/types";

export function StudentsTable({ rows }: { rows: EnrichedRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper-raised shadow-sm">
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-ink text-paper-raised">
            <tr>
              {["Nome", "CEP", "Cidade", "UF", "Bairro", "Região", "Zona JF"].map((h) => (
                <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i % 2 === 1 ? "bg-paper" : "bg-paper-raised"}>
                <td className="max-w-[220px] truncate px-3 py-2 whitespace-nowrap">
                  {r.nomeCompleto || "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{r.cep || "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.cidadeViaCep || "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.ufViaCep || "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.bairroViaCep || "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.regiao || "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.zonaJf || "—"}
                  {r.zonaOrigem === "similaridade" && (
                    <span className="ml-1 text-muted" title="Zona aplicada por similaridade de nome">
                      ~
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-3 py-2 text-xs text-muted">
        {rows.length} inscritos no total.
      </p>
    </div>
  );
}
