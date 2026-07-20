-- =====================================================================
-- Migration 0011 — DONATIONS (deposit details) + QUIZ LEADERBOARD points
-- =====================================================================

-- ---- Donations: each church's giving/deposit details (admin-editable) ----
alter table public.churches
  add column if not exists giving_bank_name      text,
  add column if not exists giving_account_number text,
  add column if not exists giving_account_name   text,
  add column if not exists giving_extra          text;

-- Let a church admin update their own church row (giving details, etc.).
-- Members keep read access via the existing select policy.
create policy "admins update own church"
  on public.churches for update to authenticated
  using (id = public.current_church_id() and public.is_church_admin())
  with check (id = public.current_church_id() and public.is_church_admin());

-- ---- Quiz leaderboard: cumulative correct answers per member ----
alter table public.profiles
  add column if not exists quiz_points integer not null default 0;
