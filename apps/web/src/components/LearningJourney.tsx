import { MessageCircle, Sparkles, TrendingUp, Star, Zap, Users } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Fale com a Maria',
    description: 'Envie uma mensagem no WhatsApp. Ela entende seu momento e te guia sem enrolação.',
    color: 'text-[#00D97E]',
    bg: 'bg-[#00D97E]/10',
    border: 'border-[#00D97E]/30 group-hover:border-[#00D97E]',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Receba conhecimento',
    description: 'A Maria entrega exatamente o que você precisa saber, na hora certa. Sem cursos longos, sem perda de tempo.',
    color: 'text-[#FFD60A]',
    bg: 'bg-[#FFD60A]/10',
    border: 'border-[#FFD60A]/30 group-hover:border-[#FFD60A]',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Veja o resultado',
    description: 'Aplique o que aprendeu no mesmo dia. O conhecimento se transforma em cliente, venda e crescimento.',
    color: 'text-[#00B4D8]',
    bg: 'bg-[#00B4D8]/10',
    border: 'border-[#00B4D8]/30 group-hover:border-[#00B4D8]',
  },
];

const IMPACTO = [
  { label: 'MEIs no Brasil', value: '15 milhões', icon: Users },
  { label: 'Sem acesso à IA', value: '80%', icon: Star },
  { label: 'Irão investir em IA', value: '67%', icon: Zap },
  { label: 'Resultado', value: 'Imediato', icon: TrendingUp },
];

const DEPOIMENTO = {
  texto: '"IA pode adicionar US$ 4,4 trilhões por ano à economia global — mas 80% dos pequenos negócios no Brasil ainda não têm acesso."',
  fonte: 'McKinsey Global Institute, 2025',
};

export function LearningJourney() {
  return (
    <section className="py-24 bg-[#0A0E1A] relative overflow-hidden">
      {/* Gradiente de fundo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#00D97E]/10 via-transparent to-[#00B4D8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white/90 mb-4 tracking-tight">
            Do primeiro "Oi" ao{' '}
            <span className="bg-gradient-to-r from-[#00D97E] to-[#00B4D8] bg-clip-text text-transparent">
              resultado
            </span>
          </h2>
          <p className="text-lg text-[#9DA1B4] max-w-xl mx-auto">
            Três passos simples. Zero complicação. Apenas o que você precisa para crescer.
          </p>
        </div>

        {/* Passos */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`group relative p-8 rounded-2xl border ${step.border} ${step.bg} bg-[#0F1535]/50 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] animate-fade-in-up`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`text-5xl font-bold ${step.color} opacity-50`}>
                  {step.number}
                </span>
                <step.icon className={`w-8 h-8 ${step.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-white/90 mb-3">{step.title}</h3>
              <p className="text-sm text-[#9DA1B4] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Bloco de Impacto */}
        <div className="relative bg-gradient-to-r from-[#1A2150] via-[#0F1535] to-[#1A2150] border border-[#252B54] rounded-2xl p-10 mb-16">
          <h3 className="text-lg font-semibold text-white/90 mb-8 text-center tracking-wide">
            O IMPACTO DA IA NO BRASIL
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {IMPACTO.map((item) => (
              <div key={item.label} className="text-center group">
                <item.icon className="w-6 h-6 text-[#00D97E] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-3xl font-bold text-white/90 mb-1">{item.value}</p>
                <p className="text-xs text-[#757994] tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Depoimento */}
        <div className="relative bg-[#1A2150]/50 border border-[#252B54] rounded-2xl p-10 mb-16">
          <div className="absolute -top-5 left-8 w-10 h-10 bg-gradient-to-br from-[#00D97E] to-[#00B4D8] rounded-xl flex items-center justify-center shadow-lg shadow-[#00D97E]/20">
            <span className="text-white font-serif text-xl">"</span>
          </div>
          <p className="text-white/80 text-xl md:text-2xl italic mb-6 leading-relaxed">
            {DEPOIMENTO.texto}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00D97E]/20 flex items-center justify-center border border-[#00D97E]/30">
              <span className="text-[#00D97E] font-mono text-xs font-bold">MGI</span>
            </div>
            <div>
              <p className="text-[#00D97E] font-medium text-sm">{DEPOIMENTO.fonte}</p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <a
            href="https://wa.me/5511999999999?text=Oi%20Maria%21"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#00D97E] text-[#0A0E1A] px-10 py-5 rounded-full font-semibold text-lg hover:scale-105 hover:shadow-xl hover:shadow-[#00D97E]/20 transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6" />
            Quero começar agora — é grátis
          </a>
        </div>
      </div>
    </section>
  );
}