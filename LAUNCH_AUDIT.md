# Vitrine — Launch audit and deployment plan

## Launch score

**Current readiness: 82/100**

Vitrine is close to a controlled beta launch. The core product is working: marketing homepage, guided setup, preview with watermark, published pages, dashboard, leads, tracking, QR, reports and multilingual public experience. The remaining gap is mainly production operations: payments, customer identity/account model, automated entitlement by plan, migrations applied in production, and end-to-end email/payment verification.

## What is already strong

- Premium homepage with clear positioning and three business categories.
- Guided setup with immediate language switching and client-friendly explanations.
- Watermarked preview for test/unpaid pages.
- Public pages with multilingual content.
- Food/menu template with menu QR support.
- Owner dashboard with visits, leads, channels, QR and settings.
- Supabase schema for businesses, leads, page views, channels and reports.
- Resend integration for welcome/report emails.
- Plan-aware report cadence: Starter biweekly, Pro weekly.
- Vercel-ready Next.js build.

## Must-have before public launch

### 1. Database and identity

Run `supabase-schema.sql` in Supabase production and confirm these tables exist:

- `businesses`
- `page_views`
- `leads`
- `channels`
- `email_reports`
- `dev_settings`

Recommended next schema additions for cleaner customer identity:

```sql
alter table businesses add column if not exists customer_id uuid;
alter table businesses add column if not exists subscription_status text default 'trial';
alter table businesses add column if not exists billing_provider text;
alter table businesses add column if not exists billing_customer_id text;
alter table businesses add column if not exists billing_subscription_id text;
alter table businesses add column if not exists trial_started_at timestamptz default now();
alter table businesses add column if not exists published_at timestamptz;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  preferred_language text default 'pt',
  created_at timestamptz default now()
);

create index if not exists businesses_customer_id_idx on businesses(customer_id);
create index if not exists businesses_billing_customer_idx on businesses(billing_customer_id);
```

Purpose: every business page belongs to a customer, every customer has a plan/subscription, and reports are sent to the right owner without ambiguity.

### 2. Payments

Recommended path:

1. Use Stripe Checkout for `starter` and `pro`.
2. Add `/api/billing/checkout` to create checkout sessions.
3. Add `/api/billing/webhook` to receive `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. Save Stripe customer/subscription IDs on `businesses` or preferably `customers`.
5. Use `subscription_status` to decide:
   - `trial` → preview has watermark.
   - `active` → public page can be published without watermark.
   - `past_due/canceled` → dashboard warning and optional watermark/limited publishing.

### 3. Auth and login

Current dashboard works with private token links. For launch:

- Keep private dashboard token as a simple MVP.
- Add magic-link login or Supabase Auth before scale.
- Send welcome email after page creation with:
  - public page link,
  - dashboard link,
  - selected plan,
  - next steps.
- Add dashboard recovery by owner email.

### 4. Reports

Already present direction:

- Starter: report every 14 days.
- Pro: weekly report.

Before launch:

1. Configure Vercel Cron to call `/api/cron/feedback-email`.
2. Set a secret header for cron protection.
3. Confirm Resend domain is verified.
4. Test reports with one Starter and one Pro business.
5. Confirm `email_reports` prevents duplicate reports.

### 5. Production environment variables

Set in Vercel Production and Preview:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SUPABASE_STORAGE_BUCKET=business-photos
VITRINE_DEV_PASSWORD=
VITRINE_DEV_SESSION_SECRET=
```

When Stripe is added:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Launch checklist

### Phase 1 — Controlled beta

- Apply SQL schema in Supabase.
- Create Storage bucket `business-photos`.
- Deploy to Vercel.
- Verify homepage, setup, preview, public page, dashboard and test login.
- Create 3 test businesses:
  - food,
  - salon,
  - clinic/office.
- Confirm each has correct language, contact options and dashboard data.
- Confirm watermark appears only in preview/test flow.
- Confirm reports can be sent manually.

### Phase 2 — Paid launch

- Add Stripe Checkout.
- Add subscription webhooks.
- Connect plan limits to subscription status.
- Add payment success page.
- Add upgrade/downgrade handling in dashboard.
- Add automatic welcome email after successful payment.

### Phase 3 — Scale and polish

- Add Supabase Auth or magic login.
- Add admin customer list and subscription status.
- Add in-dashboard onboarding checklist.
- Add better analytics by channel and conversion rate.
- Add translated emails for PT/EN/ES/FR.
- Add automated screenshot or visual QA before publishing.

## Deployment steps

1. Merge PR into `main`.
2. Open Supabase SQL Editor and run `supabase-schema.sql`.
3. Create Storage bucket `business-photos`.
4. Add all environment variables in Vercel.
5. Import GitHub repo in Vercel as Next.js.
6. Build command: `npm run build`.
7. Deploy.
8. Open `/admin` and configure launch settings.
9. Open `/dashboard` and create a test page.
10. Open `/preview` and verify watermark.
11. Publish page and open `/p/[slug]`.
12. Open dashboard token link and verify visits/leads.
13. Trigger cron route manually and verify Resend email.

## Recommendation

Launch as a beta after one final payment/auth pass. The product is visually strong and already useful. The safest launch path is a controlled beta with manual payment/plan assignment first, then Stripe automation before broader public traffic.
