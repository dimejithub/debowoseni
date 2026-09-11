-- Online joining details for an event: the video-call / webinar link (Zoom,
-- Google Meet, Teams, etc.) and any extra dial-in text. Debo enters these a few
-- days before an online event and broadcasts them to contacts from the admin
-- panel (POST /admin/events/{id}/send-link).
--
-- Safe to run repeatedly. Run once in the Supabase SQL editor.

alter table public.events add column if not exists online_url text;
alter table public.events add column if not exists online_details text;

notify pgrst, 'reload schema';
