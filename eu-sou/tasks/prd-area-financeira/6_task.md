# 6.0 - Dashboard Financeiro (KPIs + Gráficos)

## Objetivo
Exibir visão consolidada e em tempo real da situação financeira com Recharts.

## Entregáveis
- `app/admin/financeiro/page.tsx` (dashboard com KPIs e alertas).
- `components/financeiro/DashboardCharts.tsx` (gráficos Recharts — client component).

## Subtarefas
6.0.1 Instalar `recharts` (`npm install recharts`).
6.0.2 Implementar `getDashboardData()` em `financeiroQueries.ts`: saldo do mês, total entradas, total saídas, saldo acumulado, vencimentos próximos (7 dias), contagem de comprovantes pendentes.
6.0.3 Criar cards de KPI: Saldo do Mês, Total Entradas, Total Saídas, Saldo Acumulado — todos formatados em R$.
6.0.4 Criar `DashboardCharts` com `'use client'`: gráfico de barras (entradas vs. saídas dos últimos 6 meses) + gráfico de pizza (distribuição de entradas por categoria).
6.0.5 Exibir lista das 5 contas vencendo nos próximos 7 dias com destaque visual (amarelo se ≤7 dias, vermelho se já vencido).
6.0.6 Exibir badge "X comprovantes aguardando confirmação" com link para `/admin/financeiro/comprovantes`.
6.0.7 Conferente vê apenas os dados do seu grupo (totais do grupo, não geral).

## Critérios de Sucesso
- Dashboard carrega em < 2s com dados reais do banco.
- Gráfico de barras exibe 6 meses anteriores corretamente, incluindo meses sem lançamento (valor zero).
- Conferente não vê KPIs gerais da comunidade — apenas do seu grupo.

## Testes
- Unitário: `calcularUltimos6Meses()` retorna array de 6 entradas com meses corretos, incluindo meses sem lançamentos.
- Visual: gráficos renderizados sem erro de `window is not defined` (SSR).
