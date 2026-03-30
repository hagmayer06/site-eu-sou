# 6.0 - Reuniões Recorrentes (CRUD + Agenda)

## Objetivo
Implementar CRUD de reuniões recorrentes com dias da semana e horários, com visualização em calendário/agenda.

## Entregáveis
- `app/admin/grupos/reunioes/page.tsx` — Listagem de grupos
- `app/admin/grupos/reunioes/[grupoId]/page.tsx` — Agenda de reuniões do grupo
- `components/admin-formularios/ReunioForm.tsx` — Form criar/editar reunião
- `app/admin/grupos/actions.ts` (extensão) — Server actions para reuniões

## Subtarefas
6.0.1 Criar `app/admin/grupos/reunioes/page.tsx`:
  - Server component
  - Fetch: lista de grupos
  - Render: `ReunioesListClient`

6.0.2 Criar `app/admin/grupos/reunioes/reunioes-list-client.tsx`:
  - Client component
  - Grid/table de grupos com:
    - Nome grupo
    - Total reuniões agendadas
    - Link "Ver Agenda" → detalhe

6.0.3 Criar `app/admin/grupos/reunioes/[grupoId]/page.tsx`:
  - Server component
  - Fetch: `getReunioesGrupo(grupoId)`
  - Render: `AgendaClient`

6.0.4 Criar `app/admin/grupos/reunioes/[grupoId]/agenda-client.tsx`:
  - Client component
  - View 1: Lista de reuniões (tabela)
    - Colunas: dia semana, horário, título, localizacao, ações (edit, delete)
    - Botão "Nova Reunião" → modal com form
  - View 2: Agenda semanal (opcional, nice-to-have)
    - Grid com dias da semana (seg-dom)
    - Reuniões exibidas por dia
  - Delete com confirm modal

6.0.5 Criar `components/admin-formularios/ReunioForm.tsx`:
  - Props: `{grupoId, reuniao?: Reuniao, onSubmit, onCancel}`
  - Modo Create: campos vazios
  - Modo Edit: pre-fill
  - Campos:
    - Título (required)
    - Descrição (textarea, opcional)
    - Dia da semana (select: segunda, terça, ..., domingo)
    - Horário (time input, HH:MM)
    - Localização (text, opcional)
  - Validation: título e dia/horário obrigatórios

6.0.6 Estender `app/admin/grupos/actions.ts`:
  - `criarReuniao(grupoId, {titulo, descricao, diaSeana, horario, localizacao})`:
    - Insert em `reunioes_grupo`
    - Revalidate: `/admin/grupos/reunioes/[grupoId]`
    - Retorna: `{ok: true, reuniaoId}`
  
  - `atualizarReuniao(grupoId, reuniaoId, data)`:
    - Update `reunioes_grupo`
    - Revalidate path
    - Retorna: `{ok, error?}`
  
  - `deletarReuniao(grupoId, reuniaoId)`:
    - Delete `reunioes_grupo`
    - Revalidate path
    - Retorna: `{ok, error?}`

6.0.7 Integração com mapa (future):
  - Reuniões podem ter geocoding de localização (opcional para task 8.0)

## Critérios de Sucesso
- CRUD completo funciona
- Dia semana + horário obrigatórios
- Lista atualiza após criar/editar/deletar (revalidate)
- Form pré-preenche corretamente em edit mode

## Testes
- Criar reunião: segunda 19:00 "Culto" → vê na lista
- Edit: mudar dia para quarta → atualiza
- Delete com confirm → desaparece
- Validação: tentar criar sem dia/horário → erro
- Agenda visual mostra reuniões agrupadas por dia (se implementado)
