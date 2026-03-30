# 2.0 - Migrations + Query Layer

## Objetivo
Criar schema do banco de dados para grupos familiares com 4 tabelas principais, RLS e índices otimizados.

## Entregáveis
- Migration SQL: `supabase/migrations/<timestamp>_criar_grupos_familiares.sql` com 4 tabelas + RLS + índices.
- `lib/gruposQueries.ts` com funções CRUD type-safe para todas as operações de leitura.
- Seed SQL com grupos de exemplo (opcional, para dev).

## Subtarefas
2.0.1 Criar tabela `grupos`:
  - Campos: id (uuid), nome, descricao, endereco, latitude, longitude, telefone, email, imagem_url, ativo, lider_id (fk perfis), criado_em, atualizado_em
  - Constraints: unique(email), unique(telefone), not null (nome, endereco)
  - RLS: SELECT públic, INSERT/UPDATE/DELETE apenas pastor/lider do grupo

2.0.2 Criar tabela `membros_grupo`:
  - Campos: id (uuid), grupo_id (fk), perfil_id (fk perfis), cargo (lider|membro), data_entrada, data_saida (nullable), ativo
  - Constraints: unique(grupo_id, perfil_id) — impede duplicação
  - Índices: (grupo_id, ativo), (perfil_id)
  - RLS: SELECT lider/members do grupo, INSERT/UPDATE/DELETE apenas lider/pastor

2.0.3 Criar tabela `reunioes_grupo`:
  - Campos: id (uuid), grupo_id (fk), titulo, descricao, dia_semana (0-6), horario (HH:MM), localizacao, criado_por (fk perfis), criado_em, atualizado_em
  - RLS: SELECT all members, INSERT/UPDATE/DELETE apenas lider/pastor

2.0.4 Criar tabela `avisos_grupo`:
  - Campos: id (uuid), grupo_id (fk), titulo, mensagem, tipo (reuniao|evento|geral), data_envio, enviado_por (fk perfis), wa_message_id (para future integração API), criado_em
  - Índices: (grupo_id, tipo), (data_envio DESC)
  - RLS: SELECT público, INSERT apenas lider/pastor, DELETE apenas criador/pastor

2.0.5 Implementar RLS policies:
  - Anonimous (público): SELECT grupos (ativo=true), SELECT avisos
  - authenticated (membro): SELECT grupos (ativo OR é membro), ver membros/reuniões do seu grupo
  - lider: CRUD seu grupo + membros + reuniões + avisos
  - pastor: CRUD all

2.0.6 Criar índices otimizados:
  - `grupos(ativo, criado_em DESC)` — para listagem pública
  - `membros_grupo(grupo_id, data_saida)` — membros ativos
  - `reunioes_grupo(grupo_id, dia_semana)` — agenda
  - `avisos_grupo(grupo_id, criado_em DESC)` — histórico avisos

2.0.7 Descrever `lib/gruposQueries.ts` com funções (todas com supabase param):
  - `getGrupos(filtro?: {ativo, search})` — SELECT com filtro
  - `getGrupoById(id)` — GET um grupo + membros + reuniões
  - `getMembrosGrupo(grupoId)` — lista de membros
  - `getReunioesGrupo(grupoId)` — reuniões agendadas
  - `getAvisosGrupo(grupoId, limit=10)` — avisos recentes
  - `getBoundingBoxGrupos()` — retorna lat/lng de grupos para mapa

## Critérios de Sucesso
- Migration executa sem erros em `supabase db reset`.
- RLS impede membro de ver grupos inativos.
- Uniqueness constraint bloqueia adesão duplicada.
- Índices foram criados e aparecem em `pg_indexes` query.

## Testes
- INSERT membro 2x no mesmo grupo → viola constraint.
- SELECT as anonymous → apenas grupos ativo=true.
- SELECT as lider de grupo B → não vê grupo A.
- Teste índices: EXPLAIN ANALYZE on WHERE grupo_id = 'X' — deve usar índice.
