import { MessageCircle, BookOpen, Briefcase, TrendingUp, Star } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    icon: MessageCircle,
    title: 'Fale com a Maria',
    description: 'Envie "Oi Maria" no WhatsApp. Ela te recebe de braços abertos e entende seu momento.',
    color: 'text-[#00D97E]',
    bg: 'bg-[#00D97E]/10',
    border: 'border-[#00D97E]/30',
  },
  {
    number: 2,
    icon: BookOpen,
    title: 'Aprenda com microlições',
    description: 'Aulas de 10 minutos, direto no WhatsApp. Do básico ao avançado, no seu ritmo.',
    color: 'text-[#FFD60A]',
    bg: 'bg-[#FFD60A]/10',
    border: 'border-[#FFD60A]/30',
  },
  {
    number: 3,
    icon: Briefcase,
    title: 'Aplique no seu negócio',
    description: 'Cada aula tem um exercício prático. Você aplica na hora, no seu negócio real.',
    color: 'text-[#00B4D8]',
    bg: 'bg-[#00B4D8]/10',
    border: 'border-[#00B4D8]/30',
  },
];

const IMPACTO = [
  { label: 'MEIs no Brasil', value: '15 milhões', icon: TrendingUp },
  { label: 'Sem capacitação em IA', value: '80%', icon: Star },
  { label: 'Mensalidade', value: 'Grátis', icon: Star },
  { label: 'Certificado', value: 'Incluso', icon: Star },
];

const DEPOIMENTO = {
  texto: '"Maria me ajudou a calcular o preço certo do meu bolo. Agora vendo o dobro!"',
  nome: 'Ana',
  negocio: 'Doceira há 3 anos',
};

export function LearningJourney() {
  return (
    <section className="py-20 bg-[#0F1535]/50">
      <div className="max-w-5xl mx-auto px-6">
        {/* Cabeçalho */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-4">
          Sua jornada de aprendizado
        </h2>
        <p className="text-center text-[#9DA1B4] text-lg mb-16 max-w-xl mx-auto">
          Do primeiro "Oi Maria" ao certificado, em 3 passos simples.
          Sem app novo, sem complicação.
        </p>

        {/* Passos */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`relative p-6 rounded-xl border ${step.border} ${step.bg} animate-fade-in-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.bg}`}>
                  <span className={`font-bold ${step.color}`}>{step.number}</span>
                </div>
                <step.icon className={`w-5 h-5 ${step.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white/90 mb-2">{step.title}</h3>
              <p className="text-sm text-[#9DA1B4] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Bloco de Impacto */}
        <div className="bg-[#1A2150] border border-[#252B54] rounded-xl p-8 mb-12">
          <h3 className="text-lg font-semibold text-white/90 mb-6 text-center">
            O impacto da IA no Brasil
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {IMPACTO.map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className="w-5 h-5 text-[#00D97E] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white/90">{item.value}</p>
                <p className="text-xs text-[#757994]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Depoimento */}
        <div className="relative bg-[#1A2150] border border-[#252B54] rounded-xl p-8 mb-12">
          <div className="absolute -top-4 left-6 w-8 h-8 bg-[#00D97E] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">"</span>
          </div>
          <p className="text-white/80 text-lg italic mb-4 leading-relaxed">
            {DEPOIMENTO.texto}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00D97E]/20 flex items-center justify-center">
              <span className="text-[#00D97E] font-semibold text-sm">
                {DEPOIMENTO.nome[0]}
              </span>
            </div>
            <div>
              <p className="text-white/90 font-medium text-sm">{DEPOIMENTO.nome}</p>
              <p className="text-[#757994] text-xs">{DEPOIMENTO.negocio}</p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <a
            href="https://wa.me/5511999999999?text=Oi%20Maria%21"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#00D97E] text-[#0F1535] px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform duration-240"
          >
            <MessageCircle className="w-5 h-5" />
            Quero começar agora — é grátis
          </a>
        </div>
      </div>
    </section>
  );
}