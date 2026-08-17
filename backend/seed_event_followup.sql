-- ---------------------------------------------------------------------------
-- debowoseni.com — Event follow-up automation (generic, covers every event)
--
-- One rule, triggered by *any* event registration (blank trigger value = all
-- events). This is the hands-off answer to "an automation for every event's
-- attendees": Debo never has to build a rule per event — every registration,
-- for any event now or in future, enters this follow-up.
--
-- The registration itself already sends an immediate confirmation (the backend
-- does that directly), so this sequence is the nurture that follows: a warm
-- note, then a soft pointer to the programmes.
--
-- Seeded PAUSED. Review and edit the copy in Admin → Automations, then activate.
-- Safe to re-run. Requires phase 4.
-- ---------------------------------------------------------------------------

insert into public.sequences (name, description, trigger_type, trigger_value, status)
select
  'Event follow-up',
  'Nurture for anyone who registers for any event. Fires on every event registration.',
  'event_registered',
  null,
  'paused'
where not exists (
  select 1 from public.sequences where name = 'Event follow-up'
);

-- Step 1 — day 1
insert into public.sequence_steps (sequence_id, position, delay_days, subject, preheader, body)
select s.id, 1, 1,
  'Glad you are coming',
  'A note before we meet.',
  '# Glad you are coming

Thank you for registering — your place is set, and I am looking forward to it.

A quick word before we meet: come as you are. You do not need to prepare, or arrive with your questions polished. The most useful thing you can bring is the honest one — the thing you have been circling.

That is where the work starts.

See you soon,
Debo''
'
from public.sequences s
where s.name = 'Event follow-up'
  and not exists (
    select 1 from public.sequence_steps where sequence_id = s.id and position = 1
  );

-- Step 2 — day 4
insert into public.sequence_steps (sequence_id, position, delay_days, subject, preheader, body)
select s.id, 2, 4,
  'If the event stirred something',
  'Where the room becomes a plan.',
  '# If something stirred

If the event named something you have been carrying — good. That is the point of a room like that.

The question is what happens next. An honest hour in a room fades unless it becomes a direction you can act on.

That is what the Life Transformation Enquiry is for: turning the shift into a Life-Map and a plan for the chapter in front of you. Three ways in — one to one, or a bootcamp in person or online — each with a copy of *Taking Your Day* and the community alongside.

[See the pathways →](https://debowoseni.com/programmes)

And if now is not the time, stay close. Reply when something lands.

Debo''
'
from public.sequences s
where s.name = 'Event follow-up'
  and not exists (
    select 1 from public.sequence_steps where sequence_id = s.id and position = 2
  );
