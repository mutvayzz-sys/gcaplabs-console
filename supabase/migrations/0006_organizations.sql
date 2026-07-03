-- Organizations ("school" model): a user belongs to at most one organization, with an org_role
-- of 'admin' or 'member' scoping org-level oversight. Agent ownership is untouched — every user
-- still has exactly one personal Agent37 agent (profiles.agent37_id), organizations are purely a
-- grouping + org-scoped-admin layer on top, distinct from profiles.is_admin (site-wide admin).
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.profiles
  add column if not exists organization_id uuid references public.organizations(id) on delete set null,
  add column if not exists org_role text check (org_role in ('admin', 'member'));

create table if not exists public.org_invitations (
  token           text primary key default encode(gen_random_bytes(24), 'hex'),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  org_role        text not null check (org_role in ('admin', 'member')) default 'member',
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '7 days'),
  used_at         timestamptz
);

revoke all on public.organizations, public.org_invitations from anon, authenticated;
grant all on public.organizations, public.org_invitations to service_role;
