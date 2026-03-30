# 4.0 - CRUD Grupos (Create / Read / Update / Delete)

## Objetivo
Implementar lógica de servidor para criar, editar, deletar grupos com geocoding via Nominatim API e upload de imagens.

## Entregáveis
- `app/admin/grupos/actions.ts` — Server actions: criar, editar, deletar grupo
- `app/admin/grupos/novo/page.tsx` — Página de criação
- `app/admin/grupos/[id]/page.tsx` — Página de edição
- Cache de geocoding em tabela auxiliar (opcional, para evitar rate limit)

## Subtarefas
4.0.1 Criar `app/admin/grupos/actions.ts` com server actions:
  - `criarGrupo(formData)` — valida, geocodifica, upload imagem, insere BD
    - Validações: nome/email/endereço obrigatórios, email unique, endereço válido
    - Chamada Nominatim: `https://nominatim.openstreetmap.org/search?q={endereco}&format=json&limit=1`
    - Se geocoding falhar → erro user-friendly
    - Upload imagem → bucket `grupo-imagens` (privado, max 5MB)
    - Insere em `grupos` table via `supabaseAdmin`
    - Retorna: `{ok: true, grupoId}` ou `{ok: false, error: string}`
  
  - `atualizarGrupo(id, formData)` — validation similar + update
    - Impede mudança de email se duplicado
    - Re-geocodifica apenas se endereço mudou
    - Revalidate path: `/admin/grupos`, `/admin/grupos/[id]`
  
  - `deletarGrupo(id)` — soft delete (ativo=false) ou delete físico com confirmação
    - Revalidate path: `/admin/grupos`

4.0.2 Implementar rate limiting para Nominatim:
  - Verificar se endereço já foi geocodificado (cache em tabela `geocoding_cache` ou memory)
  - Max 1 req/segundo para Nominatim API (se exceeder, aguardar)
  - Log de erros de geocoding para debug

4.0.3 Upload de imagem:
  - Criar bucket `grupo-imagens` no Supabase Storage (privado)
  - Path: `{grupo_id}/{filename}`
  - Validar mime: image/jpeg, image/png, image/webp
  - Gerar thumbnail opcional (se usar next/image optimization)
  - Retornar public URL para exibição

4.0.4 Criar página `app/admin/grupos/novo/page.tsx`:
  - Server component
  - Render: `NovoGrupoClient`

4.0.5 Criar página `app/admin/grupos/novo/novo-grupo-client.tsx`:
  - Client component
  - Form: `<GrupoForm onSubmit={criarGrupo} />`
  - Loading state durante criação
  - Success → redirect `/admin/grupos`
  - Error → exibe toast com mensagem

4.0.6 Criar página `app/admin/grupos/[id]/page.tsx`:
  - Server component
  - Fetch grupo via `getGrupoById(id)`
  - Render: `EditarGrupoClient`

4.0.7 Criar página `app/admin/grupos/[id]/editar-grupo-client.tsx`:
  - Client component
  - Form: `<GrupoForm grupo={grupo} onSubmit={atualizarGrupo} />`
  - Mudanças de endereço triggam re-geocoding
  - Success → toast + refresh page
  - Error → toast com detalhe

## Critérios de Sucesso
- POST /admin/grupos/actions → cria grupo com lat/lng corretos.
- Tentativa de criar 2 grupos com mesmo email → erro 409.
- Imagem upload → armazena em bucket e retorna URL.
- Delete marca grupo como inativo (ou deleta, conforme escolha).
- Nominatim rate limit respeitado (1 req/s max).

## Testes
- Criar grupo com endereço real (ex: "Rua das Flores, 123, São Paulo") → geocoding com sucesso
- Tentar criar com endereço inválido → erro "Endereço não encontrado"
- Edit grupo existente → só refaz geocoding se endereço mudou
- Delete grupo → estado muda para inativo ou some da listagem
- Upload imagem inválida (txt) → rejeita
- Imagem acima 5MB → rejeita
