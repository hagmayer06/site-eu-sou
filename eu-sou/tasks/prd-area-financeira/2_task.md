# 2.0 - Queries tipadas + atualização do middleware

## Objetivo
Criar a camada de dados financeiros e estender o middleware para proteger `/admin/financeiro/*` e `/membro/contribuir`.

## Entregáveis
- `lib/financeiroQueries.ts` com todos os tipos e funções de leitura.
- `middleware.ts` atualizado com verificação de papel financeiro.

## Subtarefas
2.0.1 Definir tipos: `CategoriaRow`, `LancamentoRow`, `ConfiguracaoIgrejaRow`, `DashboardData`.
2.0.2 Implementar `getCategorias()`, `getLancamentos(filtros)`, `getDashboardData()`.
2.0.3 Implementar `getVencimentosProximos(dias)`, `getComprovantesNaoConfirmados()`.
2.0.4 Implementar `getHistoricoMembro(membroId, ano?)` e `getConfiguracaoIgreja()`.
2.0.5 Estender `middleware.ts`: `/admin/financeiro/*` exige `pastor` | `tesoureiro` | `conferente`; `/membro/contribuir` exige qualquer autenticado.
2.0.6 Garantir que conferente sem `grupo_id` seja redirecionado ao tentar acessar `/admin/financeiro`.

## Critérios de Sucesso
- `getDashboardData()` retorna saldo, totais do mês e vencimentos proximos.
- Membro sem papel financeiro em `/admin/financeiro` → redireciona para `/membro`.
- TypeScript sem erros (`tsc --noEmit`).

## Testes
- Unitário: `getDashboardData()` com array de lançamentos mockados retorna saldo correto.
- Unitário: conversão centavos ↔ reais (evitar float).
