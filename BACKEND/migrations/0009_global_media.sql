-- =====================================================================
-- Migration 0009 — GLOBAL (site-wide) MEDIA
-- Media uploaded by Media Personnel / Pastors that is visible to EVERY
-- signed-in user across ALL churches (a "Featured ministrations" band).
-- Not church-scoped. A secret passkey (checked in the server action against
-- the GLOBAL_MEDIA_PASSKEY env var) gates the final upload — RLS only
-- enforces the media/pastor role.
-- =====================================================================

create table public.global_media (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  preacher     text,
  preached_on  date,
  media_type   text not null default 'audio' check (media_type in ('audio','video')),
  storage_path text not null,
  description  text,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.global_media enable row level security;

-- Every signed-in user can view site-wide media.
create policy "signed-in read global media"
  on public.global_media for select to authenticated
  using (true);

-- Only Media Personnel / Pastors may add or remove it (passkey checked in app).
create policy "media/pastor insert global media"
  on public.global_media for insert to authenticated
  with check (public.has_ministry_role(array['Media Personnel','Pastor']));

create policy "media/pastor delete global media"
  on public.global_media for delete to authenticated
  using (public.has_ministry_role(array['Media Personnel','Pastor']));

-- =====================================================================
-- STORAGE — public "global-media" bucket
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('global-media', 'global-media', true)
on conflict (id) do nothing;

create policy "public read global media files"
  on storage.objects for select
  using (bucket_id = 'global-media');

create policy "media/pastor upload global media files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'global-media'
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  );

create policy "media/pastor delete global media files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'global-media'
    and public.has_ministry_role(array['Media Personnel','Pastor'])
  );
