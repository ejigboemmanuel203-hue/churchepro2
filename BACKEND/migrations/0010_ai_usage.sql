-- =====================================================================
-- Migration 0010 — AI assistant per-user daily usage counter
-- Tracks how many assistant messages a user has sent today so we can
-- enforce a daily limit (cost control). Stored on profiles.
-- The existing "users can update own profile" policy covers these columns.
-- =====================================================================

alter table public.profiles
  add column if not exists ai_day date,
  add column if not exists ai_count integer not null default 0;
