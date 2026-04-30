'use client';

import { useState } from 'react';
import { Scissors, UtensilsCrossed, Wrench, Laptop, Bell } from 'lucide-react';

type VerticalStatus = 'available' | 'in_development';

const VERTICALS = [
  {
    slug: 'salao',
    name: 'Salão de Beleza & Estética',
    persona: 'Bia',
    icon: Scissors,
    accent: 'green' as const,
    tagline: 'Sua agenda cheia, seu Instagram voando',
    description:
      'Agendamento, marketing no Instagram, precificação de serviços, fidelização de clientes com IA.',
    pain: 'Cliente cancela, agenda vazia, post não sai',
    status: 'available' as VerticalStatus,
  },
  {
    slug: 'food-service',
    name: 'Food Service Local',
    persona: 'Léo',
    icon: UtensilsCrossed,
    accent: 'gold' as const,
    tagline: 'Seu cardápio inteligente, seu delivery sem dono',
    description:
      'Cardápio com IA, delivery sem app, precificação dinâmica, WhatsApp como canal de pedido.',
    pain: 'Custo subiu, cliente some, delivery come margem',
    status: 'in_development' as VerticalStatus,
  },
  {
    slug: 'home-service',
    name: 'Prestadores de Serviço',
    persona: 'Tião',
    icon: Wrench,
    accent: 'night' as const,
    tagline: 'Mais serviço, preço justo, cliente que volta',
    description:
      'Orçamento automático, roteamento de visitas, formalização do MEI, captação via Google.',
    pain: 'Falta serviço, orçamento errado, cliente não volta',
    status: 'in_development' as VerticalStatus,
  },
  {
    slug: 'tech-service',
    name: 'TI & Tecnologia',
    persona: 'Zé',
    icon: Laptop,
    accent: 'blue' as const,
    tagline: 'Cobre o valor certo, conquista o cliente certo',
    description:
      'Precificação de hora/projeto, contratos simples, captação no LinkedIn, automação com IA.',
    pain: 'Freela barato, cliente calote, sem contrato',
    status: 'available' as VerticalStatus,
  },
] as const;

const ACCENT_MAP = {
  green: {
    icon: 'text-green-500',
    border: 'hover:border-green-400/40',
    bg: 'hover:bg-green-500/[0.03]',
    tag: 'bg-green-400/15 text-green-700',
    dot: 'bg-green-400',
    painBg: 'bg-green-50',
  },
  gold: {
    icon: 'text-gold-500',
    border: 'hover:border-gold-400/40',
    bg: 'hover:bg-gold-500/[0.03]',
    tag: 'bg-gold-400/15 text-gold-700',
    dot: 'bg-gold-400',
    painBg: 'bg-gold-50',
  },
  night: {
    icon: 'text-night-400',
    border: 'hover:border-night-400/40',
    bg: 'hover:bg-night-500/[0.04]',
    tag: 'bg-night-400/15 text-night-700',
    dot: 'bg-night-300',
    painBg: 'bg-neutral-50',
  },
  blue: {
    icon: 'text-blue-500',
    border: 'hover:border-blue-400/40',
    bg: 'hover:bg-blue-500/[0.03]',
    tag: 'bg-blue-400/15 text-blue-700',
    dot: 'bg-blue-400',
    painBg: 'bg-blue-50',
  },
} as const;

export function VerticalCards() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {VERTICALS.map((v, i) => {
          const Icon = v.icon;
          const a = ACCENT_MAP[v.accent];
          const isHovered = hovered === v.slug;
          const isOtherHovered = hovered !== null && hovered !== v.slug;
          const isAvailable = v.status === 'available';

          return (
            <div
              key={v.slug}
              onMouseEnter={() => setHovered(v.slug)}
              onMouseLeave={() => setHovered(null)}
              className={`
                group relative flex flex-col rounded-lg border bg-surface p-8
                transition-all duration-fast ease-out
                ${a.border} ${a.bg}
                ${isHovered ? 'scale-[1.02] shadow-elev-2' : 'shadow-elev-1'}
                ${isOtherHovered ? 'opacity-55' : 'opacity-100'}
              `}
              style={{
                animation: `cardIn 500ms ${i * 80}ms both cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {/* Top row: icon + persona tag + status */}
              <div className="flex items-center justify-between">
                <div className={`text-heading-l ${a.icon}`}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-micro font-medium ${a.tag}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.dot}`} />
                    {v.persona}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-micro font-medium ${
                    isAvailable
                      ? 'bg-green-50 text-green-600'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                      isAvailable ? 'bg-green-400' : 'bg-neutral-300'
                    }`} />
                    {isAvailable ? 'Disponível' : 'Em desenvolvimento'}
                  </span>
                </div>
              </div>

              {/* Title + tagline */}
              <h3 className="mt-4 text-heading-m text-neutral-900">
                {v.name}
              </h3>
              <p className="mt-1 font-serif text-body-s italic text-text-secondary">
                {v.tagline}
              </p>

              {/* Description */}
              <p className="mt-4 text-body-s text-text-secondary leading-relaxed">
                {v.description}
              </p>

              {/* Pain callout or CTA */}
              <div className="mt-auto pt-4">
                {isAvailable ? (
                  <div className={`rounded-md px-3 py-2.5 ${a.painBg}`}>
                    <p className="font-mono text-micro uppercase tracking-micro text-text-tertiary">
                      dor que resolve
                    </p>
                    <p className="mt-0.5 text-body-s font-medium text-neutral-800">
                      {v.pain}
                    </p>
                  </div>
                ) : (
                  <a
                    href={`https://wa.me/5511999999999?text=Oi%20Maria!%20Quero%20ser%20avisado%20quando%20o%20${encodeURIComponent(v.persona)}%20chegar`}
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-body-s font-medium text-neutral-600 transition-all hover:border-green-300 hover:text-green-700"
                  >
                    <Bell size={14} />
                    Quero ser avisado quando chegar
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Founder benefit line */}
      <p className="text-center text-body-s text-text-secondary">
        Founders ganham acesso vitalício a todos os especialistas —{' '}
        <span className="font-medium text-green-700">atuais e futuros</span>.
      </p>
    </div>
  );
}
