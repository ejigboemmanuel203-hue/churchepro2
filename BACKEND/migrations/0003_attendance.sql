-- =====================================================================
-- Migration 0003 — ATTENDANCE
-- Multi-day, updatable sheets. Each sheet = an activity (e.g. a week of
-- services). Each day holds Male/Female figures per category. Totals are
-- computed in the app. Categories a church doesn't have are simply left
-- out of the sheet's `categories` array ("Nil").
-- =====================================================================

create table public.attendance_sheets (
  id            uuid primary key default gen_random_uuid(),
  church_id     uuid not null references public.churches(id) on delete cascade,
  title         text not null,
  activity_type text not null,
  -- which of the 5 categories this church tracks on this sheet (Nil = omitted)
  categories    text[] not null default array['adult','campus','youth','children','newcomers'],
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table public.attendance_days (
  id           uuid primary key default gen_random_uuid(),
  sheet_id     uuid not null references public.attendance_sheets(id) on delete cascade,
  church_id    uuid not null references public.churches(id) on delete cascade,
  day_label    text,
  service_date date not null,
  created_at   timestamptz not null default now(),
  unique (sheet_id, service_date)
);

create table public.attendance_figures (
  id        uuid primary key default gen_random_uuid(),
  day_id    uuid not null references public.attendance_days(id) on delete cascade,
  church_id uuid not null references public.churches(id) on delete cascade,
  category  text not null check (category in ('adult','campus','youth','children','newcomers')),
  male      integer not null default 0 check (male >= 0),
  female    integer not null default 0 check (female >= 0),
  unique (day_id, category)
);

create index attendance_days_sheet_idx    on public.attendance_days(sheet_id);
create index attendance_figures_day_idx   on public.attendance_figures(day_id);
create index attendance_sheets_church_idx on public.attendance_sheets(church_id);

-- =====================================================================
-- ROW LEVEL SECURITY — each church only sees/edits its own attendance
-- =====================================================================
alter table public.attendance_sheets  enable row level security;
alter table public.attendance_days     enable row level security;
alter table public.attendance_figures  enable row level security;

-- attendance_sheets
create policy "members read sheets"   on public.attendance_sheets for select to authenticated using (church_id = public.current_church_id());
create policy "members insert sheets" on public.attendance_sheets for insert to authenticated with check (church_id = public.current_church_id());
create policy "members update sheets" on public.attendance_sheets for update to authenticated using (church_id = public.current_church_id()) with check (church_id = public.current_church_id());
create policy "members delete sheets" on public.attendance_sheets for delete to authenticated using (church_id = public.current_church_id());

-- attendance_days
create policy "members read days"   on public.attendance_days for select to authenticated using (church_id = public.current_church_id());
create policy "members insert days" on public.attendance_days for insert to authenticated with check (church_id = public.current_church_id());
create policy "members update days" on public.attendance_days for update to authenticated using (church_id = public.current_church_id()) with check (church_id = public.current_church_id());
create policy "members delete days" on public.attendance_days for delete to authenticated using (church_id = public.current_church_id());

-- attendance_figures
create policy "members read figures"   on public.attendance_figures for select to authenticated using (church_id = public.current_church_id());
create policy "members insert figures" on public.attendance_figures for insert to authenticated with check (church_id = public.current_church_id());
create policy "members update figures" on public.attendance_figures for update to authenticated using (church_id = public.current_church_id()) with check (church_id = public.current_church_id());
create policy "members delete figures" on public.attendance_figures for delete to authenticated using (church_id = public.current_church_id());
