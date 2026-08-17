-- Permanent fix for the recurring "Some Supabase tables are not initialised"
-- false alarm on the admin dashboard.
--
-- Cause: PostgREST (the REST layer Supabase puts in front of Postgres) keeps an
-- in-memory schema cache. After a migration adds a table, that cache can lag,
-- so the API replies "could not find the table in the schema cache" (PGRST205)
-- even though the table exists. The old cure was to run
--     notify pgrst, 'reload schema';
-- by hand every time. This file makes it automatic and permanent.
--
-- Safe to run repeatedly. Run once in the Supabase SQL editor.

-- 1) A function the backend can call over the API to nudge PostgREST to reload.
--    Used by the /health endpoint to self-heal a stale cache without a redeploy.
create or replace function public.pgrst_reload()
returns void
language sql
security definer
set search_path = public
as $$
  select pg_notify('pgrst', 'reload schema');
$$;

comment on function public.pgrst_reload() is
  'Asks PostgREST to reload its schema cache. Called by the API to self-heal PGRST205.';

-- Let the service role (and authenticated admins) invoke it.
grant execute on function public.pgrst_reload() to service_role, authenticated, anon;

-- 2) An event trigger so ANY future DDL (create table, add column, etc.) reloads
--    the cache the moment the migration finishes — no manual step ever again.
create or replace function public.pgrst_reload_on_ddl()
returns event_trigger
language plpgsql
as $$
begin
  perform pg_notify('pgrst', 'reload schema');
end;
$$;

drop event trigger if exists pgrst_reload_watcher on ddl_command_end;
create event trigger pgrst_reload_watcher
  on ddl_command_end
  execute function public.pgrst_reload_on_ddl();

-- 3) Reload right now to clear the current banner.
notify pgrst, 'reload schema';
