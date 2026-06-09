-- ============================================================
-- debowoseni.com — Supabase schema (idempotent)
-- Paste this into Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) POSTS table (journal)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text default 'Transformation',
  excerpt text,
  body text,
  cover_url text,
  author_name text default 'Debo Owoseni',
  author_avatar text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "public reads published" on public.posts;
create policy "public reads published" on public.posts for select
  to anon, authenticated using (status='published' or auth.role()='authenticated');

drop policy if exists "authed full access" on public.posts;
create policy "authed full access" on public.posts for all
  to authenticated using (true) with check (true);

-- 2) CONTACT submissions
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "authed read contact" on public.contact_messages;
create policy "authed read contact" on public.contact_messages for select
  to authenticated using (true);

-- 3) NEWSLETTER subscribers
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "authed read subscribers" on public.subscribers;
create policy "authed read subscribers" on public.subscribers for select
  to authenticated using (true);

-- 4) Storage bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog-images','blog-images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects for select
  to anon, authenticated using (bucket_id='blog-images');

drop policy if exists "authed write images" on storage.objects;
create policy "authed write images" on storage.objects for insert
  to authenticated with check (bucket_id='blog-images');

drop policy if exists "authed update images" on storage.objects;
create policy "authed update images" on storage.objects for update
  to authenticated using (bucket_id='blog-images');

drop policy if exists "authed delete images" on storage.objects;
create policy "authed delete images" on storage.objects for delete
  to authenticated using (bucket_id='blog-images');
