# Vitrine ✨

> Generate beautiful landing pages for local businesses in seconds. No code needed.

Vitrine is a SaaS platform where local business owners upload photos and basic info, and the system instantly generates a professional, multilingual landing page with a chatbot, contact form, and more.

## 🚀 Demo

- **Homepage:** `/` — product landing with pricing
- **Live Demo:** `/demo` — Studio Elegance hair salon page  
- **Dashboard:** `/dashboard` — onboarding form for business owners
- **Login:** `/login` — token-based access for the private owner dashboard

## ✅ Launch Readiness

Current checkout: **82/100**. Core launch paths are ready: landing page, onboarding, generated public pages, lead capture, tracking, and private dashboard access. Before a full production launch, prioritize payments, custom domains, production monitoring, and a configured test dashboard token.

## 💻 Run Locally

```bash
git clone https://github.com/gabrieljcsena26-web/vitrine.git
cd vitrine
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

To enable the test dashboard button on `/login`, set:

```bash
NEXT_PUBLIC_TEST_DASHBOARD_TOKEN=your-test-dashboard-token
```

## 🛠 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)
- **next/font** (Inter — via system font stack fallback)
- **Supabase** (businesses, visits, leads, dashboard data)
- **Resend** (welcome and feedback emails)

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gabrieljcsena26-web/vitrine)

1. Click the button above
2. Connect your GitHub account
3. Deploy in one click

## 🗺 Roadmap

- [ ] **Supabase** — database + auth for business accounts
- [ ] **OpenAI** — AI-powered chatbot responses
- [ ] **Resend** — transactional emails for contact form
- [ ] **Stripe** — payment processing for subscriptions
- [ ] Custom domains per business
- [ ] Analytics dashboard

## 📄 License

MIT © 2024 Vitrine
