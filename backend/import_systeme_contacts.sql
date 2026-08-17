-- ---------------------------------------------------------------------------
-- debowoseni.com — import the Systeme contact list
--
-- 38 contacts exported from Systeme before the subscription was
-- cancelled. Run this after phase 3 and phase 4.
--
-- Deliberately a direct SQL insert rather than a call to /api/newsletter:
-- the API path fires the 'subscriber_created' automation, which would enrol
-- all 38 of these people in the LTE Welcome series. They are not new
-- subscribers — some go back to 2023 — and greeting them with "you are in"
-- would be wrong. Importing at the database level skips the trigger entirely.
--
-- Original signup dates are preserved, so the dashboard growth chart and each
-- person's CRM timeline stay truthful instead of showing 38 people
-- joining on the day of the import.
--
-- Safe to re-run: conflicts merge rather than overwrite, and an existing
-- unsubscribe is never resurrected.
-- ---------------------------------------------------------------------------

-- Systeme carried phone and country; the subscribers table did not. Keep them
-- rather than discard them — the phone numbers matter for the WhatsApp
-- community, and country is the only geography on the list.
alter table public.subscribers add column if not exists phone   text;
alter table public.subscribers add column if not exists country text;

insert into public.subscribers
  (email, name, phone, country, source, tags, status, created_at)
values
  ('dimsharedxb@gmail.com', 'Oladimeji Tiamiyu', '447769390296', 'GB', 'systeme-import', array['heard-instagram','lte-registered','systeme-import']::text[], 'subscribed', '2023-01-28 01:24:09+01'::timestamptz),
  ('tiamiyuoladimeji3@gmail.com', 'Oladimeji Tiamiyu', '447769390284', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('folayemiemoruwa@gmail.com', 'Folayemi Emoruwa', null, null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('debo@dodigital.uk', 'Test me', '447534496595', null, 'systeme-import', array['internal','lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('ilocelineozioma@gmail.com', 'Celine Ilo', '447865671812', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('oladipupohilton@gmail.com', 'Oladipupo Samuel Hilton', '447413168653', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('desmondosawaru53@gmail.com', 'Desmond Osawaru', '447717027683', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('karen.aikpehae@gmail.com', 'Karen Aikpehae', '447459702056', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('alfredharry2001@gmail.com', 'Alfred onyemali', '447708181826', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('ooriaifo982@gmail.com', 'Obehi Oriaifo', null, null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('chehono@gmail.com', 'Chebono Uziewe (Niko)', '447511112124', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('featbolaji@gmail.com', 'Folasade Eunice Bolaji', '2348035730611', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('obyademola@yahoo.com', 'Mrs Obioma  Joy Ademola', '447534801954', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('ifeohalehi@gmail.com', 'Ifeoma', '447459287598', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('xplicitpresh@gmail.com', 'Precious Chukwu', '447538590374', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('ooaoyeniji@gmail.com', 'Oluyinka Oyeniji', '447308598463', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('boluwatifeadelua@gmail.com', 'Boluwatife Adelua', '447407063123', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('drabigailudoma@gmail.com', 'Dr Abigail Udoma', null, null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('julianahumani@gmail.com', 'Julianah Esoso', '447765931456', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('sendadaamih@gmail.com', 'Adama Christiana Amih', '447440404338', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('fabulousiyanuoluwa75@gmail.com', 'Iyanuoluwa', '447769371057', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('kuns4jesus@gmail.com', 'Olukunle Ogunniran', '447769371066', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('chinwenogwurumba@gmail.com', 'Chinwe O', '447551111460', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('wunmi4jc@yahoo.com', 'Nana-Hauwa Ndirpaya', null, null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('toluoyetade@gmail.com', 'Iyanda Tolulope Fiyinfoluwa', '447988795438', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('omololamajolagbe@gmail.com', 'Omolola Majolagbe', '447312751049', 'GB', 'systeme-import', array['lead-event','lte-registered','source-website','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('nkoyomajebi@gmail.com', 'Nkoyo Lynn Majebi', '447951861373', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('vickkelechi@gmail.com', 'Kelechi Uduji', '447448698374', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('sonaiketimz@gmail.com', 'Timothy Sonaike', '447506610865', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('amikmoore@yahoo.com', 'Amara Muoghalu', null, null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('bussy4lurv@yahoo.com', 'Olubusayo Olabode', '7402940079', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('akinyemitaiwo42@yahoo.co.uk', 'Taiwo Akinyemi', '7403042173', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('folakemti@gmail.com', 'folakemi tiamiyu', '447769390284', null, 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-04 12:28:17+01'::timestamptz),
  ('smutkoncept@gmail.com', 'Olusegun Adekunle', '447983270953', 'GB', 'systeme-import', array['heard-through-a-friend','lte-registered','systeme-import']::text[], 'subscribed', '2026-03-06 05:28:20+01'::timestamptz),
  ('adebowale.owoseni@gmail.com', 'Adebowale Owoseni', '447534496595', 'GB', 'systeme-import', array['lte-registered','systeme-import']::text[], 'subscribed', '2026-03-07 08:29:01+01'::timestamptz),
  ('diatom-cool0a@icloud.com', 'Constance Ade', '447404531417', 'GB', 'systeme-import', array['heard-dr-debo','lte-registered','systeme-import']::text[], 'subscribed', '2026-03-07 08:45:10+01'::timestamptz),
  ('dimejiteam@gmail.com', null, null, 'GB', 'systeme-import', array['lead-event','source-website','systeme-import']::text[], 'subscribed', '2026-06-24 12:11:07+02'::timestamptz),
  ('mikkygroove99@gmail.com', null, null, 'NG', 'systeme-import', array['lead-event','source-website','systeme-import']::text[], 'subscribed', '2026-07-26 23:39:00+02'::timestamptz)
on conflict (email) do update set
  -- Never blank out something already known, and never overwrite a status:
  -- anyone who unsubscribed on the site must stay unsubscribed.
  name       = coalesce(public.subscribers.name, excluded.name),
  phone      = coalesce(public.subscribers.phone, excluded.phone),
  country    = coalesce(public.subscribers.country, excluded.country),
  tags       = (
    select array(select distinct unnest(public.subscribers.tags || excluded.tags))
  ),
  created_at = least(public.subscribers.created_at, excluded.created_at);

-- What landed.
select
  count(*) filter (where 'systeme-import' = any(tags))                 as imported,
  count(*) filter (where 'internal'       = any(tags))                 as flagged_internal,
  count(*) filter (where status = 'subscribed')                        as mailable,
  count(*)                                                             as total_subscribers
from public.subscribers;
