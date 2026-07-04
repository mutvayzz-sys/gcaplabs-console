-- Forward migration for databases that were already provisioned before the
-- runtime-provider column rename landed in the baseline migration. Migration 0002
-- was edited in place, so existing databases still need these legacy column names
-- renamed once to match the current runtime_* schema.

alter table public.profiles rename column agent37_id to runtime_id;
alter table public.profiles rename column agent37_status to runtime_status;
alter table public.profiles rename column agent37_name to runtime_name;
alter table public.profiles rename column agent37_template to runtime_template;
alter table public.profiles rename column agent37_created_at to runtime_created_at;

alter index if exists public.profiles_agent37_id_idx rename to profiles_runtime_id_idx;
