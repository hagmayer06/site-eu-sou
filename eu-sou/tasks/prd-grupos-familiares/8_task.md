# 8.0 - Mapa Público + Leaflet Integration (HIGH COMPLEXITY)

## Objetivo
Implementar mapa interativo publicamente acessível com Leaflet/OpenStreetMap para descoberta e visualização de grupos familiares.

## Entregáveis
- `components/sections/MapaGrupos.tsx` — Componente Leaflet com markers de grupos
- `components/financeiro/MapaGruposPublico.tsx` — Página pública com mapa fullscreen
- `app/grupos/page.tsx` — Página pública de descoberta (mapa + lista)
- Integração com CSS do Leaflet em `globals.css`
- Função de geocoding reverso para detalhes do grupo no mapa

## Subtarefas
8.0.1 Instalação de dependências:
  - `npm install react-leaflet leaflet @types/leaflet`
  - Importar CSS do Leaflet em `app/globals.css`:
    ```css
    @import 'leaflet/dist/leaflet.css';
    ```

8.0.2 Criar `components/sections/MapaGrupos.tsx`:
  - Client component com `'use client'`
  - Props: `{grupos: Grupo[], onMarkerClick: (grupo) => void}`
  - Features:
    - MapContainer: centered em Brasil (lat -14.2, lng -51.9), zoom 4
    - TileLayer: OpenStreetMap (free tiles)
    - Markers para cada grupo com lat/lng
    - Marker icon: customizado com cor/ícone
    - Popup ao clicar: nome grupo, endereço, telefone, botão "Detalhes"
    - MarkerCluster (opcional, se muitos grupos): agrupar markers próximos
  - Prévention bugs:
    - SSR: renderizar dentro de dynamic() com ssr: false
    - Styles: Leaflet CSS não conflitar com Tailwind

8.0.3 Criar `app/grupos/page.tsx`:
  - Server component
  - Fetch: `getGrupos({ativo: true})` — grupos públicos
  - Render: `GruposPublicoClient`

8.0.4 Criar `app/grupos/grupos-publico-client.tsx`:
  - Client component
  - Layout: 2 colunas (map + list) ou abas (map / list)
  - **Coluna/Aba 1 - Mapa:**
    - MapaGrupos component
    - Click marker → destacar na lista e mostrar detalhes
  - **Coluna/Aba 2 - Lista:**
    - Cards ou table de grupos:
      - Foto (thumbnail)
      - Nome, endereço, telefone
      - "Membros: X pessoas"
      - Reuniões próximas (próximas 3)
      - Botão "Saiba Mais" → modal ou página detalhe
    - Filtro por:
      - Search por nome/endereço
      - Distance/raio (opcional, usa lat/lng do user)
    - Sortear por: Proximidade, Membros, Criação

8.0.5 Criar modal/detalhes de grupo:
  - Exibe: foto, nome, descrição, endereço, telefone, email
  - Membros: lista truncada (primeiros 5)
  - Reuniões: próximas reuniões da semana
  - Avisos: últimos 3 avisos
  - Botão "Entrar em Contato" (mailto ou WhatsApp link)

8.0.6 Otimizações de performance:
  - Lazy load mapa: mostrar apenas quando visível (Intersection Observer)
  - Memoize MapaGrupos para evitar re-renders
  - Pagination de lista (se > 20 grupos)
  - Debounce na search

8.0.7 Styling:
  - Integração com Tailwind CSS
  - Responsive: mobile (full-height map), desktop (2 col layout)
  - Ensure Leaflet popup não quebra com sistema de fontes

8.0.8 Testes de usability:
  - Mapa carrega corretamente
  - Markers aparecem nos locais corretos
  - Click marker mostra popup completo
  - Lista sincroniza com marker selecionado
  - Map responsivo em mobile
  - Performance: carrega < 3s mesmo com 100 grupos

## Critérios de Sucesso
- Mapa renderiza sem hydration errors
- Todos os grupos ativos aparecem como markers
- Popup shows info completo
- Leaflet CSS não causa conflitos com Tailwind
- Mobile layout é usável (mapa full-width, list abaixo ou tab)
- Search filtra grupos real-time

## Testes
- Load `/grupos` → mapa visível em 3s
- Click marker → popup exibe dados corretos
- Search "São Paulo" → filtra grupos
- Resize window para mobile → layout reflow correto
- 100+ grupos no mapa → performance aceitável (cluster se necessário)
- Lighthouse audit: bom score de performance
