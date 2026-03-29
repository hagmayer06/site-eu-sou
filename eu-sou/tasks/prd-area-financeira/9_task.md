# 9.0 - Avisos de Vencimento (Edge Function cron) + Testes + Documentação

## Objetivo
Automatizar e-mails de aviso de vencimento, garantir cobertura de testes e documentar o rollout do módulo financeiro.

## Entregáveis
- `supabase/functions/avisos-vencimento/index.ts` (Edge Function com cron diário às 08h).
- Suíte de testes unitários e de integração para funções críticas.
- README atualizado com setup do módulo financeiro (bucket `comprovantes`, Edge Function, variáveis).

## Subtarefas

### 9.0.1 Edge Function `avisos-vencimento`
- Cron schedule: `0 8 * * *` (todo dia às 08:00 BRT).
- Busca lançamentos com `status = 'pendente'` e `data_vencimento = hoje + 3 dias`.
- Envia e-mail ao tesoureiro via Supabase Auth email (template: título, lista de contas, valores).
- Em caso de falha no envio: registra log de erro sem interromper outras notificações.
- Deploy: `supabase functions deploy avisos-vencimento`.

### 9.0.2 Testes
- Unitário: `calcularStatus`, `formatarReais`, `parseCentavos`, `gerarCSV`.
- Integração: RLS do conferente (acesso restrito ao grupo), fluxo comprovante → confirmação.
- E2E (Playwright): fluxo completo membro → comprovante → tesoureiro confirma → lançamento criado.

### 9.0.3 Documentação (README)
- Variáveis de ambiente novas (nenhuma — usa as existentes do Supabase).
- Setup bucket `comprovantes`: SQL de criação + RLS de storage.
- Deploy da Edge Function: `supabase functions deploy avisos-vencimento --schedule "0 8 * * *"`.
- Checklist de deploy do módulo financeiro.
- QA manual: fluxo tesoureiro (lançar entrada/saída, dashboard, relatório) e fluxo membro (contribuir, ver histórico).

## Critérios de Sucesso
- Edge Function executa sem erro em `supabase functions serve avisos-vencimento` local.
- E-mail de aviso enviado para tesoureiro com contas corretas.
- README revisado e aprovado com todos os passos de setup.

## Testes
- Edge Function: simular chamada com data artificialmente definida → verificar e-mail enviado.
- Revisar README com checklist de deploy financeiro completo.
