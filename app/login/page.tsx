'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors, Mail, ArrowRight, CheckCircle, Lock, UserPlus, KeyRound, Eye, EyeOff, Bot, Sparkles, Shield } from 'lucide-react'

interface DashboardLink {
  name: string | null
  slug: string
  token: string
  plan: string | null
  subscriptionStatus: string | null
}

type Mode = 'login' | 'signup' | 'verify'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [nextPath, setNextPath] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [dashboards, setDashboards] = useState<DashboardLink[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [lastToken, setLastToken] = useState('')
  const [passwordFocusDepth, setPasswordFocusDepth] = useState(0)
  const [mascotPointer, setMascotPointer] = useState({ x: 0, y: 0 })

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const requestedMode = params.get('mode')
      const requestedEmail = params.get('email')
      const requestedCode = params.get('code')
      const requestedNext = params.get('next')
      if (requestedMode === 'verify') setMode('verify')
      if (requestedEmail) setEmail(requestedEmail)
      if (requestedCode) setCode(requestedCode)
      if (requestedNext?.startsWith('/')) setNextPath(requestedNext)
      setLastToken(localStorage.getItem('vitrine_dashboard_token') ?? '')
    } catch {
      // browser APIs unavailable — ignore
    }
  }, [])

  const goAfterAuth = (nextDashboards: DashboardLink[]) => {
    setDashboards(nextDashboards)
    if (nextPath) {
      router.push(nextPath)
      return
    }
    if (nextDashboards.length === 1 && nextDashboards[0]?.token) {
      try {
        localStorage.setItem('vitrine_dashboard_token', nextDashboards[0].token)
        localStorage.setItem('vitrine_dashboard_slug', nextDashboards[0].slug)
      } catch {
        // localStorage unavailable — ignore
      }
      router.push(`/dashboard/${nextDashboards[0].token}`)
      return
    }
    if (nextDashboards.length === 0) {
      router.push('/dashboard')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    setNotice('')
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
      goAfterAuth(nextDashboards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await fetch('/api/account/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, confirmPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not create account')
      setMode('verify')
      setNotice(json.devCode ? `Development code: ${json.devCode}` : 'We sent a confirmation code to your email. Enter it below to activate your account.')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/account/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not confirm account')
      setNotice('Welcome to Vitrine. Your account is confirmed.')
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm account')
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

  const title = mode === 'signup' ? 'Create your Vitrine account' : mode === 'verify' ? 'Confirm your email' : 'Access your dashboard'
  const subtitle = mode === 'signup'
    ? 'Create a secure account first. Then you can build your page, preview it and choose a plan.'
    : mode === 'verify'
    ? 'Enter the 6-digit code sent to your email to activate your account.'
    : 'Log in with your email and password. We never send private dashboard links without password protection.'
  const passwordGuardActive = passwordFocusDepth > 0

  const handleCardMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    setMascotPointer({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) })
  }

  const handleCardMouseLeave = () => {
    setMascotPointer({ x: 0, y: 0 })
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
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            Create a page →
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
          <div className={`mx-auto grid items-center gap-6 ${dashboards.length > 1 ? 'max-w-md' : 'max-w-4xl lg:grid-cols-[250px_minmax(0,460px)]'}`}>
            {dashboards.length <= 1 && (
              <div className="order-2 lg:order-1">
                <LoginMascot mode={mode} pointer={mascotPointer} guarding={passwordGuardActive} />
              </div>
            )}

            <div className={`rounded-2xl border border-slate-200 bg-white p-8 shadow-sm ${dashboards.length > 1 ? '' : 'order-1 lg:order-2'}`}>
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
                <button onClick={() => { setDashboards([]); setPassword('') }} className="mt-6 text-sm text-gold hover:underline font-medium">
                  ← Back to login
                </button>
              </div>
              ) : (
                <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {mode === 'signup' ? <UserPlus className="w-5 h-5 text-gold" /> : mode === 'verify' ? <KeyRound className="w-5 h-5 text-gold" /> : <Scissors className="w-5 h-5 text-gold" />}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
                  <p className="text-slate-500 text-sm leading-relaxed">{subtitle}</p>
                </div>

                <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setNotice('') }}
                    className={`rounded-lg py-2 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white text-navy shadow-sm' : 'text-slate-500'}`}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); setNotice('') }}
                    className={`rounded-lg py-2 text-sm font-bold transition-colors ${mode !== 'login' ? 'bg-white text-navy shadow-sm' : 'text-slate-500'}`}
                  >
                    Create account
                  </button>
                </div>

                {notice && <p className="mb-4 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}
                {error && <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                {mode === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <EmailInput email={email} setEmail={setEmail} autoFocus />
                    <PasswordInput
                      label="Password"
                      value={password}
                      setValue={setPassword}
                      placeholder="Your password"
                      onFocus={() => setPasswordFocusDepth((current) => current + 1)}
                      onBlur={() => setPasswordFocusDepth((current) => Math.max(0, current - 1))}
                    />
                    <SubmitButton loading={loading} disabled={!email.trim() || !password} label="Open my dashboard" />
                  </form>
                )}

                {mode === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <EmailInput email={email} setEmail={setEmail} autoFocus />
                    <PasswordInput
                      label="Create password"
                      value={password}
                      setValue={setPassword}
                      placeholder="12+ characters"
                      onFocus={() => setPasswordFocusDepth((current) => current + 1)}
                      onBlur={() => setPasswordFocusDepth((current) => Math.max(0, current - 1))}
                    />
                    <PasswordInput
                      label="Repeat password"
                      value={confirmPassword}
                      setValue={setConfirmPassword}
                      placeholder="Repeat your password"
                      onFocus={() => setPasswordFocusDepth((current) => current + 1)}
                      onBlur={() => setPasswordFocusDepth((current) => Math.max(0, current - 1))}
                    />
                    <SubmitButton loading={loading} disabled={!email.trim() || password.length < 12 || password !== confirmPassword} label="Send confirmation code" />
                  </form>
                )}

                {mode === 'verify' && (
                  <form onSubmit={handleVerify} className="space-y-4">
                    <EmailInput email={email} setEmail={setEmail} autoFocus={!email} />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmation code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm tracking-[0.35em] text-center font-black focus:outline-none focus:border-gold transition-colors bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <SubmitButton loading={loading} disabled={!email.trim() || code.length !== 6} label="Confirm and continue" />
                    <button type="button" onClick={() => setMode('signup')} className="w-full text-sm text-slate-500 hover:text-navy transition-colors">
                      Need a new code? Create account again
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  {lastToken && mode === 'login' && (
                    <Link href={`/dashboard/${lastToken}`} className="block mb-4 text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4">
                      Open last dashboard saved in this browser
                    </Link>
                  )}
                  <p className="text-sm text-slate-500">
                    {mode === 'login' ? 'New to Vitrine?' : 'Already have an account?'}{' '}
                    <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-gold font-semibold hover:underline">
                      {mode === 'login' ? 'Create your account →' : 'Log in →'}
                    </button>
                  </p>
                </div>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Your dashboard is protected by your email and password. Never share private dashboard URLs publicly.
          </p>
        </div>
      </div>
    </div>
  )
}

function EmailInput({ email, setEmail, autoFocus }: { email: string; setEmail: (value: string) => void; autoFocus?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="email"
          required
          autoFocus={autoFocus}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors bg-slate-50 focus:bg-white"
        />
      </div>
    </div>
  )
}

function LoginMascot({
  mode,
  pointer,
  guarding,
}: {
  mode: Mode
  pointer: { x: number; y: number }
  guarding: boolean
}) {
  const bubbleTitle = guarding ? 'Modo segredo ativado' : mode === 'signup' ? 'Seu robo guia' : mode === 'verify' ? 'Confirmacao segura' : 'Bem-vindo de volta'
  const bubbleText = guarding
    ? 'Enquanto voce digita a senha, eu baixo o visor e protejo o campo.'
    : mode === 'signup'
    ? 'Segue o fluxo e eu acompanho seu mouse para deixar a entrada mais viva.'
    : mode === 'verify'
    ? 'Falta so confirmar o codigo para liberar o painel.'
    : 'Move o mouse e o robo responde. Ao focar na senha, ele entra em modo guarda.'
  const pupilX = Math.round(pointer.x * 5)
  const pupilY = Math.round(pointer.y * 3)

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_42%),linear-gradient(155deg,#ffffff_0%,#eef6ff_62%,#fff9ed_100%)] p-5 shadow-sm">
      <div className="absolute inset-x-8 top-0 h-20 rounded-full bg-gold/10 blur-2xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          <Bot className="h-3.5 w-3.5 text-gold" />
          Companheiro de login
        </div>
        <h2 className="mt-3 text-base font-black text-slate-800">{bubbleTitle}</h2>
        <p className="mt-1 max-w-[210px] text-sm leading-relaxed text-slate-500">{bubbleText}</p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="rounded-2xl border border-white/70 bg-white/75 px-3 py-2 shadow-sm backdrop-blur">
            <p className="text-[11px] font-semibold text-slate-500">{guarding ? 'Guardando a senha' : 'Seguindo o seu mouse'}</p>
          </div>

          <div className="relative h-40 w-32 shrink-0">
            <div className="absolute right-1 top-4 flex h-8 w-8 items-center justify-center rounded-2xl border border-gold/30 bg-white/85 text-gold shadow-sm transition-transform" style={{ transform: `translate(${pointer.x * 6}px, ${pointer.y * 3}px) rotate(${pointer.x * 12}deg)` }}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="absolute right-5 top-1 h-2 w-2 rounded-full bg-gold/70 animate-pulse" />
            <div className="absolute left-10 top-3 h-6 w-2 rounded-full bg-slate-700 transition-transform" style={{ transform: `rotate(${pointer.x * 12}deg)` }} />
            <div className="absolute left-6 top-8 h-16 w-16 rounded-[26px] border border-slate-700 bg-slate-900 shadow-[0_20px_40px_rgba(15,23,42,0.22)] transition-transform" style={{ transform: `translate(${pointer.x * 4}px, ${pointer.y * 2}px)` }}>
              <div className="absolute left-1/2 top-2 h-2.5 w-8 -translate-x-1/2 rounded-full bg-slate-700" />
              <div className="absolute inset-x-2.5 top-5 h-7 overflow-hidden rounded-2xl border border-cyan-200/40 bg-cyan-100/90">
                {guarding ? (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.24))]" />
                    <div className="absolute inset-x-2 top-3 h-1.5 rounded-full bg-slate-800/80" />
                  </>
                ) : (
                  <>
                    <div className="absolute left-2.5 top-1.5 h-4.5 w-4.5 rounded-full bg-slate-900">
                      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 transition-transform" style={{ transform: `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))` }} />
                    </div>
                    <div className="absolute right-2.5 top-1.5 h-4.5 w-4.5 rounded-full bg-slate-900">
                      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 transition-transform" style={{ transform: `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))` }} />
                    </div>
                  </>
                )}
              </div>
              <div className="absolute bottom-2.5 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-slate-700/80" />
            </div>
            <div className="absolute left-3 top-[77px] h-7 w-7 rounded-[18px] border border-slate-700 bg-slate-800 transition-all" style={{ transform: guarding ? 'translateX(12px) rotate(-14deg)' : `translate(${pointer.x * 2}px, ${pointer.y * 2}px) rotate(10deg)` }} />
            <div className="absolute right-4 top-[77px] h-7 w-7 rounded-[18px] border border-slate-700 bg-slate-800 transition-all" style={{ transform: guarding ? 'translateX(-12px) rotate(14deg)' : `translate(${pointer.x * 2}px, ${pointer.y * 2}px) rotate(-10deg)` }} />
            <div className="absolute left-9 top-[92px] h-11 w-10 rounded-[18px] border border-slate-700 bg-slate-800 shadow-[0_12px_20px_rgba(15,23,42,0.14)] transition-transform" style={{ transform: `translate(${pointer.x * 3}px, ${pointer.y}px)` }}>
              <div className="absolute left-1/2 top-2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-cyan-200/70" />
            </div>
            <div className="absolute left-10 top-[129px] h-8 w-3 rounded-full bg-slate-800" />
            <div className="absolute left-[74px] top-[129px] h-8 w-3 rounded-full bg-slate-800" />
            <div className="absolute left-7 top-[152px] h-3 w-7 rounded-full bg-slate-900/80" />
            <div className="absolute left-[67px] top-[152px] h-3 w-7 rounded-full bg-slate-900/80" />
            {guarding && (
              <div className="absolute -left-1 top-[114px] inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-bold text-emerald-700 shadow-sm">
                <Shield className="h-3 w-3" />
                Shield on
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordInput({ label, value, setValue, placeholder, onFocus, onBlur }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; onFocus?: () => void; onBlur?: () => void }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors bg-slate-50 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

function SubmitButton({ loading, disabled, label }: { loading: boolean; disabled: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-gold text-navy py-3 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  )
}
