# Tasks — Área Financeira

Sequência de execução derivada do PRD e Tech Spec.

| # | Task | Entregável principal | Depende de |
|---|---|---|---|
| 1 | [Migrations + Storage](./1_task.md) | Schema DB + bucket `comprovantes` | — |
| 2 | [Queries + Middleware](./2_task.md) | `lib/financeiroQueries.ts` + middleware | 1 |
| 3 | [Layout + Configurações](./3_task.md) | Layout financeiro + plano de contas + chave Pix | 2 |
| 4 | [Entradas](./4_task.md) | CRUD de receitas | 3 |
| 5 | [Saídas / Contas a Pagar](./5_task.md) | CRUD de despesas + status vencimento | 3 |
| 6 | [Dashboard (Recharts)](./6_task.md) | KPIs + gráficos | 4, 5 |
| 7 | [Comprovantes Pix](./7_task.md) | Contribuição membro + fila tesoureiro | 3 |
| 8 | [Relatórios (PDF + CSV)](./8_task.md) | Relatórios + Declaração anual | 4, 5 |
| 9 | [Edge Function + Testes + Docs](./9_task.md) | Cron avisos + QA + README | 1–8 |

## Dependências npm a instalar antes de começar

```bash
cd eu-sou
npm install recharts @react-pdf/renderer
```

## Notas

- Valores monetários sempre em **centavos** (integer) no banco — nunca float.
- Lançamentos confirmados são **imutáveis** — usar estorno (novo lançamento com valor negativo).
- Conferente: escopo restrito ao `grupo_id` via RLS — nunca contornar por UI.
- Todas as escritas financeiras via **Server Actions** com `supabaseAdmin`.
- PDFs gerados com `export const runtime = 'nodejs'` para evitar incompatibilidade com Edge Runtime.
