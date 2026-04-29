'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle, LogIn, Scissors } from 'lucide-react'

const TEST_DASHBOARD_TOKEN = process.env.NEXT_PUBLIC_TEST_DASHBOARD_TOKEN ?? ''

export default function LoginPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [savedSlug, setSavedSlug] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      setToken(localStorage.getItem('vitrine_dashboard_token') ?? '')
      setSavedSlug(localStorage.getItem('vitrine_dashboard_slug') ?? '')
    } catch {
      // localStorage unavailable — keep manual token entry.
    }
  }, [])

  const openDashboard = (dashboardToken: string) => {
    const trimmed = dashboardToken.trim()
    if (!trimmed) {
      setError('Paste your dashboard token to continue.')
      return
    }

    router.push(`/dashboard/${encodeURIComponent(trimmed)}`)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    openDashboard(token)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-navy border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-white font-bold">Vitrine</span>
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
            Create a page →
          </Link>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
          <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-6">
            <LogIn className="w-7 h-7 text-gold" />
          </div>

          <h1 className="text-3xl font-black text-navy mb-3">Dashboard login</h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            Use the private token from your welcome email or the test token configured for this environment to access the owner dashboard.
          </p>

          {savedSlug && (
            <div className="flex gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-semibold text-sm">Saved dashboard found</p>
                <p className="text-green-700 text-xs mt-1">
                  This browser has a saved token for <span className="font-mono">{savedSlug}</span>.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="dashboard-token" className="block text-sm font-semibold text-gray-700 mb-2">
                Dashboard token
              </label>
              <input
                id="dashboard-token"
                value={token}
                onChange={(event) => {
                  setToken(event.target.value)
                  setError('')
                }}
                placeholder="Paste your private dashboard token"
                className="w-full border border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gold transition-colors font-mono text-sm"
                autoComplete="off"
              />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gold text-navy px-6 py-3 rounded-2xl font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              Open dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {TEST_DASHBOARD_TOKEN && (
            <button
              type="button"
              onClick={() => openDashboard(TEST_DASHBOARD_TOKEN)}
              className="w-full mt-3 border border-stone-200 text-navy px-6 py-3 rounded-2xl font-semibold hover:border-gold hover:bg-gold/5 transition-colors"
            >
              Use configured test dashboard
            </button>
          )}

          <p className="text-xs text-gray-400 leading-relaxed mt-6">
            Dashboard access is token-based. Keep the private link safe; anyone with the token can view the owner dashboard.
          </p>
        </div>
      </main>
    </div>
  )
}
