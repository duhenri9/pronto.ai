# ⚡ RAILWAY PASSO 3 — Adicionar Variáveis de Ambiente (Guia Rápido)

## 🎯 O que Fazer

Adicionar 16 variáveis de ambiente no dashboard do Railway para que o Worker consiga acessar banco, Redis, APIs, etc.

---

## 📋 Variáveis Prontas para Copiar/Colar

Abaixo estão as **16 variáveis exatamente como devem ser adicionadas**:

### **Bloco 1: Banco de Dados**
```
DATABASE_URL=postgresql://neondb_owner:npg_0YVfcmXG5syU@ep-dark-sunset-ac7rlt0n-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### **Bloco 2: Redis**
```
REDIS_URL=redis://default:gQAAAAAAAbm_AAIgcDE4YzFjZDZmNmMyYjM0ZGQ3YTNiMzUwMjRlNGIwZTIxMQ@humane-cod-113087.upstash.io:6379
```

### **Bloco 3: APIs Externas**
```
ANTHROPIC_API_KEY=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

RESEND_API_KEY=re_Kb1ghC1f_Q5MYDthQrxEsh9MC4CW1qA4r
```

### **Bloco 4: WhatsApp (Z-API)**
```
WHATSAPP_PROVIDER=zapi

ZAPI_INSTANCE_ID=instance_3F284FBBE1B4B168A54306AF8374E24E

ZAPI_TOKEN=token_80B23ED013EA71A5409AB593

ZAPI_SECURITY_TOKEN=security_token_F0d1170c89ff2448187cff7d1ef9de543S

WHATSAPP_WEBHOOK_VERIFY_TOKEN=B19701F1AA4E28B1E3380C3A
```

### **Bloco 5: Segurança**
```
JWT_SECRET=devsecret

COOKIE_SECRET=devcookie

ADMIN_SECRET=devadmin
```

### **Bloco 6: Monitoramento (Sentry)**
```
SENTRY_DSN=https://b9ac9fd4406f94bd5e041a563f3af610@o4510347010768896.ingest.us.sentry.io/4511320432246784

SENTRY_AUTH_TOKEN=sntrys_placeholder
```

### **Bloco 7: Produção**
```
NODE_ENV=production

NEXT_PUBLIC_BASE_URL=https://pronto-ia.vercel.app
```

---

## 🖥️ COMO ADICIONAR NO RAILWAY (Passo a Passo)

### **Passo A: Acessar Variables**

1. Vá para: https://railway.app
2. Login na sua conta
3. Clique no projeto: **`pronto.ia`**
4. Clique no serviço: **`pronto-ia`** (ou similar)
5. Na barra lateral, clique em: **"Variables"**

### **Passo B: Adicionar Variáveis Manualmente (Recomendado)**

**Opção 1: Uma por uma (mais seguro)**

Para cada variável acima:
1. Clique em: **"New Variable"** ou **"Add Variable"**
2. Cole a variável exatamente (ex: `DATABASE_URL=postgresql://...`)
3. Clique em "Save" ou "Add"
4. Repita para cada uma das 16 variáveis

**Opção 2: Todas de uma vez (se Railway permitir)**

1. Clique em: **"Import from file"** ou **"Paste"**
2. Cole todas as variáveis abaixo (formato `.env`):

```env
DATABASE_URL=postgresql://neondb_owner:npg_0YVfcmXG5syU@ep-dark-sunset-ac7rlt0n-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
REDIS_URL=redis://default:gQAAAAAAAbm_AAIgcDE4YzFjZDZmNmMyYjM0ZGQ3YTNiMzUwMjRlNGIwZTIxMQ@humane-cod-113087.upstash.io:6379
ANTHROPIC_API_KEY=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
RESEND_API_KEY=re_Kb1ghC1f_Q5MYDthQrxEsh9MC4CW1qA4r
WHATSAPP_PROVIDER=zapi
ZAPI_INSTANCE_ID=instance_3F284FBBE1B4B168A54306AF8374E24E
ZAPI_TOKEN=token_80B23ED013EA71A5409AB593
ZAPI_SECURITY_TOKEN=security_token_F0d1170c89ff2448187cff7d1ef9de543S
WHATSAPP_WEBHOOK_VERIFY_TOKEN=B19701F1AA4E28B1E3380C3A
JWT_SECRET=devsecret
COOKIE_SECRET=devcookie
ADMIN_SECRET=devadmin
SENTRY_DSN=https://b9ac9fd4406f94bd5e041a563f3af610@o4510347010768896.ingest.us.sentry.io/4511320432246784
SENTRY_AUTH_TOKEN=sntrys_placeholder
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://pronto-ia.vercel.app
```

3. Clique "Import" ou "Save"

### **Passo C: Verificar Adição**

1. Você deve ver todas as 16 variáveis listadas
2. Não deve haver nenhuma com valor vazio ou vermelho
3. Status deve ser "✅ Active" ou similar

### **Passo D: Deploy**

1. Na página do serviço, clique em **"Deploy"** ou **"Redeploy"**
2. Railway vai reiniciar o serviço com as novas variáveis
3. Acompanhe os logs para confirmar que conectou ao banco

---

## ✅ Checklist Final

- [ ] Acessei Variables no Railway
- [ ] Adicionei as 16 variáveis (ou colei todas de uma vez)
- [ ] Verifiquei que todas estão presentes
- [ ] Cliquei em "Deploy" ou "Redeploy"
- [ ] Acompanhei os logs
- [ ] Logs mostram "Connected to database" ou similar (sem erros)

---

## 🚀 Próximo Passo

Após confirmar que o Worker está rodando com as variáveis:
→ **Fase 3**: Deploy do Frontend no Vercel (30 minutos)

---

## ⏱️ Tempo Estimado
- **Adicionar variáveis**: 5 minutos (manual) ou 1 minuto (paste)
- **Deploy**: 5 minutos
- **Validar logs**: 2 minutos

**Total**: ~10 minutos

