-- Vitrine — Supabase schema
-- Run this in the Supabase SQL Editor to set up the database.

create extension if not exists "pgcrypto";

-- ─── Businesses ────────────────────────────────────────────────────────────────
create table if not exists businesses (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  owner_name    text not null,
  owner_email   text not null,
  contact_email text,
  secret_token  text not null unique default encode(gen_random_bytes(18), 'hex'),
  category      text,
  description   text,
  address       text,
  phone         text,
  lang          text default 'en',
  services          jsonb,
  hours             jsonb,
  photos            jsonb,
  benefits          jsonb,
  testimonials      jsonb,
  faqs              jsonb,
  social_links      jsonb,
  logo_url          text,
  primary_color     text,
  accent_color      text,
  map_url           text,
  menu_url          text,
  menu_image_url    text,
  seo_title         text,
  seo_description   text,
  og_image_url      text,
  booking_url       text,
  whatsapp_number   text,
  whatsapp_message  text,
  plan              text default 'starter',
  subscription_status text default 'trial',
  billing_provider text,
  billing_customer_id text,
  billing_subscription_id text,
  trial_started_at timestamptz default now(),
  published_at timestamptz,
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

-- Idempotent migration helper for existing projects.
alter table page_views add column if not exists event_type text not null default 'visit';
alter table businesses  add column if not exists contact_email text;
alter table businesses  add column if not exists whatsapp_number text;
alter table businesses  add column if not exists whatsapp_message text;
alter table businesses  add column if not exists plan text default 'starter';
alter table businesses  add column if not exists subscription_status text default 'trial';
alter table businesses  add column if not exists billing_provider text;
alter table businesses  add column if not exists billing_customer_id text;
alter table businesses  add column if not exists billing_subscription_id text;
alter table businesses  add column if not exists trial_started_at timestamptz default now();
alter table businesses  add column if not exists published_at timestamptz;
alter table businesses  add column if not exists benefits jsonb;
alter table businesses  add column if not exists testimonials jsonb;
alter table businesses  add column if not exists faqs jsonb;
alter table businesses  add column if not exists social_links jsonb;
alter table businesses  add column if not exists logo_url text;
alter table businesses  add column if not exists primary_color text;
alter table businesses  add column if not exists accent_color text;
alter table businesses  add column if not exists map_url text;
alter table businesses  add column if not exists menu_url text;
alter table businesses  add column if not exists menu_image_url text;
alter table businesses  add column if not exists seo_title text;
alter table businesses  add column if not exists seo_description text;
alter table businesses  add column if not exists og_image_url text;
alter table businesses  add column if not exists booking_url text;
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

alter table leads add column if not exists status text default 'new';
alter table leads add column if not exists interest text;
alter table leads add column if not exists temperature text default 'new';

-- ─── Owner accounts ───────────────────────────────────────────────────────────
-- Customer dashboard login. Passwords are stored as scrypt hashes only.
create table if not exists owner_accounts (
  email          text primary key,
  password_hash  text not null,
  password_salt  text not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Temporary email confirmation records for customer account creation.
create table if not exists account_verifications (
  email          text primary key,
  code_hash      text not null,
  code_salt      text not null,
  password_hash  text not null,
  password_salt  text not null,
  attempts       integer not null default 0,
  expires_at     timestamptz not null,
  created_at     timestamptz default now()
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

-- ─── Email reports ────────────────────────────────────────────────────────────
create table if not exists email_reports (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  report_type   text not null,
  period_days   integer not null,
  sent_at       timestamptz default now()
);

-- ─── Customers / subscriptions ────────────────────────────────────────────────
-- A customer owns one or more Vitrine pages. This keeps billing, AI usage and
-- page ownership separate from the public business content.
create table if not exists customers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null unique,
  name               text,
  preferred_language text default 'pt',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

alter table businesses add column if not exists customer_id uuid references customers(id) on delete set null;

create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  customer_id             uuid not null references customers(id) on delete cascade,
  plan                   text not null default 'base', -- base = €12.90/mo
  status                 text not null default 'trial',
  base_price_cents       integer not null default 1290,
  extra_page_price_cents integer not null default 300,
  ai_update_price_cents  integer not null default 100,
  included_pages         integer not null default 1,
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ─── AI-ready page generation ─────────────────────────────────────────────────
-- Photos are compressed client-side before upload. AI uses these assets plus the
-- short setup context to generate a safe JSON config rendered by Vitrine blocks.
create table if not exists business_assets (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  customer_id     uuid references customers(id) on delete set null,
  storage_path    text,
  public_url      text not null,
  role            text default 'gallery', -- hero | about | gallery | menu | service | logo
  mime_type       text default 'image/webp',
  width           integer,
  height          integer,
  size_bytes      integer,
  ai_description  text,
  dominant_colors jsonb,
  sort_order      integer default 0,
  created_at      timestamptz default now()
);

create table if not exists business_page_configs (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  customer_id     uuid references customers(id) on delete set null,
  generation_id   uuid,
  template        text not null default 'service',
  style           jsonb not null default '{}'::jsonb,
  sections        jsonb not null default '[]'::jsonb,
  copy            jsonb not null default '{}'::jsonb,
  photo_roles     jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  version         integer not null default 1,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (business_id)
);

create table if not exists ai_generation_logs (
  id                 uuid primary key default gen_random_uuid(),
  customer_id         uuid references customers(id) on delete set null,
  business_id         uuid references businesses(id) on delete cascade,
  generation_type     text not null default 'page_config', -- page_config | menu_ocr | copy_update | photo_analysis
  model               text not null default 'gpt-5.5-vision',
  status              text not null default 'pending', -- pending | processing | succeeded | failed
  image_count         integer not null default 0,
  cost_cents          integer not null default 100,
  input_summary       jsonb not null default '{}'::jsonb,
  output_config       jsonb,
  error_message       text,
  created_at          timestamptz default now(),
  completed_at        timestamptz
);

-- AI/OCR can extract menu/services into editable database rows. The customer
-- should always be able to review these before final publication.
create table if not exists menu_items (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name        text not null,
  description text,
  price       text,
  category    text,
  photo_url   text,
  source      text default 'manual', -- manual | ai_menu_ocr | ai_photo
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists google_places_connections (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  customer_id     uuid references customers(id) on delete set null,
  place_id        text not null,
  place_name      text,
  rating          numeric,
  review_count    integer,
  reviews_cache   jsonb,
  last_synced_at  timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (business_id)
);

-- ─── Developer/admin settings ─────────────────────────────────────────────────
create table if not exists dev_settings (
  key          text primary key,
  value        jsonb not null,
  updated_at   timestamptz default now()
);

-- ─── Recommended indexes for scale ────────────────────────────────────────────
create index if not exists page_views_business_event_idx on page_views (business_id, event_type, visited_at desc);
create index if not exists page_views_business_via_idx on page_views (business_id, via);
create index if not exists leads_business_submitted_idx on leads (business_id, submitted_at desc);
create index if not exists businesses_owner_email_idx on businesses (owner_email);
create index if not exists businesses_customer_id_idx on businesses (customer_id);
create index if not exists businesses_contact_email_idx on businesses (contact_email);
create index if not exists businesses_billing_customer_idx on businesses (billing_customer_id);
create index if not exists businesses_slug_idx on businesses (slug);
create index if not exists customers_email_idx on customers (email);
create index if not exists subscriptions_customer_idx on subscriptions (customer_id, status);
create index if not exists business_assets_business_idx on business_assets (business_id, role, sort_order);
create index if not exists business_page_configs_business_idx on business_page_configs (business_id);
create index if not exists ai_generation_logs_customer_idx on ai_generation_logs (customer_id, created_at desc);
create index if not exists ai_generation_logs_business_idx on ai_generation_logs (business_id, created_at desc);
create index if not exists menu_items_business_idx on menu_items (business_id, sort_order);
create index if not exists google_places_business_idx on google_places_connections (business_id);
create index if not exists owner_accounts_updated_idx on owner_accounts (updated_at desc);
create index if not exists account_verifications_expires_idx on account_verifications (expires_at);
create index if not exists channels_business_slug_idx on channels (business_id, slug);
create index if not exists email_reports_business_type_idx on email_reports (business_id, report_type, sent_at desc);

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- Public pages can insert views and leads; reads are only via service role key.
alter table businesses  enable row level security;
alter table page_views  enable row level security;
alter table leads       enable row level security;
alter table channels    enable row level security;
alter table owner_accounts enable row level security;
alter table account_verifications enable row level security;
alter table customers enable row level security;
alter table subscriptions enable row level security;
alter table business_assets enable row level security;
alter table business_page_configs enable row level security;
alter table ai_generation_logs enable row level security;
alter table menu_items enable row level security;
alter table google_places_connections enable row level security;
alter table dev_settings enable row level security;
alter table email_reports enable row level security;

-- Anyone can insert a page view (tracked from the public page).
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'page_views' and policyname = 'insert page views'
  ) then
    create policy "insert page views" on page_views for insert with check (true);
  end if;
end $$;

-- Anyone can insert a lead (from the contact form).
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname = 'insert leads'
  ) then
    create policy "insert leads" on leads for insert with check (true);
  end if;
end $$;

-- ─── Supabase Storage ─────────────────────────────────────────────────────────
-- Public image reads are allowed; uploads are handled by server routes using the
-- service role key, so anonymous users never receive write access to storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-photos',
  'business-photos',
  true,
  2500000,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public read business photos'
  ) then
    create policy "public read business photos"
      on storage.objects for select
      using (bucket_id = 'business-photos');
  end if;
end $$;

-- Reads via service role key bypass RLS automatically — no extra policy needed.
