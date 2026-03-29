# 5.0 - Gestão admin de membros

## Objetivo
Permitir que pastor consulte, filtre e gerencie perfis de membros.

## Entregáveis
- `app/admin/membros/page.tsx` (lista + busca + filtros)
- `app/admin/membros/[id]/page.tsx` (edição individual + atribuição de papéis)

## Subtarefas
5.0.1 Criar tabela com nome, telefone, grupo, papel, status.
5.0.2 Implementar busca por nome/e-mail/telefone.
5.0.3 Implementar filtros por grupo/papel/status.
5.0.4 Allow ativar/desativar e exportar CSV.
5.0.5 Implementar UI de edição de papéis (multi-select). 

## Critérios de Sucesso
- Pastor encontra membro via busca/filtro.
- Alteração de papel é refletida no banco.
- Ativar/desativar funciona e membro perde acesso se inativo.

## Testes
- Integração: fluxo completo de alteração de papel e checagem RLS.
