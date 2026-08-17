-- ---------------------------------------------------------------------------
-- debowoseni.com — Phase 5
--
-- The scheduled journal digest (the hands-off newsletter). A single settings
-- row Debo controls from Admin → Newsletter: how often an issue goes out, and
-- when. The hourly automation job reads this and sends when it is due, pulling
-- whatever journal posts were published since the last issue.
--
-- Safe to re-run. Requires phases 3 and 4.
-- ---------------------------------------------------------------------------

create table if not exists public.newsletter_settings (
  id           smallint primary key default 1,
  -- off = never send. The others are the cadence between issues.
  frequency    text not null default 'off'
               check (frequency in ('off','weekly','biweekly','monthly')),
  -- 0 = Monday … 6 = Sunday (Python's weekday numbering), and the UTC hour the
  -- issue may go out at or after.
  send_weekday int not null default 3,
  send_hour    int not null default 9 check (send_hour between 0 and 23),
  -- Skip an issue if fewer than this many new posts exist — never mail an
  -- empty digest.
  min_posts    int not null default 1,
  -- Optional standing intro line at the top of every issue.
  intro        text,
  last_sent_at timestamptz,
  updated_at   timestamptz not null default now(),
  constraint newsletter_settings_single_row check (id = 1)
);

insert into public.newsletter_settings (id) values (1)
on conflict (id) do nothing;

alter table public.newsletter_settings enable row level security;
drop policy if exists "authed all newsletter_settings" on public.newsletter_settings;
create policy "authed all newsletter_settings" on public.newsletter_settings for all
  to authenticated using (true) with check (true);
