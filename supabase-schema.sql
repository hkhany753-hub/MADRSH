-- Darsita online-study schema
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  subject text not null,
  type text not null check (type in ('study','test')),
  minutes integer not null default 0 check (minutes >= 0),
  tests integer not null default 0 check (tests >= 0),
  correct integer not null default 0 check (correct >= 0),
  wrong integer not null default 0 check (wrong >= 0),
  blank integer not null default 0 check (blank >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null default 'آزاد',
  capacity integer not null default 20 check (capacity between 2 and 100),
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  conversation_id text not null default 'general',
  room_id uuid references public.rooms(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.rooms enable row level security;
alter table public.messages enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "activities readable" on public.activities for select using (true);
create policy "activities own insert" on public.activities for insert with check (auth.uid() = user_id);
create policy "activities own update" on public.activities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activities own delete" on public.activities for delete using (auth.uid() = user_id);

create policy "rooms readable" on public.rooms for select using (true);
create policy "rooms signed in create" on public.rooms for insert with check (auth.uid() = owner_id);
create policy "rooms owner update" on public.rooms for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "rooms owner delete" on public.rooms for delete using (auth.uid() = owner_id);

create policy "messages readable" on public.messages for select using (true);
create policy "messages signed in insert" on public.messages for insert with check (auth.uid() = sender_id);
create policy "messages sender delete" on public.messages for delete using (auth.uid() = sender_id);

insert into public.rooms (name, subject, capacity)
select 'اتاق عمومی', 'آزاد', 20
where not exists (select 1 from public.rooms where name='اتاق عمومی');
