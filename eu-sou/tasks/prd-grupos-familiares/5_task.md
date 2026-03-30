# 5.0 - Gerenciar Membros do Grupo

## Objetivo
Implementar interface e lógica para adicionar, listar, remover membros de um grupo com validação de unicité.

## Entregáveis
- `app/admin/grupos/membros/page.tsx` — Listagem de grupos com view de membros
- `app/admin/grupos/membros/[grupoId]/page.tsx` — Detalhe de membros de um grupo
- `app/admin/grupos/actions.ts` (extensão) — Server actions: adicionar/remover membro
- `components/membros/MembroGrupoForm.tsx` — Form para adicionar membro

## Subtarefas
5.0.1 Criar `app/admin/grupos/membros/page.tsx`:
  - Server component
  - Fetch: lista de grupos (apenas do lider/pastor)
  - Render: `MembrosListClient`
  - Link para cada grupo → `/admin/grupos/membros/[grupoId]`

5.0.2 Criar `app/admin/grupos/membros/membros-list-client.tsx`:
  - Client component
  - Grid ou table de grupos com:
    - Nome grupo
    - Total membros
    - Data criação
    - Link "Ver Membros" (→ detalhe)
  - Botão "Novo Grupo" se nenhum existe

5.0.3 Criar `app/admin/grupos/membros/[grupoId]/page.tsx`:
  - Server component
  - Fetch: `getGrupoById(grupoId)` + `getMembrosGrupo(grupoId)`
  - Auth check: user é lider/pastor do grupo? (via RLS)
  - Render: `MembrosDetalheClient`

5.0.4 Criar `app/admin/grupos/membros/[grupoId]/membros-detalhe-client.tsx`:
  - Client component
  - Tab/Section 1: Listagem de membros
    - Table: nome, email, cargo (lider/membro), data entrada, ações (edit, remove)
    - Botão "Adicionar Membro" → modal com form
    - Remove membro → soft delete (data_saida = now()) ou hard delete
  - Tab/Section 2: Adicionar novo membro
    - Search por email entre perfis existentes
    - Ou convite (email) para perfis não cadastrados (futuro feature)

5.0.5 Criar `components/membros/MembroGrupoForm.tsx`:
  - Props: `{grupoId, onSubmit, onCancel}`
  - Autocomplete field: busca perfis por email/nome
  - Cargo: select (lider/membro)
  - Validação: email deve existir em `perfis` table
  - Validação: membro não pode estar 2x no mesmo grupo (uniqueness constraint no BD)
  - Submit → chama `adicionarMembroGrupo` action

5.0.6 Estender `app/admin/grupos/actions.ts`:
  - `adicionarMembroGrupo(grupoId, perfilId, cargo)`:
    - Validações: perfil existe? É único no grupo? Erro 409 se duplicado
    - Insert em `membros_grupo`
    - Revalidate path: `/admin/grupos/membros/[grupoId]`
    - Retorna: `{ok: true}` ou `{ok: false, error}`
  
  - `removerMembroGrupo(grupoId, membroGrupoId)`:
    - Soft delete ou update data_saida
    - Revalidate path: `/admin/grupos/membros/[grupoId]`
    - Validação: lider pode remover membro? Apenas pastor pode remover lider?

5.0.7 Testes de validação:
  - Tentar adicionar mesmo membro 2x → erro 409
  - Remover membro → data_saida atualizado ou deletado
  - Autocomplete filtra por email correto
  - RLS: membro vê apenas seus próprios dados, lider vê seu grupo

## Critérios de Sucesso
- Adicionar membro → aparece na lista instantaneamente (revalidate)
- Constraint BD impede duplicação
- Remover membro → some da lista ou mostra como inativo
- Autocomplete busca por email funciona

## Testes
- Add membro novo → vê na tabela
- Tentar adicionar 2x → erro "Membro já existe neste grupo"
- Remove membro → desaparece ou mostra como saído
- Pagination se > 10 membros
- Filter por cargo (lider/membro) opcional
