-- Darsita admin security + moderation schema
-- Run after supabase-schema.sql in Supabase SQL Editor.

alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user','support','moderator','admin'));

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles readable" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;

create policy "profiles self or admin read"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

create policy "profiles self insert"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles self update"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- Public-safe directory: only non-sensitive profile fields are exposed to signed-in users.
create or replace view public.public_profiles as
select id, name, created_at
from public.profiles;

grant select on public.public_profiles to anon, authenticated;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  category text not null default 'other',
  details text not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_logs (
  id bigint generated always as identity primary key,
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_logs enable row level security;

drop policy if exists "reports own insert" on public.reports;
drop policy if exists "reports admin read" on public.reports;
drop policy if exists "reports admin update" on public.reports;
drop policy if exists "announcements public read" on public.announcements;
drop policy if exists "announcements admin write" on public.announcements;
drop policy if exists "admin logs admin read" on public.admin_logs;
drop policy if exists "admin logs admin insert" on public.admin_logs;

create policy "reports signed in create"
on public.reports for insert to authenticated
with check (auth.uid() = reporter_id);

create policy "reports admin read"
on public.reports for select to authenticated
using (public.is_admin());

create policy "reports admin update"
on public.reports for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "announcements published read"
on public.announcements for select
using (published = true or public.is_admin());

create policy "announcements admin write"
on public.announcements for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin logs admin read"
on public.admin_logs for select to authenticated
using (public.is_admin());

create policy "admin logs admin insert"
on public.admin_logs for insert to authenticated
with check (public.is_admin() and admin_id = auth.uid());

-- Set your own authenticated user's UUID to admin only after your account exists:
-- update public.profiles set role='admin' where id='YOUR_AUTH_USER_UUID';
