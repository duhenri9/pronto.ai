import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Transparência — Pronto.IA',
  description: 'Cada real importa. Veja como usamos os recursos para manter o Pronto.IA no ar.',
};

const COSTS = [
  { component: 'Infraestrutura (workers, banco, cache, CDN)', cost: 'R$ 3.000 – 8.000' },
  { component: 'Inteligência Artificial (LLM)', cost: 'R$ 15.000 – 25.000' },
  { component: 'Equipe (7 pessoas)', cost: 'R$ 35.000' },
  { component: 'Outros (domínio, email, compliance)', cost: 'R$ 1.500' },
];

const MILESTONES = [
  { color: 'green', goal: 'Meta 1 — R$ 5.000/mês', description: 'Manter o MVP no ar, atendendo 0-300 alunos.' },
  { color: 'yellow', goal: 'Meta 2 — R$ 20.000/mês', description: 'Expandir trilhas, alcançar 1.000 alunos.' },
  { color: 'orange', goal: 'Meta 3 — R$ 55.000/mês', description: 'Escala para 100.000 alunos, equipe dedicada.' },
  { color: 'red', goal: 'Meta 4 — R$ 130.000+/mês', description: 'Milhões de brasileiros capacitados para a era da IA.' },
];

const META_COLORS: Record<string, string> = {
  green: 'bg-[#00D97E]/10 border-[#00D97E]/30',
  yellow: 'bg-yellow-500/10 border-yellow-500/30',
  orange: 'bg-orange-500/10 border-orange-500/30',
  red: 'bg-red-500/10 border-red-500/30',
};

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0E1A] text-white/90">
      <Nav />
      <main className="flex-1 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">Transparência</h1>
        <p className="text-lg text-[#9DA1B4] mb-12">
          Cada real importa. Veja como usamos os recursos para manter o Pronto.IA no ar.
        </p>

        {/* Total Arrecadado */}
        <div className="bg-[#1A2150] rounded-xl p-6 mb-8 text-center">
          <p className="text-sm text-[#757994] mb-2">Total arrecadado</p>
          <p className="text-4xl font-bold text-[#00D97E]">R$ 2.470</p>
          <p className="text-sm text-[#9DA1B4] mt-2">
            23 pessoas já apoiaram. Junte-se a elas.
          </p>
          <div className="mt-4 mx-auto h-2 max-w-xs rounded-full bg-[#252B54] overflow-hidden">
            <div className="h-full rounded-full bg-[#00D97E]" style={{ width: '49.4%' }} />
          </div>
          <p className="mt-2 text-xs text-[#757994]">
            49,4% da meta 1 (R$ 5.000/mês)
          </p>
        </div>

        {/* Tabela de Custos */}
        <h2 className="text-2xl font-semibold mt-12 mb-4">Nossos custos mensais</h2>
        <div className="bg-[#1A2150] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#252B54]">
                <th className="text-left p-4 text-[#757994] font-medium">Componente</th>
                <th className="text-right p-4 text-[#757994] font-medium">Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B54]">
              {COSTS.map((row) => (
                <tr key={row.component}>
                  <td className="p-4">{row.component}</td>
                  <td className="p-4 text-right">{row.cost}</td>
                </tr>
              ))}
              <tr className="bg-[#00D97E]/5">
                <td className="p-4 font-semibold">Total</td>
                <td className="p-4 text-right font-semibold text-[#00D97E]">R$ 54.500 – 69.500</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Metas */}
        <h2 className="text-2xl font-semibold mt-12 mb-4">Metas</h2>
        <div className="space-y-4">
          {MILESTONES.map((m) => (
            <div key={m.goal} className={`p-4 rounded-lg border ${META_COLORS[m.color]}`}>
              <p className="font-semibold text-white/90">{m.goal}</p>
              <p className="text-sm text-[#9DA1B4] mt-1">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
