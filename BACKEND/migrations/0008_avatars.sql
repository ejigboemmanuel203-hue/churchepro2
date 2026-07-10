-- =====================================================================
-- Migration 0008 — PROFILE AVATARS
-- Adds a profile picture URL to profiles and a public "avatars" storage
-- bucket. Each user manages only their own avatar file (folder = their id).
-- The existing "users can update own profile" policy covers avatar_url.
-- =====================================================================

alter table public.profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatars (public bucket).
create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- A user may upload/replace/remove only files inside their own id folder.
create policy "users upload own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
