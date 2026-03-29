# Tech Spec — Área de Membros

## Resumo Executivo

A Área de Membros introduz o sistema de identidade digital da comunidade Eu Sou. A implementação usa Supabase Auth como única fonte de verdade de autenticação (e-mail/senha, Google OAuth, Magic Link), com uma tabela `perfis` no Supabase ligada 1:1 ao `auth.users`. O controle de acesso por papel (`membro`, `lider`, `conferente`, `tesoureiro`, `pastor`) é implementado via coluna `papeis text[]` em `perfis` + RLS policies no banco. O middleware Next.js (criado no módulo de Grupos) é estendido para cobrir `/membro/*`. A área do membro vive em `/membro/*` como grupo de rotas separado do `/admin/*`.

## Arquitetura do Sistema

### Visão Geral dos Componentes

- **`middleware.ts`** *(estender o criado em Grupos)*: adicionar proteção de `/membro/*` — verificar sessão Supabase SSR; redirecionar para `/entrar` se não autenticado.
- **`lib/membrosQueries.ts`** *(novo)*: funções tipadas de leitura de perfis, busca e filtros — usa cliente anônimo com RLS.
- **`lib/auth.ts`** *(substituir stub)*: helpers de autenticação reutilizáveis (getSession, signOut, getPerfilAtual).
- **`app/(auth)/cadastro/page.tsx`** *(novo)*: formulário público multi-etapas de cadastro.
- **`app/(auth)/entrar/page.tsx`** *(novo)*: página de login com e-mail/senha, Google e Magic Link.
- **`app/(auth)/layout.tsx`** *(novo)*: layout minimalista para páginas de auth (sem Navbar padrão).
- **`app/membro/layout.tsx`** *(novo)*: layout da área do membro com sidebar/navbar de membro.
- **`app/membro/page.tsx`** *(novo)*: dashboard do membro — foto, grupo, próximas reuniões, eventos.
- **`app/membro/perfil/page.tsx`** *(novo)*: edição de perfil pessoal e foto.
- **`app/admin/membros/page.tsx`** *(novo)*: listagem de membros para o pastor com busca e filtros.
- **`app/admin/membros/[id]/page.tsx`** *(novo)*: edição completa de perfil e atribuição de papéis.
- **`app/admin/membros/actions.ts`** *(novo)*: Server Actions para criar/editar/desativar membro e atribuir papéis.
- **`components/membros/PerfilForm.tsx`** *(novo)*: formulário de edição de perfil com upload de foto.
- **Supabase Storage bucket `avatares`** *(novo)*: bucket privado para fotos de perfil (acesso via URL assinada).

**Fluxo de dados:**
```
[Visitante] → /cadastro → supabase.auth.signUp() → trigger DB → perfis (insert)
[Membro]    → /entrar   → supabase.auth.signIn()  → session  → /membro (redirect)
[Pastor]    → /admin/membros/actions.ts → supabaseAdmin → perfis.papeis (update)
[Middleware]→ verifica session SSR → permite ou redireciona
```

## Design de Implementação

### Interfaces Principais

```typescript
// lib/membrosQueries.ts
export type PerfilRow = {
  id: string               // = auth.users.id
  nome: string
  email: string
  telefone: string | null
  data_nascimento: string | null
  cep: string | null
  rua: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  foto_url: string | null
  papeis: PapelUsuario[]
  ativo: boolean
  grupo_id: string | null
  criado_em: string
}

export type PapelUsuario =
  | 'membro'
  | 'lider'
  | 'conferente'
  | 'tesoureiro'
  | 'pastor'

// Helper de verificação de papel
export function temPapel(perfil: PerfilRow, papel: PapelUsuario): boolean {
  return perfil.papeis.includes(papel)
}
```

### Modelos de Dados — Supabase (SQL)

```sql
-- Perfis (1:1 com auth.users)
create table perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  telefone text,
  data_nascimento date,
  cep text,
  rua text,
  bairro text,
  cidade text,
  uf char(2),
  foto_url text,
  papeis text[] not null default array['membro'],
  ativo boolean not null default true,
  grupo_id uuid references grupos(id),
  criado_em timestamptz not null default now()
);

-- Trigger: cria perfil automático ao registrar usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS
alter table perfis enable row level security;

-- Membro lê e edita apenas o próprio perfil
create policy "perfil_self" on perfis
  for all using (auth.uid() = id);

-- Pastor e tesoureiro leem todos os perfis
create policy "perfil_admin_read" on perfis
  for select using (
    exists (
      select 1 from perfis p
      where p.id = auth.uid()
      and (p.papeis @> array['pastor'] or p.papeis @> array['tesoureiro'])
    )
  );

-- Somente pastor escreve em qualquer perfil
create policy "perfil_pastor_write" on perfis
  for update using (
    exists (
      select 1 from perfis p
      where p.id = auth.uid()
      and p.papeis @> array['pastor']
    )
  );
```

### Endpoints de API

Não serão criadas rotas REST. Toda escrita ocorre via Server Actions; toda leitura via Supabase client com RLS.

**Provedores Supabase Auth a configurar no Dashboard:**
- Email/senha: habilitado (padrão)
- Google OAuth: configurar Client ID + Secret no Supabase > Authentication > Providers
- Magic Link: habilitado via `supabase.auth.signInWithOtp({ email })`

**Busca de CEP** — chamada client-side no formulário de cadastro:
```
GET https://viacep.com.br/ws/{cep}/json/
```
Gratuita, sem chave. Preenche rua, bairro, cidade, UF automaticamente.

## Pontos de Integração

| Serviço | Uso | Autenticação | Fallback |
|---|---|---|---|
| Supabase Auth | Login, cadastro, Magic Link, Google OAuth | Chaves públicas / OAuth redirect | Exibir erro na tela |
| Google OAuth | Login social | Client ID + Secret (configurado no Supabase) | Oferecer e-mail/senha |
| ViaCEP | Preenchimento automático de endereço | Nenhuma | Usuário preenche manualmente |
| Supabase Storage `avatares` | Fotos de perfil (privado) | Service Role (upload) / URL assinada (leitura) | Avatar padrão com iniciais |

## Abordagem de Testes

### Testes Unidade
- `temPapel()`: função pura — testar todos os papéis e combinações.
- `lib/membrosQueries.ts`: mockar cliente Supabase; testar busca por nome/telefone/e-mail.
- Formulário de cadastro: validação de campos obrigatórios, formato de e-mail, telefone.

### Testes de Integração
- Cadastro completo: `signUp` → trigger cria `perfis` → membro recebe e-mail de confirmação.
- Atribuição de papel: pastor altera `papeis` via Server Action → RLS bloqueia membro de fazer o mesmo.
- Upload de avatar: Server Action envia para Storage → URL assinada gerada e salva em `perfis.foto_url`.

### Testes de E2E (Playwright)
- Visitante se cadastra → recebe e-mail → confirma → é redirecionado ao `/membro`.
- Membro tenta acessar `/admin` → é redirecionado ao login.
- Pastor acessa `/admin/membros` → busca por nome → atribui papel `lider` → confirma persistência.

## Sequenciamento de Desenvolvimento

1. **Migrations Supabase** — tabela `perfis` + trigger `handle_new_user` + RLS policies.
2. **`lib/auth.ts`** — helpers de sessão reutilizáveis (substitui stub).
3. **`app/(auth)/cadastro/` + `/entrar/`** — fluxos de auth públicos.
4. **Configuração de providers no Supabase Dashboard** — Google OAuth + Magic Link.
5. **`middleware.ts`** *(extensão)* — adicionar proteção de `/membro/*`.
6. **`app/membro/`** — layout + dashboard + edição de perfil do membro.
7. **`lib/membrosQueries.ts`** — queries tipadas para admin.
8. **`app/admin/membros/`** — listagem, busca, edição e atribuição de papéis.
9. **`app/admin/membros/actions.ts`** — Server Actions privilegiadas.

### Dependências Técnicas

- Google OAuth: requer conta Google Cloud com credenciais OAuth configuradas.
- `@supabase/ssr` já está no `package.json` — usar para criar cliente SSR no middleware.
- Sem novas dependências npm necessárias para este módulo.

## Monitoramento e Observabilidade

- **Auth errors**: Supabase Dashboard > Auth > Logs já captura falhas de login.
- **Trigger errors**: monitorar via Supabase Dashboard > Database > Logs.
- **Uploads de avatar**: erros logados pelo Server Action; visível no Vercel Function Logs.

## Considerações Técnicas

### Decisões Principais

| Decisão | Escolha | Justificativa |
|---|---|---|
| Armazenamento de papéis | `text[]` em `perfis` | Simples, consultável com `@>` no Postgres; evita tabela extra de RBAC |
| Criação de perfil | Trigger `on_auth_user_created` | Garante que todo `auth.users` tenha `perfis` correspondente automaticamente |
| Rota da área do membro | `/membro/*` (Route Group `(auth)` para login) | Separação clara entre área pública, auth e área logada |
| Upload de foto | Server Action + Supabase Storage privado | Foto de perfil é dado pessoal — não deve ser pública |
| Busca de CEP | ViaCEP (client-side) | Gratuita, sem chave, API estável e amplamente usada no Brasil |

### Riscos Conhecidos

- **Trigger Supabase**: se a trigger falhar, o usuário existe em `auth.users` mas sem `perfis`. Mitigação: Server Action de primeiro login verifica existência do perfil e cria se ausente (`upsert`).
- **Google OAuth redirect URI**: deve ser configurada corretamente no Supabase e no Google Cloud Console para cada ambiente (dev/prod). Testar antes do deploy.
- **URL assinada de avatar**: URLs assinadas expiram. Gerar com TTL de 1h e renovar ao carregar o painel do membro.

### Conformidade com Padrões

Seguindo padrões existentes no codebase:
- Server Actions (`'use server'`) para toda escrita privilegiada
- `supabaseAdmin` exclusivamente em Server Actions
- `supabase` (anon) para leitura pública com RLS
- Componentes de página admin como `'use client'` com `onAuthStateChange`
- `revalidatePath` após mutações

### Arquivos Relevantes e Dependentes

**Criados:**
- `lib/membrosQueries.ts`
- `lib/auth.ts` *(substituir stub)*
- `app/(auth)/cadastro/page.tsx`
- `app/(auth)/entrar/page.tsx`
- `app/(auth)/layout.tsx`
- `app/membro/layout.tsx`
- `app/membro/page.tsx`
- `app/membro/perfil/page.tsx`
- `app/admin/membros/page.tsx`
- `app/admin/membros/[id]/page.tsx`
- `app/admin/membros/actions.ts`
- `components/membros/PerfilForm.tsx`

**Modificados:**
- `middleware.ts` — adicionar proteção de `/membro/*`
- `components/ui/Navbar.jsx` — adicionar link "Fazer parte" e "Minha área"
- `app/admin/layout.tsx` — adicionar verificação de papel `pastor` ou `tesoureiro` ou `lider`

**Migration Supabase:**
- Tabela `perfis` + trigger `handle_new_user` + RLS policies
- Storage bucket `avatares` (private)
