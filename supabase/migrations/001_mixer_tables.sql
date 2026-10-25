-- Silverhawk Audio Mixer — tables on shared Supabase (Web Gallery project)
-- Run in SQL Editor. Enable RLS. Service role only in Edge Functions.

create extension if not exists "pgcrypto";

create table if not exists public.mixer_local_users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.mixer_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  author_name text,
  user_id uuid,
  audio_url text,
  cover_url text,
  duration_ms integer default 0,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mixer_likes (
  track_id uuid not null references public.mixer_tracks(id) on delete cascade,
  user_key text not null,
  created_at timestamptz not null default now(),
  primary key (track_id, user_key)
);

create table if not exists public.mixer_comments (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.mixer_tracks(id) on delete cascade,
  user_id uuid,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists mixer_tracks_public_created on public.mixer_tracks (is_public, created_at desc);
create index if not exists mixer_comments_track on public.mixer_comments (track_id, created_at);

alter table public.mixer_tracks enable row level security;
alter table public.mixer_comments enable row level security;
alter table public.mixer_likes enable row level security;
alter table public.mixer_local_users enable row level security;

-- Public read for published tracks & comments
create policy "mixer_tracks_public_read" on public.mixer_tracks
  for select using (is_public = true);

create policy "mixer_comments_public_read" on public.mixer_comments
  for select using (true);

-- Writes go through Edge Function (service role). No direct anon insert by default.
