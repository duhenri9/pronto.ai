'use client';

import { useState } from 'react';
import {
  Sparkles, Shield, Briefcase, TrendingUp,
  ArrowRight, MessageCircle, Users,
  Timer, Star, Globe, Heart, BookOpen, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

const HERO_STATS = [
  { icon: BookOpen, value: '4', label: 'Módulos completos' },
  { icon: Timer, value: '20-30 min', label: 'Por microlição' },
  { icon: Star, value: '100%', label: 'Grátis e vitalício' },
  { icon: Users, value: '+15M', label: 'meis no Brasil' },
];

const MODULOS = [
  {
    id: 'primeiros-passos',
    icon: Sparkles,
    number: '01',
    title: 'Primeiros passos com IA',
    duration: '20 minutos',
    modules: '2 módulos',
    description: 'Entenda o que é Inteligência Artificial de um jeito simples, sem tecniquês. Descubra como a IA já está presente na sua vida e como ela pode te ajudar no dia a dia.',
    lessons: [
      'O que é IA (e o que não é)',
      'Como a IA está no seu celular, no seu banco e no seu trabalho',
      'Primeira conversa com a Maria para testar na prática',
    ],
    color: 'green',
  },
  {
    id: 'ia-no-dia-a-dia',
    icon: Shield,
    number: '02',
    title: 'IA no seu dia a dia',
    duration: '30 minutos',
    modules: '3 módulos',
    description: 'Aprenda a usar IA para se proteger de golpes, organizar suas tarefas, cuidar da saúde e facilitar a rotina da sua família. Segurança e praticidade andam juntas.',
    lessons: [
      'Como identificar golpes e fake news com ajuda da IA',
      'Organize sua vida: listas, lembretes e compromissos',
      'Saúde e bem-estar: use IA para se cuidar melhor',
    ],
    color: 'yellow',
  },
  {
    id: 'ia-no-trabalho',
    icon: Briefcase,
    number: '03',
    title: 'IA no seu trabalho',
    duration: '30 minutos',
    modules: '3 módulos',
    description: 'Descubra como a IA pode te ajudar a escrever mensagens para clientes, organizar as contas do seu negócio e criar propostas profissionais — mesmo se você nunca usou IA antes.',
    lessons: [
      'Escreva mensagens e legendas que vendem',
      'Organize suas finanças com ajuda da IA',
      'Crie propostas e orçamentos em minutos',
    ],
    color: 'blue',
  },
  {
    id: 'ia-na-carreira',
    icon: TrendingUp,
    number: '04',
    title: 'IA para crescer na carreira',
    duration: '30 minutos',
    modules: '3 módulos',
    description: 'Aprenda a usar IA para montar um currículo que se destaca, se preparar para entrevistas e descobrir novas oportunidades de trabalho e renda — tudo no seu tempo.',
    lessons: [
      'Monte um currículo profissional com IA',
      'Prepare-se para entrevistas com confiança',
      'Descubra novas áreas de atuação e renda',
    ],
    color: 'green',
  },
];

const COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  green: { bg: 'bg-[#00D97E]/5', border: 'border-[#00D97E]/20', text: 'text-[#00D97E]', accent: 'bg-[#00D97E]' },
  yellow: { bg: 'bg-[#FFD60A]/5', border: 'border-[#FFD60A]/20', text: 'text-[#FFD60A]', accent: 'bg-[#FFD60A]' },
  blue: { bg: 'bg-[#00B4D8]/5', border: 'border-[#00B4D8]/20', text: 'text-[#00B4D8]', accent: 'bg-[#00B4D8]' },
};

const FAQ = [
  {
    q: '"Maria, eu entendo NADA de tecnologia. Dá pra aprender?"',
    a: 'Meu bem, a IA foi feita pra pessoas como você. Não precisa saber programar, não precisa ser expert. Se você consegue mandar mensagem no WhatsApp, você consegue aprender com a Maria. É só conversar.',
  },
  {
    q: '"Preciso pagar alguma coisa?"',
    a: 'O acesso à Maria é gratuito e vitalício. A gente acredita que capacitação em IA é um direito, não privilégio. Os agentes especializados (Bia, Léo, Tião, Zé) são opcionais e custam R$ 29/mês.',
  },
  {
    q: '"Quanto tempo eu vou demorar pra aprender?"',
    a: 'Cada microlição tem entre 20 e 30 minutos. Você faz no seu ritmo, quando quiser. Não tem prazo, não tem pressa. A Maria te espera — e nunca cobra.',
  },
  {
    q: '"E se eu não gostar?"',
    a: 'Sem compromisso. Você pode parar quando quiser, sem multa, sem contrato. Mas a gente aposta que você vai gostar — porque cada aula tem resultado prático no seu negócio.',
  },
  {
    q: '"A Maria é um robô? Vai me julgar?"',
    a: 'A Maria é uma mentora virtual. Ela te ouve, te respeita e te ajuda sem julgar. Nunca vai te chamar de burro ou dizer que sua pergunta é boba. Tô aqui pra ajudar, meu bem.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#252B54] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-[#1A2150]/30 transition-colors"
      >
        <span className="text-white/90 font-medium pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#757994] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-[#9DA1B4] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function ModulosPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D97E]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#00D97E]/8 via-[#00B4D8]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Módulos e{' '}
              <span className="bg-gradient-to-r from-[#00D97E] to-[#00B4D8] bg-clip-text text-transparent">
                Conteúdo
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[#9DA1B4] max-w-2xl mx-auto leading-relaxed">
              Do básico ao aplicado. Cada módulo foi pensado pra você que quer
              dominar a IA sem complicação.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center group">
                <stat.icon className="w-6 h-6 text-[#00D97E] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-2xl md:text-3xl font-bold text-white/90 mb-1">{stat.value}</p>
                <p className="text-xs text-[#757994] leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Por que aprender IA? ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-6">
            Por que aprender{' '}
            <span className="bg-gradient-to-r from-[#00D97E] to-[#00B4D8] bg-clip-text text-transparent">
              Inteligência Artificial
            </span>?
          </h2>
          <p className="text-center text-[#9DA1B4] text-lg mb-16 max-w-2xl mx-auto">
            Meu bem, deixa eu te contar uma coisa: a IA já está em tudo.
            Mas calma — não precisa ter medo. Precisa entender. E é pra isso que eu estou aqui.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'O mundo mudou',
                text: 'A IA já está no seu banco, no seu celular, no seu trabalho. Quem entende isso sai na frente. Quem ignora, fica pra trás.',
              },
              {
                icon: Heart,
                title: 'É mais simples do que parece',
                text: 'Você não precisa ser expert em tecnologia. A Maria fala a sua língua, no seu ritmo, sem palavras difíceis.',
              },
              {
                icon: TrendingUp,
                title: 'Resultado que aparece',
                text: 'Cada microlição é feita pra você aplicar na hora. Aprendeu de manhã? Usa de tarde no seu negócio.',
              },
            ].map((item) => (
              <div key={item.title} className="group p-8 rounded-2xl bg-[#1A2150]/30 border border-[#252B54] hover:border-[#00D97E]/20 transition-all duration-300 hover:scale-[1.02]">
                <item.icon className="w-8 h-8 text-[#00D97E] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white/90 mb-3">{item.title}</h3>
                <p className="text-sm text-[#9DA1B4] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Módulos Disponíveis ── */}
      <section className="py-24 px-6 bg-[#0F1535]/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-4">
            Módulos disponíveis
          </h2>
          <p className="text-center text-[#9DA1B4] text-lg mb-16 max-w-2xl mx-auto">
            Do básico ao avançado. Cada módulo é independente — comece por onde quiser.
          </p>

          <div className="space-y-8">
            {MODULOS.map((modulo, i) => {
              const c = COLORS[modulo.color];
              return (
                <div
                  key={modulo.id}
                  className={`group relative rounded-2xl border ${c.border} ${c.bg} p-8 md:p-10 hover:shadow-xl transition-all duration-500 animate-fade-in-up`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Número + Ícone */}
                    <div className="flex-shrink-0 flex items-start gap-4">
                      <span className={`text-5xl font-bold ${c.text} opacity-40`}>
                        {modulo.number}
                      </span>
                      <modulo.icon className={`w-10 h-10 ${c.text} mt-2`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-2xl font-semibold text-white/90">
                          {modulo.title}
                        </h3>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${c.bg} ${c.border} ${c.text}`}>
                          {modulo.duration}
                        </span>
                        <span className="text-xs text-[#757994]">{modulo.modules}</span>
                      </div>
                      <p className="text-[#9DA1B4] leading-relaxed mb-6">
                        {modulo.description}
                      </p>

                      {/* Lições */}
                      <div className="space-y-2 mb-6">
                        {modulo.lessons.map((lesson, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${c.accent}`} />
                            <span className="text-sm text-[#757994]">{lesson}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`https://wa.me/5511999999999?text=Oi%20Maria%21%20Quero%20fazer%20o%20m%C3%B3dulo%20${encodeURIComponent(modulo.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${c.border} ${c.text} text-sm font-medium hover:${c.bg} transition-colors`}
                      >
                        Quero fazer este módulo
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Depoimento McKinsey ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-[#1A2150]/50 border border-[#252B54] rounded-2xl p-10">
            <div className="absolute -top-5 left-8 w-10 h-10 bg-gradient-to-br from-[#00D97E] to-[#00B4D8] rounded-xl flex items-center justify-center shadow-lg shadow-[#00D97E]/20">
              <span className="text-white font-serif text-xl">&quot;</span>
            </div>
            <p className="text-white/80 text-xl md:text-2xl italic mb-6 leading-relaxed pt-4">
              &quot;IA pode adicionar US$ 4,4 trilhões por ano à economia global — mas 80% dos
              pequenos negócios no Brasil ainda não têm acesso a essa tecnologia.&quot;
            </p>
            <p className="text-[#757994] text-sm">
              McKinsey Global Institute, 2025 · The economic potential of generative AI
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-[#0F1535]/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-16">
            Dúvidas que sempre me perguntam
          </h2>

          <div className="space-y-4">
            {FAQ.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Nota de Referência ── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-[#4D5274] leading-relaxed">
            A estrutura de módulos e conteúdo do Pronto.IA foi inspirada no
            AIReady.ie — programa de alfabetização em IA financiado pelo governo irlandês.
            Adaptamos o conceito para a realidade brasileira: WhatsApp-first, conversacional,
            verticalizado e focado em resultado prático para o microempreendedor.
          </p>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white/90 mb-4">
          Pronto pra começar?
        </h2>
        <p className="text-[#9DA1B4] text-lg max-w-xl mx-auto mb-8">
          A Maria está esperando você. É grátis, é rápido e o primeiro resultado já aparece hoje.
        </p>
        <a
          href="https://wa.me/5511999999999?text=Oi%20Maria%21%20Quero%20começar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#00D97E] text-[#0A0E1A] px-10 py-5 rounded-full font-semibold text-lg hover:scale-105 hover:shadow-xl hover:shadow-[#00D97E]/20 transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
          Quero começar agora — é grátis
        </a>
      </section>
    </main>
  );
}