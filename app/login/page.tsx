'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors, Mail, ArrowRight, Lock, UserRound } from 'lucide-react'

interface DashboardLink {
  ownerName: string
  slug: string
  dashboardUrl: string
  pageUrl: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('test@test.com')
  const [password, setPassword] = useState('teste123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      const loginId = email.trim().toLowerCase()
      const normalizedEmail = 'test@test.com'
      const validTestLogin =
        (loginId === 'test@test.com' || loginId === 'teste') &&
        password === 'teste123'

      if (!validTestLogin) {
        setError('E-mail ou senha inválidos. Use o perfil teste abaixo.')
        return
      }

      const res = await fetch('/api/dashboard/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const json = await res.json()
      if (json.links && json.links.length > 0) {
        const dashboardPath = new URL(json.links[0].dashboardUrl).pathname
        router.push(dashboardPath)
      } else {
        setError('Perfil teste encontrado, mas nenhum dashboard foi retornado.')
      }
    } catch {
      setError('Erro ao entrar no dashboard. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
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

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserRound className="w-5 h-5 text-gold" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Entrar no perfil teste</h1>
                  <p className="text-slate-500 text-sm">
                    Use o acesso abaixo para entrar direto no dashboard e testar as mudanças.
                  </p>
                </div>

                <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-5 text-sm">
                  <p className="font-semibold text-navy mb-1">Perfil teste pronto</p>
                  <p className="text-slate-600">Nome: <span className="font-mono">teste</span></p>
                  <p className="text-slate-600">E-mail: <span className="font-mono">test@test.com</span></p>
                  <p className="text-slate-600">Senha: <span className="font-mono">teste123</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nome ou e-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teste ou test@test.com"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="teste123"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password.trim()}
                    className="w-full bg-gold text-navy py-3 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                    ) : (
                      <>
                        Entrar no dashboard teste
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500">
                    Quer criar outra landing page?{' '}
                    <Link href="/dashboard" className="text-gold font-semibold hover:underline">
                      Criar nova página →
                    </Link>
                  </p>
                </div>
              </>
          </div>
        </div>
      </div>
    </div>
  )
}
