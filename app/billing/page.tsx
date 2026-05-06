'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, CreditCard, Lock, ShieldCheck, Sparkles } from 'lucide-react'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    pages: '1 landing page',
    price: '€10',
    period: '/mês',
    badge: 'Relatório quinzenal',
    text: 'Para validar uma página profissional com link público, leads e dashboard básico.',
    features: ['1 página publicada', 'Dashboard privado', 'Leads e rastreio', 'Relatório a cada 14 dias'],
  },
  {
    id: 'pro',
    name: 'Pro',
    pages: '3 landing pages',
    price: '€15',
    period: '/mês',
    badge: 'Mais escolhido',
    text: 'Para clientes com múltiplas páginas, campanhas, QR e relatórios semanais.',
    features: ['Até 3 páginas', 'Seletor inteligente por landing', 'QR por campanha', 'Relatório semanal'],
    highlighted: true,
  },
]

export default function BillingPage() {
  const [email, setEmail] = useState('')
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')

  const startCheckout = async (plan: string) => {
    setError('')
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Não foi possível abrir o checkout.')
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível abrir o checkout.')
      setLoadingPlan('')
    }
  }

  return (
    <main className="min-h-screen bg-navy text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <Link href="/" className="font-black text-xl">Vitrine</Link>
          <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">Criar página</Link>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-gold text-sm font-bold mb-6">
              <ShieldCheck className="w-4 h-4" />
              Pagamento seguro via Stripe
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
              Escolha o plano e pague com cartão de forma segura.
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-7">
              Os dados do cartão ficam no Stripe Checkout. A Vitrine nunca salva número do cartão, CVC ou dados sensíveis — recebe apenas a confirmação da assinatura para liberar Starter ou Pro.
            </p>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-200">Email do dono da página</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cliente@email.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <Lock className="w-5 h-5 text-gold mb-2" />
                  <p className="font-bold">Sem cartão no banco</p>
                  <p className="text-gray-400 text-xs mt-1">A Vitrine não guarda número de cartão.</p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <CreditCard className="w-5 h-5 text-gold mb-2" />
                  <p className="font-bold">Checkout protegido</p>
                  <p className="text-gray-400 text-xs mt-1">Cartão, 3DS, Apple Pay/Google Pay dependem do Stripe.</p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <Sparkles className="w-5 h-5 text-gold mb-2" />
                  <p className="font-bold">Plano automático</p>
                  <p className="text-gray-400 text-xs mt-1">Webhook atualiza Starter ou Pro.</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Depois do pagamento, você volta para a Vitrine. Se já existir uma página com este email, o plano é atualizado automaticamente. Se ainda não existir, crie a página com o mesmo email.
              </p>
              {error && <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl border p-6 shadow-2xl ${plan.highlighted ? 'bg-gold text-navy border-gold shadow-gold/20' : 'bg-white text-navy border-white'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${plan.highlighted ? 'bg-navy text-gold' : 'bg-gold/10 text-gold'}`}>{plan.badge}</span>
                    <h2 className="text-3xl font-black mt-3">{plan.name}</h2>
                    <div className="mt-2 flex items-end gap-1">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className={`pb-1 text-sm font-black ${plan.highlighted ? 'text-navy/60' : 'text-gray-400'}`}>{plan.period}</span>
                    </div>
                    <p className="font-bold text-lg mt-1">{plan.pages}</p>
                  </div>
                  <CreditCard className="w-7 h-7" />
                </div>
                <p className={plan.highlighted ? 'text-navy/70' : 'text-gray-500'}>{plan.text}</p>
                <ul className="my-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm font-bold">
                      <Check className="w-4 h-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => startCheckout(plan.id)}
                  disabled={!email.trim() || Boolean(loadingPlan)}
                  className={`w-full rounded-full px-5 py-3 font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${plan.highlighted ? 'bg-navy text-gold hover:bg-navy/90' : 'bg-gold text-navy hover:bg-yellow-400'}`}
                >
                  {loadingPlan === plan.id ? 'Abrindo checkout...' : `Pagar ${plan.name}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
