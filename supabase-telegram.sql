create table if not exists public.telegram_signup_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_token text not null unique,
  phone text not null,
  name text not null,
  telegram_chat_id bigint,
  otp_hash text,
  attempts integer not null default 0,
  verified_at timestamptz,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now()
);

create index if not exists telegram_signup_challenges_phone_idx on public.telegram_signup_challenges(phone);
create index if not exists telegram_signup_challenges_expires_idx on public.telegram_signup_challenges(expires_at);

alter table public.telegram_signup_challenges enable row level security;
