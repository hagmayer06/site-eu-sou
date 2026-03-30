# 1.0 - Middleware + RLS Setup

## Objetivo
Estender middleware de autenticação para incluir grupo_id no token e preparar contexto para RLS de Grupos Familiares.

## Entregáveis
- `middleware.ts` atualizado com grupo_id extraction
- Tipos TypeScript em `lib/database.types.ts` com tipos de grupos
- Verificação de role e grupo_id funcionando

## Subtarefas
1.0.1 Atualizar `middleware.ts` para extrair **grupo_id** da tabela `perfis` ao fazer decode do JWT.
1.0.2 Estender tipos de `database.types.ts`:
  - `tipo_acesso_grupo` = 'pastor' | 'lider' | 'membro' | 'público'
  - `grupo` type com schema básico
  - `membro_grupo` type com schema básico
1.0.3 Criar função helper `getGrupoIdFromAuth()` em `lib/auth.ts` para extrair grupo_id do session.
1.0.4 Criar route protection helper para `/admin/grupos/*` que valida role `pastor` ou `lider`.
1.0.5 Testar: Token JWT deve incluir grupo_id após login.

## Critérios de Sucesso
- Middleware não quebra login existente.
- `console.log(user?.grupo_id)` em `/admin/grupos` mostra grupo_id correto.
- Role validation bloqueia user com role de `membro` em `/admin/grupos/*`.

## Testes
- Login como pastor → acessa `/admin/grupos` OK.
- Login como membro → redirect para `/membro` (não consegue acessar `/admin`).
- Session refresh mantém grupo_id intacto.
