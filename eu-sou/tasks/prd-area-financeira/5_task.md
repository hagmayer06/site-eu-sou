# 5.0 - Lançamento de Saídas / Contas a Pagar

## Objetivo
Permitir que o tesoureiro registre despesas com controle de vencimento e status de pagamento.

## Entregáveis
- `app/admin/financeiro/saidas/page.tsx` (lista + formulário).
- Server Actions `criarSaidaAction`, `marcarPagoAction` em `actions.ts`.
- Lógica de atualização automática de status "vencido".

## Subtarefas
5.0.1 Criar listagem de saídas com colunas: data vencimento, descrição, categoria, valor, status (badge colorido: pendente/pago/vencido).
5.0.2 Implementar filtros: status, categoria, período de vencimento.
5.0.3 Reutilizar `LancamentoForm` para saídas adicionando campos: data vencimento, status inicial.
5.0.4 Implementar `criarSaidaAction` (tipo = 'saida', status inicial = 'pendente').
5.0.5 Implementar `marcarPagoAction`: atualiza status para 'pago', registra data real de pagamento e aceita upload de comprovante (PDF/imagem) no bucket `comprovantes`.
5.0.6 Implementar função `atualizarVencidos()`: chamada no carregamento da página — atualiza `status = 'vencido'` onde `data_vencimento < hoje AND status = 'pendente'`.
5.0.7 Exibir banner de alerta no topo da página quando há contas vencidas não pagas.

## Critérios de Sucesso
- Conta com `data_vencimento` no passado aparece com badge "vencido" automaticamente.
- Marcar como pago atualiza status e exibe comprovante anexado.
- Upload de comprovante salvo no bucket `comprovantes` com URL assinada (não pública).

## Testes
- Unitário: `calcularStatus(dataVencimento, hoje)` → 'vencido' quando data passada.
- Integração: criar saída pendente com vencimento ontem → recarregar lista → status 'vencido'.
- Storage: comprovante enviado não acessível por URL direta sem token.
