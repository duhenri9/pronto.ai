'use client';

import { useState } from 'react';
import {
  Sparkles, Shield, Briefcase, TrendingUp,
  ArrowRight, MessageCircle, Users,
  Timer, Star, Globe, Heart, BookOpen, ChevronDown, Rocket
} from 'lucide-react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const HERO_STATS = [
  { icon: BookOpen, value: '4', label: 'Módulos completos' },
  { icon: Timer, value: '< 30 min', label: 'Por módulo' },
  { icon: Star, value: '100%', label: 'Grátis e vitalício' },
  { icon: Users, value: '+15M', label: 'MEIs no Brasil' },
];

const MODULOS = [
  {
    id: 'primeiros-passos',
    icon: Sparkles,
    number: '01',
    title: 'Primeiros passos com IA',
    subtitle: 'Getting Started with AI',
    duration: '20 minutos',
    modules: '2 blocos',
    description: 'Entenda o que é IA de verdade, sem exageros e sem medo.',
    lessons: [
      'Começando com IA — o que é, onde está, como usar',
      'Fundamentos de Prompting — como fazer a pergunta certa',
    ],
    blocks: [
      {
        title: 'Começando com IA',
        sections: [
          {
            title: 'Visão geral do módulo',
            content: 'Meu bem, seja bem-vindo ao seu primeiro passo no mundo da IA. Este módulo foi feito para você que quer entender de uma vez por todas o que é essa tal de Inteligência Artificial — sem palavras difíceis, sem medo e sem exageros. Em apenas 20 minutos, você vai descobrir que a IA está mais perto de você do que imagina.',
          },
          {
            title: 'Desmistificando a IA',
            content: 'Vamos separar os fatos da ficção. IA não é robô que vai dominar o mundo. Não é magia. Não é coisa de filme de Hollywood. É uma ferramenta — como uma calculadora, só que para palavras e ideias. Ela aprende com exemplos, do mesmo jeito que você aprendeu a fazer bolo: vendo, tentando e ajustando.',
          },
          {
            title: 'Ferramentas de IA para usar hoje',
            content: 'Você não precisa instalar nada. Não precisa pagar nada. Vou te apresentar ferramentas gratuitas que você pode começar a usar agora mesmo no seu celular ou computador. A mais importante delas? Eu mesma! A Maria está aqui, no seu WhatsApp, pronta para te ajudar.',
          },
          {
            title: 'Como a IA ajuda no dia a dia',
            content: 'A IA já está na sua vida — no seu banco, no seu celular, nas sugestões de compras, no GPS que te leva para lugares novos. Nesta seção, vou te mostrar exemplos práticos em compras, saúde e comunicação. Você vai se surpreender com o quanto já usa IA sem saber.',
          },
          {
            title: 'IA na prática',
            content: 'Hora de colocar a mão na massa. Você vai aplicar IA em uma situação real: imagine que você precisa planejar o cardápio da semana para sua família. Como a IA pode te ajudar? Vamos fazer isso junto, passo a passo.',
          },
          {
            title: 'Resumo do bloco',
            content: 'Recapitulando: você aprendeu o que é IA de verdade, descobriu que já usa ela no dia a dia e deu seu primeiro passo prático. Agora está pronto para o próximo desafio: aprender a conversar com a IA para tirar o melhor proveito dela.',
          },
        ],
      },
      {
        title: 'Fundamentos de Prompting',
        sections: [
          {
            title: 'Visão geral do bloco',
            content: 'Prompt é o nome chique para "pergunta que você faz para a IA". Parece simples, mas a forma como você pergunta muda completamente a resposta. Neste bloco, você vai aprender a arte de fazer perguntas poderosas.',
          },
          {
            title: 'Respostas melhores com prompts claros',
            content: 'Os 4 elementos de um bom prompt: clareza, contexto, formato e papel. Exemplo prático: em vez de "me ajuda com marketing", diga "você é uma especialista em marketing para pequenos negócios. Me dá 5 ideias de conteúdo para Instagram para uma doceria caseira." Percebe a diferença? A segunda pergunta é um prato cheio para a IA trabalhar.',
          },
          {
            title: 'Use IA com responsabilidade e segurança',
            content: 'Meu bem, com grandes poderes vêm grandes responsabilidades. Nunca compartilhe dados pessoais, senhas ou informações bancárias. Revise tudo que a IA gerar antes de usar. E lembre-se: a responsabilidade final é sempre sua. A IA é uma ferramenta, não uma conselheira infalível.',
          },
          {
            title: 'Prompting na prática',
            content: 'Exercício guiado: você tem um pequeno negócio de salgados. Precisa criar uma mensagem para clientes antigos que não compram há 30 dias. Vamos construir o prompt junto. Depois, você vai adaptar esse mesmo modelo para qualquer situação do seu negócio.',
          },
          {
            title: 'Resumo do módulo',
            content: 'Você chegou ao fim do Módulo 1. Agora sabe o que é IA, como ela está presente na sua vida e — mais importante — como conversar com ela para obter respostas realmente úteis. O próximo passo? Explorar como a IA pode te ajudar em áreas específicas: segurança, saúde, trabalho e carreira. Nos vemos no Módulo 2!',
          },
        ],
      },
    ],
    color: 'green',
  },
  {
    id: 'ia-no-dia-a-dia',
    icon: Shield,
    number: '02',
    title: 'IA no seu dia a dia',
    subtitle: 'Everyday AI',
    duration: '30 minutos',
    modules: '3 submódulos',
    description: 'Use IA para se proteger de golpes, navegar com segurança online e cuidar da sua saúde.',
    lessons: [
      'Como identificar golpes e notícias falsas com IA',
      'Como se proteger online e proteger sua família',
      'Como usar IA para cuidar melhor da sua saúde',
    ],
    color: 'yellow',
  },
  {
    id: 'ia-no-trabalho',
    icon: Briefcase,
    number: '03',
    title: 'IA no seu trabalho',
    subtitle: 'AI in Your Job',
    duration: '20-30 minutos',
    modules: '2-3 submódulos',
    description: 'Escreva e-mails e mensagens profissionais, organize suas contas e crie propostas que impressionam.',
    lessons: [
      'Como escrever correspondências e e-mails profissionais em segundos',
      'Como organizar a administração do seu negócio',
      'Como criar orçamentos e propostas que fecham contratos',
    ],
    color: 'blue',
  },
  {
    id: 'ia-na-carreira',
    icon: TrendingUp,
    number: '04',
    title: 'IA para crescer na carreira',
    subtitle: 'AI to Support Your Career',
    duration: '20-30 minutos',
    modules: '2-3 submódulos',
    description: 'Descubra novas áreas de atuação, monte um currículo competitivo e prepare-se para entrevistas.',
    lessons: [
      'Como descobrir novas áreas de atuação',
      'Como montar um currículo que se destaca',
      'Como se preparar para entrevistas com confiança',
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
    a: 'Cada módulo leva menos de 30 minutos. Você faz no seu ritmo, quando quiser. Não tem prazo, não tem pressa. A Maria te espera — e nunca cobra.',
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
    <div className="min-h-screen flex flex-col bg-[#0A0E1A] text-white">
      <Nav />
      <main className="flex-1">
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
                      <p className="text-xs text-[#4D5274] mb-2 font-mono">{modulo.subtitle}</p>
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

      {/* ── Como aprender com a Maria ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-16">
            Como aprender com a Maria?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: MessageCircle,
                title: 'Chame a Maria',
                text: 'Mande um "Oi" no WhatsApp. É de graça, sem cadastro, sem complicação.',
              },
              {
                step: '2',
                icon: BookOpen,
                title: 'Escolha sua trilha',
                text: 'Ela te mostra as opções e você decide por onde começar — do básico ao avançado.',
              },
              {
                step: '3',
                icon: Rocket,
                title: 'Aprenda e aplique',
                text: 'Cada aula tem um exercício prático. Você aprende e já usa no mesmo dia.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-[#1A2150] border border-[#252B54] flex items-center justify-center mx-auto mb-4 group-hover:border-[#00D97E]/30 transition-colors">
                  <span className="text-2xl font-bold text-[#00D97E]">{item.step}</span>
                </div>
                <item.icon className="w-6 h-6 text-[#00D97E] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white/90 mb-2">{item.title}</h3>
                <p className="text-sm text-[#9DA1B4] leading-relaxed">{item.text}</p>
              </div>
            ))}
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
        <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-4">
          Pronta pra começar?
        </h2>
        <p className="text-[#9DA1B4] text-lg mb-8 max-w-xl mx-auto">
          A Maria está te esperando. Escolha um módulo — em menos de 30 minutos você já aprendeu algo novo.
        </p>
        <a
          href="https://wa.me/5511999999999?text=Oi%20Maria%21"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#00D97E] text-[#0A0E1A] px-10 py-5 rounded-full font-semibold text-lg hover:scale-105 hover:shadow-xl hover:shadow-[#00D97E]/20 transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
          Quero começar agora — é grátis
        </a>
      </section>
      </main>
      <Footer />
    </div>
  );
}