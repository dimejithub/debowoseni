-- Records when an event was announced to the mailing list, so the automatic
-- "new event" broadcast fires exactly once per event — publishing an event
-- sends the invite; later edits (fixing a typo, adding a photo) never re-blast
-- the list.
--
-- Safe to run repeatedly. Run once in the Supabase SQL editor.

alter table public.events add column if not exists announced_at timestamptz;

notify pgrst, 'reload schema';
