-- =============================================================
-- Migration: 20260329160215_criar_financeiro
-- Tarefa 1.0 — Infraestrutura de dados financeiros
-- Nota: grupo_id em lancamentos sem FK por ora —
--       FK para grupos(id) adicionada na task de Grupos.
-- =============================================================

-- ------------------------------------------------------------
-- 1.0.1 Plano de contas (categorias de entrada/saída)
-- ------------------------------------------------------------
create table if not exists categorias_financeiro (
  id        uuid    primary key default gen_random_uuid(),
  nome      text    not null,
  tipo      text    not null check (tipo in ('entrada', 'saida')),
  icone     text,
  ativo     boolean not null default true
);

alter table categorias_financeiro enable row level security;

-- Pastor e tesoureiro — acesso total
create policy "catfin_admin" on categorias_financeiro
  for all
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and (p.papeis @> array['pastor'] or p.papeis @> array['tesoureiro'])
    )
  );

-- Conferente e membro autenticado — somente leitura (para preencher selects)
create policy "catfin_read_autenticado" on categorias_financeiro
  for select
  using (auth.uid() is not null);

-- ------------------------------------------------------------
-- 1.0.2 Lançamentos financeiros (entradas e saídas unificados)
-- Valor armazenado em CENTAVOS (integer) — evita imprecisão float.
-- ------------------------------------------------------------
create table if not exists lancamentos (
  id               uuid         primary key default gen_random_uuid(),
  tipo             text         not null check (tipo in ('entrada', 'saida')),
  categoria_id     uuid         not null references categorias_financeiro(id),
  valor            integer      not null check (valor > 0),   -- centavos
  descricao        text         not null,
  data             date         not null,
  grupo_id         uuid,        -- FK para grupos(id) adicionada na task de Grupos
  membro_id        uuid         references perfis(id),
  data_vencimento  date,
  status           text         not null default 'confirmado'
                                check (status in ('pendente', 'pago', 'vencido', 'confirmado')),
  comprovante_url  text,
  criado_por       uuid         not null references auth.users(id),
  criado_em        timestamptz  not null default now()
);

alter table lancamentos enable row level security;

-- Pastor e tesoureiro — acesso total
create policy "lancamentos_admin" on lancamentos
  for all
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and (p.papeis @> array['pastor'] or p.papeis @> array['tesoureiro'])
    )
  );

-- Conferente — select e insert restritos ao próprio grupo (via perfis.grupo_id)
create policy "lancamentos_conferente_select" on lancamentos
  for select
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['conferente']
        and p.grupo_id = lancamentos.grupo_id
    )
  );

create policy "lancamentos_conferente_insert" on lancamentos
  for insert
  with check (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['conferente']
        and p.grupo_id = grupo_id
    )
  );

-- Membro — lê apenas lançamentos vinculados a si (histórico de contribuições)
create policy "lancamentos_membro_self" on lancamentos
  for select
  using (membro_id = auth.uid());

-- ------------------------------------------------------------
-- 1.0.3 Configurações da igreja (singleton — chave Pix, CNPJ etc.)
-- ------------------------------------------------------------
create table if not exists configuracoes_igreja (
  id           uuid         primary key default gen_random_uuid(),
  chave_pix    text,
  cnpj         text,
  nome_igreja  text,
  updated_at   timestamptz  default now()
);

alter table configuracoes_igreja enable row level security;

-- Pastor e tesoureiro — acesso total
create policy "configigrreja_admin" on configuracoes_igreja
  for all
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and (p.papeis @> array['pastor'] or p.papeis @> array['tesoureiro'])
    )
  );

-- Qualquer membro autenticado lê (necessário para exibir chave Pix no painel)
create policy "configigrreja_read_autenticado" on configuracoes_igreja
  for select
  using (auth.uid() is not null);

-- Garante no máximo uma linha na tabela de configurações
create unique index if not exists configuracoes_igreja_singleton
  on configuracoes_igreja ((true));

-- Linha inicial vazia (upsert na aplicação via ON CONFLICT)
insert into configuracoes_igreja (chave_pix, cnpj, nome_igreja)
values (null, null, 'Igreja Eu Sou')
on conflict do nothing;

-- ------------------------------------------------------------
-- 1.0.4 Índices para performance em consultas financeiras
-- ------------------------------------------------------------
create index if not exists idx_lancamentos_data_tipo
  on lancamentos (data, tipo);

create index if not exists idx_lancamentos_grupo_id
  on lancamentos (grupo_id);

create index if not exists idx_lancamentos_membro_id
  on lancamentos (membro_id);

create index if not exists idx_lancamentos_status
  on lancamentos (status);

create index if not exists idx_lancamentos_vencimento
  on lancamentos (data_vencimento) where data_vencimento is not null;

-- ------------------------------------------------------------
-- 1.0.5 Storage bucket `comprovantes` (privado)
-- Políticas de acesso via service role (Route Handler /api/*)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprovantes',
  'comprovantes',
  false,
  10485760,   -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do nothing;

-- Membro autenticado faz upload apenas na própria pasta
create policy "comprovantes_upload_proprio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Service role — acesso total (usado pelo Route Handler server-side)
create policy "comprovantes_service_role"
  on storage.objects for all
  to service_role
  using (bucket_id = 'comprovantes');

-- ------------------------------------------------------------
-- 1.0.6 Seed — categorias padrão
-- Inserção idempotente: não duplica se já existir pelo nome+tipo.
-- ------------------------------------------------------------
insert into categorias_financeiro (nome, tipo, icone) values
  ('Dízimos',    'entrada', '💰'),
  ('Ofertas',    'entrada', '🙏'),
  ('Doações',    'entrada', '❤️'),
  ('Eventos',    'entrada', '🎉'),
  ('Aluguel',    'saida',   '🏠'),
  ('Água/Luz',   'saida',   '💡'),
  ('Material',   'saida',   '📦'),
  ('Salários',   'saida',   '👤'),
  ('Missões',    'saida',   '✈️')
on conflict do nothing;
