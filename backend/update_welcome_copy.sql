-- ---------------------------------------------------------------------------
-- debowoseni.com — Improved LTE Welcome copy
--
-- Rewrites the four welcome emails to work harder for the brand: it establishes
-- Debo's authority (coach, academic, author), tells enough of the story to
-- build trust, and leads deliberately toward the programmes, the book and the
-- community — without hard-selling. Still in his voice.
--
-- Updates the existing 'LTE Welcome' steps in place, so anyone part-way through
-- keeps their position. Safe to re-run. Debo can keep editing these in
-- Admin → Automations afterwards.
-- ---------------------------------------------------------------------------

update public.sequence_steps s
set subject = v.subject, preheader = v.preheader, body = v.body, updated_at = now()
from (values
  (1,
   'Welcome — you are in the right room',
   'What the Enquiry is, who Debo is, and what happens next.',
   '# You are in the right room

Thank you for stepping into the Enquiry.

I am Debo Owoseni — a transformation coach, an academic, and the author of *Taking Your Day*. For years, across lecture halls, boardrooms and living rooms, I have watched the same quiet thing: capable, driven people carrying lives that have split into compartments. Work in one. Faith in another. Family in a third. And a sense of purpose that never quite connects to any of them.

If that lands, you are exactly where you should be.

Over the next week I will send you three more short notes — not content for its own sake, but the few ideas that most reliably move people from scattered to settled. At the end, if it is right, I will show you how we can do that work together.

For now, just read. And if something stirs, reply. I read every one.

Debo''')
  ,
  (2,
   'You do not need more information',
   'You need one coherent direction — here is why.',
   '# You do not need more information

You need one coherent direction.

This is the thing I say most often, because it is the thing most often missed. When life feels heavy, the instinct is to go looking — another book, another course, another framework. More input.

But the weight is rarely ignorance. It is fragmentation.

You are running several competent versions of yourself in parallel, and the exhaustion comes from the switching — and from the quiet suspicion that none of them are pointed the same way.

Here is the idea at the centre of everything I teach:

**One life. One purpose. Expressed through several assignments and multiple platforms.**

Read the order again, because it matters. Not several purposes competing for one life. One purpose, given several expressions. The assignments are allowed to be many. The direction is not.

The work is not adding anything. It is finding the single thread already running through what you do — and letting everything else fall in behind it.

That is what the Life Transformation Enquiry builds. More on that soon.

Debo''')
  ,
  (3,
   'Time tells, if you give it time',
   'Why the thing you keep avoiding keeps coming back.',
   '# Time tells

If you give it time.

There is a particular tiredness that comes not from doing too much, but from carrying something unresolved for so long that carrying it has become normal.

You know the thing. It surfaces on quiet drives, and in the first minute after you wake. You have become skilled at putting it down again.

Here is what I have watched for years: **all actions are seeds — including the decision to wait.** Waiting is not neutral. It is a planting, and time will tell you honestly what you planted.

That sounds like a warning. It is closer to an invitation. Because the principle runs both ways: one honest conversation, one decision named aloud, one direction chosen and committed to — those are seeds too, and time is just as faithful to them.

The fog does not lift by waiting. It lifts by moving.

What is the thing you have been circling? Reply and tell me — sometimes naming it to one person is the first honest move.

Debo''')
  ,
  (4,
   'Three ways we can do this work together',
   'One to one, one day in a room, or one day online — plus the book.',
   '# When you are ready to move

Everything I have written this week is one idea from three angles: you are not missing information, you are missing coherence — and coherence is built, not stumbled into.

That building is the Life Transformation Enquiry. There are three ways in. They differ in depth and format, not in outcome — each ends with a Life-Map you can act on and a plan for the chapter in front of you.

- **One to one** — three sessions over fourteen days, built entirely around you. We begin with a free thirty-minute call to scope it.
- **Bootcamp, in person** — one focused day, six hours, a small room in Leicester. Limited to ten.
- **Bootcamp, online** — the same day, live, wherever you are.

Every pathway includes a copy of *Taking Your Day — 365 Insights on Walking Transformation Daily*, access to the LTE community, and ongoing check-ins from me.

[See the three pathways →](https://debowoseni.com/programmes)

And if the timing is not right yet, that is a fine and honest answer. Stay close. Keep reading. Reply when something lands. The door does not close.

Debo''')
) as v(position, subject, preheader, body)
where s.position = v.position
  and s.sequence_id = (select id from public.sequences where name = 'LTE Welcome' limit 1);
