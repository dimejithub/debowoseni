-- Optional teaser video for an event (shown on upcoming events, before the
-- gallery of photos exists). A direct video URL (.mp4/.webm) or a YouTube/Vimeo
-- link — the public events page renders whichever it is.
--
-- Safe to run repeatedly. Run once in the Supabase SQL editor.

alter table public.events add column if not exists video_url text;

notify pgrst, 'reload schema';
