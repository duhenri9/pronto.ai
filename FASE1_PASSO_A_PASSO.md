# Fase 1 — Provisionar Infraestrutura Externa (Passo a Passo)

## 🎯 Objetivo
Criar contas em 6 serviços externos, gerar credenciais e coletar tudo pra usar nas Fases 2 e 3.

---

## 1️⃣ NEON (Postgres em Produção)

### Passo 1.1: Criar Conta
1. Acesse: https://console.neon.tech
2. Sign up com email pessoal
3. Escolha a região: **sa-east-1 (São Paulo)**

### Passo 1.2: Criar Projeto e Banco
1. Na dashboard, clique em "New Project"
2. Nome: `pronto-ia` ou similar
3. Região: **São Paulo (sa-east-1)** ✅
4. Clique em "Create Project"

### Passo 1.3: Obter Connection String
1. Na dashboard do projeto, vá para "Connection strings"
2. Copie a string **Prisma** ou **PostgreSQL**
3. Deve parecer com: `postgresql://user:password@ep-xxx.sa-east-1.aws.neon.tech/pronto_ia?sslmode=require`

### 📝 O que coletar:
```
NEON_DATABASE_URL = postgresql://...
```

---

## 2️⃣ UPSTASH (Redis em Produção)

### Passo 2.1: Criar Conta
1. Acesse: https://console.upstash.com
2. Sign up com email pessoal

### Passo 2.2: Criar Redis Database
1. Clique em "Create Database"
2. Nome: `pronto-ia-redis` ou similar
3. Região: **sa-east-1 (São Paulo)**
4. Plano: **Free** (até 10k comandos/dia)

### Passo 2.3: Obter Connection String
1. Após criar, copie a "Redis CLI URL" ou "Rest URL"
2. Deve parecer com: `redis://default:password@hostname:port`

### 📝 O que coletar:
```
UPSTASH_REDIS_URL = redis://default:...
```

---

## 3️⃣ ANTHROPIC (API Key + Startup Credits)

### Passo 3.1: Criar Conta
1. Acesse: https://console.anthropic.com
2. Sign up com email pessoal
3. Confirme o email

### Passo 3.2: Gerar API Key
1. Na dashboard, vá para "API Keys"
2. Clique em "Create Key"
3. Copie a chave gerada (pareça com: `sk-ant-...`)

### Passo 3.3: Solicitar Startup Credits (Opcional, mas recomendado)
1. Vá para "Billing" → "Credits"
2. Clique em "Request startup credits"
3. Preencha o formulário com:
   - **Company**: Pronto.IA
   - **Use case**: AI-powered WhatsApp tutor for education
   - **Expected spend**: $1k-$5k tier
4. Aguarde aprovação (geralmente 2-5 dias)

### 📝 O que coletar:
```
ANTHROPIC_API_KEY = sk-ant-...
```

---

## 4️⃣ Z-API (Instância WhatsApp)

### Passo 4.1: Criar Conta
1. Acesse: https://www.z-api.io
2. Sign up com email pessoal
3. Confirme o email

### Passo 4.2: Criar Instância
1. Na dashboard, clique em "Nova Instância"
2. Nomeie: `pronto-ia` ou similar
3. Selecione: **Mensagens** (não é Zapier)
4. Clique em "Criar Instância"

### Passo 4.3: Obter Credenciais
1. Na página da instância, copie:
   - **Instance ID**
   - **API Token** (ou gere um novo em Settings)
   - **Security Token** (em Settings → Segurança)

### Passo 4.4: Número de Teste (Importante!)
1. Você receberá um número de WhatsApp para testar
2. Salve esse número — vai usar na Fase 5 pra testar o fluxo

### 💰 Custo
- **R$ 99/mês** (primeira instância)
- Ilimitado depois

### 📝 O que coletar:
```
ZAPI_INSTANCE_ID = instance_xxx
ZAPI_TOKEN = token_xxx
ZAPI_SECURITY_TOKEN = security_token_xxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN = (gere um UUID aleatório, ex: uuid -v4)
```

---

## 5️⃣ RESEND (Email Transacional)

### Passo 5.1: Criar Conta
1. Acesse: https://resend.com
2. Sign up com email pessoal
3. Confirme o email

### Passo 5.2: Gerar API Key
1. Na dashboard, vá para "API Keys"
2. Clique em "Create API Key"
3. Nome: `pronto-ia` ou similar
4. Copie a chave (pareça com: `re_...`)

### Passo 5.3: Adicionar Domain (Opcional para Produção)
- Por agora, pode deixar como está (usa `onboarding@resend.dev`)
- Em produção, configure seu próprio domínio

### 💰 Custo
- **Gratuito**: até 3k emails/mês
- Suficiente pra MVP

### 📝 O que coletar:
```
RESEND_API_KEY = re_...
```

---

## 6️⃣ SENTRY (Observabilidade e Erros)

### Passo 6.1: Criar Conta
1. Acesse: https://sentry.io
2. Sign up com email pessoal
3. Confirme o email

### Passo 6.2: Criar Projeto
1. Na dashboard, clique em "Create Project"
2. Plataforma: **Next.js**
3. Nome: `pronto-ia-web`
4. Clique em "Create Project"

### Passo 6.3: Obter DSN
1. Após criar, copie o **DSN** (pareça com: `https://key@sentry.io/xxxxx`)
2. Salve para depois

### Passo 6.4: Criar Segundo Projeto (Worker)
1. Repita os passos 6.2-6.3 mas escolha **Node.js**
2. Nome: `pronto-ia-worker`

### 💰 Custo
- **Free tier**: até 5k eventos/mês
- Suficiente pra MVP

### 📝 O que coletar:
```
NEXT_PUBLIC_SENTRY_DSN = https://key@sentry.io/xxxxx (web)
SENTRY_DSN = https://key@sentry.io/xxxxx (worker)
SENTRY_AUTH_TOKEN = sntrys_eyJ... (gere em Settings → Auth Tokens)
```

---

## 📋 Checklist — O que Você Precisa Entregar

Após completar os 6 serviços, você deve ter coletado:

```
# 1. NEON (Postgres)
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.sa-east-1.aws.neon.tech/pronto_ia?sslmode=require

# 2. UPSTASH (Redis)
UPSTASH_REDIS_URL=redis://default:password@host:port

# 3. ANTHROPIC (API)
ANTHROPIC_API_KEY=sk-ant-...

# 4. Z-API (WhatsApp)
ZAPI_INSTANCE_ID=instance_xxx
ZAPI_TOKEN=token_xxx
ZAPI_SECURITY_TOKEN=security_token_xxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<uuid-aleatorio>
WHATSAPP_NUMERO_TESTE=5511999999999 (seu número de teste Z-API)

# 5. RESEND (Email)
RESEND_API_KEY=re_...

# 6. SENTRY (Observabilidade)
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/xxxxx (web)
SENTRY_DSN=https://key@sentry.io/xxxxx (worker)
SENTRY_AUTH_TOKEN=sntrys_eyJ...
```

---

## ⚠️ Observações Importantes

1. **Z-API é o serviço mais caro** (R$ 99/mês)
   - Os outros são gratuitos ou free-tier inicialmente
   - Total mensal: ~R$ 150-200 (Z-API + overhead)

2. **Neon tem limite free**
   - 0.5 GB de storage
   - Suficiente pra MVP e testes
   - Se passar, paga ~$0.16/GB

3. **IMPORTANTE**: Salve todos esses tokens num lugar seguro!
   - Nunca commite no GitHub
   - Use `.env` local ou secret manager

4. **Z-API número de teste**
   - Você receberá um número pra testar
   - Use esse número na Fase 5 pra validar o fluxo

---

## 🎯 Próximos Passos

Após coletar tudo, volte aqui e me entregue:
1. Todas as variáveis de ambiente acima
2. Confirme que todas as contas estão criadas
3. Pronto pra Fase 2 (Deploy do Worker no Railway)

---

## ⏱️ Tempo Estimado
- **Neon**: 5 minutos
- **Upstash**: 5 minutos
- **Anthropic**: 5 minutos (+ tempo de aprovação de credits)
- **Z-API**: 10 minutos (+ R$ 99)
- **Resend**: 5 minutos
- **Sentry**: 10 minutos

**Total**: ~40 minutos (sem contar aprovação do Anthropic)

