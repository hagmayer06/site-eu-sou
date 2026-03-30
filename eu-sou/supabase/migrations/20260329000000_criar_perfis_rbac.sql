-- =============================================================
-- Migration: 20260329000000_criar_perfis_rbac
-- Tarefa 1.0 — Infraestrutura de dados e RBAC
-- Nota: projeto Supabase compartilhado — nomes de função/trigger
--       levam prefixo eu_sou_ para evitar conflito com outras apps.
-- =============================================================

-- ------------------------------------------------------------
-- 1.0.1 Tabela perfis (1:1 com auth.users)
-- Nota: grupo_id sem FK por ora — será adicionada na task de Grupos
-- ------------------------------------------------------------
create table if not exists perfis (
  id              uuid         primary key references auth.users(id) on delete cascade,
  nome            text         not null,
  telefone        text,
  data_nascimento date,
  cep             text,
  rua             text,
  bairro          text,
  cidade          text,
  uf              char(2),
  foto_url        text,
  papeis          text[]       not null default array['membro'],
  ativo           boolean      not null default true,
  grupo_id        uuid,        -- FK para grupos(id) adicionada na task de Grupos
  criado_em       timestamptz  not null default now()
);

-- ------------------------------------------------------------
-- 1.0.2 Função trigger e trigger on_auth_user_created_eu_sou
-- Prefixo eu_sou_ evita conflito com trigger de outra app no mesmo projeto.
-- Cria perfil automaticamente ao registrar novo usuário
-- ------------------------------------------------------------
create or replace function handle_new_eu_sou_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfis (id, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created_eu_sou
  after insert on auth.users
  for each row execute procedure handle_new_eu_sou_user();

-- ------------------------------------------------------------
-- 1.0.3 RLS e políticas
-- ------------------------------------------------------------
alter table perfis enable row level security;

-- Membro lê e edita apenas o próprio perfil
create policy "perfil_self" on perfis
  for all
  using (auth.uid() = id);

-- Pastor e tesoureiro leem todos os perfis
create policy "perfil_admin_read" on perfis
  for select
  using (
    exists (
      select 1 from perfis p
      where p.id = auth.uid()
        and (
          p.papeis @> array['pastor']
          or p.papeis @> array['tesoureiro']
        )
    )
  );

-- Somente pastor escreve em qualquer perfil
create policy "perfil_pastor_write" on perfis
  for update
  using (
    exists (
      select 1 from perfis p
      where p.id = auth.uid()
        and p.papeis @> array['pastor']
    )
  );
