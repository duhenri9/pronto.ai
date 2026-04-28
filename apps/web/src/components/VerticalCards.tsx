import { Scissors, ChefHat, Wrench } from 'lucide-react';

const VERTICALS = [
  {
    slug: 'salao',
    name: 'Salão de Beleza & Estética',
    persona: 'Bia',
    icon: Scissors,
    iconColor: 'text-green-500',
    description: 'Agendamento, marketing no Instagram, precificação de serviços, fidelização de clientes com IA.',
    pain: 'Cliente cancela, agenda vazia, post não sai',
  },
  {
    slug: 'food-service',
    name: 'Food Service Local',
    persona: 'Léo',
    icon: ChefHat,
    iconColor: 'text-gold-500',
    description: 'Cardápio com IA, delivery sem app, precificação dinâmica, WhatsApp como canal de pedido.',
    pain: 'Custo subiu, cliente some, delivery come margem',
  },
  {
    slug: 'home-service',
    name: 'Prestadores de Serviço',
    persona: 'Tião',
    icon: Wrench,
    iconColor: 'text-night-800',
    description: 'Orçamento automático, roteamento de visitas, formalização do MEI, captação via Google.',
    pain: 'Falta serviço, orçamento errado, cliente não volta',
  },
] as const;

export function VerticalCards() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {VERTICALS.map((v) => {
        const Icon = v.icon;
        return (
          <div
            key={v.slug}
            className="rounded-lg border border-border-subtle bg-surface p-6 transition-shadow hover:shadow-elev-2"
          >
            <div className={`text-heading-l ${v.iconColor}`}>
              <Icon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="mt-3 text-heading-s font-medium text-neutral-900">{v.name}</h3>
            <p className="mt-1 font-mono text-micro uppercase tracking-micro text-green-600">
              especialista: {v.persona}
            </p>
            <p className="mt-3 text-body-s text-text-secondary leading-relaxed">{v.description}</p>
            <div className="mt-4 rounded-md bg-sunken px-3 py-2">
              <p className="font-mono text-micro uppercase tracking-micro text-text-tertiary">dor que resolve</p>
              <p className="mt-1 text-body-s text-neutral-900">{v.pain}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
