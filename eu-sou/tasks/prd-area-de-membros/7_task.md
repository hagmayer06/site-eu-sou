# 7.0 - Integrações (ViaCEP + Storage Avatar)

## Objetivo
Adicionar preenchimento de endereço por CEP e upload seguro de fotos.

## Entregáveis
- Cadastro com busca ViaCEP e campos auto-preenchidos.
- Bucket Supabase Storage `avatares` privado.
- Upload de foto e URL assinada no `perfis.foto_url`.

## Subtarefas
7.0.1 Implementar função `fetchCep(cep)` no cadastro.
7.0.2 Atualizar o formulário de edição para permitir upload de imagem.
7.0.3 Implementar Server Action para upload de avatar (service_role).
7.0.4 Gerar URL assinada para exibição e expiração 1h.
7.0.5 Testar fallback para avatar padrão.

## Critérios de Sucesso
- CEP válido preenche endereço.
- Foto salva no bucket e field `foto_url` atualizado.
- Membro vê avatar sem expor storage público.

## Testes
- Integração: API ViaCEP mockada e upload funcional.
