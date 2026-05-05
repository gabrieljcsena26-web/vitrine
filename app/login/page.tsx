'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors, Mail, ArrowRight, CheckCircle, Lock } from 'lucide-react'

interface DashboardLink {
  name: string | null
  slug: string
  token: string
  plan: string | null
  subscriptionStatus: string | null
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [dashboards, setDashboards] = useState<DashboardLink[]>([])
  const [error, setError] = useState('')
  const [lastToken, setLastToken] = useState('')

  useEffect(() => {
    try {
      setLastToken(localStorage.getItem('vitrine_dashboard_token') ?? '')
    } catch {
      // localStorage unavailable — ignore
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    setDashboards([])
    try {
      const res = await fetch('/api/dashboard/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Invalid email or password')
      const nextDashboards = Array.isArray(json.dashboards) ? json.dashboards : []
      setDashboards(nextDashboards)
      if (nextDashboards.length === 1 && nextDashboards[0]?.token) {
        try {
          localStorage.setItem('vitrine_dashboard_token', nextDashboards[0].token)
          localStorage.setItem('vitrine_dashboard_slug', nextDashboards[0].slug)
        } catch {
          // localStorage unavailable — ignore
        }
        router.push(`/dashboard/${nextDashboards[0].token}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const openDashboard = (dashboard: DashboardLink) => {
    try {
      localStorage.setItem('vitrine_dashboard_token', dashboard.token)
      localStorage.setItem('vitrine_dashboard_slug', dashboard.slug)
    } catch {
      // localStorage unavailable — ignore
    }
    router.push(`/dashboard/${dashboard.token}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-slate-800 font-bold">Vitrine</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            Create a page →
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {dashboards.length > 1 ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Choose your dashboard</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">You have more than one page on this account.</p>
                <div className="space-y-3 text-left">
                  {dashboards.map((dashboard) => (
                    <button
                      key={dashboard.token}
                      type="button"
                      onClick={() => openDashboard(dashboard)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:border-gold/50 hover:bg-gold/5 p-4 text-left transition-all"
                    >
                      <p className="font-black text-navy">{dashboard.name ?? dashboard.slug}</p>
                      <p className="text-xs text-slate-400 mt-1">/{dashboard.slug} · {dashboard.plan ?? 'starter'} · {dashboard.subscriptionStatus ?? 'trial'}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setDashboards([]); setPassword('') }}
                  className="mt-6 text-sm text-gold hover:underline font-medium"
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scissors className="w-5 h-5 text-gold" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Access your dashboard</h1>
                  <p className="text-slate-500 text-sm">
                    Enter your account email and password to open your private dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {error && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password}
                    className="w-full bg-gold text-navy py-3 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                    ) : (
                      <>
                        Open my dashboard
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  {lastToken && (
                    <Link
                      href={`/dashboard/${lastToken}`}
                      className="block mb-4 text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4"
                    >
                      Open last dashboard saved in this browser
                    </Link>
                  )}
                  <p className="text-sm text-slate-500">
                    Don&apos;t have an account yet?{' '}
                    <Link href="/dashboard" className="text-gold font-semibold hover:underline">
                      Create your account and page →
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Your dashboard is protected by your email and password. Never share your private dashboard link publicly.
          </p>
        </div>
      </div>
    </div>
  )
}
