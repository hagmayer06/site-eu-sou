# 3.0 - Layout do módulo financeiro + Configurações

## Objetivo
Criar o layout da área financeira com menu lateral e a tela de configurações (plano de contas + chave Pix).

## Entregáveis
- `app/admin/financeiro/layout.tsx` (menu lateral: Dashboard, Entradas, Saídas, Comprovantes, Relatórios, Configurações).
- `app/admin/financeiro/configuracoes/page.tsx` (plano de contas + chave Pix da igreja).
- `app/admin/financeiro/actions.ts` com Server Actions de escrita (base para as demais tasks).
- `app/admin/layout.tsx` atualizado com link "Financeiro" no menu.
- `app/membro/layout.tsx` atualizado com link "Contribuir" no menu do membro.

## Subtarefas
3.0.1 Criar `FinanceiroNav` (client component) com links e indicação da página ativa.
3.0.2 Criar layout com sidebar financeiro — esconder itens que conferente não pode acessar.
3.0.3 Implementar listagem de categorias (entradas e saídas separadas).
3.0.4 Implementar CRUD de categorias: criar, editar nome/ícone, desativar (sem excluir se houver lançamentos vinculados).
3.0.5 Implementar formulário de chave Pix e CNPJ da igreja com Server Action `salvarConfiguracaoAction`.
3.0.6 Adicionar link "Financeiro" no menu admin existente e "Contribuir" no menu do membro.

## Critérios de Sucesso
- Conferente vê apenas Dashboard, Entradas e Saídas no menu (sem Relatórios, Comprovantes e Configurações).
- Pastor/tesoureiro vê menu completo.
- Categorias criadas aparecem disponíveis nos formulários de lançamento.
- Chave Pix salva persiste após reload.

## Testes
- Navegar como conferente: links restritos não aparecem.
- Criar categoria "Eventos" (entrada) → aparece na listagem.
- Desativar categoria com lançamento vinculado → mantém lançamento intacto.
