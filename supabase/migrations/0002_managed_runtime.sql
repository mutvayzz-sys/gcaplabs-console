-- Headmaster Console Runtime Provider cutover
-- Store the one Managed runtime cloud instance assigned to each Supabase user.

alter table public.profiles
  add column if not exists runtime_id text,
  add column if not exists runtime_status text,
  add column if not exists runtime_name text,
  add column if not exists runtime_template text,
  add column if not exists runtime_created_at timestamptz default now();

create unique index if not exists profiles_runtime_id_idx
  on public.profiles (runtime_id)
  where runtime_id is not null;
