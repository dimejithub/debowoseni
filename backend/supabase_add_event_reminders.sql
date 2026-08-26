-- Countdown reminders for event registrants. As an event approaches, everyone
-- who registered gets a "7 / 3 / 2 / 1 days to go" nudge. This table records
-- which reminder has already gone to whom, so the hourly scheduler sends each
-- milestone exactly once per person — never twice, even though it ticks every
-- hour of the milestone day.
--
-- Safe to run repeatedly. Run once in the Supabase SQL editor.

create table if not exists public.event_reminders (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  email       text not null,
  days_before int  not null,
  status      text,
  provider_id text,
  error       text,
  sent_at     timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (event_id, email, days_before)
);

create index if not exists event_reminders_event_idx on public.event_reminders (event_id);

notify pgrst, 'reload schema';
