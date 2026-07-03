-- Admin broadcasts announcements to all users; users send messages to admins. Unread counts
-- feed a badge in DashboardShell's nav (admin: unread messages; user: unread announcements).
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  active      boolean not null default true
);

create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references auth.users(id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now(),
  read_by_admin boolean not null default false
);

revoke all on public.announcements, public.announcement_reads, public.messages from anon, authenticated;
grant all on public.announcements, public.announcement_reads, public.messages to service_role;
