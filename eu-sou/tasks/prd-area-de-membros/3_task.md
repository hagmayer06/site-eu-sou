# 3.0 - UI de auth pública (cadastro/login)

## Objetivo
Criar as páginas de cadastro e login (identidade digital) no grupo `(auth)`.

## Entregáveis
- `app/(auth)/cadastro/page.tsx` (formulário multi-step)
- `app/(auth)/entrar/page.tsx` (e-mail/senha, Google, Magic Link)
- `app/(auth)/layout.tsx` (layout auth mínimo)

## Subtarefas
3.0.1 Criar formulário de cadastro com campos obrigatórios e validação.
3.0.2 Implementar chamada `supabase.auth.signUp` e captura de erros.
3.0.3 Implementar login email/senha + Google provider + MagicLink email.
3.0.4 Implementar recuperação de senha (supabase.auth.resetPasswordForEmail).
3.0.5 Testar UX em mobile.

## Critérios de Sucesso
- Visitante completa cadastro e é redirecionado para rota de confirmação.
- Login funciona nos três modos.
- Erros de validação exibidos adequadamente.

## Testes
- Unitário: validações de formulário.
- Integração: criar conta, login, senha reset.
