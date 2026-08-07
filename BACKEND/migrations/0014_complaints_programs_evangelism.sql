-- =====================================================================
-- Migration 0014 — COMPLAINTS/SUGGESTIONS, PROGRAMS, EVANGELISM
-- =====================================================================

-- =====================================================================
-- 1. COMPLAINTS & SUGGESTIONS (anonymous, like prayer requests)
-- =====================================================================

create table public.complaints (
  id         uuid primary key default gen_random_uuid(),
  church_id  uuid not null references public.churches(id) on delete cascade,
  kind       text not null default 'suggestion'
             check (kind in ('complaint','suggestion')),
  body       text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
  -- No sender column — always anonymous.
);

create index complaints_church_idx on public.complaints(church_id);

alter table public.complaints enable row level security;

create policy "members submit complaints"
  on public.complaints for insert to authenticated
  with check (church_id = public.current_church_id());

create policy "admins and pastors read complaints"
  on public.complaints for select to authenticated
  using (
    church_id = public.current_church_id()
    and (
      public.is_church_admin()
      or public.has_ministry_role(array['Pastor','Associate Pastor'])
    )
  );

create policy "admins update complaints"
  on public.complaints for update to authenticated
  using (
    church_id = public.current_church_id()
    and (
      public.is_church_admin()
      or public.has_ministry_role(array['Pastor','Associate Pastor'])
    )
  )
  with check (church_id = public.current_church_id());

create policy "admins delete complaints"
  on public.complaints for delete to authenticated
  using (
    church_id = public.current_church_id()
    and (
      public.is_church_admin()
      or public.has_ministry_role(array['Pastor','Associate Pastor'])
    )
  );


-- =====================================================================
-- 2. PROGRAMS (admin creates; members + external visitors register)
-- =====================================================================

create table public.programs (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches(id) on delete cascade,
  title       text not null,
  description text,
  date        date,
  location    text,
  is_open     boolean not null default true,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index programs_church_idx on public.programs(church_id);

-- Custom fields defined per program (e.g. "T-shirt size", "Dietary needs").
create table public.program_custom_fields (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  label      text not null,
  field_type text not null default 'text'
             check (field_type in ('text','number','select')),
  options    text[],  -- for select fields: list of choices
  required   boolean not null default false,
  sort_order integer not null default 0
);

create index program_fields_program_idx on public.program_custom_fields(program_id);

-- Registrations (both logged-in members and external visitors).
create table public.program_registrations (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.programs(id) on delete cascade,
  church_id    uuid not null references public.churches(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,  -- null for external
  full_name    text not null,
  phone        text,
  email        text,
  custom_data  jsonb not null default '{}',  -- answers to custom fields
  created_at   timestamptz not null default now()
);

create index registrations_program_idx on public.program_registrations(program_id);

alter table public.programs               enable row level security;
alter table public.program_custom_fields   enable row level security;
alter table public.program_registrations   enable row level security;

-- Programs: everyone in the church reads; admins write.
create policy "members read programs"
  on public.programs for select to authenticated
  using (church_id = public.current_church_id());

create policy "admins insert programs"
  on public.programs for insert to authenticated
  with check (church_id = public.current_church_id() and public.is_church_admin());

create policy "admins update programs"
  on public.programs for update to authenticated
  using (church_id = public.current_church_id() and public.is_church_admin())
  with check (church_id = public.current_church_id());

create policy "admins delete programs"
  on public.programs for delete to authenticated
  using (church_id = public.current_church_id() and public.is_church_admin());

-- Custom fields: same as programs.
create policy "members read fields"
  on public.program_custom_fields for select to authenticated
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.church_id = public.current_church_id()
    )
  );

create policy "admins insert fields"
  on public.program_custom_fields for insert to authenticated
  with check (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.church_id = public.current_church_id()
      and public.is_church_admin()
    )
  );

create policy "admins update fields"
  on public.program_custom_fields for update to authenticated
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.church_id = public.current_church_id()
      and public.is_church_admin()
    )
  )
  with check (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.church_id = public.current_church_id()
    )
  );

create policy "admins delete fields"
  on public.program_custom_fields for delete to authenticated
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.church_id = public.current_church_id()
      and public.is_church_admin()
    )
  );

-- Registrations: admins see all; members see their own; anyone can insert.
create policy "admins read registrations"
  on public.program_registrations for select to authenticated
  using (church_id = public.current_church_id() and public.is_church_admin());

create policy "members read own registration"
  on public.program_registrations for select to authenticated
  using (church_id = public.current_church_id() and user_id = auth.uid());

create policy "members register for programs"
  on public.program_registrations for insert to authenticated
  with check (church_id = public.current_church_id());

-- Anonymous / public registration (via shareable link) — uses anon key.
create policy "anon register for programs"
  on public.program_registrations for insert to anon
  with check (true);

-- Programs must be readable by anon for the public registration page.
create policy "anon read open programs"
  on public.programs for select to anon
  using (is_open = true);

create policy "anon read program fields"
  on public.program_custom_fields for select to anon
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.is_open = true
    )
  );


-- =====================================================================
-- 3. EVANGELISM (logged encounters + leaderboard)
-- =====================================================================

create table public.evangelism_entries (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  person_name text,
  location    text,
  notes       text,
  won         boolean not null default false,
  created_at  timestamptz not null default now()
);

create index evangelism_church_idx on public.evangelism_entries(church_id);
create index evangelism_user_idx   on public.evangelism_entries(user_id);

alter table public.evangelism_entries enable row level security;

-- Members read all entries in their church (for the leaderboard).
create policy "members read evangelism"
  on public.evangelism_entries for select to authenticated
  using (church_id = public.current_church_id());

-- Members insert their own entries.
create policy "members insert evangelism"
  on public.evangelism_entries for insert to authenticated
  with check (
    church_id = public.current_church_id()
    and user_id = auth.uid()
  );

-- Members can update/delete their own entries.
create policy "members update own evangelism"
  on public.evangelism_entries for update to authenticated
  using (user_id = auth.uid() and church_id = public.current_church_id())
  with check (user_id = auth.uid());

create policy "members delete own evangelism"
  on public.evangelism_entries for delete to authenticated
  using (user_id = auth.uid() and church_id = public.current_church_id());

-- Admins can also manage all entries.
create policy "admins manage evangelism"
  on public.evangelism_entries for all to authenticated
  using (church_id = public.current_church_id() and public.is_church_admin())
  with check (church_id = public.current_church_id());


-- =====================================================================
-- 4. ADMIN MODE COLUMN (for 3-mode admin: creator/analysis/member)
-- =====================================================================

alter table public.profiles
  add column if not exists admin_mode text default 'member'
    check (admin_mode in ('creator','analysis','member'));
