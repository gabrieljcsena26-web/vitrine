'use client'
import Link from 'next/link'
import { Scissors, Upload, FileText, Zap, Check, ArrowRight, Star, LogIn } from 'lucide-react'

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
              View Demo
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
              Login
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
      <section className="pt-32 pb-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">No code needed</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Generate your business page{' '}
            <span className="text-gold">in 60 seconds</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Upload your photos, fill in your info, and get a stunning professional
            landing page instantly. Perfect for local businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-gold/20 flex items-center gap-2 justify-center"
            >
              Create My Page Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2 justify-center"
            >
              See Live Demo
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Free trial · No credit card required
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Upload className="w-6 h-6" />, title: 'Upload your photos', desc: 'Drag and drop your best business photos. We handle the rest.' },
              { icon: <FileText className="w-6 h-6" />, title: 'Fill your info', desc: 'Add your business name, services, hours, and contact details.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Go live instantly', desc: 'Your professional landing page is live and ready to share in seconds.' },
            ].map((card, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-all">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold mb-4">
                  {card.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Launch readiness */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-center">
            <div className="text-center lg:text-left">
              <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">Launch Readiness</p>
              <div className="inline-flex items-end gap-1 mb-3">
                <span className="text-6xl font-black text-white leading-none">82</span>
                <span className="text-gray-400 font-bold mb-2">/100</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Core launch paths are ready; the remaining work is payments, domains, monitoring, and launch operations.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Homepage, demo page, and onboarding are ready',
                'Public business pages support multilingual content',
                'Leads, visits, booking clicks, and WhatsApp clicks are tracked',
                'Private dashboard is accessible by token link',
                'Test login route is available for dashboard access',
                'Before full launch: add payments, custom domains, and production monitoring',
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-navy/40 border border-white/10 p-4">
                  <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
              <Link
                href="/login"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-white/20 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Test dashboard login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Simple process</span>
          <h2 className="text-4xl font-bold mt-2 mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create account', desc: 'Sign up free in seconds. No credit card needed.' },
              { step: '02', title: 'Add your business', desc: 'Fill in details, upload photos, set your services and hours.' },
              { step: '03', title: 'Share your page', desc: 'Copy your link and share it on Instagram, WhatsApp, Google.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-gold/20 font-black text-7xl absolute -top-4 left-1/2 -translate-x-1/2 select-none">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl font-bold mt-2">Simple, honest pricing</h2>
            <p className="text-gray-400 mt-4">Cancel anytime. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: '19€',
                period: '/mo',
                desc: 'Perfect for getting started',
                features: ['1 landing page', 'Multilingual (3 languages)', 'Contact form', 'Mobile responsive', 'Basic analytics'],
                cta: 'Get Starter',
                highlighted: false,
              },
              {
                name: 'Pro',
                price: '39€',
                period: '/mo',
                desc: 'For growing businesses',
                features: ['3 landing pages', 'Everything in Starter', 'AI Chatbot widget', 'Custom domain', 'Priority support'],
                cta: 'Get Pro',
                highlighted: true,
              },
              {
                name: 'Business',
                price: '79€',
                period: '/mo',
                desc: 'For multiple locations',
                features: ['Unlimited pages', 'Everything in Pro', 'White label', 'API access', 'Dedicated support'],
                cta: 'Get Business',
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-gold border-gold text-navy'
                    : 'bg-white/5 border-white/10 hover:border-gold/30'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-navy text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-bold text-xl mb-1 ${plan.highlighted ? 'text-navy' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-navy/70' : 'text-gray-400'}`}>
                    {plan.desc}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${plan.highlighted ? 'text-navy' : 'text-white'}`}>
                      {plan.price}
                    </span>
                    <span className={plan.highlighted ? 'text-navy/70' : 'text-gray-400'}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-navy' : 'text-gold'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-navy' : 'text-gray-300'}`}>{feat}</span>
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
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gold fill-gold" />
            ))}
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Ready to go live?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join hundreds of local businesses already using Vitrine.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gold text-navy px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105"
          >
            Create My Page Free
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
            <Link href="/login" className="text-gray-500 hover:text-gold text-sm transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
