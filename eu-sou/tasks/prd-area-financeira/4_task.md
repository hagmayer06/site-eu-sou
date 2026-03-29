# 4.0 - Lançamento de Entradas

## Objetivo
Permitir que tesoureiro e conferente registrem receitas da comunidade.

## Entregáveis
- `app/admin/financeiro/entradas/page.tsx` (lista + formulário inline ou modal).
- `components/financeiro/LancamentoForm.tsx` (formulário reutilizável entrada/saída).
- Server Action `criarLancamentoAction` em `actions.ts`.

## Subtarefas
4.0.1 Criar listagem de entradas com colunas: data, categoria, descrição, membro vinculado, valor, status.
4.0.2 Implementar filtros: período (data início/fim), categoria, membro.
4.0.3 Criar `LancamentoForm` com campos: data, valor (formatado R$), categoria (select), descrição, membro vinculado (opcional, busca por nome), culto de referência (opcional).
4.0.4 Implementar `criarLancamentoAction` com `supabaseAdmin` — valor convertido para centavos antes de salvar.
4.0.5 Conferente: ao abrir entradas, `grupo_id` é preenchido automaticamente com o grupo do conferente logado.
4.0.6 Implementar edição de lançamento não confirmado (estorno proibido — ver 4.0.7).
4.0.7 Lançamentos confirmados são imutáveis — exibir botão "Estornar" que cria novo lançamento com valor negativo.

## Critérios de Sucesso
- Tesoureiro lança entrada de R$ 1.500,00 → salvo como 150000 centavos no banco.
- Conferente só vê lançamentos do seu grupo.
- Tentativa de editar lançamento confirmado via API retorna erro (RLS).
- Valor exibido sempre formatado como "R$ 1.500,00".

## Testes
- Unitário: `formatarReais(150000)` → `"R$ 1.500,00"` e `parseCentavos("1500,00")` → `150000`.
- Integração: conferente cria entrada com `grupo_id = X` → query com `grupo_id = Y` retorna vazio.
