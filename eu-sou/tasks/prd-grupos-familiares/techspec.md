# Tech Spec — Grupos Familiares

## Resumo Executivo

A funcionalidade de Grupos Familiares será implementada sobre a arquitetura existente do projeto (Next.js 16 App Router, Supabase, Tailwind v4), seguindo os padrões já estabelecidos: Server Actions para escrita/upload, query files tipados em `lib/` para leitura, e componentes client-side para interatividade. O mapa público usará `react-leaflet` com dynamic import SSR-disabled sobre tiles do OpenStreetMap. A geocodificação de endereços usará a API pública Nominatim (gratuita). A proteção de rotas será implementada via `middleware.ts` no Next.js, cobrindo `/admin/*` e `/membro/*`.

## Arquitetura do Sistema

### Visão Geral dos Componentes

- **`middleware.ts`** *(novo — compartilhado entre todos os módulos)*: intercepta requisições para `/admin/*` e `/membro/*`, valida o token Supabase SSR via `@supabase/ssr` e redireciona para login se não autenticado.
- **`lib/gruposQueries.ts`** *(novo)*: funções tipadas de leitura para grupos, membros do grupo, reuniões e avisos — usa cliente anônimo.
- **`app/admin/grupos/page.tsx`** *(substituir stub)*: página client-side de listagem e gestão de grupos para o pastor. Padrão igual a `app/admin/eventos/page.tsx`.
- **`app/admin/grupos/actions.ts`** *(novo)*: Server Actions para criar/editar/desativar grupo, upload de foto de capa, geocodificação via Nominatim.
- **`components/admin-fomularios/GrupoForm.tsx`** *(novo)*: formulário de criação/edição de grupo com busca de endereço e preview do mapa.
- **`app/admin/grupos/[id]/membros/page.tsx`** *(novo)*: página do líder para gerenciar membros do seu grupo.
- **`app/admin/grupos/[id]/reunioes/page.tsx`** *(novo)*: página para criar/editar reuniões recorrentes do grupo.
- **`app/admin/grupos/[id]/avisos/page.tsx`** *(novo)*: página para redigir aviso e gerar links WhatsApp individuais.
- **`components/sections/Grupos.tsx`** *(novo)*: seção pública da home com cards de grupos e mapa Leaflet.
- **`components/grupos/MapaGrupos.tsx`** *(novo)*: componente Leaflet carregado com `dynamic({ ssr: false })`.
- **Supabase Storage bucket `grupos-capas`** *(novo)*: armazena fotos de capa dos grupos (público).

**Fluxo de dados:**
```
[Admin Form] → GrupoForm → Server Action → Nominatim API (geocode) → supabaseAdmin (escrita)
[Membro/Visitante] → Grupos.tsx → gruposQueries.ts → supabase anon (leitura) → MapaGrupos.tsx
[Líder] → avisos/page.tsx → gera URLs wa.me → abre WhatsApp no browser
```

## Design de Implementação

### Interfaces Principais

```typescript
// lib/gruposQueries.ts
export type GrupoRow = {
  id: string
  nome: string
  descricao: string | null
  endereco: string
  bairro: string
  cidade: string
  lat: number
  lng: number
  lider_id: string | null
  foto_url: string | null
  ativo: boolean
  criado_em: string
}

export type MembroGrupoRow = {
  id: string
  grupo_id: string
  membro_id: string | null   // null se não tem cadastro digital
  nome: string
  telefone: string
  data_ingresso: string
}

export type ReuniaoRow = {
  id: string
  grupo_id: string
  dia_semana: number          // 0=Dom … 6=Sáb
  horario_inicio: string      // "HH:MM"
  horario_fim: string | null
  endereco_reuniao: string | null
  ativo: boolean
}

export type AvisoRow = {
  id: string
  grupo_id: string
  autor_id: string
  conteudo: string
  criado_em: string
}
```

### Modelos de Dados — Supabase (SQL)

```sql
-- Grupos
create table grupos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  endereco text not null,
  bairro text not null,
  cidade text not null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  lider_id uuid references auth.users(id),
  foto_url text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Membros do grupo
create table membros_grupo (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references grupos(id) on delete cascade,
  membro_id uuid references auth.users(id),
  nome text not null,
  telefone text not null,
  data_ingresso date not null default current_date,
  unique(grupo_id, membro_id)  -- impede duplicidade quando vinculado
);

-- Reuniões recorrentes
create table reunioes_grupo (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references grupos(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  horario_inicio time not null,
  horario_fim time,
  endereco_reuniao text,
  ativo boolean not null default true
);

-- Avisos
create table avisos_grupo (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references grupos(id) on delete cascade,
  autor_id uuid not null references auth.users(id),
  conteudo text not null,
  criado_em timestamptz not null default now()
);

-- RLS
alter table grupos enable row level security;
alter table membros_grupo enable row level security;
alter table reunioes_grupo enable row level security;
alter table avisos_grupo enable row level security;

-- Leitura pública de grupos ativos
create policy "grupos_public_read" on grupos for select using (ativo = true);
-- Escrita apenas para autenticados (middleware garante papel)
create policy "grupos_auth_write" on grupos for all using (auth.role() = 'authenticated');
```

### Endpoints de API

Não serão criadas rotas de API REST — seguindo o padrão do projeto, toda escrita ocorre via Server Actions e toda leitura via Supabase client direto.

O stub `app/api/grupos/route.ts` será mantido como placeholder sem alteração.

**Geocodificação (Nominatim)** — chamada server-side dentro da Server Action:
```
GET https://nominatim.openstreetmap.org/search
  ?q={endereco},{cidade},Brasil
  &format=json&limit=1
  &User-Agent=eu-sou-app/1.0
```
Rate limit: 1 req/s. Chamada feita apenas no momento de salvar o grupo (não em tempo real).

## Pontos de Integração

| Serviço | Uso | Autenticação | Fallback |
|---|---|---|---|
| Nominatim (OSM) | Geocodificar endereço → lat/lng | Nenhuma (User-Agent obrigatório) | Exibir erro no form; admin informa lat/lng manualmente |
| OpenStreetMap tiles | Tiles de mapa no frontend | Nenhuma | Mapa não carrega; exibir mensagem |
| WhatsApp `wa.me` | Gerar links de aviso | Nenhuma | Link copiado para área de transferência |
| Supabase Storage `grupos-capas` | Upload foto de capa | Service Role Key (server-side) | Campo foto permanece vazio |

## Abordagem de Testes

### Testes Unidade
- `lib/gruposQueries.ts`: mockar cliente Supabase; testar filtragem de grupos ativos, ordenação.
- Server Action geocodificação: mockar fetch para Nominatim; testar extração de lat/lng e fallback de erro.
- Geração de URL `wa.me`: função pura — testar encoding de caracteres especiais e quebra de linha.

### Testes de Integração
- Criar grupo via Server Action → verificar registro no Supabase com lat/lng corretos.
- Adicionar membro ao grupo → verificar unicidade (membro não pode estar em 2 grupos).
- Desativar grupo → verificar que não aparece na listagem pública.

### Testes de E2E (Playwright)
- Pastor cria grupo com endereço → grupo aparece no mapa público com marcador.
- Líder acessa `/admin/grupos/[id]/avisos` → gera link WhatsApp com texto correto.
- Visitante acessa seção Grupos → vê mapa com marcadores clicáveis.

## Sequenciamento de Desenvolvimento

1. **Middleware de autenticação** (`middleware.ts`) — bloqueia `/admin/*` sem token; base para todos os módulos seguintes.
2. **Migrations Supabase** — criar as 4 tabelas + RLS policies.
3. **`lib/gruposQueries.ts`** — funções de leitura tipadas (base para UI).
4. **`app/admin/grupos/actions.ts`** — Server Actions com geocodificação.
5. **`components/admin-fomularios/GrupoForm.tsx`** + **`app/admin/grupos/page.tsx`** — CRUD admin.
6. **Páginas de líder** — membros, reuniões, avisos (dependem do grupo criado).
7. **`components/grupos/MapaGrupos.tsx`** + **`components/sections/Grupos.tsx`** — seção pública.
8. **Integração na home** (`app/page.tsx`) — adicionar `<Grupos />` à página principal.

### Dependências Técnicas

```bash
npm install react-leaflet leaflet @types/leaflet
```

- `react-leaflet` v4 — wrapper React para Leaflet; requer dynamic import com `ssr: false`.
- CSS do Leaflet importado globalmente em `app/globals.css`: `@import 'leaflet/dist/leaflet.css'`.
- Ícones do Leaflet requerem configuração manual de path (problema conhecido com Webpack/Next.js).

## Monitoramento e Observabilidade

- **Logs**: Server Actions logam erros de geocodificação com `console.error` — visível no Vercel Function Logs.
- **Erros de mapa**: componente MapaGrupos envolto em `<ErrorBoundary>` com mensagem de fallback.
- **Métrica de uso**: quantidade de grupos ativos consultável via Supabase Dashboard.

## Considerações Técnicas

### Decisões Principais

| Decisão | Escolha | Justificativa |
|---|---|---|
| Biblioteca de mapa | `react-leaflet` + OSM | Gratuita, sem API key, ecossistema React maduro |
| SSR do mapa | `dynamic({ ssr: false })` | Leaflet usa `window` — incompatível com SSR |
| Geocodificação | Nominatim (server-side na Action) | Gratuita; chamada server-side esconde User-Agent e evita rate limit no browser |
| Armazenamento de coordenadas | `numeric(10,7)` no banco | Evita recalcular a cada load; Nominatim tem rate limit |
| Avisos WhatsApp | Links `wa.me` | Zero custo; não requer API; funciona em qualquer dispositivo |

### Riscos Conhecidos

- **Nominatim rate limit (1 req/s)**: risco baixo — geocodificação ocorre apenas ao salvar grupo, não em tempo real.
- **Endereços brasileiros**: Nominatim tem cobertura variável em cidades pequenas. Mitigação: exibir prévia do mapa antes de salvar; permitir ajuste manual de lat/lng.
- **Leaflet CSS no Next.js**: ícones padrão do Leaflet quebram com bundler. Mitigação: usar ícones customizados via `L.divIcon` ou importar ícones explicitamente.

### Conformidade com Padrões

Sem `.windsurf/rules` no projeto. Padrões seguidos conforme codebase existente:
- Server Actions para toda escrita privilegiada (padrão de `app/admin/serie/actions.ts`)
- Query files tipados em `lib/` (padrão de `lib/eventosQueries.ts`)
- Componentes admin como `'use client'` com `useEffect` para auth (padrão de `app/admin/eventos/page.tsx`)
- `supabaseAdmin` apenas em Server Actions (nunca exposto ao browser)
- `revalidatePath` após mutações para invalidar cache ISR

### Arquivos Relevantes e Dependentes

**Criados:**
- `middleware.ts` *(raiz do projeto)*
- `lib/gruposQueries.ts`
- `app/admin/grupos/page.tsx` *(substituir stub)*
- `app/admin/grupos/actions.ts`
- `app/admin/grupos/[id]/membros/page.tsx`
- `app/admin/grupos/[id]/reunioes/page.tsx`
- `app/admin/grupos/[id]/avisos/page.tsx`
- `components/admin-fomularios/GrupoForm.tsx`
- `components/sections/Grupos.tsx`
- `components/grupos/MapaGrupos.tsx`

**Modificados:**
- `app/page.tsx` — adicionar `<Grupos />`
- `app/globals.css` — adicionar `@import 'leaflet/dist/leaflet.css'`
- `components/ui/Navbar.jsx` — adicionar link para seção grupos

**Dependências externas novas:**
- `react-leaflet`, `leaflet`, `@types/leaflet`
