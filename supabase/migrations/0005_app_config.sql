-- Generic key/value app-config editor for console admins — feature flags, app-wide settings,
-- etc. Ships with zero seeded rows; admins add keys ad hoc as real config needs arise.
create table if not exists public.app_config (
  key         text primary key,
  value       jsonb not null,
  value_type  text not null check (value_type in ('string', 'number', 'boolean', 'enum', 'json')),
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

revoke all on public.app_config from anon, authenticated;
grant all on public.app_config to service_role;
