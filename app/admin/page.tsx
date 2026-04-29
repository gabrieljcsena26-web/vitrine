'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import Link from 'next/link'
import {
  BarChart3, Check, Database, ExternalLink, Eye, Lock, LogOut,
  RefreshCw, Save, Scissors, Settings, ShieldCheck, Users,
} from 'lucide-react'

interface AdminBusiness {
  id: string
  slug: string
  owner_name: string | null
  owner_email: string | null
  plan: string | null
  created_at: string
}

interface DevSetting {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

interface OverviewData {
  stats: {
    businesses: number
    leads: number
    events: number
  }
  businesses: AdminBusiness[]
  settings: DevSetting[]
}

const defaultControlSettings = {
  betaMode: true,
  defaultPlan: 'starter',
  internalNote: 'Use this console to test pages, monitor activity and keep launch controls saved in Supabase.',
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [controlSettings, setControlSettings] = useState(defaultControlSettings)

  const controlSetting = useMemo(() => (
    overview?.settings.find((item) => item.key === 'control')
  ), [overview])

  const loadOverview = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/overview')
      if (res.status === 401) {
        setIsAuthenticated(false)
        setOverview(null)
        return
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not load admin overview')
      setOverview(json)
      setIsAuthenticated(true)
      const savedControl = json.settings?.find((item: DevSetting) => item.key === 'control')?.value
      if (savedControl && typeof savedControl === 'object') {
        setControlSettings({
          betaMode: Boolean(savedControl.betaMode ?? defaultControlSettings.betaMode),
          defaultPlan: String(savedControl.defaultPlan ?? defaultControlSettings.defaultPlan),
          internalNote: String(savedControl.internalNote ?? defaultControlSettings.internalNote),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Invalid password')
      setPassword('')
      await loadOverview()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid password')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    setIsAuthenticated(false)
    setOverview(null)
  }

  const handleSaveSettings = async () => {
    setSaveLoading(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'control', value: controlSettings }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not save settings')
      setSaved(true)
      await loadOverview()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings')
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_32%)]" />
        <div className="relative w-full max-w-md bg-white text-navy rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center mb-5">
            <Lock className="w-6 h-6 text-navy" />
          </div>
          <h1 className="text-3xl font-black mb-2">Developer login</h1>
          <p className="text-gray-500 text-sm mb-6">
            Private control panel for testing, launch checks and saved internal settings.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter developer password"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold text-sm"
              />
              <p className="text-xs text-gray-400 mt-2">Local development fallback password is dev when no environment password is set.</p>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loginLoading || !password.trim()}
              className="w-full bg-gold text-navy rounded-xl px-4 py-3 font-black hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Opening...' : 'Open developer console'}
            </button>
          </form>
          <Link href="/" className="block text-center text-sm text-gray-400 hover:text-navy mt-5">
            Back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-navy border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-white font-bold">Vitrine Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={loadOverview}
              className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-navy to-slate-900 text-white rounded-3xl p-7 mb-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 mb-4">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span className="text-gold text-xs font-bold uppercase tracking-wider">Private developer console</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Launch control</h1>
              <p className="text-gray-300 max-w-2xl">
                Monitor pages, test the product flow and keep internal launch settings saved in Supabase.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2.5 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-sm"
            >
              Open test login
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {error && <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AdminStat icon={<Database className="w-5 h-5" />} label="Pages created" value={overview?.stats.businesses ?? 0} />
          <AdminStat icon={<Users className="w-5 h-5" />} label="Leads captured" value={overview?.stats.leads ?? 0} />
          <AdminStat icon={<Eye className="w-5 h-5" />} label="Tracked events" value={overview?.stats.events ?? 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <section className="bg-white rounded-3xl border border-stone-200/70 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-black text-navy">Saved controls</h2>
            </div>
            <div className="space-y-5">
              <label className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50 border border-stone-100 p-4">
                <div>
                  <p className="font-bold text-navy">Beta mode</p>
                  <p className="text-sm text-gray-400">Internal flag saved for launch discipline.</p>
                </div>
                <input
                  type="checkbox"
                  checked={controlSettings.betaMode}
                  onChange={(event) => setControlSettings((current) => ({ ...current, betaMode: event.target.checked }))}
                  className="w-5 h-5 accent-yellow-500"
                />
              </label>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Default plan for tests</label>
                <select
                  value={controlSettings.defaultPlan}
                  onChange={(event) => setControlSettings((current) => ({ ...current, defaultPlan: event.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold text-sm bg-white"
                >
                  <option value="starter">Starter — 1 page</option>
                  <option value="pro">Pro — 3 pages</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Internal notes</label>
                <textarea
                  rows={5}
                  value={controlSettings.internalNote}
                  onChange={(event) => setControlSettings((current) => ({ ...current, internalNote: event.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saveLoading}
                className="inline-flex items-center gap-2 bg-gold text-navy px-5 py-3 rounded-xl font-black hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {saved ? <><Check className="w-4 h-4" />Saved in Supabase</> : <><Save className="w-4 h-4" />Save controls</>}
              </button>

              {controlSetting && (
                <p className="text-xs text-gray-400">
                  Last saved: {new Date(controlSetting.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-stone-200/70 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black text-navy">Recent pages</h2>
                <p className="text-sm text-gray-400 mt-1">Latest businesses created in the database.</p>
              </div>
              <Link href="/dashboard" className="text-sm font-bold text-gold hover:underline">Create demo</Link>
            </div>
            {overview?.businesses.length ? (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {overview.businesses.map((business) => (
                  <div key={business.id} className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black text-navy truncate">{business.owner_name ?? 'Unnamed business'}</p>
                      <p className="text-xs text-gray-400 break-all">{business.owner_email ?? 'No email'} · {business.plan ?? 'starter'}</p>
                      <p className="text-xs text-gray-400 mt-1">Created {new Date(business.created_at).toLocaleDateString()}</p>
                    </div>
                    <a
                      href={`/p/${business.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-navy px-3 py-2 rounded-xl text-xs font-bold hover:border-gold/40 transition-colors flex-shrink-0"
                    >
                      Page
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center">
                <BarChart3 className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No pages found yet.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function AdminStat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/70 shadow-sm p-5">
      <div className="w-11 h-11 bg-gold/10 text-gold rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-3xl font-black text-navy">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  )
}
