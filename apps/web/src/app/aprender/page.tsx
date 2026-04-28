import {
  Sparkles, Shield, Briefcase, TrendingUp,
  ArrowRight, MessageCircle, Users, Zap,
  Smartphone, Timer, Heart, Globe, BookOpen, Rocket
} from 'lucide-react';
import Link from 'next/link';

const HERO_STATS = [
  { icon: Users, value: '1 milhão', label: 'de pessoas capacitadas até 2028' },
  { icon: Timer, value: '20 minutos', label: 'por microlição, no seu ritmo' },
  { icon: Smartphone, value: 'WhatsApp', label: 'sem app novo, sem login' },
  { icon: Zap, value: 'Grátis', label: 'acesso livre e vitalício' },
];

const COURSES = [
  {
    id: 'primeiros-passos',
    icon: Sparkles,
    number: '01',
    title: 'Primeiros passos com IA',
    duration: '20 minutos',
    modules: '2 módulos',
    description: 'Entenda o que é Inteligência Artificial de um jeito simples, sem tecniquês. Descubra como a IA já está presente na sua vida e como ela pode te ajudar no dia a dia.',
    topics: [
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
    topics: [
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
    topics: [
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
    topics: [
      'Monte um currículo profissional com IA',
      'Prepare-se para entrevistas com confiança',
      'Descubra novas áreas de atuação e renda',
    ],
    color: 'green',
  },
];

const COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  green: {
    bg: 'bg-[#00D97E]/5', border: 'border-[#00D97E]/20', text: 'text-[#00D97E]',
    accent: 'bg-[#00D97E]',
  },
  yellow: {
    bg: 'bg-[#FFD60A]/5', border: 'border-[#FFD60A]/20', text: 'text-[#FFD60A]',
    accent: 'bg-[#FFD60A]',
  },
  blue: {
    bg: 'bg-[#00B4D8]/5', border: 'border-[#00B4D8]/20', text: 'text-[#00B4D8]',
    accent: 'bg-[#00B4D8]',
  },
};

const STEPS = [
  {
    step: '1',
    icon: MessageCircle,
    title: 'Chame a Maria',
    description: 'Mande "Oi Maria" no WhatsApp. Ela te recebe e entende seu momento.',
    color: 'text-[#00D97E]',
    bg: 'bg-[#00D97E]/10',
  },
  {
    step: '2',
    icon: BookOpen,
    title: 'Aprenda no seu ritmo',
    description: 'Microlições de 20 minutos. Você faz quando e onde quiser.',
    color: 'text-[#FFD60A]',
    bg: 'bg-[#FFD60A]/10',
  },
  {
    step: '3',
    icon: Rocket,
    title: 'Aplique no mesmo dia',
    description: 'Cada aula tem um exercício prático. Resultado imediato no seu negócio.',
    color: 'text-[#00B4D8]',
    bg: 'bg-[#00B4D8]/10',
  },
];

export default function AprenderPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D97E]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#00D97E]/8 via-[#00B4D8]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Domine a{' '}
              <span className="bg-gradient-to-r from-[#00D97E] to-[#00B4D8] bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[#9DA1B4] max-w-2xl mx-auto leading-relaxed">
              O Pronto.IA traduz o que há de mais avançado em IA para a sua realidade —
              de graça, no WhatsApp, do seu jeito.
            </p>
          </div>

          {/* Stats */}
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

      {/* ── Manifesto ── */}
      <section className="py-16 px-6 bg-[#0F1535]/30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-light leading-relaxed text-white/90">
            &quot;A IA já não é coisa do futuro. É do agora. E a gente acredita que
            <span className="text-[#00D97E] font-normal"> todo mundo </span>
            merece a chance de aprender, crescer e prosperar com ela.&quot;
          </p>
          <p className="text-[#9DA1B4] mt-4 text-sm">— Maria, sua mentora de IA no WhatsApp</p>
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

      {/* ── Microlições ── */}
      <section className="py-24 px-6 bg-[#0F1535]/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-4">
            Nossas microlições
          </h2>
          <p className="text-center text-[#9DA1B4] text-lg mb-16 max-w-2xl mx-auto">
            Do básico ao avançado. Cada aula é rapidinha — entre 20 e 30 minutos.
            Dá pra fazer no intervalo do café, na fila do banco ou antes de dormir.
          </p>

          <div className="space-y-8">
            {COURSES.map((course, i) => {
              const c = COLORS[course.color];
              return (
                <div
                  key={course.id}
                  className={`group relative rounded-2xl border ${c.border} ${c.bg} p-8 md:p-10 transition-all duration-500 animate-fade-in-up`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Número + Ícone */}
                    <div className="flex-shrink-0 flex items-start gap-4">
                      <span className={`text-5xl font-bold ${c.text} opacity-40`}>
                        {course.number}
                      </span>
                      <course.icon className={`w-10 h-10 ${c.text} mt-2`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-2xl font-semibold text-white/90">
                          {course.title}
                        </h3>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${c.bg} ${c.border} ${c.text}`}>
                          {course.duration}
                        </span>
                      </div>
                      <p className="text-[#9DA1B4] leading-relaxed mb-6">
                        {course.description}
                      </p>

                      {/* Tópicos */}
                      <div className="space-y-2 mb-6">
                        {course.topics.map((topic, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${c.accent}`} />
                            <span className="text-sm text-[#757994]">{topic}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`https://wa.me/5511999999999?text=Oi%20Maria%21%20Quero%20aprender%20${encodeURIComponent(course.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${c.border} ${c.text} text-sm font-medium hover:${c.bg} transition-colors`}
                      >
                        Quero aprender
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

      {/* ── Como aprender com a Maria? ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-16">
            Como aprender com a Maria?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.step} className={`relative p-8 rounded-2xl border border-[#252B54] ${step.bg} transition-all duration-300 hover:scale-[1.02]`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-4xl font-bold ${step.color} opacity-40`}>{step.step}</span>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white/90 mb-2">{step.title}</h3>
                <p className="text-sm text-[#9DA1B4] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-24 px-6 text-center bg-[#0F1535]/30">
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