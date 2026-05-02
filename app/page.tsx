'use client'
import Link from 'next/link'
import { Scissors, Upload, FileText, Zap, Check, ArrowRight, BarChart3, Globe2, MessageCircle, CalendarDays } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-navy" />
            </div>
            <span className="font-bold text-xl">Vitrine</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="text-gray-400 hover:text-white transition-colors text-sm">
              View Demos
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
              Login
            </Link>
            <Link href="/login" className="hidden sm:inline-flex text-gold hover:text-yellow-300 transition-colors text-sm font-semibold">
              Test Login
            </Link>
            <Link
              href="/dashboard"
              className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Landing pages + leads + tracking</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Launch a premium page for any local business
              <span className="text-gold"> in minutes.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl">
              Vitrine creates a beautiful multilingual page, captures leads before WhatsApp or booking clicks, and shows which channels bring real intent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-gold/20 flex items-center gap-2 justify-center"
              >
                Create a page
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2 justify-center"
              >
                Open demo dashboard
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
              {[
                ['4', 'Languages'],
                ['2', 'Page plans'],
                ['24/7', 'Public page'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gold/10 blur-3xl rounded-full" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur p-4 shadow-2xl">
              <div className="rounded-[1.5rem] overflow-hidden bg-white text-navy">
                <div className="h-44 bg-gradient-to-br from-stone-900 via-stone-700 to-gold/70 relative">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,white,transparent_18%),radial-gradient(circle_at_80%_60%,white,transparent_12%)]" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="bg-gold text-navy text-[10px] font-black px-2 py-1 rounded-full">BEAUTY STUDIO</span>
                    <h3 className="text-white text-3xl font-black mt-3">Luna Studio</h3>
                    <div className="flex gap-2 mt-4">
                      <span className="bg-gold text-navy px-4 py-2 rounded-full text-xs font-bold">Book now</span>
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold">WhatsApp</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3 border-b border-stone-100">
                  {[
                    [<BarChart3 key="i" className="w-4 h-4" />, '128', 'visits'],
                    [<MessageCircle key="i" className="w-4 h-4" />, '34', 'intent'],
                    [<CalendarDays key="i" className="w-4 h-4" />, '12', 'leads'],
                  ].map(([icon, value, label]) => (
                    <div key={label as string} className="rounded-2xl bg-stone-50 p-3">
                      <div className="text-gold mb-2">{icon}</div>
                      <p className="font-black text-xl">{value}</p>
                      <p className="text-[10px] uppercase text-gray-400 font-bold">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="p-5 space-y-3">
                  {['Instagram', 'WhatsApp', 'Google'].map((source, i) => (
                    <div key={source} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-bold">{source}</span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${85 - i * 20}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-400">{8 - i * 2}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-4 bg-white text-navy">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">What is included</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2">Everything needed to launch one beautiful page.</h2>
            <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
              A clean setup flow, professional sections and a dashboard simple enough for any local business owner.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Upload className="w-6 h-6" />, title: 'Upload your photos', desc: 'Drag and drop your best business photos. We handle the rest.' },
              { icon: <FileText className="w-6 h-6" />, title: 'Fill your info', desc: 'Add your business name, services, hours, and contact details.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Go live instantly', desc: 'Your professional landing page is live and ready to share in seconds.' },
            ].map((card, i) => (
              <div key={i} className="bg-stone-50 border border-stone-100 rounded-3xl p-7 hover:border-gold/40 hover:-translate-y-1 transition-all shadow-sm">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold mb-4">
                  {card.icon}
                </div>
                <h3 className="text-navy font-black text-lg mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light value section */}
      <section className="py-20 px-4 bg-stone-50 text-navy border-y border-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Built for selling</span>
              <h2 className="text-4xl md:text-5xl font-black mt-2 mb-5">
                Simple pages that make local clients look professional fast.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Instead of a complex website, Vitrine gives each business one focused page with WhatsApp, booking, photos, reviews, location and a clean dashboard.
              </p>
              <Link href="/demo" className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-bold hover:bg-navy/90 transition-colors">
                View commercial demos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <MessageCircle className="w-5 h-5" />, title: 'WhatsApp first', desc: 'Turn visitors into conversations with one clear action.' },
                { icon: <CalendarDays className="w-5 h-5" />, title: 'Booking ready', desc: 'Send customers to the scheduling platform the business already uses.' },
                { icon: <Globe2 className="w-5 h-5" />, title: 'Local SEO base', desc: 'Dynamic metadata, sitemap, and local business structure.' },
                { icon: <BarChart3 className="w-5 h-5" />, title: 'Easy dashboard', desc: 'Simple numbers, recent leads and recommended next action.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-stone-100 bg-white p-5 hover:border-gold/40 hover:-translate-y-1 transition-all shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <p className="font-black text-navy text-lg mb-1">{item.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual demo */}
      <section className="py-20 px-4 bg-gradient-to-b from-navy via-slate-950 to-navy text-white border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Client preview</span>
              <h2 className="text-4xl md:text-5xl font-black mt-2 mb-5">Show the owner how their page could look.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Use real business photos, services, opening hours, WhatsApp and booking links to create a polished presentation before launch.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Hero photo', 'First impression'],
                  ['About section', 'Trust and story'],
                  ['Service cards', 'Clear offers'],
                  ['Gallery', 'Proof of work'],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-gold/30 transition-colors">
                    <p className="font-bold text-white">{title}</p>
                    <p className="text-sm text-gray-400 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=900&auto=format&fit=crop', 'Salon interior'],
                ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop', 'Hair styling'],
                ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop', 'Beauty service'],
                ['https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop', 'Haircut detail'],
              ].map(([src, alt], index) => (
                <div key={alt} className={`rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10 ${index === 0 ? 'row-span-2 h-96' : 'h-44'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-white text-navy">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Simple process</span>
          <h2 className="text-4xl font-bold mt-2 mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create test page', desc: 'Use the guided setup to see exactly how the client page will look.' },
              { step: '02', title: 'Add your business', desc: 'Fill in details, upload photos, set your services and hours.' },
              { step: '03', title: 'Share your page', desc: 'Copy your link and share it on Instagram, WhatsApp, Google.' },
            ].map((item, i) => (
              <div key={i} className="relative rounded-3xl bg-stone-50 border border-stone-100 p-8 shadow-sm">
                <div className="text-gold/25 font-black text-7xl absolute -top-5 left-1/2 -translate-x-1/2 select-none">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-navy font-black text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan limits */}
      <section className="py-24 px-4 bg-stone-50 text-navy border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Plans</span>
            <h2 className="text-4xl font-bold mt-2">Choose the page capacity</h2>
            <p className="text-gray-500 mt-4">Plan capacity is ready; commercial terms stay private during beta.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: 'Starter',
                pages: '1 page',
                desc: 'Perfect for one business page',
                features: ['Multilingual page', 'Lead capture', 'Tracking channels', 'Basic dashboard'],
                cta: 'Start with Starter',
                highlighted: false,
              },
              {
                name: 'Pro',
                pages: '3 pages',
                desc: 'For multiple services or locations',
                features: ['Everything in Starter', '3 pages', 'Demo dashboard', 'Priority improvements'],
                cta: 'Choose Pro',
                highlighted: true,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-gold border-gold text-navy'
                    : 'bg-white border-stone-100 text-navy hover:border-gold/30 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-navy text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-1 text-navy">
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-navy/70' : 'text-gray-500'}`}>
                    {plan.desc}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-navy">
                      {plan.pages}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-navy' : 'text-gold'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-navy' : 'text-gray-600'}`}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`block text-center py-3 rounded-full font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-navy text-gold hover:bg-navy/90'
                      : 'bg-gold text-navy hover:bg-yellow-400'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-white text-navy">
        <div className="max-w-2xl mx-auto rounded-[2rem] bg-gradient-to-br from-stone-50 to-white border border-stone-100 p-10 shadow-sm">
          <div className="flex justify-center gap-2 mb-5 flex-wrap">
            {['Ready demos', 'WhatsApp leads', 'SEO foundation'].map((label) => (
              <span key={label} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-gold text-xs font-bold">
                {label}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Ready to go live?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Create a professional demonstration and show clients exactly what they can launch.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gold text-navy px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105"
          >
            Create a demo page
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3 h-3 text-navy" />
            </div>
            <span className="font-bold text-sm">Vitrine</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Vitrine. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/demo" className="text-gray-500 hover:text-gold text-sm transition-colors">Demo</Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-gold text-sm transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
