# 2.0 - Autenticação base e middleware

## Objetivo
Construir helpers de autenticação e proteção de rotas.

## Entregáveis
- `lib/auth.ts` com `getSession`, `getPerfilAtual`, `signOut`.
- `middleware.ts` protege `/membro/*` e `/admin/*` (SSO Supabase SSR).

## Subtarefas
2.0.1 Implementar `getSession` e `getPerfilAtual` com client Supabase.
2.0.2 Atualizar paginação de `middleware` para redirecionar sem sessão.
2.0.3 Cobrir rota `/auth/*` como pública.
2.0.4 Testar rota segura e caminho de fallback.

## Critérios de Sucesso
- Usuário não autenticado em `/membro` redireciona para `/entrar`.
- Usuário pastor/tesoureiro pode acessar `/admin/membros`.
- Usuário membro não acessa `/admin`.

## Testes
- Integração: simular diferentes perfis e verificar redirecionamento.
