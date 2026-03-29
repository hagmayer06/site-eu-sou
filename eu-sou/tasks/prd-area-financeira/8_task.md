# 8.0 - Relatórios (PDF + CSV) e Declaração Anual

## Objetivo
Gerar relatórios financeiros por período e declarações individuais de contribuição exportáveis.

## Entregáveis
- `app/admin/financeiro/relatorios/page.tsx` (filtros + botões de export).
- `components/financeiro/RelatorioPDF.tsx` (template `@react-pdf/renderer` para relatórios).
- `components/financeiro/DeclaracaoPDF.tsx` (template para declaração anual de membro).
- Server Actions: `gerarRelatorioPDFAction`, `gerarDeclaracaoAction` em `actions.ts`.

## Subtarefas
8.0.1 Instalar `@react-pdf/renderer` (`npm install @react-pdf/renderer`).
8.0.2 Criar página de relatórios com filtros: tipo (entradas/saídas/fluxo de caixa), período (início e fim), categoria.
8.0.3 Implementar export CSV client-side:
  - `gerarCSV(lancamentos)` → string CSV → `Blob` → `URL.createObjectURL` → download automático.
  - Sem dependência extra.
8.0.4 Criar `RelatorioPDF`: cabeçalho com nome da igreja + CNPJ, tabela de lançamentos, totais por categoria, total geral. Usar `export const runtime = 'nodejs'` na Server Action.
8.0.5 Criar seção de Declaração Anual: busca por membro (autocomplete por nome), ano, botão "Gerar Declaração".
8.0.6 Criar `DeclaracaoPDF`: nome do membro, CNPJ da igreja, período, total contribuído por categoria, espaço para assinatura do tesoureiro.
8.0.7 Implementar `gerarDeclaracaoAction`: busca lançamentos confirmados do membro no ano, renderiza PDF e retorna como download.

## Critérios de Sucesso
- Relatório de entradas de janeiro/2026 exportado em CSV com colunas corretas.
- PDF de relatório gerado com cabeçalho da igreja e totais por categoria.
- Declaração anual gerada com nome do membro, CNPJ e total confirmado.
- Nenhum dado de membro exposto a outro membro via relatório.

## Testes
- Unitário: `gerarCSV([...])` retorna string com header + linhas corretas.
- Integração: `gerarDeclaracaoAction(membroId, 2026)` retorna PDF com valor correto.
- Segurança: tesoureiro pode gerar declaração de qualquer membro; membro não consegue gerar declaração de outro.
