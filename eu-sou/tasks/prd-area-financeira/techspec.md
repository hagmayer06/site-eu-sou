# Tech Spec — Área Financeira

## Resumo Executivo

A Área Financeira é implementada como um módulo protegido em `/admin/financeiro/*`, acessível apenas para usuários com papel `pastor`, `tesoureiro` ou `conferente` (este último com escopo restrito ao seu grupo). O controle de acesso usa o sistema de papéis (`perfis.papeis[]`) introduzido no módulo de Membros, verificado em nível de middleware e reforçado por RLS no Supabase. Gráficos usam `Recharts`. PDFs são gerados server-side com `@react-pdf/renderer`. Avisos de vencimento são enviados via Supabase Edge Functions com cron scheduler. O módulo é projetado para operação offline-first no mobile (tesoureiro lança do celular no culto).

## Arquitetura do Sistema

### Visão Geral dos Componentes

- **`middleware.ts`** *(estender)*: adicionar verificação de papel para `/admin/financeiro/*` — bloquear papéis sem acesso financeiro.
- **`lib/financeiroQueries.ts`** *(novo)*: funções tipadas de leitura de lançamentos, categorias, dashboard e relatórios.
- **`app/admin/financeiro/layout.tsx`** *(novo)*: layout do módulo financeiro com menu lateral (Dashboard, Entradas, Saídas, Relatórios, Configurações).
- **`app/admin/financeiro/page.tsx`** *(novo)*: dashboard com KPIs (Recharts) e alertas de vencimento.
- **`app/admin/financeiro/entradas/page.tsx`** *(novo)*: listagem e lançamento de entradas.
- **`app/admin/financeiro/saidas/page.tsx`** *(novo)*: listagem e lançamento de saídas/contas a pagar.
- **`app/admin/financeiro/relatorios/page.tsx`** *(novo)*: geração e exportação de relatórios (PDF/CSV).
- **`app/admin/financeiro/comprovantes/page.tsx`** *(novo)*: fila de comprovantes Pix enviados por membros aguardando confirmação.
- **`app/admin/financeiro/configuracoes/page.tsx`** *(novo)*: plano de contas e chave Pix da igreja.
- **`app/admin/financeiro/actions.ts`** *(novo)*: Server Actions para todas as escritas financeiras.
- **`app/membro/contribuir/page.tsx`** *(novo)*: página do membro para enviar contribuição Pix com upload de comprovante.
- **`components/financeiro/LancamentoForm.tsx`** *(novo)*: formulário de lançamento de entrada/saída.
- **`components/financeiro/DashboardCharts.tsx`** *(novo)*: gráficos Recharts (barras + pizza).
- **`components/financeiro/DeclaracaoPDF.tsx`** *(novo)*: template `@react-pdf/renderer` para declaração anual.
- **`components/financeiro/RelatorioPDF.tsx`** *(novo)*: template `@react-pdf/renderer` para relatórios gerais.
- **Supabase Edge Function `avisos-vencimento`** *(novo)*: cron diário que verifica contas vencendo em 3 dias e envia e-mail via Supabase Auth email.
- **Supabase Storage bucket `comprovantes`** *(novo)*: bucket privado para imagens de comprovantes Pix.

**Fluxo de dados:**
```
[Tesoureiro/Conferente] → LancamentoForm → actions.ts → supabaseAdmin → lancamentos
[Pastor/Tesoureiro]     → DashboardCharts → financeiroQueries.ts → supabase (RLS)
[Membro]                → /membro/contribuir → upload comprovante → Storage + pendentes
[Edge Function]         → cron 08:00 → verifica vencimentos → envia e-mail
[Relatório PDF]         → Server Action → DeclaracaoPDF → stream response
```

## Design de Implementação

### Interfaces Principais

```typescript
// lib/financeiroQueries.ts
export type CategoriaRow = {
  id: string
  nome: string
  tipo: 'entrada' | 'saida'
  icone: string | null
  ativo: boolean
}

export type LancamentoRow = {
  id: string
  tipo: 'entrada' | 'saida'
  categoria_id: string
  valor: number             // em centavos (evita float)
  descricao: string
  data: string              // ISO date
  grupo_id: string | null   // lançamento de conferente
  membro_id: string | null  // contribuição vinculada a membro
  data_vencimento: string | null
  status: 'pendente' | 'pago' | 'vencido' | 'confirmado'
  comprovante_url: string | null
  criado_por: string        // auth.uid()
  criado_em: string
}

export type DashboardData = {
  saldo_mes: number
  total_entradas_mes: number
  total_saidas_mes: number
  saldo_acumulado: number
  vencimentos_proximos: LancamentoRow[]
  comprovantes_pendentes: number
}
```

### Modelos de Dados — Supabase (SQL)

```sql
-- Plano de contas
create table categorias_financeiro (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('entrada', 'saida')),
  icone text,
  ativo boolean not null default true
);

-- Lançamentos (entradas e saídas unificados)
create table lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  categoria_id uuid not null references categorias_financeiro(id),
  valor integer not null,          -- centavos
  descricao text not null,
  data date not null,
  grupo_id uuid references grupos(id),
  membro_id uuid references perfis(id),
  data_vencimento date,
  status text not null default 'confirmado'
    check (status in ('pendente', 'pago', 'vencido', 'confirmado')),
  comprovante_url text,
  criado_por uuid not null references auth.users(id),
  criado_em timestamptz not null default now()
);

-- Configurações da igreja (chave Pix, CNPJ, etc.)
create table configuracoes_igreja (
  id uuid primary key default gen_random_uuid(),
  chave_pix text,
  cnpj text,
  nome_igreja text,
  updated_at timestamptz default now()
);

-- RLS: pastor e tesoureiro leem tudo
create policy "financeiro_admin" on lancamentos
  for all using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
      and (p.papeis @> array['pastor'] or p.papeis @> array['tesoureiro'])
    )
  );

-- Conferente lê e insere apenas do seu grupo
create policy "financeiro_conferente" on lancamentos
  for select using (
    grupo_id in (
      select mg.grupo_id from membros_grupo mg
      where mg.membro_id = auth.uid()
      and exists (
        select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['conferente']
      )
    )
  );

-- Membro lê apenas lançamentos vinculados a si
create policy "financeiro_membro" on lancamentos
  for select using (membro_id = auth.uid());

alter table lancamentos enable row level security;
alter table categorias_financeiro enable row level security;
alter table configuracoes_igreja enable row level security;
```

### Endpoints de API

Sem rotas REST. Toda escrita via Server Actions. PDF gerado via Server Action que retorna `Response` com stream.

**Geração de PDF (declaração anual):**
```typescript
// app/admin/financeiro/actions.ts
'use server'
export async function gerarDeclaracaoAction(membroId: string, ano: number) {
  // busca lançamentos do membro no ano
  // renderiza <DeclaracaoPDF /> com @react-pdf/renderer
  // retorna base64 ou stream para download
}
```

**Export CSV (relatório):**
- Gerado client-side com `Array.join(',')` + `Blob` + `URL.createObjectURL` — sem dependência extra.

## Pontos de Integração

| Serviço | Uso | Autenticação | Fallback |
|---|---|---|---|
| Supabase Storage `comprovantes` | Upload de comprovante Pix pelo membro | Service Role (Server Action) | Erro exibido ao membro; retentar |
| Supabase Edge Function | Cron de avisos de vencimento (e-mail) | Service Role Key na Edge Function | Alerta apenas no dashboard |
| Supabase Auth email | E-mail de aviso de vencimento | Via Supabase SMTP integrado | Log de erro na Edge Function |

## Abordagem de Testes

### Testes Unidade
- Cálculo de `saldo_mes`: função pura com array de lançamentos → testar entradas, saídas e mês vazio.
- Atualização automática de status "vencido": função que recebe data e retorna status correto.
- Valor em centavos: conversão R$ → centavos e centavos → R$ (evita erro de float).

### Testes de Integração
- Lançamento de conferente: RLS impede acesso a lançamentos de outro grupo.
- Lançamento de saída vencida: cron Edge Function atualiza status automaticamente.
- Comprovante enviado por membro → aparece na fila do tesoureiro → confirmação cria lançamento.

### Testes de E2E (Playwright)
- Membro acessa `/membro/contribuir` → envia comprovante → tesoureiro vê na fila → confirma → lançamento criado.
- Tesoureiro acessa dashboard → gráficos de barras e pizza renderizados corretamente.
- Pastor gera declaração anual de membro → download de PDF com CNPJ da igreja.
- Membro sem papel financeiro tenta acessar `/admin/financeiro` → redirecionado pelo middleware.

## Sequenciamento de Desenvolvimento

1. **Migrations Supabase** — `categorias_financeiro`, `lancamentos`, `configuracoes_igreja` + RLS.
2. **`lib/financeiroQueries.ts`** — queries tipadas (dashboard, listagens, relatórios).
3. **`app/admin/financeiro/configuracoes/`** — plano de contas e chave Pix (dados base necessários primeiro).
4. **`app/admin/financeiro/entradas/` + `saidas/`** — CRUD de lançamentos.
5. **`app/admin/financeiro/page.tsx`** — dashboard com Recharts.
6. **`app/admin/financeiro/comprovantes/`** — fila de confirmação.
7. **`app/membro/contribuir/`** — página de contribuição Pix do membro.
8. **`app/admin/financeiro/relatorios/`** — PDF e CSV.
9. **Supabase Edge Function `avisos-vencimento`** — cron de e-mails.

### Dependências Técnicas

```bash
npm install recharts @react-pdf/renderer
npm install --save-dev @types/react-pdf
```

- `recharts` v2 — gráficos declarativos React; compatível com Next.js App Router.
- `@react-pdf/renderer` v3 — renderização de PDF server-side; requer `'use server'` nos componentes que o invocam.
- Gráficos Recharts usam `'use client'` — envolver em componente client separado (`DashboardCharts.tsx`).

## Monitoramento e Observabilidade

- **Dashboard financeiro**: saldo e KPIs calculados por query Supabase — tempo de resposta visível no Supabase Dashboard > Query Performance.
- **Edge Function cron**: logs disponíveis em Supabase > Edge Functions > Logs.
- **Erros de PDF**: Server Action captura e retorna `{ success: false, error }` ao cliente.
- **Auditoria**: coluna `criado_por` em `lancamentos` registra quem fez cada lançamento — nunca excluir registros.

## Considerações Técnicas

### Decisões Principais

| Decisão | Escolha | Justificativa |
|---|---|---|
| Valor monetário | Inteiro em centavos | Evita imprecisão de float (ex: R$ 1,10 = 110 centavos) |
| Gráficos | Recharts | Componentes React declarativos; sem configuração canvas manual |
| PDF server-side | `@react-pdf/renderer` | Controle total de layout; CNPJ e formatação confiáveis |
| Export CSV | Gerado client-side com Blob | Sem dependência extra para operação simples |
| Avisos de vencimento | Supabase Edge Function cron | Sem custo adicional; integrado ao ecossistema |
| Lançamentos imutáveis | Sem DELETE — apenas estorno | Garante auditoria completa de todas as movimentações |
| Escopo do conferente | Filtro por `grupo_id` via RLS | Segurança no banco, não apenas na UI |

### Riscos Conhecidos

- **`@react-pdf/renderer` em Server Actions**: o módulo usa APIs de Node.js — testar compatibilidade com Next.js App Router Edge Runtime. Mitigação: usar Node.js Runtime (`export const runtime = 'nodejs'`) na rota de geração de PDF.
- **Recharts e SSR**: `recharts` usa `window` internamente. Mitigação: componente `DashboardCharts.tsx` com `'use client'` e lazy load.
- **Volume de lançamentos**: relatórios de anos completos podem ser lentos. Mitigação: paginação + índices no banco (`create index on lancamentos (data, tipo, grupo_id)`).

### Conformidade com Padrões

Seguindo padrões existentes no codebase:
- Server Actions para toda escrita (`'use server'` + `supabaseAdmin`)
- Query files tipados em `lib/`
- RLS policies no banco como segunda linha de defesa além do middleware
- `revalidatePath` após mutações financeiras
- Componentes de gráfico com `'use client'` isolados

### Arquivos Relevantes e Dependentes

**Criados:**
- `lib/financeiroQueries.ts`
- `app/admin/financeiro/layout.tsx`
- `app/admin/financeiro/page.tsx`
- `app/admin/financeiro/entradas/page.tsx`
- `app/admin/financeiro/saidas/page.tsx`
- `app/admin/financeiro/relatorios/page.tsx`
- `app/admin/financeiro/comprovantes/page.tsx`
- `app/admin/financeiro/configuracoes/page.tsx`
- `app/admin/financeiro/actions.ts`
- `app/membro/contribuir/page.tsx`
- `components/financeiro/LancamentoForm.tsx`
- `components/financeiro/DashboardCharts.tsx`
- `components/financeiro/DeclaracaoPDF.tsx`
- `components/financeiro/RelatorioPDF.tsx`
- `supabase/functions/avisos-vencimento/index.ts` *(Edge Function)*

**Modificados:**
- `middleware.ts` — adicionar verificação de papel financeiro
- `app/admin/layout.tsx` — adicionar link "Financeiro" no menu admin
- `app/membro/layout.tsx` — adicionar link "Contribuir" no menu do membro

**Dependências npm novas:**
- `recharts`
- `@react-pdf/renderer`

**Migrations Supabase:**
- Tabelas `categorias_financeiro`, `lancamentos`, `configuracoes_igreja` + RLS + índices
- Storage bucket `comprovantes` (private)
- Edge Function `avisos-vencimento` com cron schedule
