# Vitrine ✨

> Generate beautiful landing pages for local businesses in seconds. No code needed.

Vitrine is a SaaS platform where local business owners upload photos and basic info, and the system instantly generates a professional, multilingual landing page with a chatbot, contact form, and more.

## 🚀 Demo

- **Homepage:** `/` — product introduction
- **Live Demo:** `/demo` — Studio Elegance hair salon page  
- **Dashboard:** `/dashboard` — onboarding form for business owners
- **Test Login:** `/login` — creates/opens a demo dashboard with analytics

## 💻 Run Locally

```bash
git clone https://github.com/gabrieljcsena26-web/vitrine.git
cd vitrine
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)
- **Supabase** (database + storage)
- **Resend** (transactional email)

## 🔐 Environment Variables

Set these in `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_BASE_URL=
SUPABASE_STORAGE_BUCKET=business-photos
```

## 🗄 Supabase Setup

1. Run [supabase-schema.sql](supabase-schema.sql) in the Supabase SQL Editor.
2. Create a public Storage bucket named `business-photos`.
3. Confirm the `businesses`, `page_views`, `leads`, and `channels` tables exist.

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gabrieljcsena26-web/vitrine)

1. Click the button above
2. Connect your GitHub account
3. Deploy in one click

## 🗺 Roadmap

- [x] **Supabase** — database + storage foundation
- [x] **Resend** — transactional emails for leads and recovery
- [x] **Analytics dashboard** — visits, intent, channels, leads
- [ ] **Supabase Auth** — real owner accounts
- [ ] **Stripe** — payment processing for subscriptions
- [ ] Custom domains per business
- [ ] Daily analytics aggregation for large scale

## 📄 License

MIT © 2024 Vitrine
