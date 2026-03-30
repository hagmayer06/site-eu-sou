# Eu Sou — Site Institucional + Área de Membros

Site da Igreja Eu Sou com área de membros protegida, autenticação via Supabase e painel administrativo.

**Stack:** Next.js 16 · Supabase (Auth + DB + Storage) · Tailwind CSS 4 · TypeScript

---

## Índice

1. [Variáveis de Ambiente](#variáveis-de-ambiente)
2. [Setup Supabase](#setup-supabase)
   - [Migrations](#migrations)
   - [Auth Providers](#auth-providers)
   - [Storage — Bucket `avatares`](#storage--bucket-avatares)
3. [Módulo Financeiro](#módulo-financeiro)
   - [Storage — Bucket `comprovantes`](#storage--bucket-comprovantes-módulo-financeiro)
   - [Edge Function `avisos-vencimento`](#edge-function-avisos-vencimento)
   - [Checklist de Deploy — Módulo Financeiro](#checklist-de-deploy--módulo-financeiro)
   - [QA Manual — Módulo Financeiro](#qa-manual--módulo-financeiro)
4. [Desenvolvimento Local](#desenvolvimento-local)
5. [Estrutura de Rotas](#estrutura-de-rotas)
6. [Checklist de Deploy](#checklist-de-deploy)
7. [Estratégia de Rollback](#estratégia-de-rollback)
8. [Monitoramento de Logs](#monitoramento-de-logs)
9. [Checklist de QA Manual](#checklist-de-qa-manual)

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (`eu-sou/`) com as seguintes variáveis:

```bash
# URL pública do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co

# Chave anônima (segura para uso no cliente)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Chave de serviço (NUNCA expor ao cliente — apenas Server Components e Route Handlers)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# URL pública do site (usada nos links dos e-mails)
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com

# Módulo Financeiro — Edge Function avisos-vencimento
RESEND_API_KEY=re_...              # Resend.com — criar em resend.com/api-keys
EMAIL_FROM=noreply@seu-dominio.com # Remetente dos avisos de vencimento
```

> **Onde encontrar:** Supabase Dashboard → Project Settings → API.
>
> Para produção (Vercel), configure as mesmas variáveis em **Project Settings → Environment Variables**.
>
> As variáveis `RESEND_API_KEY` e `EMAIL_FROM` também precisam ser configuradas nos **segredos da Edge Function** (ver seção [Edge Function `avisos-vencimento`](#edge-function-avisos-vencimento)).

---

## Setup Supabase

### Migrations

Execute as migrations no banco do projeto (local ou remoto):

```bash
# Aplicar no ambiente remoto (requer CLI do Supabase autenticado)
supabase db push

# OU aplicar localmente com Supabase rodando em Docker
supabase db reset
```

Migrations disponíveis:

| Arquivo | O que cria |
|---|---|
| `20260329000000_criar_perfis_rbac.sql` | Tabela `perfis`, trigger de criação automática, RLS (membro vê/edita apenas o próprio perfil; pastor/tesoureiro leem todos) |

**Trigger:** ao registrar um novo usuário via Supabase Auth, o campo `nome` é preenchido automaticamente a partir de `raw_user_meta_data->>'full_name'` (ou o e-mail como fallback).

### Auth Providers

#### E-mail + Senha
Habilitado por padrão. Configurações relevantes no `supabase/config.toml`:
- `enable_confirmations = false` (dev) — altere para `true` em produção
- `minimum_password_length = 6`

#### Magic Link (OTP por e-mail)
Usa o mesmo fluxo de e-mail do Supabase. Em produção, configure um SMTP real:

```toml
# supabase/config.toml
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
admin_email = "noreply@seuprojeto.com"
sender_name = "Igreja Eu Sou"
```

#### Google OAuth
1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
2. Ative a **Google Identity API**
3. Crie credenciais OAuth 2.0 (Web Application) com as origens autorizadas:
   - `https://<project-ref>.supabase.co`
   - `https://seu-dominio.com`
4. URIs de redirecionamento autorizados:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
5. No Supabase Dashboard → Authentication → Providers → Google: cole o **Client ID** e **Client Secret**
6. Em produção, adicione `https://seu-dominio.com/auth/callback` à lista de Redirect URLs permitidas (Supabase Dashboard → Authentication → URL Configuration)

#### Recuperação de Senha
Usa o mesmo provedor de e-mail. O link de redefinição aponta para `/auth/callback?next=/membro/alterar-senha`.

### Storage — Bucket `comprovantes` (módulo financeiro)

Bucket **privado** para comprovantes de pagamento Pix enviados por membros. Acesso exclusivo via service role (Route Handlers server-side).

**Via SQL (migration já inclui):** executado automaticamente em `supabase db push` / `db reset`.

**Criar manualmente via Dashboard (se necessário):**
1. Supabase Dashboard → Storage → New Bucket
2. Nome: `comprovantes`
3. Public bucket: **desabilitado**
4. File size limit: `10485760` (10 MB)
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif, application/pdf`

**RLS de storage** (já incluída na migration):
- Membro autenticado: upload apenas na própria pasta (`{userId}/...`)
- Service role: acesso total (usado pelos Route Handlers)

---

---

## Módulo Financeiro

O módulo financeiro permite ao tesoureiro e pastor gerenciar entradas, saídas, categorias e comprovantes da Igreja. Conferentes têm acesso restrito ao próprio grupo celular.

### Rotas do módulo

| Rota | Acesso | Descrição |
|---|---|---|
| `/admin/financeiro` | Pastor / Tesoureiro / Conferente | Dashboard (KPIs + gráficos) |
| `/admin/financeiro/entradas` | Pastor / Tesoureiro / Conferente | Lançar e listar entradas |
| `/admin/financeiro/saidas` | Pastor / Tesoureiro / Conferente | Lançar e listar saídas |
| `/admin/financeiro/comprovantes` | Pastor / Tesoureiro | Confirmar comprovantes pendentes |
| `/admin/financeiro/relatorios` | Pastor / Tesoureiro | Exportar relatórios CSV |
| `/admin/financeiro/configuracoes` | Pastor / Tesoureiro | Categorias e dados da igreja |

### Storage — Bucket `comprovantes` (módulo financeiro)

Bucket **privado** para comprovantes de pagamento Pix enviados por membros.

**Criado automaticamente pela migration `20260329160215_criar_financeiro.sql`.** Não é necessária configuração manual se a migration foi aplicada.

**Criar manualmente (se necessário):**

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprovantes', 'comprovantes', false, 10485760,
  array['image/jpeg','image/png','image/webp','image/gif','application/pdf']
);

-- Membro sobe comprovante na própria pasta
create policy "comprovantes_upload_proprio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'comprovantes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role acessa tudo (Route Handlers)
create policy "comprovantes_service_role"
  on storage.objects for all to service_role
  using (bucket_id = 'comprovantes');
```

### Edge Function `avisos-vencimento`

Envia e-mail diário ao(s) tesoureiro(s) listando lançamentos pendentes que vencem em 3 dias.

**Cron:** `0 11 * * *` (11h UTC = 08h BRT)

#### Pré-requisitos

1. Conta na [Resend](https://resend.com) com domínio verificado
2. Variáveis configuradas como segredos da Edge Function

#### Configurar segredos no Supabase

```bash
# Produção (remoto)
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set EMAIL_FROM=noreply@seu-dominio.com
supabase secrets set NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

Para ambiente local (`.env` na raiz do projeto, não commitado):

```bash
# supabase/.env  (gitignored)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@seu-dominio.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Deploy

```bash
# Autenticar e linkar o projeto (uma vez)
supabase login
supabase link --project-ref <project-ref>

# Fazer deploy com o cron configurado no config.toml
supabase functions deploy avisos-vencimento
```

#### Testar localmente

```bash
# Subir as Edge Functions localmente
supabase functions serve avisos-vencimento --env-file supabase/.env

# Em outro terminal — disparar manualmente
curl -i --location --request POST \
  'http://127.0.0.1:54321/functions/v1/avisos-vencimento' \
  --header 'Authorization: Bearer <SUPABASE_ANON_KEY>'
```

Verificar e-mail recebido em `http://localhost:54324` (Inbucket).

### Checklist de Deploy — Módulo Financeiro

Execute junto ao checklist geral antes de cada deploy que inclua o módulo financeiro.

- [ ] Migration `20260329160215_criar_financeiro.sql` aplicada (`supabase db push`)
- [ ] Bucket `comprovantes` criado com RLS configurada
- [ ] Variáveis de ambiente configuradas na Vercel:
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `RESEND_API_KEY`
  - [ ] `EMAIL_FROM`
- [ ] Segredos da Edge Function configurados (`supabase secrets set ...`)
- [ ] Edge Function implantada: `supabase functions deploy avisos-vencimento`
- [ ] Cron ativo: verificar em Supabase Dashboard → Edge Functions → `avisos-vencimento` → Schedule
- [ ] Pelo menos um usuário com papel `tesoureiro` cadastrado (recebe os avisos)

### QA Manual — Módulo Financeiro

#### Fluxo Tesoureiro

- [ ] Acessar `/admin/financeiro` → dashboard carrega com KPIs e gráficos
- [ ] KPI "Saldo Acumulado" reflete entradas - saídas de todos os lançamentos
- [ ] Gráfico de barras exibe 6 meses anteriores (meses sem lançamento aparecem com zero)
- [ ] Gráfico de pizza exibe categorias de entrada corretamente
- [ ] Criar entrada em `/admin/financeiro/entradas` → aparece no dashboard
- [ ] Criar saída com data de vencimento em `/admin/financeiro/saidas`
- [ ] Saída com vencimento ≤7 dias aparece na lista "Vencimentos próximos" com badge amarelo
- [ ] Saída vencida aparece com badge vermelho
- [ ] Adicionar/editar/desativar categoria em `/admin/financeiro/configuracoes`
- [ ] Badge de comprovantes pendentes aparece no dashboard quando há comprovantes
- [ ] Badge leva corretamente a `/admin/financeiro/comprovantes`

#### Fluxo Conferente

- [ ] Login como conferente → acessa `/admin/financeiro`
- [ ] Dashboard exibe apenas dados do grupo do conferente (badge "Apenas seu grupo")
- [ ] Conferente não vê KPIs gerais da comunidade
- [ ] Conferente consegue lançar entrada/saída (vinculada ao próprio grupo)
- [ ] Conferente não acessa `/admin/financeiro/comprovantes` (exibe erro de permissão)

---

### Storage — Bucket `avatares`

O bucket é **privado** — o acesso é feito via URLs assinadas (1 hora de validade) geradas pelo Route Handler `/api/avatares`.

**Criar o bucket via Dashboard:**
1. Supabase Dashboard → Storage → New Bucket
2. Nome: `avatares`
3. Public bucket: **desabilitado** (privado)
4. File size limit: `5242880` (5 MB)
5. Allowed MIME types: `image/jpeg, image/png, image/webp`

**OU via SQL:**
```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatares',
  'avatares',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);
```

**RLS no bucket** — executar no SQL Editor:
```sql
-- Usuário autenticado pode fazer upload na própria pasta
create policy "avatares_upload_proprio"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Usuário autenticado pode substituir o próprio arquivo
create policy "avatares_update_proprio"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role tem acesso total (usado pelo Route Handler /api/avatares)
create policy "avatares_service_role"
  on storage.objects for all
  to service_role
  using (bucket_id = 'avatares');
```

---

## Desenvolvimento Local

```bash
# 1. Instalar dependências
cd eu-sou
npm install

# 2. Criar .env.local com as variáveis acima

# 3. (Opcional) Subir Supabase local
supabase start
# Copia as URLs e chaves exibidas no terminal para o .env.local

# 4. Aplicar migrations
supabase db reset

# 5. Rodar o servidor
npm run dev
```

Acesse `http://localhost:3000`.

---

## Estrutura de Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Site institucional |
| `/entrar` | Público | Login (senha / Magic Link / Google) |
| `/cadastro` | Público | Cadastro de novo membro |
| `/auth/callback` | Público | Callback OAuth e Magic Link |
| `/membro` | Membro autenticado | Dashboard do membro |
| `/membro/perfil` | Membro autenticado | Edição de perfil + foto |
| `/admin` | Pastor / Tesoureiro | Painel administrativo |
| `/admin/membros` | Pastor / Tesoureiro | Gerenciamento de membros |
| `/admin/eventos` | Pastor / Tesoureiro | Gerenciamento de eventos |
| `/api/avatares` | Server (service role) | Upload e URLs assinadas de fotos |

O middleware (`middleware.ts`) protege automaticamente `/membro/*` e `/admin/*`, redirecionando para `/entrar` sem sessão ativa. Rotas `/admin/*` exigem papel `pastor` ou `tesoureiro`.

---

## Checklist de Deploy

Execute este checklist a cada deploy em produção.

### Pré-deploy

- [ ] Todas as migrations aplicadas no banco de produção (`supabase db push`)
- [ ] Bucket `avatares` criado e com RLS configurada
- [ ] Variáveis de ambiente configuradas na Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Google OAuth: `https://seu-dominio.com/auth/callback` adicionado como redirect URI autorizado no Google Cloud Console e no Supabase
- [ ] `enable_confirmations = true` (confirmação de e-mail em produção)
- [ ] SMTP de produção configurado no Supabase
- [ ] `next.config.ts`: verificar `allowedDevOrigins` (remover IPs locais se necessário)
- [ ] Build local sem erros: `npm run build`
- [ ] TypeScript sem erros: `npx tsc --noEmit`

### Deploy

```bash
# Via Vercel CLI
vercel --prod

# OU via push na branch main (se CI/CD configurado)
git push origin main
```

### Pós-deploy

- [ ] Verificar logs de build na Vercel (sem erros)
- [ ] Testar login com e-mail/senha em produção
- [ ] Testar Magic Link (verificar e-mail recebido)
- [ ] Testar Google OAuth (fluxo completo)
- [ ] Verificar upload de avatar (foto salva e exibida)
- [ ] Confirmar que `/membro` redireciona para `/entrar` sem sessão
- [ ] Confirmar que membro comum não acessa `/admin`

---

## Estratégia de Rollback

### Rollback de código (Vercel)

1. Acesse Vercel Dashboard → Deployments
2. Localize o último deploy estável
3. Clique em **Redeploy** → confirmar
4. O tráfego volta imediatamente para a versão anterior

### Rollback de banco de dados

As migrations são aditivas (sem `DROP TABLE` ou `ALTER COLUMN` destrutivo). Para reverter:

1. Conectar ao banco de produção:
   ```bash
   supabase db connect --project-ref <project-ref>
   ```
2. Executar o SQL de reversão manualmente (criar script `supabase/migrations/rollback_<timestamp>.sql`)
3. Exemplo para reverter a migration de perfis:
   ```sql
   drop trigger if exists on_auth_user_created_eu_sou on auth.users;
   drop function if exists handle_new_eu_sou_user();
   drop table if exists perfis;
   ```

> **Atenção:** reversão de tabela com dados requer backup prévio via Supabase Dashboard → Database → Backups.

---

## Monitoramento de Logs

### Supabase

| O que monitorar | Onde |
|---|---|
| Erros de autenticação | Dashboard → Authentication → Logs |
| Erros de banco (RLS, queries) | Dashboard → Database → Logs |
| Erros de Storage | Dashboard → Storage → Logs |
| Edge Functions | Dashboard → Edge Functions → Logs |

Alertas recomendados: configurar em **Supabase Dashboard → Advisors** para detectar queries lentas e violações de RLS.

### Vercel

| O que monitorar | Onde |
|---|---|
| Erros de Runtime (500) | Vercel Dashboard → Functions → Logs |
| Build failures | Vercel Dashboard → Deployments |
| Route Handler errors (`/api/*`) | Vercel Dashboard → Functions → `/api/avatares` |

**Filtros úteis no Vercel Logs:**
```
# Erros do Route Handler de avatares
path:/api/avatares status:500

# Erros de autenticação
path:/auth/callback status:3xx
```

---

## Checklist de QA Manual

Execute antes de cada release ou após mudanças nas features de autenticação/membros.

### Cadastro

- [ ] Preencher etapa 1 (nome, e-mail, senha, confirmar senha) e avançar
- [ ] Tentar avançar com senha < 6 caracteres → exibe erro
- [ ] Tentar avançar com senhas divergentes → exibe erro
- [ ] Preencher etapa 2 (opcional) e submeter
- [ ] Tela de confirmação exibida com o e-mail correto
- [ ] E-mail de confirmação recebido (verificar Inbucket em dev: `http://localhost:54324`)
- [ ] Clicar no link → redirecionado para `/membro`

### Login

- [ ] **Senha:** login com credenciais corretas → `/membro`
- [ ] **Senha:** credenciais erradas → exibe "E-mail ou senha incorretos"
- [ ] **Magic Link:** inserir e-mail → mensagem de sucesso → link recebido → `/membro`
- [ ] **Google:** clicar "Continuar com Google" → fluxo OAuth → `/membro`
- [ ] **Recuperar senha:** enviar e-mail → instrução exibida → link recebido → funcional

### Proteção de rotas

- [ ] Acessar `/membro` sem sessão → redireciona para `/entrar`
- [ ] Acessar `/admin` como membro comum → redireciona para `/membro`
- [ ] Acessar `/admin/membros` como pastor/tesoureiro → acesso concedido

### Área do membro

- [ ] Dashboard exibe nome, papéis, dados de perfil
- [ ] Barra de completude reflete campos preenchidos
- [ ] Edição de perfil: alterar nome e salvar → atualizado na tela
- [ ] Upload de foto: enviar JPG/PNG → preview atualizado → foto exibida após reload
- [ ] Upload de foto > 5 MB → exibe erro de tamanho
- [ ] Preenchimento automático de endereço via CEP (campo `cep` com onBlur)
- [ ] Botão "Sair" → sessão encerrada → redireciona para `/entrar`

### Mobile

- [ ] Bottom navigation visível em telas < 768px
- [ ] Formulários usáveis em tela pequena (sem overflow horizontal)
- [ ] Teclado virtual não oculta campos importantes
