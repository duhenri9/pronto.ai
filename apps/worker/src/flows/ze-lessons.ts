// ============================================
// PRONTO.IA — Zé da TI Lesson Content (Sprint 3)
// ============================================
// 7 microcápsulas de fundação digital.
// Per spec: cada lição tem lessonId, title, body (máx 500 chars), cta.
// Stored as structured data for the worker scheduler
// to deliver via ZE_01 template.

export interface ZeLesson {
  lessonId: string;
  dayNumber: number;
  title: string;
  body: string;
  cta: string;
}

export const ZE_LESSONS: ZeLesson[] = [
  {
    lessonId: 'ZE-L01',
    dayNumber: 1,
    title: 'Por que aparecer no Google muda seu negócio',
    body: 'Quando alguém procura "eletricista perto de mim" no Google, o que aparece são os negócios cadastrados no Google Meu Negócio. Se você não tá lá, você não existe pra essa pessoa. É de graça, leva 15 minutos, e funciona 24h por dia por você.',
    cta: 'Você já ouviu falar do Google Meu Negócio? Me conta se já tentou cadastrar.',
  },
  {
    lessonId: 'ZE-L02',
    dayNumber: 2,
    title: 'Configurando seu Google Meu Negócio em 15 minutos',
    body: 'Baixa o app "Google Meu Negócio". Cria a conta com seu número de WhatsApp. Preenche: nome do negócio, endereço, horário, telefone. Confirma o endereço pelo correio ou por vídeo. Não tem segredo não — é preencher campo por campo.',
    cta: 'Vai lá e cria sua ficha agora. Me diz quando terminar que eu confiro com você.',
  },
  {
    lessonId: 'ZE-L03',
    dayNumber: 3,
    title: 'WhatsApp Business: catálogo, mensagens automáticas, perfil',
    body: 'Se você ainda usa WhatsApp normal pra atender cliente, tá perdendo tempo. O WhatsApp Business é de graça e tem: catálogo de serviços, mensagem de ausência, resposta rápida e perfil profissional. Passa devagar comigo — cada função a gente configura na hora.',
    cta: 'Você já usa WhatsApp Business ou tá no normal? Me fala que eu te guio na troca.',
  },
  {
    lessonId: 'ZE-L04',
    dayNumber: 4,
    title: 'Foto profissional com celular: regras simples',
    body: 'Não precisa de câmera cara. Regras: luz natural (perto da janela), fundo limpo, rosto na altura dos olhos de quem tá vendo. Pra foto de produto ou serviço: objeto centralizado, fundo claro, sem bagunça atrás. Isso aqui é mais fácil do que parece.',
    cta: 'Tira uma foto do seu espaço de trabalho agora com essas regras e me manda. Eu te digo se tá boa.',
  },
  {
    lessonId: 'ZE-L05',
    dayNumber: 5,
    title: 'Bio.site ou Linktree: seu link único',
    body: 'Sabe quando você quer mandar seu WhatsApp, Instagram e Google Meu Negócio pra um cliente e fica mandando 3 links? Um bio.site ou Linktree junta tudo num link só. Você põe na bio do Instagram e pronto — cliente acha tudo num clique.',
    cta: 'Acessa bio.site e cria o seu. Me manda o link quando pronto que eu dou uma olhada.',
  },
  {
    lessonId: 'ZE-L06',
    dayNumber: 6,
    title: 'Segurança digital: senha forte, 2FA, golpes do Pix',
    body: 'Regra 1: senha diferente pra cada coisa. Pode anotar num caderno — na boa, caderno é mais seguro que senha 123456. Regra 2: ativa verificação em dois passos no email e no WhatsApp. Regra 3: se alguém pede Pix "pra liberar cadastro", é golpe. Ninguém do Google liga pedindo Pix.',
    cta: 'Qual é sua senha mais usada? Se for "123456" ou seu nome, a gente troca agora.',
  },
  {
    lessonId: 'ZE-L07',
    dayNumber: 7,
    title: 'Respondendo review: o que falar e o que evitar',
    body: 'Review bom: agradece pelo carinho e cita o serviço ("Que bom que gostou da unha, volte sempre!"). Review ruim: nunca discute, nunca dá desculpa. Responde calmo: "Poxa, sinto que não foi a experiência que a gente quer. Me chama no WhatsApp pra gente resolver." Vai funcionar.',
    cta: 'Tem algum review que você não sabe como responder? Me mostra que eu te ajudo com a resposta.',
  },
];

/**
 * Returns the next Zé da TI lesson for a user based on what they've already received.
 * After ZE-L07, returns null (cycle complete).
 */
export function getNextZeLesson(completedLessonIds: string[]): ZeLesson | null {
  const completedSet = new Set(completedLessonIds);

  for (const lesson of ZE_LESSONS) {
    if (!completedSet.has(lesson.lessonId)) {
      return lesson;
    }
  }

  // All 7 lessons completed
  return null;
}

/**
 * Formats a Zé da TI lesson for delivery.
 */
export function formatZeLessonForDelivery(lesson: ZeLesson, userName: string): {
  messageText: string;
  lessonId: string;
} {
  const messageText = `E aí, ${userName}! Hoje a gente vai falar de: ${lesson.title}.\n\n${lesson.body}\n\n${lesson.cta}`;

  return {
    messageText,
    lessonId: lesson.lessonId,
  };
}
