-- =====================================================================
-- Migration 0007 — PRAYER REQUESTS (anonymous)
-- Any church member can submit a prayer request. The sender is NEVER
-- recorded (truly anonymous). Only Pastors, Associate Pastors, and
-- Prayer Coordinators/Intercessors can read their church's requests.
-- Relies on has_ministry_role() from migration 0006.
-- =====================================================================

create table public.prayer_requests (
  id         uuid primary key default gen_random_uuid(),
  church_id  uuid not null references public.churches(id) on delete cascade,
  category   text not null default 'general'
             check (category in ('general','healing','family','finances','thanksgiving','guidance','other')),
  body       text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
  -- NOTE: deliberately no sender/user column — requests are anonymous.
);

create index prayer_requests_church_idx on public.prayer_requests(church_id);

alter table public.prayer_requests enable row level security;

-- Roles allowed to read/manage the prayer inbox.
-- (kept inline so the policy is self-contained)
-- Any member of the church may submit a request.
create policy "members submit prayer requests"
  on public.prayer_requests for insert to authenticated
  with check (church_id = public.current_church_id());

-- Only prayer-team roles may read their church's requests.
create policy "prayer team reads requests"
  on public.prayer_requests for select to authenticated
  using (
    church_id = public.current_church_id()
    and public.has_ministry_role(
      array['Pastor','Associate Pastor','Prayer Coordinator / Intercessor']
    )
  );

-- Prayer-team roles may mark requests read / delete them.
create policy "prayer team updates requests"
  on public.prayer_requests for update to authenticated
  using (
    church_id = public.current_church_id()
    and public.has_ministry_role(
      array['Pastor','Associate Pastor','Prayer Coordinator / Intercessor']
    )
  )
  with check (church_id = public.current_church_id());

create policy "prayer team deletes requests"
  on public.prayer_requests for delete to authenticated
  using (
    church_id = public.current_church_id()
    and public.has_ministry_role(
      array['Pastor','Associate Pastor','Prayer Coordinator / Intercessor']
    )
  );
