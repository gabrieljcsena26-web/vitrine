# Vitrine Launch E2E Runbook

Este arquivo e o roteiro final para colocar o projeto no ar com o menor risco possivel.

## Estado atual

- Build de producao local: OK
- Lint: OK
- Login com mascote interativo: OK
- Edicao rapida da landing pelo dashboard: OK
- Preview IA: OK com fallback local, sem redirecionar para login, e modo real quando OpenAI estiver configurada
- Deploy automatico GitHub > Vercel: OK
- Deploy manual por CLI neste ambiente: bloqueado por login da Vercel CLI
- Observacao de producao: se a URL responder 401, o deploy esta protegido por Vercel Deployment Protection/SSO e precisa ser liberado nas configuracoes do projeto

## O que publicar neste release

- Login mais interativo em [app/login/page.tsx](app/login/page.tsx)
- Edicao rapida da landing em [app/dashboard/[token]/page.tsx](app/dashboard/[token]/page.tsx)
- Salvamento de descricao, endereco, servicos, precos e fotos em [app/api/dashboard/[token]/route.ts](app/api/dashboard/[token]/route.ts)
- Diagnostico de ambiente ampliado em [app/api/diagnostics/env/route.ts](app/api/diagnostics/env/route.ts)

## Resultado E2E local desta rodada

Executado em 2026-05-06 apos o commit `5e2d982`.

| Checagem | Resultado |
| --- | --- |
| `npm run build` | OK |
| `/` local | 200 |
| `/login` local | 200 |
| `/dashboard` local | 200 |
| `/preview` local | 200 |
| `/api/diagnostics/env` local | 200 |
| Supabase local | `supabaseConnection: ok` |
| API `/api/ai/generate-page-config` sem sessao, `initial_preview` | OK, retorna fallback local em vez de mandar para login |

Diagnostico local indicou que estas variaveis nao estavam carregadas no ambiente do Codespace: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_BASE_URL`, `VITRINE_CUSTOMER_SESSION_SECRET`, `OPENAI_API_KEY`, `OPENAI_VISION_MODEL`, Stripe e `CRON_SECRET`. Isso nao prova que faltam na Vercel, mas se faltarem em Production causam exatamente estes sintomas:

- `VITRINE_CUSTOMER_SESSION_SECRET` ausente: login pode nao persistir corretamente entre deploys/ambientes.
- `OPENAI_API_KEY` ausente: a IA usa fallback local e nao interpreta fotos de verdade.
- `NEXT_PUBLIC_BASE_URL` ausente: emails, links e callbacks podem sair com dominio errado.
- Stripe ausente: checkout/billing nao abre em producao.
- Resend ausente: emails de verificacao/boas-vindas/relatorio nao saem.

## Variaveis de ambiente para Vercel

Cadastre todas em Settings > Environment Variables.

### Obrigatorias

| Name | Value | Onde obter |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | https://SEU-PROJETO.supabase.co | Supabase > Project Settings > API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | sua anon key | Supabase > Project Settings > API |
| SUPABASE_SERVICE_ROLE_KEY | sua service role key | Supabase > Project Settings > API |
| NEXT_PUBLIC_BASE_URL | https://SEU-DOMINIO.com | Seu dominio final ou URL .vercel.app de producao |
| SUPABASE_STORAGE_BUCKET | business-photos | Bucket publico criado no Supabase Storage |
| RESEND_API_KEY | re_xxxxx | Resend > API Keys |
| RESEND_FROM_EMAIL | Vitrine <noreply@SEU-DOMINIO.com> | Sender verificado no Resend |
| VITRINE_CUSTOMER_SESSION_SECRET | string aleatoria longa, minimo 32 caracteres | Gere manualmente |

### Admin e painel interno

| Name | Value | Onde obter |
| --- | --- | --- |
| VITRINE_OWNER_PASSWORD | senha forte com 12+ caracteres | Definida por voce |
| VITRINE_OWNER_SESSION_SECRET | string aleatoria longa, minimo 32 caracteres | Gere manualmente |
| VITRINE_OWNER_SETUP_CODE | codigo temporario, ex: 824193 | Opcional, use so no primeiro setup |

Observacao:
Use VITRINE_OWNER_SETUP_CODE so na primeira configuracao do /admin. Depois remova essa variavel e redeploy.

### Billing com Stripe

| Name | Value | Onde obter |
| --- | --- | --- |
| STRIPE_SECRET_KEY | sk_live_xxxxx | Stripe Dashboard |
| STRIPE_WEBHOOK_SECRET | whsec_xxxxx | Stripe > Webhooks |
| STRIPE_STARTER_PRICE_ID | price_xxxxx | Stripe > Products |
| STRIPE_PRO_PRICE_ID | price_xxxxx | Stripe > Products |

### IA

| Name | Value | Onde obter |
| --- | --- | --- |
| OPENAI_API_KEY | sk-proj-xxxxx | OpenAI |
| OPENAI_VISION_MODEL | gpt-5.5 | Pode manter este valor |

Se OPENAI_API_KEY nao existir, a previa IA continua funcionando em fallback local, mas sem interpretacao real das fotos.

### Cron e automacoes

| Name | Value | Onde obter |
| --- | --- | --- |
| CRON_SECRET | string aleatoria longa | Gere manualmente |

## Valores recomendados prontos para copiar

Troque apenas os placeholders:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_a_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=cole_a_service_role_key_aqui
NEXT_PUBLIC_BASE_URL=https://SEU-DOMINIO.com
SUPABASE_STORAGE_BUCKET=business-photos
RESEND_API_KEY=cole_a_resend_api_key_aqui
RESEND_FROM_EMAIL=Vitrine <noreply@SEU-DOMINIO.com>
VITRINE_CUSTOMER_SESSION_SECRET=troque-por-uma-chave-muito-longa-e-aleatoria
VITRINE_OWNER_PASSWORD=troque-por-uma-senha-forte-de-admin
VITRINE_OWNER_SESSION_SECRET=troque-por-outra-chave-muito-longa-e-aleatoria
VITRINE_OWNER_SETUP_CODE=824193
STRIPE_SECRET_KEY=cole_a_stripe_secret_key_aqui
STRIPE_WEBHOOK_SECRET=cole_a_stripe_webhook_secret_aqui
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
OPENAI_API_KEY=cole_a_openai_api_key_aqui
OPENAI_VISION_MODEL=gpt-5.5
CRON_SECRET=troque-por-uma-chave-muito-longa-e-aleatoria
```

## Preparacao no Supabase

1. Abra o SQL Editor do Supabase.
2. Rode inteiro o arquivo [supabase-schema.sql](supabase-schema.sql).
3. Confirme que existem as tabelas:
   - businesses
   - leads
   - page_views
   - channels
   - owner_accounts
   - email_reports
   - dev_settings
   - customers
   - subscriptions
   - business_assets
   - business_page_configs
   - ai_generation_logs
   - menu_items
   - google_places_connections
4. Crie um bucket publico chamado business-photos.

## Preparacao no Stripe

1. Crie o produto Starter.
2. Crie o produto Pro.
3. Copie os dois price IDs.
4. Crie um webhook para:
   - https://SEU-DOMINIO.com/api/billing/webhook
5. Habilite pelo menos os eventos de checkout e subscription update/delete.
6. Copie o signing secret para STRIPE_WEBHOOK_SECRET.

## Preparacao no Resend

1. Verifique o dominio de envio.
2. Crie ou use um sender autorizado.
3. Coloque o sender em RESEND_FROM_EMAIL.
4. Teste envio real para um email externo, nao so para o email dono do projeto.

## Preparacao no Vercel

1. Abra o projeto no Vercel.
2. Confira se o Root Directory esta na raiz do repositorio.
3. Confira:
   - Framework: Next.js
   - Install Command: npm install
   - Build Command: npm run build
   - Output Directory: .next
4. Cadastre todas as variaveis em Production.
5. Repita as principais em Preview se quiser validar antes da producao.

## Ordem correta de deploy

1. Garantir que o branch main contem este release.
2. Aplicar schema no Supabase.
3. Criar bucket business-photos.
4. Criar e revisar produtos/webhook no Stripe.
5. Verificar dominio no Resend.
6. Preencher variaveis no Vercel.
7. Fazer deploy em producao.
8. Abrir o endpoint de diagnostico:
   - /api/diagnostics/env
9. Confirmar que todos os booleans principais estao true.
10. Testar os fluxos E2E abaixo.

## E2E de lancamento

### Fluxo 1: homepage e onboarding

1. Abrir /
2. Confirmar carregamento da homepage
3. Abrir /dashboard
4. Confirmar que o setup abre e a previa IA pode ser testada sem sessao
5. Criar conta nova em /login
6. Confirmar email/codigo
7. Voltar para /dashboard
8. Criar landing com nome, categoria, descricao e fotos
9. Clicar em previa IA
10. Confirmar que a previa abre sem erro

### Fluxo 2: login e dashboard

1. Abrir /login
2. Confirmar que o mascote responde ao mouse
3. Focar senha e confirmar que o robo cobre os olhos com as maos
4. Fazer login com conta valida
5. Confirmar abertura do dashboard certo
6. Abrir menu de tres pontos
7. Editar descricao
8. Editar um preco
9. Trocar ou adicionar uma foto
10. Salvar e abrir a landing publica para confirmar a mudanca

### Fluxo 3: landing publica

1. Abrir /p/slug-real
2. Confirmar hero, descricao, servicos e galeria
3. Clicar em WhatsApp ou booking se existirem
4. Confirmar que o CTA responde
5. Verificar se o track de visita e CTA entra no dashboard

### Fluxo 4: billing

1. Abrir /billing
2. Selecionar plano
3. Confirmar ida para Stripe Checkout
4. Finalizar pagamento de teste
5. Verificar webhook
6. Voltar para /billing/success
7. Confirmar atualizacao de status e email de boas-vindas

### Fluxo 5: cron e relatorios

1. Chamar /api/cron/feedback-email com Bearer CRON_SECRET
2. Confirmar resposta 200
3. Confirmar email recebido
4. Confirmar que email_reports evita duplicacao indevida

## Smoke test rapido depois do deploy

Checar manualmente:

- /
- /login
- /dashboard
- /billing
- /admin
- /api/diagnostics/env

Esperado:

- Paginas publicas: 200
- Dashboard sem sessao: redirect controlado para login
- Diagnostics: ok true e supabaseConnection ok

## Como confirmar que a IA real esta ligada

1. Abra /api/diagnostics/env
2. Confirme OPENAI_API_KEY true
3. Gere uma previa com fotos reais
4. Verifique se o retorno da previa marca source como gpt_vision em vez de local_preview_logic

## Como confirmar que este release entrou no ar

1. Abra /login e confirme o robo interativo
2. Abra um dashboard de cliente
3. Confirme o menu de tres pontos no topo da landing
4. Edite um preco e salve
5. Reabra a pagina publica e confirme a alteracao

## Bloqueio atual deste ambiente

O deploy automatico pelo GitHub esta funcionando, mas o deploy manual pela Vercel CLI neste Codespace pede login por device code. Se quiser usar CLI aqui, rode `npx vercel login` e autentique no navegador. Enquanto isso, o fluxo profissional recomendado e manter GitHub > Vercel ativo e acompanhar o deploy pelo status do commit.

Se a URL `.vercel.app` abrir com 401, nao e erro do app: e protecao de acesso da Vercel. Para o publico ver a landing, desative em Vercel > Project > Settings > Deployment Protection ou configure o dominio publico em Production.