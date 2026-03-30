-- =============================================================
-- Migration: 20260329170000_criar_grupos_familiares
-- Tarefa 2.0 — Infraestrutura de dados de Grupos Familiares
-- =============================================================

-- Foreign key: perfis → grupos (adicionada ao final)
-- Papéis: pastor (all), lider (own), membro (read-only), público (public)

-- ------------------------------------------------------------
-- 2.0.1 Tabela: grupos
-- Grupos familiares / congregações com localização geográfica
-- ------------------------------------------------------------
create table if not exists grupos (
  id            uuid         primary key default gen_random_uuid(),
  nome          text         not null,
  descricao     text,
  endereco      text         not null,
  latitude      numeric(10, 8),
  longitude     numeric(11, 8),
  telefone      text,
  email         text         not null unique,
  imagem_url    text,
  lider_id      uuid         not null references perfis(id) on delete set null,
  ativo         boolean      not null default true,
  criado_em     timestamptz  not null default now(),
  atualizado_em timestamptz  not null default now()
);

alter table grupos enable row level security;

-- Anônimo (público) — vê apenas grupos ativos
create policy "grupos_public_select" on grupos
  for select
  using (ativo = true and auth.uid() is null);

-- Autenticado — vê grupos ativos ou se é membro
create policy "grupos_autenticado_select" on grupos
  for select
  using (
    ativo = true or
    exists (
      select 1 from membros_grupo mg
      where mg.grupo_id = grupos.id
        and mg.perfil_id = auth.uid()
        and mg.ativo = true
    )
  );

-- Pastor — acesso total (CRUD)
create policy "grupos_pastor_full" on grupos
  for all
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
  );

-- Lider — pode editar/deletar apenas seu grupo
create policy "grupos_lider_manage_own" on grupos
  for update
  using (lider_id = auth.uid());

create policy "grupos_lider_delete_own" on grupos
  for delete
  using (lider_id = auth.uid());

-- Lider — pode inserir novo grupo (será seu lider_id)
create policy "grupos_lider_insert" on grupos
  for insert
  with check (lider_id = auth.uid());

-- Lider — pode ler seu próprio grupo + ativos
create policy "grupos_lider_select" on grupos
  for select
  using (
    lider_id = auth.uid() or
    (ativo = true and
     exists (
       select 1 from perfis p where p.id = auth.uid()
         and p.papeis @> array['lider']
     ))
  );

-- ------------------------------------------------------------
-- 2.0.2 Tabela: membros_grupo
-- Associação de perfis com grupos (fato de adesão)
-- Constraints: PK, FK grupo_id, FK perfil_id, UNIQUE(grupo_id, perfil_id)
-- Cargo: lider | membro
-- status: ativo/inativo via data_saida
-- ------------------------------------------------------------
create table if not exists membros_grupo (
  id            uuid    primary key default gen_random_uuid(),
  grupo_id      uuid    not null references grupos(id) on delete cascade,
  perfil_id     uuid    not null references perfis(id) on delete cascade,
  cargo         text    not null check (cargo in ('lider', 'membro')) default 'membro',
  data_entrada  date    not null default current_date,
  data_saida    date,
  ativo         boolean not null default true,

  -- Garante: um perfil só pode estar uma vez em cada grupo
  unique (grupo_id, perfil_id)
);

alter table membros_grupo enable row level security;

-- Anônimo — sem acesso
-- Autenticado — vê membros de grupos onde é membro/lider/pastor
create policy "membros_grupo_select" on membros_grupo
  for select
  using (
    -- Pastor: vê tudo
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
    or
    -- Lider ou membro do grupo: vê membros do mesmo grupo
    exists (
      select 1 from membros_grupo mg
      where mg.grupo_id = membros_grupo.grupo_id
        and mg.perfil_id = auth.uid()
    )
  );

-- Pastor: full CRUD
create policy "membros_grupo_pastor_full" on membros_grupo
  for all
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
  );

-- Lider: insert/update/delete membros do próprio grupo
create policy "membros_grupo_lider_manage" on membros_grupo
  for all
  using (
    exists (
      select 1 from membros_grupo mg_lider
      where mg_lider.grupo_id = membros_grupo.grupo_id
        and mg_lider.perfil_id = auth.uid()
        and mg_lider.cargo = 'lider'
    )
  );

-- Membro: pode ler, mas não pode modificar sua própria adesão
-- (isso é controlado via restrição de cargo/status)

-- Insert policy: permitir apenas para lider do grupo
create policy "membros_grupo_lider_insert" on membros_grupo
  for insert
  with check (
    exists (
      select 1 from membros_grupo mg_lider
      where mg_lider.grupo_id = grupo_id
        and mg_lider.perfil_id = auth.uid()
        and mg_lider.cargo = 'lider'
    )
    or
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
  );

-- Índices para membros_grupo
create index if not exists idx_membros_grupo_grupo_id_ativo
  on membros_grupo (grupo_id, ativo);

create index if not exists idx_membros_grupo_perfil_id
  on membros_grupo (perfil_id);

-- Index para buscar membros ativos rapidamente
create index if not exists idx_membros_grupo_data_saida
  on membros_grupo (grupo_id, data_saida);

-- ------------------------------------------------------------
-- 2.0.3 Tabela: reunioes_grupo
-- Reuniões recorrentes: dias da semana (0=seg, 6=dom) e horário
-- Sem suporte a exceções ainda (future feature)
-- ------------------------------------------------------------
create table if not exists reunioes_grupo (
  id            uuid         primary key default gen_random_uuid(),
  grupo_id      uuid         not null references grupos(id) on delete cascade,
  titulo        text         not null,
  descricao     text,
  dia_semana    integer      not null check (dia_semana between 0 and 6),
  -- 0=segunda, 1=terça, ..., 6=domingo
  horario       time         not null,
  localizacao   text,
  criado_por    uuid         not null references perfis(id) on delete set null,
  criado_em     timestamptz  not null default now(),
  atualizado_em timestamptz  not null default now()
);

alter table reunioes_grupo enable row level security;

-- Anônimo: lê apenas reuniões de grupos ativos
create policy "reunioes_grupo_public_select" on reunioes_grupo
  for select
  using (
    exists (
      select 1 from grupos g
      where g.id = reunioes_grupo.grupo_id
        and g.ativo = true
    )
  );

-- Pastor: CRUD total
create policy "reunioes_grupo_pastor_full" on reunioes_grupo
  for all
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
  );

-- Lider: manage reuniões do próprio grupo
create policy "reunioes_grupo_lider_manage" on reunioes_grupo
  for all
  using (
    exists (
      select 1 from grupos g
      where g.id = reunioes_grupo.grupo_id
        and g.lider_id = auth.uid()
    )
  );

-- Autenticado: pode ler reuniões
create policy "reunioes_grupo_autenticado_select" on reunioes_grupo
  for select
  using (auth.uid() is not null);

-- Índices
create index if not exists idx_reunioes_grupo_grupo_id_dia_semana
  on reunioes_grupo (grupo_id, dia_semana);

create index if not exists idx_reunioes_grupo_grupo_id
  on reunioes_grupo (grupo_id);

-- ------------------------------------------------------------
-- 2.0.4 Tabela: avisos_grupo
-- Histórico de avisos/notificações para o grupo
-- wa_message_id: futura integração com WhatsApp API (Twilio etc.)
-- ------------------------------------------------------------
create table if not exists avisos_grupo (
  id            uuid         primary key default gen_random_uuid(),
  grupo_id      uuid         not null references grupos(id) on delete cascade,
  titulo        text,
  mensagem      text         not null,
  tipo          text         not null check (tipo in ('reuniao', 'evento', 'geral')),
  data_envio    timestamptz  not null default now(),
  enviado_por   uuid         not null references perfis(id) on delete set null,
  wa_message_id text,
  criado_em     timestamptz  not null default now()
);

alter table avisos_grupo enable row level security;

-- Anônimo: lê avisos de grupos ativos
create policy "avisos_grupo_public_select" on avisos_grupo
  for select
  using (
    exists (
      select 1 from grupos g
      where g.id = avisos_grupo.grupo_id
        and g.ativo = true
    )
  );

-- Autenticado: lê avisos dos grupos onde é membro/lider
create policy "avisos_grupo_autenticado_select" on avisos_grupo
  for select
  using (
    exists (
      select 1 from membros_grupo mg
      where mg.grupo_id = avisos_grupo.grupo_id
        and mg.perfil_id = auth.uid()
        and mg.ativo = true
    )
    or
    exists (
      select 1 from grupos g
      where g.id = avisos_grupo.grupo_id
        and g.lider_id = auth.uid()
    )
  );

-- Pastor: CRUD total
create policy "avisos_grupo_pastor_full" on avisos_grupo
  for all
  using (
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
  );

-- Lider: insert/update do próprio grupo, mas só delete próprios avisos
create policy "avisos_grupo_lider_insert" on avisos_grupo
  for insert
  with check (
    exists (
      select 1 from grupos g
      where g.id = avisos_grupo.grupo_id
        and g.lider_id = auth.uid()
    )
  );

create policy "avisos_grupo_lider_update" on avisos_grupo
  for update
  using (
    exists (
      select 1 from grupos g
      where g.id = avisos_grupo.grupo_id
        and g.lider_id = auth.uid()
    )
  );

create policy "avisos_grupo_delete_own_or_pastor" on avisos_grupo
  for delete
  using (
    enviado_por = auth.uid() or
    exists (
      select 1 from perfis p where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
  );

-- Índices
create index if not exists idx_avisos_grupo_grupo_id_tipo
  on avisos_grupo (grupo_id, tipo);

create index if not exists idx_avisos_grupo_criado_em_desc
  on avisos_grupo (grupo_id, criado_em desc);

-- Índice para busca rápida de avisos recentes
create index if not exists idx_avisos_grupo_data_envio
  on avisos_grupo (data_envio desc);

-- Índice para filtro público
create index if not exists idx_avisos_grupo_grupo_ativo
  on avisos_grupo (grupo_id)
  where grupo_id in (select id from grupos where ativo = true);

-- ------------------------------------------------------------
-- 2.0.5 Storage bucket `grupo-imagens` (privado)
-- Armazena imagens dos grupos
-- Limite: 5 MB, tipos: jpeg, png, webp
-- Path: {grupo_id}/{filename}
-- Acesso via service role (server-side upload via Server Action)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'grupo-imagens',
  'grupo-imagens',
  false,
  5242880,    -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Service role — acesso total (usado pelo Server Action)
create policy "grupo-imagens_service_role"
  on storage.objects for all
  to service_role
  using (bucket_id = 'grupo-imagens');

-- Lider autenticado — pode upload apenas da imagem do seu grupo
create policy "grupo-imagens_lider_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'grupo-imagens'
    and exists (
      select 1 from grupos g
      where g.lider_id = auth.uid()
        and g.id::text = (storage.foldername(name))[1]
    )
  );

-- Lider — pode ler e deletar sua própria imagem
create policy "grupo-imagens_lider_manage"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'grupo-imagens'
    and exists (
      select 1 from grupos g
      where g.lider_id = auth.uid()
        and g.id::text = (storage.foldername(name))[1]
    )
  );

-- Público — lê imagens de grupos ativos (via URL pública gerada server-side)
-- (Não há RLS para SELECT anônimo em storage — URLs são geradas com tempo expirável)

-- Seed de dados para teste (comentado)
-- insert into grupos (nome, descricao, endereco, latitude, longitude, telefone, email, lider_id)
-- values (
--   'Grupo Exemplo',
--   'Descrição do grupo de teste',
--   'Rua das Flores, 123, São Paulo, SP',
--   -23.5505,
--   -46.6333,
--   '(11) 98765-4321',
--   'grupo-exemplo@igreja.com',
--   auth.uid()
-- )
-- on conflict do nothing;
