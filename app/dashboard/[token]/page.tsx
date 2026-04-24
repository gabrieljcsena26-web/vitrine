'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Scissors, Copy, Check, ExternalLink, Users, Eye, TrendingUp,
  Link2, CalendarDays, Plus, Save, MousePointerClick, MessageCircle,
  LogIn,
} from 'lucide-react'
import { generateCampaignSlug, safeBookingHref } from '@/lib/utils'

interface Lead {
  id: string
  visitor_name: string
  visitor_email: string
  message: string
  via: string | null
  submitted_at: string
}

interface ViewsBySource {
  source: string
  count: number
}

interface DashboardData {
  business: {
    id: string
    slug: string
    ownerName: string
    ownerEmail: string
    category: string
    createdAt: string
    bookingUrl: string | null
    whatsappNumber: string | null
    whatsappMessage: string | null
  }
  stats: {
    totalViews: number
    bookingClicks: number
    whatsappClicks: number
    totalLeads: number
    leadsThisWeek: number
  }
  viewsBySource: ViewsBySource[]
  leads: Lead[]
}

export default function OwnerDashboard({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Campaign link creator
  const [campaignName, setCampaignName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const copyTimeoutRef = useRef<NodeJS.Timeout>()

  // Settings editor
  const [bookingInput, setBookingInput] = useState('')
  const [whatsappInput, setWhatsappInput] = useState('')
  const [whatsappMessageInput, setWhatsappMessageInput] = useState('')
  const [contactSaving, setContactSaving] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)
  const contactSaveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    async function load() {
      const { token: t } = await params
      setToken(t)
      const res = await fetch(`/api/dashboard/${t}`)
      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const json = await res.json()
      setData(json)
      setBookingInput(json.business.bookingUrl ?? '')
      setWhatsappInput(json.business.whatsappNumber ?? '')
      setWhatsappMessageInput(json.business.whatsappMessage ?? '')
      setLoading(false)
    }
    load()
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      if (contactSaveTimeoutRef.current) clearTimeout(contactSaveTimeoutRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerateLink = () => {
    if (!data) return
    const slug = generateCampaignSlug(campaignName)
    if (!slug) return
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    setGeneratedLink(`${base}/p/${data.business.slug}?via=${slug}`)
  }

  const handleCopy = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyError('')
      onSuccess()
    } catch {
      setCopyError('Could not copy automatically. Please copy the link manually.')
    }
  }

  const handleSaveContact = async () => {
    if (!token) return
    setContactSaving(true)
    try {
      await fetch(`/api/dashboard/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingUrl: bookingInput.trim() || null,
          whatsappNumber: whatsappInput.trim() || null,
          whatsappMessage: whatsappMessageInput.trim() || null,
        }),
      })
      setContactSaved(true)
      if (data) {
        setData({
          ...data,
          business: {
            ...data.business,
            bookingUrl: bookingInput.trim() || null,
            whatsappNumber: whatsappInput.trim() || null,
            whatsappMessage: whatsappMessageInput.trim() || null,
          },
        })
      }
      contactSaveTimeoutRef.current = setTimeout(() => setContactSaved(false), 2000)
    } catch {
      // ignore
    } finally {
      setContactSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard not found</h1>
          <p className="text-slate-500 mb-6">The link may be invalid or expired.</p>
          <Link href="/login" className="text-gold hover:underline font-medium">← Try logging in</Link>
        </div>
      </div>
    )
  }

  const { business, stats, viewsBySource, leads } = data
  const maxViews = viewsBySource[0]?.count ?? 1
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${business.slug}` : `/p/${business.slug}`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-slate-800 font-bold">Vitrine</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 border border-slate-200 hover:border-gold text-slate-600 hover:text-gold text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              New Page
            </Link>
            <a
              href={`/p/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm transition-colors"
            >
              View Page
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Business overview card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{business.ownerName}</h1>
              <span className="bg-gold/10 text-gold text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {business.category}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-slate-400 text-sm font-mono truncate max-w-xs">
                /p/{business.slug}
              </span>
              <button
                onClick={() => handleCopy(pageUrl, () => {
                  setCopied(true)
                  copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
                })}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-gold transition-colors"
                title="Copy page link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Created {new Date(business.createdAt).toLocaleDateString()}
            </p>
          </div>
          <a
            href={`/p/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gold text-navy px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-400 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            Open My Page
          </a>
        </div>

        {/* ── Stats cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<Eye className="w-5 h-5 text-blue-500" />}
            iconBg="bg-blue-50"
            label="Page Visits"
            value={stats.totalViews}
          />
          <StatCard
            icon={<MousePointerClick className="w-5 h-5 text-violet-500" />}
            iconBg="bg-violet-50"
            label="Booking Clicks"
            value={stats.bookingClicks}
          />
          <StatCard
            icon={<MessageCircle className="w-5 h-5 text-emerald-500" />}
            iconBg="bg-emerald-50"
            label="WhatsApp Clicks"
            value={stats.whatsappClicks}
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-amber-500" />}
            iconBg="bg-amber-50"
            label="Total Leads"
            value={stats.totalLeads}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-rose-500" />}
            iconBg="bg-rose-50"
            label="Leads This Week"
            value={stats.leadsThisWeek}
          />
        </div>

        {/* ── Visits by source ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            Visits by Source
          </h2>
          {viewsBySource.length === 0 ? (
            <p className="text-slate-400 text-sm">No visits recorded yet. Share your page link to get traffic!</p>
          ) : (
            <div className="space-y-3">
              {viewsBySource.map(({ source, count }) => (
                <div key={source} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-slate-600 truncate flex-shrink-0">{source}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${(count / maxViews) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-slate-700 flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Leads table ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Leads
            {leads.length > 0 && (
              <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                {leads.length}
              </span>
            )}
          </h2>
          {leads.length === 0 ? (
            <p className="text-slate-400 text-sm">No leads yet. They&apos;ll appear here when someone fills in the contact form on your page.</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-2 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-2 px-2 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-2 px-2 text-slate-400 font-medium hidden md:table-cell">Message</th>
                    <th className="text-left py-2 px-2 text-slate-400 font-medium hidden sm:table-cell">Source</th>
                    <th className="text-left py-2 px-2 text-slate-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate-800">{lead.visitor_name}</td>
                      <td className="py-3 px-2">
                        <a
                          href={`mailto:${lead.visitor_email}`}
                          className="text-gold hover:underline"
                        >
                          {lead.visitor_email}
                        </a>
                      </td>
                      <td className="py-3 px-2 text-slate-500 max-w-[200px] truncate hidden md:table-cell">
                        {lead.message}
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                          {lead.via ?? 'Direct'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(lead.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Campaign link creator ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-violet-400" />
            Create a Tracked Link
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            Generate a unique link per channel (Instagram, WhatsApp, a specific referral…) to see exactly where your visitors come from.
          </p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
              placeholder="e.g. Instagram Bio, Maria Influencer"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm bg-slate-50 focus:bg-white"
            />
            <button
              onClick={handleGenerateLink}
              disabled={!campaignName.trim()}
              className="bg-gold text-navy px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              Generate Link
            </button>
          </div>

          {generatedLink && (
            <div className="mt-4 bg-slate-50 rounded-xl p-4 flex items-center gap-3 flex-wrap border border-slate-200">
              <span className="flex-1 font-mono text-sm text-slate-700 break-all min-w-0">
                {generatedLink}
              </span>
              <button
                onClick={() => handleCopy(generatedLink, () => {
                  setCopied(true)
                  copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
                })}
                className="flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
          {copyError && (
            <p className="mt-2 text-xs text-rose-500">{copyError}</p>
          )}
        </div>

        {/* ── Settings: Booking & WhatsApp ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            Booking &amp; WhatsApp Settings
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Configure how customers can reach you directly from your public page.
          </p>

          {/* Booking URL */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              📅 Scheduling / Booking link
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Paste your Calendly, Google Calendar, or any scheduling platform URL. Customers will click directly to your calendar.
              You can also enter an email address.
            </p>
            <input
              type="text"
              value={bookingInput}
              onChange={(e) => setBookingInput(e.target.value)}
              placeholder="https://calendly.com/yourname  or  you@email.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm bg-slate-50 focus:bg-white"
            />
            {data.business.bookingUrl && (() => {
              const href = safeBookingHref(data.business.bookingUrl!)
              return href ? (
                <p className="mt-1.5 text-xs text-slate-400">
                  Active:{' '}
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline break-all">
                    {data.business.bookingUrl}
                  </a>
                </p>
              ) : null
            })()}
          </div>

          {/* WhatsApp number */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              💬 WhatsApp number
            </label>
            <p className="text-xs text-slate-400 mb-2">
              International format. A green floating button will appear on your page so customers can message you instantly.
            </p>
            <input
              type="tel"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm bg-slate-50 focus:bg-white"
            />
            {data.business.whatsappNumber && (
              <p className="mt-1.5 text-xs text-slate-400">
                Active:{' '}
                <span className="text-[#25D366] font-medium">{data.business.whatsappNumber}</span>
              </p>
            )}
          </div>

          {/* WhatsApp pre-filled message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              ✏️ Pre-filled WhatsApp message
            </label>
            <p className="text-xs text-slate-400 mb-2">
              When a customer clicks the WhatsApp button, this message will be pre-typed in their chat — making it easier for them to start the conversation. Max 500 characters.
            </p>
            <textarea
              rows={3}
              maxLength={500}
              value={whatsappMessageInput}
              onChange={(e) => setWhatsappMessageInput(e.target.value)}
              placeholder="Olá! Vim pela sua página e gostaria de mais informações."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm bg-slate-50 focus:bg-white resize-none"
            />
            <p className="text-right text-xs text-slate-400 mt-1">{whatsappMessageInput.length}/500</p>
          </div>

          <button
            onClick={handleSaveContact}
            disabled={contactSaving}
            className="bg-gold text-navy px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {contactSaved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">
            Your dashboard is private.{' '}
            <Link href="/login" className="hover:text-slate-600 inline-flex items-center gap-1">
              <LogIn className="w-3 h-3" />
              Log in with a different page
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  )
}
