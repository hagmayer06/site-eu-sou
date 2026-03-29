# 1.0 - Infraestrutura de dados e RBAC

## Objetivo
Criar estrutura de dados no Supabase para perfis e controle de papéis com segurança RLS.

## Entregáveis
- Tabela `perfis` criada com relações e defaults.
- Trigger `handle_new_user` para criação de perfil automático.
- RLS habilitado e policies:
  - perfil_self (membro: somente própria linha)
  - perfil_admin_read (pastor/tesoureiro read)
  - perfil_pastor_write (pastor write)

## Subtarefas
1.0.1 Definir e aplicar migration SQL para tabela `perfis`.
1.0.2 Criar função trigger e trigger `on_auth_user_created`.
1.0.3 Habilitar RLS e políticas.
1.0.4 Testar manualmente via Supabase SQL Editor.
1.0.5 Ajustar documentação de schema.

## Critérios de Sucesso
- Novo usuário em `auth.users` gerar registro em `perfis` automaticamente.
- Membro não consegue ler/editar outro perfil.
- Pastor pode ler e editar qualquer perfil.

## Testes
- Unitário: nenhuma lógica em app, mas script de validação SQL.
- Integração: criar usuário de teste, verificar `perfis`; executar query como membro admin.
