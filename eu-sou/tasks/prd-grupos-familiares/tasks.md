# Tasks — Grupos Familiares

Sequência de execução derivada do PRD e Tech Spec.

| # | Task | Entregável principal | Depende de | Complexidade |
|---|---|---|---|---|
| 1 | [Middleware + Setup](./1_task.md) | `middleware.ts` atualizado + tipos | — | LOW |
| 2 | [Migrations + Queries](./2_task.md) | Schema DB `grupos*` + `lib/gruposQueries.ts` | 1 | MEDIUM |
| 3 | [Admin Layout + Form](./3_task.md) | Layout admin + `GrupoForm.tsx` | 2 | MEDIUM |
| 4 | [CRUD Grupos](./4_task.md) | Create/Read/Update/Delete com geocoding | 3 | MEDIUM |
| 5 | [Gerenciar Membros](./5_task.md) | Add/Remove membros + validação unicité | 3 | MEDIUM |
| 6 | [Reuniões Recorrentes](./6_task.md) | CRUD com dias da semana + horários | 3 | MEDIUM |
| 7 | [Avisos WhatsApp](./7_task.md) | Fila + histórico + wa.me links | 2 | MEDIUM |
| 8 | [Mapa Público + Leaflet](./8_task.md) | Leaflet map + OSM tiles + discover | 2, 4 | HIGH |
| 9 | [Home Integration + Testes](./9_task.md) | Seção Home + E2E + README | 1–8 | LOW |

## Dependências npm a instalar antes de começar

```bash
cd eu-sou
npm install react-leaflet leaflet @types/leaflet
```

## Notas

- **Autenticação:** Todas as rotas admin (/admin/grupos/*) protegidas via middleware e RLS.
- **Geocoding:** Nominatim API tem limite de 1 req/s — implementar fila/cache de endereços.
- **Maps:** Leaflet + OpenStreetMap tiles (livre). CSS do Leaflet importado em globals.css.
- **WhatsApp:** Usar wa.me links (sem API) — histórico armazenado em `avisos_grupo` table.
- **Acesso RLS:** Pastor/admin — acesso total; Líder — apenas seu grupo; Público — somente consulta mapa/avisos.
- **Validações:** Unicité (email/CPF) dos membros via constraint de BD + frontend validation.
- **Incrementalidade:** Cada task é funcional isoladamente — nenhuma depende de UI de outra (apenas de dados/schema).
