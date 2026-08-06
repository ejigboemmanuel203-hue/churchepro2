-- =====================================================================
-- Migration 0013 — ACCESS MODE (member vs admin) + master-code admin
-- Picks up where 0012 left off. Safe to run even if 0012 was never
-- applied — every statement here is idempotent.
--
-- Model change: admin access is now gated by ONE master passcode that
-- the admin must know (set as the ADMIN_MASTER_CODE env var), entered at
-- signup ("Continue as admin") or later in the dashboard. A correct code
-- sets `elevated = true`, which is the single source of truth for admin
-- power (see is_church_admin below). No per-user personal code anymore.
-- =====================================================================

alter table public.profiles
  add column if not exists elevated          boolean not null default false,
  add column if not exists code_attempts     integer not null default 0,
  add column if not exists code_locked_until timestamptz,
  -- 'member' | 'admin'  (null = user hasn't chosen at onboarding yet)
  add column if not exists access_mode       text
      check (access_mode in ('member','admin'));

-- Admin power is granted purely by an elevated session. Anyone who enters
-- the correct master passcode is elevated; signing out clears it.
create or replace function public.is_church_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and elevated = true
  );
$$;
