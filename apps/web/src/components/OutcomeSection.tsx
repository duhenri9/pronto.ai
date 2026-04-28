export function OutcomeSection() {
  return (
    <section id="para-empresas" className="scroll-mt-20 border-t border-border-subtle bg-night-800 py-20 text-neutral-50 md:py-24">
      <div className="mx-auto max-w-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-micro font-medium uppercase tracking-micro text-green-400">
            outcome, não diploma
          </span>
          <h2 className="mt-3 text-display-m tracking-display">
            Certificado de resultado.
          </h2>
          <p className="mt-4 font-serif text-body-l italic text-night-200">
            A Ane certifica carga horária. A Maria certifica renda. Se não mudou seu faturamento, não merece selo.
          </p>
        </div>

        {/* Metrics from Ane analysis */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-md bg-night-700 p-6">
            <div className="text-display-m font-medium text-green-400">160k</div>
            <div className="mt-1 text-body-s text-night-200">
              provam que WhatsApp + persona funciona em escala (Ane/Nova Escola)
            </div>
          </div>
          <div className="rounded-md bg-night-700 p-6">
            <div className="text-display-m font-medium text-green-400">21%</div>
            <div className="mt-1 text-body-s text-night-200">
              taxa de conclusão da Ane — esse é o teto a bater
            </div>
          </div>
          <div className="rounded-md bg-night-700 p-6">
            <div className="text-display-m font-medium text-green-400">35-40%</div>
            <div className="mt-1 text-body-s text-night-200">
              nossa meta de conclusão nas primeiras trilhas
            </div>
          </div>
          <div className="rounded-md bg-green-500 p-6">
            <div className="text-display-m font-medium text-green-900">30%</div>
            <div className="mt-1 text-body-s text-green-800">
              aumento médio de eficiência operacional em empresas que implementam IA
            </div>
            <div className="mt-2 text-micro text-green-700">
              Sebrae + FGV IBRE + Google, 2026
            </div>
          </div>
        </div>

        {/* Comparison callout */}
        <div className="mt-12 rounded-lg border border-night-700 p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-mono text-micro font-medium uppercase tracking-micro text-night-200">
                Ane (Nova Escola)
              </h3>
              <p className="mt-2 text-body-s text-night-200">
                Entrega plano de aula. Métrica: certificado emitido. Curso de 2h gratuito. Filantrópico.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-micro font-medium uppercase tracking-micro text-green-400">
                Maria (Pronto.IA)
              </h3>
              <p className="mt-2 text-body-s text-night-100">
                Entrega cliente novo, post pronto, agendamento automatizado. Métrica: reais a mais no fim do mês. Ane é ferramenta de produtividade; Maria é máquina de receita.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
