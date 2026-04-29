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
  services          jsonb,
  hours             jsonb,
  photos            jsonb,
  booking_url       text,
  whatsapp_number   text,
  whatsapp_message  text,
  plan              text default 'starter',
  created_at        timestamptz default now()
);

-- ─── Page views / click events ─────────────────────────────────────────────────
create table if not exists page_views (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  via           text,                -- campaign name, e.g. "instagram-bio" (null = direct)
  event_type    text not null default 'visit',   -- 'visit' | 'booking_click' | 'whatsapp_click'
  visited_at    timestamptz default now()
);

-- Migration helper (run if the table already exists):
-- alter table page_views add column if not exists event_type text not null default 'visit';
-- alter table businesses  add column if not exists whatsapp_number text;
-- alter table businesses  add column if not exists whatsapp_message text;
-- alter table businesses  add column if not exists plan text default 'starter';
-- alter table leads add column if not exists status text default 'new';
-- alter table leads add column if not exists interest text;
-- alter table leads add column if not exists temperature text default 'new';

-- ─── Leads ─────────────────────────────────────────────────────────────────────
create table if not exists leads (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  visitor_name    text,
  visitor_email   text,
  message         text,
  via             text,              -- same as page_views.via
  status          text default 'new', -- 'new' | 'contacted' | 'won' | 'lost'
  interest        text,
  temperature     text default 'new', -- 'new' | 'warm' | 'hot'
  submitted_at    timestamptz default now()
);

-- ─── Tracking channels ────────────────────────────────────────────────────────
create table if not exists channels (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  name          text not null,
  slug          text not null,
  created_at    timestamptz default now(),
  unique (business_id, slug)
);

-- ─── Recommended indexes for scale ────────────────────────────────────────────
create index if not exists page_views_business_event_idx on page_views (business_id, event_type, visited_at desc);
create index if not exists page_views_business_via_idx on page_views (business_id, via);
create index if not exists leads_business_submitted_idx on leads (business_id, submitted_at desc);
create index if not exists businesses_owner_email_idx on businesses (owner_email);
create index if not exists businesses_slug_idx on businesses (slug);
create index if not exists channels_business_slug_idx on channels (business_id, slug);

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- Public pages can insert views and leads; reads are only via service role key.
alter table businesses  enable row level security;
alter table page_views  enable row level security;
alter table leads       enable row level security;
alter table channels    enable row level security;

-- Anyone can insert a page view (tracked from the public page)
create policy "insert page views" on page_views for insert with check (true);

-- Anyone can insert a lead (from the contact form)
create policy "insert leads" on leads for insert with check (true);

-- Reads via service role key bypass RLS automatically — no extra policy needed.
