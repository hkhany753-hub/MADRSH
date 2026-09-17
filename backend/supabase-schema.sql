create table if not exists users (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 phone text unique not null,
 telegram_id text,
 password_hash text not null,
 created_at timestamp default now()
);

create table if not exists otp_codes (
 id uuid primary key default gen_random_uuid(),
 phone text not null,
 code text not null,
 expires_at timestamp not null,
 created_at timestamp default now()
);

create table if not exists sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references users(id),
 token text not null,
 created_at timestamp default now()
);
