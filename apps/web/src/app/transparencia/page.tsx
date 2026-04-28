import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Transparência — Pronto.IA',
  description: 'Cada real importa. Veja como seu apoio mantém o Pronto.IA no ar.',
};

const COSTS = [
  { component: 'Infraestrutura', detail: 'Workers, banco, cache, CDN', cost: 'R$ 3.000 – 8.000' },
  { component: 'Inteligência Artificial', detail: 'LLM para 100k usuários', cost: 'R$ 15.000 – 25.000' },
  { component: 'Equipe', detail: '7 pessoas', cost: 'R$ 35.000' },
  { component: 'Outros', detail: 'Domínio, email, compliance', cost: 'R$ 1.500' },
];

const MILESTONES = [
  { color: 'bg-green-400', amount: 'R$ 5.000/mês', description: 'Manter MVP no ar, 0–300 alunos' },
  { color: 'bg-gold-400', amount: 'R$ 20.000/mês', description: 'Expandir trilhas, 1.000 alunos' },
  { color: 'bg-orange-400', amount: 'R$ 55.000/mês', description: 'Escala 100k alunos, equipe dedicada' },
  { color: 'bg-red-400', amount: 'R$ 130.000+/mês', description: 'Milhões de brasileiros capacitados' },
];

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Nav />
      <div className="mx-auto max-w-container px-6 py-20 pt-28 md:py-24">
        {/* Header */}
        <span className="font-mono text-micro font-medium uppercase tracking-micro text-green-600">
          cada real importa
        </span>
        <h1 className="mt-3 text-display-l tracking-display text-neutral-900">
          Transparência
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-body-l italic text-text-secondary">
          O Pronto.IA é um projeto independente. Cada doação vai direto pra manter a plataforma no ar e alcançar mais pessoas.
        </p>

        {/* Total arrecadado */}
        <div className="mt-12 rounded-lg border border-border-subtle bg-surface p-8 text-center">
          <p className="font-mono text-micro uppercase tracking-micro text-text-tertiary">
            Total arrecadado
          </p>
          <p className="mt-2 text-display-m text-green-500">R$ 2.470</p>
          <p className="mt-1 text-body-s text-text-secondary">
            23 pessoas já apoiaram. Junte-se a elas.
          </p>
          <div className="mt-4 mx-auto h-2 max-w-xs rounded-full bg-sunken overflow-hidden">
            <div className="h-full rounded-full bg-green-400" style={{ width: '49.4%' }} />
          </div>
          <p className="mt-2 font-mono text-micro text-text-tertiary">
            49,4% da meta 1 (R$ 5.000/mês)
          </p>
        </div>

        {/* Custos mensais */}
        <div className="mt-12">
          <h2 className="text-heading-l text-neutral-900">Nossos custos mensais</h2>
          <p className="mt-2 text-body-s text-text-secondary">
            Projeção para operar com 100 mil pessoas /alun@s.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-3 text-left font-mono text-micro uppercase tracking-micro text-text-tertiary">Componente</th>
                  <th className="py-3 text-left font-mono text-micro uppercase tracking-micro text-text-tertiary">Detalhe</th>
                  <th className="py-3 text-right font-mono text-micro uppercase tracking-micro text-text-tertiary">Custo Mensal</th>
                </tr>
              </thead>
              <tbody>
                {COSTS.map((row) => (
                  <tr key={row.component} className="border-b border-border-subtle">
                    <td className="py-3 text-body-s font-medium text-neutral-900">{row.component}</td>
                    <td className="py-3 text-body-s text-text-secondary">{row.detail}</td>
                    <td className="py-3 text-right text-body-s font-medium text-neutral-900 tabular-nums">{row.cost}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-neutral-900">
                  <td className="py-3 text-heading-s font-medium text-neutral-900" colSpan={2}>Total (100k usuários)</td>
                  <td className="py-3 text-right text-heading-s font-medium text-green-600 tabular-nums">R$ 54.500 – 69.500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Metas */}
        <div className="mt-12">
          <h2 className="text-heading-l text-neutral-900">Metas</h2>
          <div className="mt-6 space-y-4">
            {MILESTONES.map((m) => (
              <div key={m.amount} className="flex items-start gap-4 rounded-lg border border-border-subtle bg-surface p-5">
                <span className={`mt-1 inline-block h-3 w-3 rounded-full ${m.color} flex-shrink-0`} />
                <div>
                  <p className="text-heading-s font-medium text-neutral-900">{m.amount}</p>
                  <p className="mt-0.5 text-body-s text-text-secondary">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
