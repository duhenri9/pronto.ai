// ============================================
// PRONTO.IA — Message Templates (Canonical)
// ============================================
// All WhatsApp messages organized by flow code.
// Maria's voice: calorosa, direta, prática.
// "Meu bem" is PROHIBITED — Maria é prima jovem, não tia.
// Maria may paraphrase, but cannot change meaning, tone or structure.

export const TEMPLATE = {
  // ============================================================
  // 3.1 Onboarding (OB-*)
  // ============================================================

  OB_01:
    'Oi! Eu sou a Maria. Antes da gente começar — pra eu poder te ajudar, preciso guardar seu nome e WhatsApp aqui comigo. Tudo bem? Você pode pedir pra eu apagar a qualquer hora, é só falar \'apaga tudo\'.',

  OB_02:
    'Sem problema! Sem você guardando comigo aqui, não consigo te ajudar de verdade. Mas se mudar de ideia, é só me chamar.',

  OB_03:
    'Boa pergunta! Eu guardo só seu nome e WhatsApp pra te reconhecer e te chamar pelo nome. Você pode apagar tudo a qualquer hora falando \'apaga tudo\'. Topa?',

  OB_04:
    'Beleza! Como você gosta de ser chamada?',

  OB_05: (name: string) =>
    `Prazer, ${name}! Me conta em duas linhas: o que você faz da vida?`,

  OB_06:
    'Aaah, salão! Adorei. Vou poder te ajudar bastante com isso.',

  OB_07: (vertical: string) =>
    `Ainda tô aprendendo a ajudar com ${vertical}. Por enquanto trabalho melhor com salão de beleza. Mas a gente pode conversar sobre IA em geral, e quando eu expandir, te aviso. Te ajuda assim?`,

  OB_08:
    'Última coisa antes da gente seguir: posso te chamar uma vez por dia com uma dica rápida de 5 minutos? Se preferir, eu fico só respondendo quando você me chamar. Como prefere?',

  OB_09:
    'Beleza! Que horário fica bom pra você? Manhã, tarde ou noite?',

  OB_10: (window: string) =>
    `Tá tudo combinado. Vou te chamar de ${window}. E quando você precisar, é só me chamar qualquer hora também.`,

  OB_11:
    'Tranquilo. Eu fico aqui quando você precisar. É só me chamar qualquer hora.',

  OB_12:
    'Como você gosta de ser chamada? Pode ser primeiro nome, apelido, como quiser.',

  OB_13: (fallbackName: string) =>
    `Beleza, ${fallbackName}! Me conta em duas linhas: o que você faz da vida?`,

  // ============================================================
  // 3.2 Camada gratuita (FREE-*)
  // ============================================================

  FREE_01: (name: string, lessonTitle: string, lessonBody: string) =>
    `Bom dia, ${name}! Hoje a gente vai falar de: ${lessonTitle}.\n\n${lessonBody}\n\nFaz sentido?`,

  FREE_02:
    'Tranquilo, sigo aqui. Quando quiser tentar aplicar, me chama.',

  FREE_03:
    'Demais! Conta como tá indo.',

  FREE_04:
    'Acontece. O que travou?',

  FREE_05: (genericAdvice: string) =>
    `Olha, isso é especialidade da Bia, mas vou te dar uma dica geral: ${genericAdvice}. Bora testar e me conta o que veio?`,

  // ============================================================
  // 3.3 Oferta Pro (PRO-*)
  // ============================================================

  PRO_01:
    'Posso te falar uma coisa?',

  PRO_02:
    'Você tá pronta pra um nível mais profundo. Tenho aqui o Pronto.IA Pro — R$ 29/mês, te dá acesso à Bia inteira, com trilha completa pro seu negócio. Pode cancelar quando quiser, sem pegadinha. Quer conhecer?',

  PRO_02_FOUNDER:
    'Você tá pronta pra um nível mais profundo. Tenho aqui o Pronto.IA Pro — R$ 29/mês. Te dá acesso à Bia inteira (e ao Zé da TI também). E olha que importante: nessa fase de lançamento, quem entra ganha esse acesso pra sempre por R$ 29. Quando a gente chegar em mil assinantes, esse benefício acaba. Quer entrar?',

  PRO_02_POST_LAUNCH:
    'Você tá pronta pra um nível mais profundo. O Pronto.IA Pro é R$ 29/mês e te dá acesso à Bia (ou outro especialista do seu negócio). Pode cancelar quando quiser, sem pegadinha. Quer conhecer?',

  PRO_03:
    'Boa! Vou gerar o link de pagamento agora. Você prefere Pix imediato? (é o único método que aceito por enquanto)',

  PRO_04:
    'Tranquilo. A gente segue do jeito que tá. Se mudar de ideia, é só me chamar.',

  PRO_05:
    'Posso te ajudar a decidir? Me fala uma dúvida que tá rolando.',

  // ============================================================
  // 3.4 Pagamento Abacate (PAY-*)
  // ============================================================

  PAY_01: (checkoutUrl: string) =>
    `Aqui o link do Pix:\n\n${checkoutUrl}\n\nAssim que receber a confirmação, libero a Bia pra você. Demora poucos segundos.`,

  PAY_02:
    'Recebi! Tá tudo certo. Agora você tem acesso à Bia.',

  PAY_02_FOUNDER:
    'Recebi! Tá tudo certo. E você acabou de garantir o acesso vitalício a todos os especialistas — atuais e futuros — pelos R$ 29/mês. Bem-vindo ao grupo founder.',

  PAY_02_PRO_SINGLE:
    'Recebi! Tá tudo certo. Agora você tem acesso à Bia.',

  PAY_03:
    'Última coisa rapidinha — pra eu te mandar o recibo, qual seu email?',

  PAY_04:
    'Hmm, esse email não tá certo. Me manda de novo?',

  PAY_05: (name: string) =>
    `Anotado! Recibo já tá indo pro seu email. Vou te apresentar a Bia agora.`,

  PAY_06: (name: string) =>
    `Bia, essa é ${name} — vai ser sua nova aluna. Toma conta dela, beleza?`,

  PAY_07:
    'O Pix de antes venceu. Quer que eu gere um novo?',

  PAY_08:
    'Algo travou no pagamento. Acontece. Quer tentar de novo?',

  PAY_09:
    'O Pix que te mandei antes expirou. Quer que eu gere um novo?',

  // ============================================================
  // 3.5 Renovação (REN-*)
  // ============================================================

  REN_01: (name: string, daysUntilExpiry: number) =>
    `${name}, antes de tudo: tua mensalidade do Pro vence em ${daysUntilExpiry} dias. Quer renovar pelo Pix? Te mando o link.`,

  REN_02:
    'Beleza, gerando o link agora.',

  REN_03:
    'Tranquilo, sem pressa. Volto a falar nisso quando estiver perto do vencimento.',

  REN_04: (expiryDate: string) =>
    `Entendi. A Bia fica disponível até ${expiryDate}. Depois disso eu continuo aqui contigo, mas a Bia some. Se mudar de ideia até lá, é só falar.`,

  REN_05:
    'Oi! Vi que tua assinatura do Pro venceu. A Bia ficou indisponível, mas eu continuo aqui contigo de graça pra sempre. Se quiser voltar pro Pro, é só pedir.',

  // ============================================================
  // 3.9 Reativação (REA-*)
  // ============================================================

  REA_01: (name: string) =>
    `${name}, que bom ter você de volta! Te mando o link de pagamento agora mesmo. R$ 29/mês, com a Bia e tudo que você já conhece. Sem pegadinha.`,

  REA_01_FOUNDER_PRESERVED: (name: string) =>
    `${name}, boa! Vou gerar o link agora. E olha, lembrando: você é founder, então continua R$ 29/mês com acesso a todos os especialistas. Promessa cumprida.`,

  // ============================================================
  // 3.6 Cancelamento (CAN-*)
  // ============================================================

  CAN_01:
    'Tem certeza? Posso cancelar agora. Antes, posso te perguntar uma coisa só? Só pra eu entender — o que aconteceu?',

  CAN_02: (expiryDate: string) =>
    `Tá feito. A Bia fica disponível até ${expiryDate}. Eu fico aqui contigo, como sempre. Se mudar de ideia, é só falar.`,

  CAN_03: (expiryDate: string) =>
    `Entendi. Tá cancelado. A Bia some a partir de ${expiryDate}. Eu fico aqui contigo, como sempre. Se mudar de ideia, é só falar.`,

  CAN_04:
    'Tranquilo, segue tudo igual. Se quiser cancelar mais pra frente, é só falar.',

  // ============================================================
  // 3.7 LGPD (LGPD-*)
  // ============================================================

  LGPD_01:
    'Tem certeza? Eu vou apagar tudo: nossas conversas, seu progresso, certificados. Não dá pra desfazer. Quer mesmo?',

  LGPD_02:
    'Tá feito. Sentirei sua falta. Se um dia voltar, é como se fosse a primeira vez.',

  LGPD_03:
    'Tranquilo, mantive tudo. Se mudar de ideia, é só falar \'apaga tudo\'.',

  // ============================================================
  // 3.8 Reconhecimento de outcome (OUT-*)
  // ============================================================

  OUT_01:
    'Caraca, que orgulho! Conta como foi.',

  OUT_02: (amount: string) =>
    `${amount}? Demais. Como conseguiu?`,

  OUT_03:
    'Cliente nova fechada? Comemora aí, você merece.',

  OUT_04:
    'Anotado aqui. Você tá no caminho certo.',

  // ============================================================
  // 3.10 Zé da TI (ZE-*)
  // ============================================================

  ZE_01:
    'E olha só, deixa eu te apresentar mais alguém. Esse é o Zé da TI, nosso especialista em fundação digital — Google Meu Negócio, WhatsApp Business, essas coisas que dão base pro resto funcionar. Como você é founder, ele já tá disponível pra você. Quer começar com ele ou com a Bia?',

  ZE_02_HANDOFF:
    'Isso aí que você tá pedindo é mais especialidade do Zé da TI. Vou chamar ele aqui pra você.',
};
