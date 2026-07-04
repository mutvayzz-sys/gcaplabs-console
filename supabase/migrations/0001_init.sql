-- Headmaster Console — Supabase init migration
--
-- In the Headmaster beta model, each user has ONE managed Managed runtime cloud
-- instance. The fleet/workspace/membership/agents tables from the original
-- starter-kit are kept but commented out — we may need them when we add
-- multi-agent or team features later.
--
-- Supabase Auth manages user identity; Managed runtime cloud manages the runtime.
-- All table access is server-side (service-role key); direct client
-- table access is revoked.

-- User profiles (one row per auth user)
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  display_name text,
  beta_approved boolean default false,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Revoke direct client access to all tables — the app uses the service-role key server-side
revoke all on public.profiles from anon, authenticated;
grant all on public.profiles to service_role;

-- =============================================================================
-- Original starter-kit tables — commented out for now. Uncomment when we add
-- fleet/workspace/team features later.
-- =============================================================================

-- create table if not exists public.workspaces (
--   id         uuid primary key default gen_random_uuid(),
--   name       text not null,
--   owner_id   uuid not null references auth.users (id) on delete cascade,
--   created_at timestamptz not null default now()
-- );
--
-- create table if not exists public.memberships (
--   workspace_id uuid not null references public.workspaces (id) on delete cascade,
--   user_id      uuid not null references auth.users (id) on delete cascade,
--   role         text not null check (role = 'admin'),
--   created_at   timestamptz not null default now(),
--   primary key (workspace_id, user_id)
-- );
--
-- create table if not exists public.invitations (
--   token        uuid primary key default gen_random_uuid(),
--   workspace_id uuid not null references public.workspaces (id) on delete cascade,
--   role         text not null check (role = 'admin'),
--   created_by   uuid references auth.users (id) on delete set null,
--   created_at   timestamptz not null default now(),
--   expires_at   timestamptz not null default now() + interval '7 days'
-- );
--
-- create table if not exists public.agents (
--   runtime_id   text primary key,
--   workspace_id uuid not null references public.workspaces (id) on delete cascade,
--   name         text,
--   status       text,
--   template     text,
--   cpu          integer,
--   memory       integer,
--   disk         integer,
--   created_by   uuid references auth.users (id) on delete set null,
--   created_at   timestamptz not null default now()
-- );
--
-- create index if not exists agents_workspace_idx on public.agents (workspace_id);
-- create index if not exists memberships_user_idx on public.memberships (user_id);
--
-- create or replace function public.is_workspace_member(ws uuid)
-- returns boolean
-- language sql
-- security definer
-- set search_path = public
-- stable
-- as $$
--   select exists (
--     select 1 from public.memberships
--     where workspace_id = ws and user_id = auth.uid()
--   );
-- $$;
--
-- create or replace function public.is_workspace_admin(ws uuid)
-- returns boolean
-- language sql
-- security definer
-- set search_path = public
-- stable
-- as $$
--   select exists (
--     select 1 from public.memberships
--     where workspace_id = ws and user_id = auth.uid() and role = 'admin'
--   );
-- $$;