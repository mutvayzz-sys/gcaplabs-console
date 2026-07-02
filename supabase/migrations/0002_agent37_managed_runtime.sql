-- Headmaster Console Agent37 cutover
-- Store the one Agent37 Cloud instance assigned to each Supabase user.

alter table public.profiles
  add column if not exists agent37_id text,
  add column if not exists agent37_status text,
  add column if not exists agent37_name text,
  add column if not exists agent37_template text,
  add column if not exists agent37_created_at timestamptz default now();

create unique index if not exists profiles_agent37_id_idx
  on public.profiles (agent37_id)
  where agent37_id is not null;
