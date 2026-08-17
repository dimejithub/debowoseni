-- ---------------------------------------------------------------------------
-- debowoseni.com — Phase 4
--
-- Two additions:
--   1) Community membership — the site takes the join, WhatsApp hosts the
--      conversation, and Debo keeps the membership record either way.
--   2) Programme enrolments — who is in what, at what stage, for how much.
--
-- Together with the existing subscribers / event_registrations /
-- campaign_sends / contact_messages tables, these are what the per-person
-- CRM timeline in Admin → People is assembled from. Email is the join key
-- throughout: it is the one identifier every capture point already has.
--
-- Safe to re-run. Paste into the Supabase SQL editor and press Run.
-- Requires phase 3 to have been run first.
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- 1) COMMUNITY MEMBERSHIP
-- ===========================================================================
create table if not exists public.community_members (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text,
  subscriber_id uuid references public.subscribers(id) on delete set null,
  group_key     text not null default 'lte',
  channel       text not null default 'whatsapp'
                check (channel in ('whatsapp','telegram','other')),
  status        text not null default 'joined'
                check (status in ('joined','left','removed')),
  source        text default 'website',
  notes         text,
  joined_at     timestamptz not null default now(),
  left_at       timestamptz,
  updated_at    timestamptz not null default now(),
  unique (email, group_key)
);

create index if not exists community_members_email_idx on public.community_members (lower(email));
create index if not exists community_members_group_idx on public.community_members (group_key);

alter table public.community_members enable row level security;

-- Joins are written by the backend's service key via /api/community/join,
-- so there is deliberately no anon insert policy here.
drop policy if exists "authed all community" on public.community_members;
create policy "authed all community" on public.community_members for all
  to authenticated using (true) with check (true);

-- ===========================================================================
-- 2) PROGRAMME ENROLMENTS
-- ===========================================================================
create table if not exists public.programme_enrolments (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  name            text,
  subscriber_id   uuid references public.subscribers(id) on delete set null,
  programme       text not null,
  programme_label text,
  stage           text not null default 'enquired'
                  check (stage in ('enquired','booked','paid','in_progress','completed','cancelled')),
  amount          numeric(10,2),
  currency        text not null default 'EUR',
  started_at      date,
  completed_at    date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists programme_enrolments_email_idx on public.programme_enrolments (lower(email));
create index if not exists programme_enrolments_stage_idx on public.programme_enrolments (stage);

alter table public.programme_enrolments enable row level security;

drop policy if exists "authed all enrolments" on public.programme_enrolments;
create policy "authed all enrolments" on public.programme_enrolments for all
  to authenticated using (true) with check (true);

-- ===========================================================================
-- 3) AUTOMATIONS — Systeme's "rules" and "campaigns", rebuilt
--
-- A sequence is a named drip: a trigger, then an ordered list of emails each
-- with a delay. This is the piece that lets a welcome series, an event
-- follow-up or a quiz-result nurture run without anyone pressing send.
-- ===========================================================================
create table if not exists public.sequences (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  trigger_type  text not null default 'tag_added'
                check (trigger_type in ('tag_added','subscriber_created','event_registered',
                                        'event_attended','community_joined','manual')),
  -- The trigger's argument: a tag name, an event slug, a community group key.
  -- Empty means "any" — e.g. event_registered with no value fires for all events.
  trigger_value text,
  status        text not null default 'active' check (status in ('active','paused')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.sequences enable row level security;
drop policy if exists "authed all sequences" on public.sequences;
create policy "authed all sequences" on public.sequences for all
  to authenticated using (true) with check (true);

create table if not exists public.sequence_steps (
  id          uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  position    int not null,
  -- Days to wait after the previous step. On step 1 this is days after the
  -- trigger fired, so 0 means "send immediately".
  delay_days  int not null default 0,
  subject     text not null,
  preheader   text,
  body        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (sequence_id, position)
);

alter table public.sequence_steps enable row level security;
drop policy if exists "authed all sequence_steps" on public.sequence_steps;
create policy "authed all sequence_steps" on public.sequence_steps for all
  to authenticated using (true) with check (true);

create table if not exists public.sequence_enrolments (
  id            uuid primary key default gen_random_uuid(),
  sequence_id   uuid not null references public.sequences(id) on delete cascade,
  subscriber_id uuid references public.subscribers(id) on delete cascade,
  email         text not null,
  -- Steps already sent. next_send_at is when step (current_step + 1) is due.
  current_step  int not null default 0,
  next_send_at  timestamptz,
  status        text not null default 'active'
                check (status in ('active','completed','cancelled')),
  last_sent_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (sequence_id, email)
);

create index if not exists sequence_enrolments_due_idx
  on public.sequence_enrolments (next_send_at) where status = 'active';
create index if not exists sequence_enrolments_email_idx
  on public.sequence_enrolments (lower(email));

alter table public.sequence_enrolments enable row level security;
drop policy if exists "authed all sequence_enrolments" on public.sequence_enrolments;
create policy "authed all sequence_enrolments" on public.sequence_enrolments for all
  to authenticated using (true) with check (true);

-- Every automated email that actually went out, for the CRM timeline.
create table if not exists public.sequence_sends (
  id          uuid primary key default gen_random_uuid(),
  sequence_id uuid references public.sequences(id) on delete cascade,
  step_id     uuid references public.sequence_steps(id) on delete set null,
  email       text not null,
  subject     text,
  status      text not null default 'sent' check (status in ('sent','failed')),
  provider_id text,
  error       text,
  sent_at     timestamptz not null default now()
);

create index if not exists sequence_sends_email_idx on public.sequence_sends (lower(email));

alter table public.sequence_sends enable row level security;
drop policy if exists "authed all sequence_sends" on public.sequence_sends;
create policy "authed all sequence_sends" on public.sequence_sends for all
  to authenticated using (true) with check (true);

-- ===========================================================================
-- 4) Timeline read paths
--
-- The CRM timeline pulls every table by email. contact_messages had no index
-- on it, which is the one that would have hurt as the list grows.
-- ===========================================================================
create index if not exists contact_messages_email_idx on public.contact_messages (lower(email));
