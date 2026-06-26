-- =====================================================================
-- Migration 0002 — Harden SECURITY DEFINER function permissions
-- Stops anonymous visitors from calling internal functions via the API.
-- =====================================================================

-- handle_new_user is ONLY meant to run from the auth trigger.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- current_church_id is an RLS helper - anon has no business calling it.
revoke all on function public.current_church_id() from public, anon;
grant execute on function public.current_church_id() to authenticated;

-- create_church should only be callable by signed-in users.
revoke all on function public.create_church(text) from public, anon;
grant execute on function public.create_church(text) to authenticated;
