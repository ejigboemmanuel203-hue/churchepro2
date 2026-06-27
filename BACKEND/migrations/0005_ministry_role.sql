-- =====================================================================
-- Migration 0005 — add ministry_role to profiles
-- Stores which church department / ministry the member serves in
-- (e.g. "Usher", "Choir Member", "Pastor", or a custom value).
-- The existing "users can update own profile" RLS policy already covers
-- updating this column, so no new policy is needed.
-- =====================================================================

alter table public.profiles
  add column if not exists ministry_role text;
