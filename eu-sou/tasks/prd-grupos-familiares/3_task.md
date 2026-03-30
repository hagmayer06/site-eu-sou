# 3.0 - Admin Layout + GrupoForm Component

## Objetivo
Criar layout administrativo para gerenciamento de grupos e componente reutilizável de form para CRUD.

## Entregáveis
- `app/admin/grupos/layout.tsx` — Layout sidebar com nav para Grupos / Membros / Reuniões / Avisos
- `components/admin-formularios/GrupoForm.tsx` — Form componentizado (Create + Edit mode)
- `app/admin/grupos/page.tsx` — Landing page com listagem

## Subtarefas
3.0.1 Criar `app/admin/grupos/layout.tsx`:
  - Estende layout admin existente
  - Sidebar com 4 links: Grupos, Membros, Reuniões, Avisos
  - Breadcrumb: Admin > Grupos
  - Type: Server Component com auth check

3.0.2 Criar `components/admin-formularios/GrupoForm.tsx`:
  - Props: `{grupo?: Grupo, onSubmit, isLoading}`
  - Modo Create: todos campos vazios
  - Modo Edit: pre-fill com valores
  - Campos:
    - Nome (required, text)
    - Descrição (textarea)
    - Endereço (required, text com button "Geocodificar")
    - Latitude/Longitude (read-only, mostrem resultado geocoding)
    - Telefone (tel, opcional)
    - Email (email, required, unique validation)
    - Imagem (file upload, preview, max 5MB)
    - Ativo (toggle)
    - Líder (select de perfis com role pastor/lider)
  - Validações client-side: nome, email, endereço, lider obrigatórios
  - Server-side validation será na action

3.0.3 Criar `app/admin/grupos/page.tsx`:
  - Server component
  - Imports: auth check
  - Fetch: `getGrupos()` query
  - Render: `GruposListClient` component
  - Button "Novo Grupo" → /admin/grupos/novo

3.0.4 Criar `app/admin/grupos/grupos-client.tsx`:
  - Client component com useState, useTransition
  - Table de grupos: nome, email, lider, membros count, ativo, açoes (edit, delete)
  - Search/filter por nome
  - Pagination opcional (se > 10)
  - Delete button com confirm modal → chama server action

## Critérios de Sucesso
- Form valida email como required.
- Layout renderiza sem erros.
- Search de grupos filtra em tempo real.
- Imagem preview funciona antes de upload.

## Testes
- Abrir /admin/grupos → vê tabela vazia (ou grupos existentes).
- Clicar "Novo Grupo" → form exibe, todos campos vazios.
- Clicar edit em grupo existente → form pre-preenche correct.
- Mudança de rota no sidebar funciona.
