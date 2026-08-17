-- ---------------------------------------------------------------------------
-- debowoseni.com — LTE Welcome sequence
--
-- The replacement for the Systeme "LTE Welcome" campaign. Systeme's copy could
-- not be read from the build environment, so this is a fresh draft written in
-- the voice already on the site (the Expressions pages and the philosophical
-- anchors). Treat it as a first draft to edit, not finished copy.
--
-- Seeded PAUSED on purpose. Nothing sends until you read it in
-- Admin -> Automations, edit what you want, send yourself a test, and press
-- play. Seeding a live email sequence that mails real people unreviewed would
-- be the wrong default.
--
-- Trigger: someone joins the mailing list (quiz, newsletter, event sign-up or
-- community join — all of them create a subscriber).
--
-- Cadence: day 0, 2, 5, 9.
--
-- Safe to re-run: it will not duplicate the sequence or its steps.
-- Requires phase 4 to have been run first.
-- ---------------------------------------------------------------------------

insert into public.sequences (name, description, trigger_type, trigger_value, status)
select
  'LTE Welcome',
  'Four-part welcome series for everyone who joins the list. Replaces the Systeme campaign.',
  'subscriber_created',
  null,
  'paused'
where not exists (
  select 1 from public.sequences where name = 'LTE Welcome'
);

-- --------------------------------------------------------------------------
-- Step 1 — day 0
-- --------------------------------------------------------------------------
insert into public.sequence_steps (sequence_id, position, delay_days, subject, preheader, body)
select s.id, 1, 0,
  'You are in',
  'What the Enquiry is, and what happens next.',
  '# You are in

Thank you for stepping into the Enquiry.

Most people who arrive here are not short of information. They are capable, they are driven, and they are carrying a life that has quietly split into compartments — work in one, faith in another, family in a third, and a sense of purpose that never quite connects to any of them.

That is what this is for.

Over the next week or so I will send you three more short notes. Not content for its own sake. Just the few ideas that tend to move people from scattered to settled.

If something lands, reply to this email. I read them.

Debo''
'
from public.sequences s
where s.name = 'LTE Welcome'
  and not exists (
    select 1 from public.sequence_steps where sequence_id = s.id and position = 1
  );

-- --------------------------------------------------------------------------
-- Step 2 — day 2
-- --------------------------------------------------------------------------
insert into public.sequence_steps (sequence_id, position, delay_days, subject, preheader, body)
select s.id, 2, 2,
  'You do not need more information',
  'You need one coherent direction.',
  '# You do not need more information

You need one coherent direction.

This is the thing I say most often, because it is the thing most often missed. When life feels heavy, the instinct is to go looking — another book, another course, another framework. More input.

But the weight usually is not ignorance. It is fragmentation.

You are running several versions of yourself in parallel, and each one is competent. The exhaustion comes from the switching, and from the quiet suspicion that none of them are pointed the same way.

One life. One purpose. Expressed through several assignments and multiple platforms.

Read that again, because the order matters. Not several purposes competing for one life. One purpose, given several expressions. The assignments are allowed to be many. The direction is not.

The work is not adding anything. It is finding the single thread already running through what you do, and letting everything else line up behind it.

Debo''
'
from public.sequences s
where s.name = 'LTE Welcome'
  and not exists (
    select 1 from public.sequence_steps where sequence_id = s.id and position = 2
  );

-- --------------------------------------------------------------------------
-- Step 3 — day 5
-- --------------------------------------------------------------------------
insert into public.sequence_steps (sequence_id, position, delay_days, subject, preheader, body)
select s.id, 3, 5,
  'Time tells, if you give it time',
  'Why the thing you are avoiding keeps returning.',
  '# Time tells

If you give it time.

There is a particular kind of tiredness that comes from postponement. Not from doing too much — from carrying something unresolved for long enough that carrying it has become normal.

You know the thing. It surfaces on quiet drives and in the first minute after you wake. You have become skilled at putting it down again.

Here is what I have watched happen for years: **all actions are seeds.** Including the decision to wait. Waiting is not neutral, it is a planting, and time will tell you honestly what you planted.

That sounds like a warning. It is closer to an invitation.

Because the same principle runs the other way. One honest conversation, one decision named out loud, one direction chosen and committed to — those are seeds too, and time tells on those just as faithfully.

The fog does not lift by waiting. It lifts by moving.

What is the thing you have been circling?

Debo''
'
from public.sequences s
where s.name = 'LTE Welcome'
  and not exists (
    select 1 from public.sequence_steps where sequence_id = s.id and position = 3
  );

-- --------------------------------------------------------------------------
-- Step 4 — day 9
-- --------------------------------------------------------------------------
insert into public.sequence_steps (sequence_id, position, delay_days, subject, preheader, body)
select s.id, 4, 9,
  'Three ways we can do this work together',
  'One to one, one day in a room, or one day online.',
  '# If you want to do the work

Everything I have written this week is the same idea from three angles: you are not missing information, you are missing coherence — and coherence is built, not stumbled into.

That building is what the Life Transformation Enquiry is.

There are three ways in, and they differ in depth and in format, not in outcome. Each one ends with a Life-Map you can act on and a plan for the chapter in front of you.

- **One to one** — three sessions over fourteen days, built entirely around you. We start with a free thirty-minute call to scope it.
- **Bootcamp, in person** — one day, six hours, a small room in Leicester. Limited to ten.
- **Bootcamp, online** — the same day, live, wherever you are.

Every one of them includes a copy of *Taking Your Day*, access to the community, and ongoing check-ins from me.

[See the three pathways](https://debowoseni.com/programmes)

And if none of it is right yet, that is a fine answer. Stay on this list. Reply when something lands. The door does not close.

Debo''
'
from public.sequences s
where s.name = 'LTE Welcome'
  and not exists (
    select 1 from public.sequence_steps where sequence_id = s.id and position = 4
  );
