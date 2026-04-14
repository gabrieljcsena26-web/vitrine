-- Vitrine — Supabase schema
-- Run this in the Supabase SQL Editor to set up the database.

create extension if not exists "pgcrypto";

-- ─── Businesses ────────────────────────────────────────────────────────────────
create table if not exists businesses (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  owner_name    text not null,
  owner_email   text not null,
  secret_token  text not null unique default encode(gen_random_bytes(18), 'hex'),
  category      text,
  description   text,
  address       text,
  phone         text,
  lang          text default 'en',
  services      jsonb,
  hours         jsonb,
  photos        jsonb,
  created_at    timestamptz default now()
);

-- ─── Page views ────────────────────────────────────────────────────────────────
create table if not exists page_views (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  via           text,                -- campaign name, e.g. "instagram-bio" (null = direct)
  visited_at    timestamptz default now()
);

-- ─── Leads ─────────────────────────────────────────────────────────────────────
create table if not exists leads (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  visitor_name    text,
  visitor_email   text,
  message         text,
  via             text,              -- same as page_views.via
  submitted_at    timestamptz default now()
);

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- Public pages can insert views and leads; reads are only via service role key.
alter table businesses  enable row level security;
alter table page_views  enable row level security;
alter table leads       enable row level security;

-- Anyone can insert a page view (tracked from the public page)
create policy "insert page views" on page_views for insert with check (true);

-- Anyone can insert a lead (from the contact form)
create policy "insert leads" on leads for insert with check (true);

-- Reads via service role key bypass RLS automatically — no extra policy needed.
