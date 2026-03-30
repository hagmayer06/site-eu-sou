# 7.0 - Avisos via WhatsApp

## Objetivo
Implementar sistema de avisos para grupos com integração wa.me links para envio manual e histórico persistido.

## Entregáveis
- `app/admin/grupos/avisos/page.tsx` — Listagem de grupos
- `app/admin/grupos/avisos/[grupoId]/page.tsx` — Avisos de um grupo
- `components/admin-formularios/AvisoForm.tsx` — Form criar aviso
- `app/admin/grupos/actions.ts` (extensão) — Server action criar aviso
- Visualização de wa.me links para envio manual

## Subtarefas
7.0.1 Criar `app/admin/grupos/avisos/page.tsx`:
  - Server component
  - Fetch: lista de grupos
  - Render: `AvisosListClient`

7.0.2 Criar `app/admin/grupos/avisos/avisos-list-client.tsx`:
  - Client component
  - Grid/table de grupos com:
    - Nome grupo
    - Total avisos (últimos 7 dias)
    - Link "Ver Avisos" → detalhe

7.0.3 Criar `app/admin/grupos/avisos/[grupoId]/page.tsx`:
  - Server component
  - Fetch: `getAvisosGrupo(grupoId, limit=20)`
  - Render: `AvisosDetalheClient`

7.0.4 Criar `app/admin/grupos/avisos/[grupoId]/avisos-detalhe-client.tsx`:
  - Client component
  - Status: Criar novo aviso (seção 1) + Histórico (seção 2)
  
  - **Seção 1 - Novo Aviso:**
    - Form: titulo, mensagem, tipo (reuniao/evento/geral)
    - Preview de wa.me link com mensagem formatada
    - Botão "Gerar Link" → abre wa.me em nova aba
    - Botão "Salvar Aviso" → insere em BD + gera link wa.me para cada membro
    - Estados: loading, success, error
  
  - **Seção 2 - Histórico:**
    - Table/list de avisos: data, tipo, título, autor, status (enviado/pendente/falha)
    - Botão "Re-enviar" → regenera link wa.me
    - Delete aviso (optional)
    - Pagination se > 10 avisos

7.0.5 Criar `components/admin-formularios/AvisoForm.tsx`:
  - Props: `{grupoId, onSubmit, onCancel}`
  - Campos:
    - Título (required)
    - Mensagem (textarea, required, max 1000 chars)
    - Tipo (select: reuniao/evento/geral)
  - Features:
    - Character counter para mensagem
    - Preview de como ficará no WhatsApp
    - Template buttons (presets para tipos comuns)

7.0.6 Estender `app/admin/grupos/actions.ts`:
  - `criarAviso(grupoId, {titulo, mensagem, tipo})`:
    - Insert em `avisos_grupo` com status='pendente'
    - Gera wa.me links para cada membro ativo do grupo
    - Formato wa.me: `https://wa.me/{numero_sem_formatacao}?text={encoded_mensagem}`
    - Armazena wa_message_id (para future integração com API Twilio/WhatsApp)
    - Revalidate: `/admin/grupos/avisos/[grupoId]`
    - Retorna: `{ok: true, avisoId, waLinks: [{membroId, url}]}`
  
  - `reenviarAviso(grupoId, avisoId)`:
    - Regenera links wa.me
    - Update status em BD (marca como re-enviado)
    - Retorna: links atualizados

7.0.7 Função helper `gerarWaLink(numero, mensagem)`:
  - Valida número (deve ter formato BR: 11987654321)
  - Encoda mensagem para URL (UTF-8)
  - Retorna: `https://wa.me/{numero}?text={encoded}`

7.0.8 Integração membro (future):
  - Perfis precisam ter campo `telefone_whatsapp` em `perfis` table (ou estender em 1.0)
  - Buscar telefones dos membros para gerar wa.me links

## Critérios de Sucesso
- Criar aviso → insere em BD com data/hora
- Preview wa.me link mostra mensagem corretamente formatada
- Clique em wa.me link → abre WhatsApp Web ou app
- Histórico mostra avisos em order DESC por data
- Character counter funciona para mensagem

## Testes
- Criar aviso com 50 chars → wa.me link funciona
- Criar aviso com acentuação (ã, é, ü) → encoda corretamente
- Preview mostra mensagem exata que será enviada
- Re-enviar aviso → regenera links (não duplica em BD)
- Filtro por tipo (reuniao/evento/geral) opcional
- Pagination de histórico se > 10 avisos
