-- =====================================================================
-- Migration 0001 — FOUNDATION: multi-tenant churches + user profiles
-- Applied to Supabase project: olvyxnsgdwtzltbespei (church-platform)
-- =====================================================================

-- 1. CHURCHES (the "tenants" - each church is one organization)
create table public.churches (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- 2. PROFILES (one row per signed-up user, linked to Supabase auth)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  church_id   uuid references public.churches(id) on delete set null,
  full_name   text,
  email       text,
  role        text not null default 'member' check (role in ('admin','member')),
  created_at  timestamptz not null default now()
);

-- 3. Auto-create a profile whenever someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Helper: which church does the current user belong to?
create or replace function public.current_church_id()
returns uuid
language sql
stable
security definer set search_path = public
as $$
  select church_id from public.profiles where id = auth.uid();
$$;

-- 5. Helper: create a church and make the caller its admin
create or replace function public.create_church(church_name text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  new_id uuid;
  new_slug text;
begin
  new_slug := lower(regexp_replace(church_name, '[^a-zA-Z0-9]+', '-', 'g'))
              || '-' || substr(gen_random_uuid()::text, 1, 6);

  insert into public.churches (name, slug, created_by)
  values (church_name, new_slug, auth.uid())
  returning id into new_id;

  update public.profiles
     set church_id = new_id, role = 'admin'
   where id = auth.uid();

  return new_id;
end;
$$;

-- =====================================================================
-- ROW LEVEL SECURITY (the "walls" between churches)
-- =====================================================================
alter table public.churches  enable row level security;
alter table public.profiles  enable row level security;

-- CHURCHES: members can view their own church
create policy "members can view their church"
  on public.churches for select
  to authenticated
  using (id = public.current_church_id());

-- CHURCHES: admins can update their own church
create policy "admins can update their church"
  on public.churches for update
  to authenticated
  using (id = public.current_church_id())
  with check (id = public.current_church_id());

-- PROFILES: a user can always see their own profile
create policy "users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- PROFILES: a user can see other profiles in the same church
create policy "users can view profiles in their church"
  on public.profiles for select
  to authenticated
  using (church_id is not null and church_id = public.current_church_id());

-- PROFILES: a user can update their own profile
create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
