-- Reconcile architecture-independent upstream Supabase hardening for the
-- single-managed-runtime profile model. Do not create fleet/workspace tables here.

-- Keep client roles away from app tables; Next.js BFF routes use the service-role key
-- after TypeScript authorization checks. RLS remains enabled as a backstop.
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant all on public.profiles to service_role;

-- Make the auth trigger idempotent/safe if Supabase replays or a profile was created
-- by another path before the auth.users insert trigger ran.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
