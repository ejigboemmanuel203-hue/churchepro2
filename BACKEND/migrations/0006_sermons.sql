-- =====================================================================
-- Migration 0006 — SERMONS
-- Per-church library of audio/video sermon messages, downloadable by any
-- member of the church. Only Media Personnel and Pastors can upload/manage.
-- Files live in a public Supabase Storage bucket named "sermons".
-- =====================================================================

-- Helper: does the current user hold one of the given ministry roles?
create or replace function public.has_ministry_role(roles text[])
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and ministry_role = any(roles)
  );
$$;

revoke all on function public.has_ministry_role(text[]) from public, anon;
grant execute on function public.has_ministry_role(text[]) to authenticated;

-- Sermon metadata (the actual file lives in storage)
create table public.sermons (
  id           uuid primary key default gen_random_uuid(),
  church_id    uuid not null references public.churches(id) on delete cascade,
  title        text not null,
  preacher     text,
  preached_on  date,
  media_type   text not null default 'audio' check (media_type in ('audio','video')),
  storage_path text not null,            -- path inside the "sermons" bucket
  description  text,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index sermons_church_idx on public.sermons(church_id);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY — all members read; Media Personnel + Pastor write
-- ---------------------------------------------------------------------
alter table public.sermons enable row level security;

create policy "members read sermons"
  on public.sermons for select to authenticated
  using (church_id = public.current_church_id());

create policy "media/pastor insert sermons"
  on public.sermons for insert to authenticated
  with check (
    church_id = public.current_church_id()
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  );

create policy "media/pastor update sermons"
  on public.sermons for update to authenticated
  using (
    church_id = public.current_church_id()
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  )
  with check (
    church_id = public.current_church_id()
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  );

create policy "media/pastor delete sermons"
  on public.sermons for delete to authenticated
  using (
    church_id = public.current_church_id()
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  );

-- =====================================================================
-- STORAGE — public "sermons" bucket + upload policy
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('sermons', 'sermons', true)
on conflict (id) do nothing;

-- Anyone can read sermon files (bucket is public, but be explicit).
create policy "public read sermon files"
  on storage.objects for select
  using (bucket_id = 'sermons');

-- Only Media Personnel and Pastors may upload sermon files.
create policy "media/pastor upload sermon files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'sermons'
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  );

-- Only Media Personnel and Pastors may delete sermon files.
create policy "media/pastor delete sermon files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'sermons'
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  );
