# 4.0 - Área do membro (self-service)

## Objetivo
Exibir dashboard do membro e permitir edição de perfil com restrição RLS.

## Entregáveis
- `app/membro/layout.tsx` (navbar/sidebar membro)
- `app/membro/page.tsx` (dashboard perfil/grupo/eventos)
- `app/membro/perfil/page.tsx` (edição perfil)
- `components/membros/PerfilForm.tsx` (formulário + upload de foto)

## Subtarefas
4.0.1 Implementar layout com navegação.
4.0.2 Exibir dados do perfil e informações de grupo.
4.0.3 Criar formulário de edição de perfil (nome, telefone, endereço, foto).
4.0.4 Integrar com `lib/membrosQueries.ts` para atualizações.
4.0.5 Validar RLS (usuário só atualiza o próprio perfil).

## Critérios de Sucesso
- Membro vê e atualiza seus dados.
- Foto de perfil salva e exibida.
- Acesso negado ao perfil de outro usuário.

## Testes
- Unitário: função de upload de foto e validação de campos.
- Integração: editar perfil, recarregar e validar no DB.
