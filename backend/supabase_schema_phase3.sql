-- ---------------------------------------------------------------------------
-- debowoseni.com — Phase 3
--
-- Brings the schema back in line with the app (event fields added after
-- phase 2 were only ever applied by hand), then adds the pieces that replace
-- Systeme.io: in-house event registration and an owned mailing list.
--
-- Safe to re-run. Paste into the Supabase SQL editor and press Run.
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- 1) EVENTS — reconcile drift + registration settings
-- ===========================================================================
alter table public.events add column if not exists location_type text not null default 'in_person';
alter table public.events add column if not exists start_time    time;
alter table public.events add column if not exists end_time      time;
alter table public.events add column if not exists is_free       boolean not null default true;
alter table public.events add column if not exists price         numeric(10,2);
alter table public.events add column if not exists currency      text not null default 'GBP';
alter table public.events add column if not exists register_url  text;

-- New: in-house registration. When register_url is empty and registration is
-- open, the site collects the sign-up itself instead of handing off elsewhere.
alter table public.events add column if not exists registration_open boolean not null default false;
alter table public.events add column if not exists capacity          int;

alter table public.events drop constraint if exists events_location_type_check;
alter table public.events add constraint events_location_type_check
  check (location_type in ('in_person','online','hybrid'));

-- ===========================================================================
-- 2) EVENT REGISTRATIONS
-- ===========================================================================
create table if not exists public.event_registrations (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  name       text not null,
  email      text not null,
  phone      text,
  notes      text,
  status     text not null default 'registered'
             check (status in ('registered','waitlisted','attended','no_show','cancelled')),
  source     text default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, email)
);

create index if not exists event_registrations_event_idx on public.event_registrations (event_id);
create index if not exists event_registrations_email_idx on public.event_registrations (lower(email));

alter table public.event_registrations enable row level security;

-- Writes only ever happen through the backend's service key, so no anon
-- insert policy here — the public form posts to /api/events/{slug}/register.
drop policy if exists "authed all registrations" on public.event_registrations;
create policy "authed all registrations" on public.event_registrations for all
  to authenticated using (true) with check (true);

-- ===========================================================================
-- 3) SUBSCRIBERS — grow into a real mailing list
-- ===========================================================================
alter table public.subscribers add column if not exists name              text;
alter table public.subscribers add column if not exists status            text not null default 'subscribed';
alter table public.subscribers add column if not exists source            text;
alter table public.subscribers add column if not exists tags              text[] not null default '{}';
alter table public.subscribers add column if not exists unsubscribe_token uuid not null default gen_random_uuid();
alter table public.subscribers add column if not exists unsubscribed_at   timestamptz;
alter table public.subscribers add column if not exists last_emailed_at   timestamptz;

alter table public.subscribers drop constraint if exists subscribers_status_check;
alter table public.subscribers add constraint subscribers_status_check
  check (status in ('subscribed','unsubscribed','bounced','complained'));

create unique index if not exists subscribers_unsub_token_idx
  on public.subscribers (unsubscribe_token);
create index if not exists subscribers_tags_idx on public.subscribers using gin (tags);

-- ===========================================================================
-- 4) CAMPAIGNS — the broadcast layer that replaces Systeme email
-- ===========================================================================
create table if not exists public.campaigns (
  id              uuid primary key default gen_random_uuid(),
  subject         text not null,
  preheader       text,
  body            text not null default '',
  segment         text not null default 'all',
  status          text not null default 'draft'
                  check (status in ('draft','sending','sent','failed')),
  recipient_count int not null default 0,
  sent_count      int not null default 0,
  failed_count    int not null default 0,
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.campaigns enable row level security;
drop policy if exists "authed all campaigns" on public.campaigns;
create policy "authed all campaigns" on public.campaigns for all
  to authenticated using (true) with check (true);

-- One row per recipient per campaign — this is the engagement record.
create table if not exists public.campaign_sends (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  subscriber_id uuid references public.subscribers(id) on delete set null,
  email         text not null,
  status        text not null default 'queued'
                check (status in ('queued','sent','delivered','opened','clicked','bounced','complained','failed')),
  provider_id   text,
  error         text,
  sent_at       timestamptz,
  opened_at     timestamptz,
  clicked_at    timestamptz,
  updated_at    timestamptz not null default now(),
  unique (campaign_id, email)
);

create index if not exists campaign_sends_campaign_idx on public.campaign_sends (campaign_id);
create index if not exists campaign_sends_email_idx    on public.campaign_sends (lower(email));

alter table public.campaign_sends enable row level security;
drop policy if exists "authed all campaign_sends" on public.campaign_sends;
create policy "authed all campaign_sends" on public.campaign_sends for all
  to authenticated using (true) with check (true);

-- ===========================================================================
-- 5) Backfill — existing rows predate the new defaults
-- ===========================================================================
update public.subscribers set status = 'subscribed' where status is null;
update public.subscribers set source = 'legacy'     where source is null;
