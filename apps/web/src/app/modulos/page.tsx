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
  { icon: BookOpen, value: '6', label: 'Trilhas completas' },
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

const TRILHAS_DETALHADAS = [
  {
    id: 'fim-do-medo',
    icon: Sparkles,
    number: '01',
    title: 'O fim do medo',
    subtitle: 'IA como sua nova parceira de trabalho',
    description: 'Entenda de uma vez que a IA não é coisa de filme nem vai roubar seu lugar. Ela é como uma calculadora: antes a gente fazia conta no papel, hoje usa a máquina. A IA é a mesma coisa para os textos e ideias do seu negócio.',
    blocks: [
      {
        title: 'Conceitos essenciais',
        sections: [
          { title: 'IA não é bicho de sete cabeças', content: 'É um programa de computador que aprendeu a conversar e pensar como a gente. Não é magia, não é consciência, não vai roubar seu negócio. É uma ferramenta — como uma calculadora, só que para palavras e ideias.' },
          { title: 'Sua nova parceira de trabalho', content: 'Imagine ter alguém que trabalha 24 horas por dia, não reclama e faz o que você pede em segundos. Essa é a IA. Ela escreve mensagens, dá ideias de promoção, organiza contas e ajuda a planejar a semana.' },
          { title: 'O que ela faz por você agora', content: 'Escreve legendas para Instagram, responde dúvidas de clientes no WhatsApp, cria cardápios e listas de preços, planeja postagens da semana, melhora a descrição dos seus produtos.' },
          { title: 'A regra de ouro', content: 'Você é a pessoa no comando. A IA te dá o rascunho, mas quem dá o toque final de quem conhece o negócio é você. Revise, adapte, deixe com a sua cara.' },
        ],
      },
      {
        title: 'Na prática — cada vertical',
        sections: [
          { title: 'Beleza (Bia)', content: 'A IA não faz o corte, mas faz a cliente sentar na cadeira. É sua secretária de marketing, pronta para escrever legendas, responder mensagens e criar promoções que enchem sua agenda.' },
          { title: 'Alimentação (Léo)', content: 'A IA não cozinha, mas calcula o custo do prato para você não ter prejuízo no final do mês. Ela também cria nomes para novos produtos e sugere combos que aumentam seu lucro.' },
          { title: 'Serviços (Tião)', content: 'A IA não aperta o parafuso, mas faz o orçamento profissional que impede o cliente de questionar o preço. Ela também organiza sua rota de trabalho e calcula seus custos.' },
          { title: 'Tecnologia (Zé)', content: 'A IA não substitui seu código, mas documenta e vende seu projeto enquanto você foca na solução. Ela também gera contratos, escopos e relatórios profissionais.' },
        ],
      },
    ],
    color: 'green',
  },
  {
    id: 'arte-do-pedido',
    icon: MessageCircle,
    number: '02',
    title: 'A arte do pedido',
    subtitle: 'Como mandar na IA e ter resultados reais',
    description: 'O segredo não é a ferramenta, é o que você escreve nela. Se você pedir mal, a resposta é ruim. Se você usar a fórmula certa, o resultado é profissional.',
    blocks: [
      {
        title: 'O método O.C.P.',
        sections: [
          { title: 'O quê', content: '"Escreva um anúncio..." Seja claro sobre o que você quer. A IA não adivinha — ela responde ao que você pede.' },
          { title: 'Contexto', content: '"...para a minha oficina que vai dar 10% de desconto em troca de óleo..." Dê informações suficientes para a IA entender exatamente a situação.' },
          { title: 'Público', content: '"...para motoristas de aplicativo que precisam economizar." Quanto mais específico for o público, mais certeira será a resposta.' },
        ],
      },
      {
        title: 'Técnicas avançadas',
        sections: [
          { title: 'Dê uma personalidade', content: 'Peça para a IA agir como "uma pessoa vendedora experiente" ou "uma recepcionista educada". Isso molda o tom e o estilo da resposta.' },
          { title: 'Ajuste o tom', content: '"Escreva de um jeito divertido", "Escreva de um jeito sério", "Use linguagem informal". Você manda no estilo.' },
          { title: 'Exemplos por vertical', content: 'Beleza: "Aja como uma pessoa expert em Instagram de beleza. Crie 3 legendas para fotos de antes e depois de uma progressiva, focando no brilho e na autoestima." Alimentação: "Analise estes ingredientes: farinha, ovo, leite e frango. Me dê 5 ideias de nomes criativos para um novo salgado no meu cardápio de delivery." Serviços: "Escreva um texto educado para mandar no WhatsApp de um cliente que não aprovou o orçamento de pintura faz 3 dias. Quero saber se há dúvidas sem parecer que estou pressionando." Tecnologia: "Redija uma cláusula simples de escopo de trabalho para um projeto de criação de site, deixando claro que alterações fora do combinado serão cobradas à parte."' },
        ],
      },
    ],
    color: 'yellow',
  },
  {
    id: 'marketing-e-vendas',
    icon: TrendingUp,
    number: '03',
    title: 'Marketing e vendas',
    subtitle: 'Atrair cliente sem gastar com agência',
    description: 'Como usar a IA para fazer seu Instagram, Facebook e WhatsApp trabalharem para trazer clientes.',
    blocks: [
      {
        title: 'Ferramentas práticas',
        sections: [
          { title: 'Calendário de postagens', content: 'Peça para a IA criar 30 ideias de posts para o mês inteiro em 5 minutos. Nunca mais fique sem saber o que postar.' },
          { title: 'Legendas que vendem', content: 'Chega de colocar só "preço no direct". Peça legendas que chamem a atenção e criem desejo pelo seu produto ou serviço.' },
          { title: 'Imagens profissionais', content: 'Use ferramentas de IA para tirar o fundo de fotos de produtos ou criar artes no Canva sem precisar saber design.' },
          { title: 'Roteiros de vídeo', content: 'Scripts prontos para você gravar seus Reels ou TikToks sem travar na frente da câmera. A IA te dá o roteiro, você grava.' },
        ],
      },
      {
        title: 'Por vertical',
        sections: [
          { title: 'Beleza — O ímã de clientes', content: 'Use a IA para criar um "Guia de Cuidados Pós-Procedimento" em PDF. Ofereça de brinde para quem agendar. Peça para a IA listar as 5 maiores dúvidas de quem quer fazer um procedimento — pronto, você tem 5 temas de vídeo para gravar.' },
          { title: 'Alimentação — Cardápio inteligente', content: 'A IA revisa seus nomes de pratos. Em vez de "X-Tudo", que tal "O Brabo da Galera: O hambúrguer que mata qualquer fome"? Promoção relâmpago: "Maria, está chovendo e o movimento caiu. Cria uma promoção de Combo de Chuva para eu soltar no status do WhatsApp agora!"' },
        ],
      },
    ],
    color: 'blue',
  },
  {
    id: 'gestao-e-dinheiro',
    icon: Briefcase,
    number: '04',
    title: 'Gestão e dinheiro',
    subtitle: 'Organização sem prejuízo',
    description: 'Usar a IA para tirar a bagunça da sua frente. Ideal para quem cuida de tudo sozinho e não tem tempo para burocracia.',
    blocks: [
      {
        title: 'Ferramentas práticas',
        sections: [
          { title: 'Do papel para o digital', content: 'Tire foto de uma lista de compras ou notas fiscais e peça para a IA organizar tudo em uma lista ou tabela. Nunca mais perca um comprovante.' },
          { title: 'Propostas e orçamentos', content: 'Gere orçamentos profissionais e bem escritos que passam confiança para o cliente. A IA calcula seus custos e sugere o preço certo.' },
          { title: 'Contratos simples', content: 'Precisa de um termo de compromisso ou um recibo? Peça para a IA redigir um modelo seguro e rápido, adaptado ao seu contexto.' },
          { title: 'Análise de concorrência', content: 'Peça para a IA pesquisar o que as lojas do seu bairro estão fazendo e como você pode fazer melhor. Informação é vantagem competitiva.' },
        ],
      },
      {
        title: 'Por vertical',
        sections: [
          { title: 'Serviços — Orçamento sem erro', content: 'Ensine a IA seus custos: hora técnica, gasolina, material. Peça: "Vou fazer uma instalação a 20 km daqui, levo 2 horas e gasto R$ 50 de material. Quanto devo cobrar para lucrar 40%?" A IA também organiza sua lista de endereços do dia para você gastar menos combustível entre um serviço e outro.' },
          { title: 'Tecnologia — Contrato e valor de mercado', content: 'Peça para a IA gerar um termo de entrega de projeto. O cliente só recebe a senha final após o último pagamento. Use a IA para pesquisar quanto está a média de mercado para um serviço de suporte de rede ou desenvolvimento freelancer na sua região, para você parar de cobrar abaixo do seu valor.' },
        ],
      },
    ],
    color: 'green',
  },
  {
    id: 'atendimento-de-ouro',
    icon: Shield,
    number: '05',
    title: 'Atendimento de ouro',
    subtitle: 'Fidelização e pós-venda',
    description: 'O WhatsApp é onde você ganha dinheiro. A IA vai te ajudar a nunca mais deixar um cliente sem resposta ou dar uma resposta mal educada por estar cansado.',
    blocks: [
      {
        title: 'Ferramentas práticas',
        sections: [
          { title: 'Respostas para perguntas comuns', content: 'Crie modelos de resposta para "quanto custa?", "entrega onde?" e "faz desconto?". A IA mantém o tom profissional mesmo quando você está sem tempo.' },
          { title: 'Cobrança amigável', content: 'Como cobrar aquela pessoa que esqueceu de pagar sem perder a amizade e com total educação. A IA encontra as palavras certas para cada situação.' },
          { title: 'Transformando feedback em marketing', content: 'Pegue os elogios dos clientes e peça para a IA transformar em depoimentos para o seu marketing. Um bom feedback vira conteúdo.' },
          { title: 'Pós-venda', content: 'Scripts para perguntar se a pessoa gostou do produto e oferecer uma nova compra. A fidelização começa depois da venda.' },
        ],
      },
      {
        title: 'Por vertical',
        sections: [
          { title: 'Beleza — Lembrete de retorno', content: 'A Maria te lembra de mandar uma mensagem 15 dias depois do serviço: "Olá, como estão suas unhas? Vamos garantir seu horário da semana que vem?" Isso mantém sua agenda cheia e a cliente fiel.' },
          { title: 'Alimentação — Pesquisa de satisfação', content: '"Seu lanche chegou certinho? De 0 a 10, como estava o sabor?" A IA resume os feedbacks para você melhorar o tempero e identificar os pratos mais amados.' },
          { title: 'Serviços — Comprovante profissional', content: '"Serviço finalizado. Aqui está seu comprovante e a garantia de 90 dias. Se precisar, é só chamar." Isso gera confiança, reduz retrabalho e evita questionamentos futuros.' },
          { title: 'Tecnologia — Relatório de valor', content: 'Envie um resumo gerado por IA do que foi feito no computador ou no sistema da pessoa. Isso gera valor percebido, justifica seu preço e documenta seu trabalho.' },
        ],
      },
    ],
    color: 'yellow',
  },
  {
    id: 'proximo-nivel',
    icon: Rocket,
    number: '06',
    title: 'O próximo nível',
    subtitle: 'Crescendo o negócio com IA',
    description: 'A IA abre portas. Aqui a gente olha para o que vem por aí e como você pode ganhar mais usando a tecnologia.',
    blocks: [
      {
        title: 'Estratégias de crescimento',
        sections: [
          { title: 'Identificando oportunidades', content: 'Use a IA para descobrir tendências. "O que as pessoas mais estão comprando no setor de [seu ramo] este ano?" Informação vira vantagem competitiva.' },
          { title: 'Criando novos serviços', content: 'Como a IA pode te ajudar a oferecer algo novo: um guia digital, um plano de assinatura, uma consultoria. Diversifique sua renda com o que você já sabe fazer.' },
          { title: 'Aprendizado acelerado', content: 'Quer aprender a mexer numa planilha ou numa rede social nova? A IA te ensina passo a passo como se fosse uma pessoa professora particular, no seu ritmo.' },
          { title: 'Escalando sem contratar', content: 'Como a tecnologia permite que você atenda o triplo de pessoas sem precisar aumentar sua equipe agora. Automatize o repetitivo e foque no que realmente importa.' },
        ],
      },
      {
        title: 'Por vertical',
        sections: [
          { title: 'Beleza — Lucratividade', content: 'Use a IA para analisar quais serviços dão mais lucro e quais só tomam tempo. Foque no que traz retorno. Descubra quanto cada procedimento realmente rende por hora trabalhada.' },
          { title: 'Alimentação — Programa de fidelidade', content: 'Crie um programa de fidelidade com ajuda da IA: "Junte 10 selos virtuais e ganhe uma bebida". A IA gerencia os nomes, as regras e as mensagens automáticas para os participantes.' },
          { title: 'Serviços — Google Meu Negócio', content: 'Como se cadastrar corretamente usando as palavras que os clientes mais buscam: "Eletricista 24 horas na [sua cidade]". A IA te ajuda com a descrição, os serviços listados e as respostas a avaliações.' },
          { title: 'Tecnologia — Automação de processos', content: 'Use a IA para responder dúvidas básicas dos clientes enquanto você está focado no código ou na montagem. Automatize o repetitivo e concentre-se no que exige sua especialidade.' },
        ],
      },
    ],
    color: 'blue',
  },
];

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

      {/* ── Resumo dos Módulos ── */}
      <section className="py-24 px-6 bg-[#0F1535]/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-4">
            Resumo dos módulos
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

      {/* ── Trilhas de Aprendizado ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white/90 mb-4">
            Trilhas de aprendizado
          </h2>
          <p className="text-center text-[#9DA1B4] text-lg mb-16 max-w-2xl mx-auto">
            Cada trilha tem conteúdo detalhado com exemplos práticos para o seu tipo de negócio.
          </p>

          <div className="space-y-12">
            {TRILHAS_DETALHADAS.map((trilha) => {
              const c = COLORS[trilha.color];
              return (
                <div
                  key={trilha.id}
                  id={trilha.id}
                  className={`rounded-2xl border ${c.border} ${c.bg} p-8 md:p-10 scroll-mt-24`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <span className={`text-5xl font-bold ${c.text} opacity-40`}>
                      {trilha.number}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <trilha.icon className={`w-8 h-8 ${c.text}`} />
                        <h3 className="text-2xl font-semibold text-white/90">
                          {trilha.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#4D5274] font-mono mb-3">{trilha.subtitle}</p>
                      <p className="text-[#9DA1B4] leading-relaxed">{trilha.description}</p>
                    </div>
                  </div>

                  {/* Blocks */}
                  <div className="space-y-8 mt-8">
                    {trilha.blocks.map((block, bi) => (
                      <div key={bi} className="bg-[#0A0E1A]/40 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${c.accent}`} />
                          {block.title}
                        </h4>
                        <div className="space-y-4">
                          {block.sections.map((section, si) => (
                            <div key={si} className="pl-4 border-l-2 border-[#252B54]">
                              <p className="text-sm font-medium text-white/80 mb-1">
                                {section.title}
                              </p>
                              <p className="text-sm text-[#9DA1B4] leading-relaxed">
                                {section.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    <Link
                      href={`https://wa.me/5511999999999?text=Oi%20Maria%21%20Quero%20fazer%20a%20trilha%20${encodeURIComponent(trilha.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${c.border} ${c.text} text-sm font-medium hover:bg-[#1A2150]/50 transition-colors`}
                    >
                      Quero fazer esta trilha
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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