-- =====================================================================
-- Migration 0004 — FOLLOW-UP
-- People to follow up (visitors, new converts, etc.), their status, who
-- they're assigned to, and a dated log of follow-up interactions.
-- Admins can add/edit; members can only read (enforced via is_church_admin).
-- =====================================================================

-- Helper: is the current user an admin of their church?
create or replace function public.is_church_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_church_admin() from public, anon;
grant execute on function public.is_church_admin() to authenticated;

-- People to follow up
create table public.contacts (
  id           uuid primary key default gen_random_uuid(),
  church_id    uuid not null references public.churches(id) on delete cascade,
  full_name    text not null,
  phone        text,
  email        text,
  contact_type text not null default 'visitor'
               check (contact_type in ('visitor','new_convert','member','other')),
  status       text not null default 'new'
               check (status in ('new','contacted','in_progress','completed','not_interested')),
  assigned_to  uuid references auth.users(id) on delete set null,
  source       text,
  notes        text,
  first_seen   date,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Dated follow-up interactions per contact
create table public.followup_logs (
  id         uuid primary key default gen_random_uuid(),
  church_id  uuid not null references public.churches(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  note       text not null,
  method     text not null default 'call'
             check (method in ('call','visit','sms','whatsapp','email','other')),
  logged_by  uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index contacts_church_idx      on public.contacts(church_id);
create index contacts_status_idx      on public.contacts(status);
create index followup_logs_contact_idx on public.followup_logs(contact_id);

-- =====================================================================
-- ROW LEVEL SECURITY — members read; admins write
-- =====================================================================
alter table public.contacts      enable row level security;
alter table public.followup_logs enable row level security;

-- contacts
create policy "members read contacts"   on public.contacts for select to authenticated using (church_id = public.current_church_id());
create policy "admins insert contacts"  on public.contacts for insert to authenticated with check (church_id = public.current_church_id() and public.is_church_admin());
create policy "admins update contacts"  on public.contacts for update to authenticated using (church_id = public.current_church_id() and public.is_church_admin()) with check (church_id = public.current_church_id() and public.is_church_admin());
create policy "admins delete contacts"  on public.contacts for delete to authenticated using (church_id = public.current_church_id() and public.is_church_admin());

-- followup_logs
create policy "members read logs"  on public.followup_logs for select to authenticated using (church_id = public.current_church_id());
create policy "admins insert logs" on public.followup_logs for insert to authenticated with check (church_id = public.current_church_id() and public.is_church_admin());
create policy "admins delete logs" on public.followup_logs for delete to authenticated using (church_id = public.current_church_id() and public.is_church_admin());
