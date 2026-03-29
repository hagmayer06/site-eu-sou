# 6.0 - API/Server Actions e queries

## Objetivo
Implementar backend de leitura/escrita para membros e papéis com segurança.

## Entregáveis
- `lib/membrosQueries.ts` (tipos e funções read/write)
- `app/admin/membros/actions.ts` (Server Actions pastor)

## Subtarefas
6.0.1 Definir `PerfilRow` e helper `temPapel`.
6.0.2 Criar funções: getPerfil, listMembros, updatePerfil, setPapeis, setAtivo.
6.0.3 Criar ações servidoras com `supabaseAdmin` e validações de negócio.
6.0.4 Cobrir edge cases: usuário sem perfil, ação não autorizada.

## Critérios de Sucesso
- API persiste corretamente e respeita RBAC.
- Logs de erro claros para falhas.

## Testes
- Unitário: funções de queries com mock do client.
- Integração: action em ambiente de teste.
