const FEATURES = [
  {
    icon: "◐",
    title: "Geografia",
    body: "Região, estado e zona de Juiz de Fora, calculados a partir do CEP.",
  },
  {
    icon: "▤",
    title: "Disponibilidade",
    body: "Cruzamento de dia da semana e período com mais disponibilidade dos inscritos.",
  },
  {
    icon: "◔",
    title: "Perfil",
    body: "PCD, necessidade especial, rede de ensino e principais dificuldades.",
  },
  {
    icon: "✓",
    title: "Validação de CEP",
    body: "CEPs inválidos e bairros sem zona reconhecida, prontos para revisar.",
  },
];

export function FeatureHighlights() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="rounded-xl border border-line bg-paper-raised p-4 text-center shadow-sm"
        >
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-lg text-accent-ink">
            {f.icon}
          </span>
          <h3 className="mt-2 text-xs font-semibold text-ink">{f.title}</h3>
          <p className="mt-1 text-[11px] leading-snug text-muted">{f.body}</p>
        </div>
      ))}
    </div>
  );
}
