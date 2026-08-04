-- =====================================================================
-- Migration 0012 — ADMIN STEP-UP (elevated admin mode with a personal code)
-- An admin must enter their personal alphanumeric code to "elevate" before
-- admin actions are allowed. is_church_admin() now requires elevation, so
-- this is enforced in the database (RLS), not just the UI.
-- =====================================================================

alter table public.profiles
  add column if not exists admin_code_hash   text,        -- salt:hash of the personal code
  add column if not exists elevated          boolean not null default false,
  add column if not exists code_attempts     integer not null default 0,
  add column if not exists code_locked_until timestamptz;

-- Admin actions now require role = 'admin' AND an active elevated session.
create or replace function public.is_church_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and elevated = true
  );
$$;
