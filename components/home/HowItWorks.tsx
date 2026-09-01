const STEPS = [
  {
    n: "1",
    title: "Envie o .xlsx",
    body: "Exporte as respostas do Google Forms e arraste o arquivo na área acima.",
  },
  {
    n: "2",
    title: "Processamos no navegador",
    body: "CEP, cidade, região e zona de Juiz de Fora são calculados na hora, sem servidor.",
  },
  {
    n: "3",
    title: "Baixe o relatório",
    body: "PDF pronto para apresentar ou .xlsx com os dados completos para analisar.",
  },
];

export function HowItWorks() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
      {STEPS.map((step) => (
        <div key={step.n} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <span className="font-serif text-3xl text-accent">{step.n}</span>
          <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
          <p className="text-xs text-muted">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
