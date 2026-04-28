import type { Metadata } from 'next';
import Link from 'next/link';
import { MariaAvatar } from '@/components/MariaAvatar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sobre — Pronto.IA',
  description: 'Conheça o Pronto.IA: capacitar pessoas comuns para a era da IA, começando pelo MEI brasileiro.',
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <div className="mx-auto max-w-container px-6 py-20 md:py-24">
        {/* Header */}
        <span className="font-mono text-micro font-medium uppercase tracking-micro text-green-600">
          quem faz o pronto.ia
        </span>
        <h1 className="mt-3 text-display-l tracking-display text-neutral-900">
          Sobre o Pronto.IA
        </h1>

        {/* Missão */}
        <div className="mt-8 max-w-2xl">
          <h2 className="text-heading-m text-neutral-900">Missão</h2>
          <p className="mt-3 text-body-l font-serif italic text-text-secondary">
            Capacitar pessoas comuns para a era da IA, começando pelo MEI brasileiro.
          </p>
          <p className="mt-4 text-body-s text-text-secondary leading-relaxed">
            O Pronto.IA nasceu de uma pergunta simples: por que treinamento em inteligência artificial
            é privilégio de quem já tem acesso? O MEI que faz bico, a manicure que quer crescer,
            o encanador que não sabe cobrar o valor certo — essas pessoas precisam de IA tanto quanto
            qualquer startup. A diferença é que elas precisam em português, no WhatsApp, em 5 minutos
            por dia.
          </p>
        </div>

        {/* Como nasceu */}
        <div className="mt-12 max-w-2xl">
          <h2 className="text-heading-m text-neutral-900">Como nasceu</h2>
          <p className="mt-3 text-body-s text-text-secondary leading-relaxed">
            O projeto começou em 2026, quando percebemos que nenhuma plataforma de educação em IA
            falava a língua do brasileiro que trabalha com as mãos. Cursos em inglês, plataformas
            caras, aulas de 2 horas — tudo errado pra quem tem 5 minutos no ônibus e precisa de
            resultado prático.
          </p>
          <p className="mt-3 text-body-s text-text-secondary leading-relaxed">
            A Maria é a resposta: uma mentora que fala português, que entende o CNPJ recente e o mês
            que fecha apertado, e que entrega resultado — não diploma.
          </p>
        </div>

        {/* Quem está por trás */}
        <div className="mt-12 max-w-2xl">
          <h2 className="text-heading-m text-neutral-900">Quem está por trás</h2>
          <div className="mt-4 flex items-center gap-4">
            <MariaAvatar size={64} />
            <div>
              <p className="text-heading-s font-medium text-neutral-900">Equipe enxuta</p>
              <p className="mt-1 text-body-s text-text-secondary">
                3 pessoas construindo algo que acreditam: que IA pode ser pra todo mundo.
              </p>
            </div>
          </div>
        </div>

        {/* Personas */}
        <div className="mt-12 max-w-2xl">
          <h2 className="text-heading-m text-neutral-900">As pessoas mentoras</h2>
          <p className="mt-3 text-body-s text-text-secondary leading-relaxed">
            Cada vertical tem uma pessoa especialista que entende o ramo por dentro:
          </p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
              <span className="text-body-s"><strong className="text-neutral-900">Bia</strong> — Salão de Beleza & Estética</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-gold-400" />
              <span className="text-body-s"><strong className="text-neutral-900">Léo</strong> — Food Service Local</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-night-300" />
              <span className="text-body-s"><strong className="text-neutral-900">Tião</strong> — Prestadores de Serviço</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-body-s"><strong className="text-neutral-900">Zé</strong> — TI & Tecnologia</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-3 text-body-m font-medium text-green-900 hover:bg-green-400 transition-colors"
          >
            conhecer a plataforma
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-2 rounded-md border border-border-subtle px-5 py-3 text-body-m font-medium text-neutral-900 hover:bg-sunken transition-colors"
          >
            ver transparência
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
