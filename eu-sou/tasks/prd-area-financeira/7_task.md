# 7.0 - Contribuição Pix (Membro) + Fila de Comprovantes (Tesoureiro)

## Objetivo
Permitir que o membro envie contribuição via Pix com comprovante, e que o tesoureiro confirme e lance a entrada.

## Entregáveis
- `app/membro/contribuir/page.tsx` (página do membro: exibe chave Pix, tipo, valor e upload de comprovante).
- `app/admin/financeiro/comprovantes/page.tsx` (fila de confirmação do tesoureiro).
- Server Actions: `enviarComprovanteMembro`, `confirmarComprovante` em `actions.ts`.

## Subtarefas
7.0.1 Criar `app/membro/contribuir/page.tsx`:
  - Busca chave Pix e nome da igreja de `configuracoes_igreja`.
  - Exibe chave Pix com botão "Copiar".
  - Formulário: tipo (dízimo/oferta), valor (R$), upload de comprovante (imagem/PDF, máx 10 MB).
  - Instrução passo a passo (copiar chave → pagar → enviar comprovante).
7.0.2 Implementar `enviarComprovanteMembro` (Server Action):
  - Upload do comprovante no bucket `comprovantes` via `supabaseAdmin`.
  - Criar lançamento com `status = 'pendente'`, `membro_id = auth.uid()`, `comprovante_url = path`.
7.0.3 Criar `app/admin/financeiro/comprovantes/page.tsx`:
  - Lista de comprovantes pendentes com: membro, tipo, valor informado, data, miniatura do comprovante.
  - URL assinada do comprovante gerada server-side (visualização segura).
7.0.4 Implementar `confirmarComprovante` (Server Action):
  - Atualiza lançamento: `status = 'confirmado'`, registra `criado_por` do tesoureiro.
  - Permite ajustar o valor real (pode diferir do informado pelo membro).
7.0.5 Exibir histórico de contribuições enviadas pelo próprio membro em `/membro/contribuir` (abas: "Enviar" / "Histórico").

## Critérios de Sucesso
- Membro envia comprovante → aparece na fila do tesoureiro em tempo real.
- Tesoureiro confirma → lançamento de entrada criado automaticamente com valor confirmado.
- Membro vê histórico de contribuições com status (pendente/confirmado).
- Comprovante visualizável apenas via URL assinada (não por URL direta).

## Testes
- Integração: membro envia comprovante → query na fila do tesoureiro retorna 1 item → confirmação → status 'confirmado'.
- Storage: URL direta do comprovante retorna 403; URL assinada retorna 200.
- E2E: fluxo completo membro → tesoureiro → lançamento criado.
