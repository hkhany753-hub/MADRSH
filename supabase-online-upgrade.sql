-- Run this after supabase-schema.sql and admin-schema.sql in Supabase SQL Editor.
-- This migration is safe to re-run.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(coalesce(new.email,''), '@', 1), 'کاربر'),
    new.email
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.room_members enable row level security;
drop policy if exists "room members readable" on public.room_members;
drop policy if exists "room members self insert" on public.room_members;
drop policy if exists "room members self update" on public.room_members;
drop policy if exists "room members self delete" on public.room_members;
create policy "room members readable" on public.room_members for select using (true);
create policy "room members self insert" on public.room_members for insert to authenticated with check (auth.uid() = user_id);
create policy "room members self update" on public.room_members for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "room members self delete" on public.room_members for delete to authenticated using (auth.uid() = user_id);

-- Add the realtime tables only when they are not already published.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='room_members') then
    execute 'alter publication supabase_realtime add table public.room_members';
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='rooms') then
    execute 'alter publication supabase_realtime add table public.rooms';
  end if;
end $$;

create index if not exists activities_user_created_idx on public.activities(user_id, created_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);
create index if not exists room_members_room_seen_idx on public.room_members(room_id, last_seen_at desc);
