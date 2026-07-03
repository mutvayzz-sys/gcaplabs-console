-- Separate "console admin" (manages the whole app: Users, Settings) from
-- "beta_approved" (this user's own signup was let in and gets a runtime).
-- Previously isConsoleAdmin() read beta_approved, which meant any approved
-- beta tester saw the admin nav — not just actual operators.
alter table public.profiles add column if not exists is_admin boolean not null default false;
