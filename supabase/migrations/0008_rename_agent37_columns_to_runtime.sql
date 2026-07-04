-- The Agent37 -> Runtime Provider rebrand renamed every code reference from
-- profiles.agent37_* to profiles.runtime_*, but migration 0002 was edited in place
-- rather than given a new forward migration, so it never re-ran against the already-
-- provisioned database. Production still has the original agent37_* columns, which
-- surfaces as "column profiles.runtime_id does not exist" on every profile query.

alter table public.profiles rename column agent37_id to runtime_id;
alter table public.profiles rename column agent37_status to runtime_status;
alter table public.profiles rename column agent37_name to runtime_name;
alter table public.profiles rename column agent37_template to runtime_template;
alter table public.profiles rename column agent37_created_at to runtime_created_at;

alter index if exists public.profiles_agent37_id_idx rename to profiles_runtime_id_idx;
