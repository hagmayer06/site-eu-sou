# 9.0 - Home Integration + E2E Tests + Documentation

## Objetivo
Integrar seção de Grupos no homepage público, criar testes E2E para validar todo fluxo, e documentar API/features.

## Entregáveis
- `components/sections/Grupos.tsx` — Seção no homepage com preview de grupos
- E2E tests (`tests/*.e2e.ts`) — Testes completos user journey
- `README.md` atualizado — Dokumentasi de features de Grupos
- `GROUPS-API.md` — Documentação técnica de endpoints e queries

## Subtarefas
9.0.1 Criar `components/sections/Grupos.tsx`:
  - Server component (ou SSG com revalidate)
  - Preview: 3-6 grupos mais recentes ou com mais membros
  - Card layout:
    - Foto grupo
    - Nome
    - Descrição (truncada, 2 linhas)
    - "X membros"
    - Botão "Explorar Mapa" → /grupos
  - Fallback: mensagem se nenhum grupo ativo
  - Responsivo: 1 col (mobile), 3 cols (desktop)

9.0.2 Estender `app/page.tsx`:
  - Importar `Grupos` section
  - Inserir após `SerieDoMes` (ou outra seção apropriada)

9.0.3 Criar E2E tests com Vitest/Playwright:

  **Test Suite 1 - Public Flow:**
  - `test: Visitor deve ver grupos no mapa`
    - Load `/grupos`
    - Verificar mapa renderizado
    - Verificar lista de grupos carregada
    - Click em marker → popup aparece
    - Click "Saiba Mais" → modal exibe detalhe
  
  - `test: Visitor deve filtrar grupos por nome`
    - Load `/grupos`
    - Type "São Paulo" no search
    - Verificar result filtra corretamente
    - Remove search → volta à lista completa

  **Test Suite 2 - Pastor CRUD Flow:**
  - `test: Pastor cria novo grupo`
    - Login como pastor
    - Navigate `/admin/grupos`
    - Click "Novo Grupo"
    - Preencher form (nome, email, endereço)
    - Click "Geocodificar" → lat/lng preenchem
    - Upload imagem
    - Submit → sucesso, redireciona /admin/grupos
    - Verificar novo grupo na tabela
    - Verificar novo grupo aparece no mapa público
  
  - `test: Pastor edita grupo`
    - Login como pastor
    - Navigate `/admin/grupos`
    - Click edit em grupo existente
    - Mudança nome → update form
    - Submit → sucesso, dados atualizados
    - Verificar mapa atualizado

  **Test Suite 3 - Lider Workflow:**
  - `test: Lider adiciona membro ao grupo`
    - Login como lider
    - Navigate `/admin/grupos/membros/[grupoId]`
    - Click "Adicionar Membro"
    - Search email, select member
    - Submit → membro aparece na lista
  
  - `test: Lider cria reunião`
    - Login como lider
    - Navigate `/admin/grupos/reunioes/[grupoId]`
    - Click "Nova Reunião"
    - Preench: segunda 19:00, "Culto"
    - Submit → vê na agenda
  
  - `test: Lider cria aviso WhatsApp`
    - Login como lider
    - Navigate `/admin/grupos/avisos/[grupoId]`
    - Type aviso
    - Click "Gerar Link" → wa.me link funciona
    - Click "Salvar Aviso" → histórico atualiza

  **Test Suite 4 - Membro (read-only):**
  - `test: Membro vê apenas seu grupo`
    - Login como membro
    - Cannot access `/admin/grupos` → redirecionado
    - Can view `/grupos` (public map)

9.0.4 Criar arquivo `GROUPS-API.md`:
  - Seção: Overview (o que é, features)
  - Seção: Database Schema (4 tables, RLS policies)
  - Seção: Query Functions (`gruposQueries.ts`)
  - Seção: Server Actions (`actions.ts`)
  - Seção: Components Públicos
  - Seção: Integração Nominatim (endpoint, rate limit, cache)
  - Seção: WhatsApp wa.me integration
  - Seção: Troubleshooting

9.0.5 Atualizar `README.md`:
  - Adicionar seção "Grupos Familiares"
  - Sumário de features
  - Links para GROUPS-API.md
  - Screenshots (opcional)

9.0.6 Performance audit:
  - Executar Lighthouse em `/grupos` → mínimo 75 score
  - Executar Lighthouse em `/admin/grupos` → mínimo 70 score
  - Profile queries de mapa (verificar N+1)

9.0.7 Cleanup final:
  - Verificar console errors/warnings
  - Test em browsers: Chrome, Firefox, Safari (mobile)
  - Validar RLS: anonymous user não consegue mutation
  - Validar auth: sessão expirada → logout

## Critérios de Sucesso
- Seção Grupos visível no homepage
- E2E tests passam 100%
- Documentação completa e atualizada
- Lighthouse score aceitável
- Zero console errors em produção

## Testes
- Load homepage → seção Grupos renderiza
- Visitor clica "Explorar Mapa" → vai para `/grupos`
- Pastor cria grupo → 5 minutos max, sucesso primeira vez
- Lider adiciona membro → lista atualiza real-time
- Lider cria aviso → wa.me link abre WhatsApp
- E2E suite: rodas em < 3 minutos
- Mapa com 100+ grupos: performance acceptable (< 5s load)

## Dependências completadas
Todas as tasks anteriores (1-8) devem estar ✅ before starting this task.
