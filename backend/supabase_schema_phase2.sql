-- ============================================================
-- debowoseni.com — Phase 2 schema additions (idempotent)
-- Paste into Supabase Dashboard → SQL Editor → New query → Run
-- Adds CMS-backed tables for testimonials, books, publications, events.
-- ============================================================

-- TESTIMONIALS
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  attribution text not null,
  role text,
  avatar_url text,
  status text not null default 'published' check (status in ('draft','published')),
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists "public read testimonials" on public.testimonials;
create policy "public read testimonials" on public.testimonials for select
  to anon, authenticated using (status='published' or auth.role()='authenticated');
drop policy if exists "authed all testimonials" on public.testimonials;
create policy "authed all testimonials" on public.testimonials for all
  to authenticated using (true) with check (true);

-- BOOKS
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  one_liner text,
  description text,
  cover_url text,
  buy_url text,
  is_featured bool default false,
  status text not null default 'published' check (status in ('draft','published')),
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.books enable row level security;
drop policy if exists "public read books" on public.books;
create policy "public read books" on public.books for select
  to anon, authenticated using (status='published' or auth.role()='authenticated');
drop policy if exists "authed all books" on public.books;
create policy "authed all books" on public.books for all
  to authenticated using (true) with check (true);

-- PUBLICATIONS
create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text,
  url text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);
alter table public.publications enable row level security;
drop policy if exists "public read publications" on public.publications;
create policy "public read publications" on public.publications for select
  to anon, authenticated using (true);
drop policy if exists "authed all publications" on public.publications;
create policy "authed all publications" on public.publications for all
  to authenticated using (true) with check (true);

-- EVENTS (gallery)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover_url text,
  gallery jsonb default '[]'::jsonb,
  location text,
  event_date date,
  status text not null default 'published' check (status in ('draft','published')),
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events for select
  to anon, authenticated using (status='published' or auth.role()='authenticated');
drop policy if exists "authed all events" on public.events;
create policy "authed all events" on public.events for all
  to authenticated using (true) with check (true);
