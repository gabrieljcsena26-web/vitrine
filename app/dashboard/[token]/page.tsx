'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Scissors, Copy, Check, ExternalLink, Users, Eye, TrendingUp,
  Link2, CalendarDays, Plus, Save, MousePointerClick, MessageCircle, Sparkles,
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
  const copyTimeoutRef = useRef<NodeJS.Timeout>()

  // Public page URL copy
  const [pageUrlCopied, setPageUrlCopied] = useState(false)
  const pageUrlCopyTimeoutRef = useRef<NodeJS.Timeout>()

  // Booking & WhatsApp editor
  const [bookingInput, setBookingInput] = useState('')
  const [whatsappInput, setWhatsappInput] = useState('')
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
      setLoading(false)
    }
    load()
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      if (contactSaveTimeoutRef.current) clearTimeout(contactSaveTimeoutRef.current)
      if (pageUrlCopyTimeoutRef.current) clearTimeout(pageUrlCopyTimeoutRef.current)
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

  const handleCopy = async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(`Copy this link manually:\n\n${generatedLink}`)
    }
  }

  const handleCopyPageUrl = async () => {
    if (!data) return
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/p/${data.business.slug}`
      : `/p/${data.business.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setPageUrlCopied(true)
      pageUrlCopyTimeoutRef.current = setTimeout(() => setPageUrlCopied(false), 2000)
    } catch {
      alert(`Copy this link manually:\n\n${url}`)
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Dashboard not found</h1>
          <p className="text-gray-500 mb-6 text-sm">
            The link may be invalid or expired. Check the welcome email we sent when you created your page — your private dashboard link is there.
          </p>
          <Link href="/dashboard" className="inline-block bg-gold text-navy px-5 py-2.5 rounded-full font-semibold hover:bg-yellow-400 transition-colors text-sm">
            Create a new page →
          </Link>
        </div>
      </div>
    )
  }

  const { business, stats, viewsBySource, leads } = data
  const maxViews = viewsBySource[0]?.count ?? 1
  const totalClicks = stats.bookingClicks + stats.whatsappClicks
  const conversionRate = stats.totalViews > 0
    ? Math.round((stats.totalLeads / stats.totalViews) * 1000) / 10
    : 0
  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${business.slug}`
    : `/p/${business.slug}`
  const createdDate = new Date(business.createdAt)
  const daysLive = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <div className="bg-navy border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-white font-bold">Vitrine</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 text-gold text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              New Page
            </Link>
            <a
              href={`/p/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              View my page
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Hero header card ── */}
        <div className="bg-gradient-to-br from-white to-stone-50 rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">{business.category}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-navy">{business.ownerName}</h1>
              <p className="text-gray-400 text-xs mt-1.5">
                Live for {daysLive} {daysLive === 1 ? 'day' : 'days'} · since {createdDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleCopyPageUrl}
                className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-gold/40 text-navy text-sm px-3.5 py-2 rounded-xl transition-colors font-medium"
              >
                {pageUrlCopied ? <><Check className="w-4 h-4 text-green-500" />Copied!</> : <><Copy className="w-4 h-4" />Copy page link</>}
              </button>
              <a
                href={`/p/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-navy hover:bg-navy/90 text-white text-sm px-3.5 py-2 rounded-xl transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open page
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-200/60">
            <p className="text-xs text-gray-400 mb-1">Your public URL</p>
            <p className="text-navy/70 font-mono text-sm break-all">{pageUrl}</p>
          </div>
        </div>

        {/* ── Block A: Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard
            icon={<Eye className="w-5 h-5 text-gold" />}
            label="Page Visits"
            value={stats.totalViews}
          />
          <StatCard
            icon={<MousePointerClick className="w-5 h-5 text-gold" />}
            label="Booking Clicks"
            value={stats.bookingClicks}
          />
          <StatCard
            icon={<MessageCircle className="w-5 h-5 text-gold" />}
            label="WhatsApp Clicks"
            value={stats.whatsappClicks}
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-gold" />}
            label="Total Leads"
            value={stats.totalLeads}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-gold" />}
            label="Leads This Week"
            value={stats.leadsThisWeek}
          />
          <StatCard
            icon={<Sparkles className="w-5 h-5 text-gold" />}
            label="Conversion"
            value={conversionRate}
            suffix="%"
            hint={stats.totalViews === 0 ? 'No visits yet' : `${stats.totalLeads}/${stats.totalViews}`}
          />
        </div>

        {/* ── Insights strip ── */}
        {(stats.totalViews > 0 || totalClicks > 0) && (
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-sm text-amber-900/80 leading-relaxed">
              {stats.totalViews === 0 ? (
                <>Your page is ready but hasn&apos;t been seen yet. <strong>Share it on Instagram bio and WhatsApp status</strong> to drive the first visits.</>
              ) : stats.totalLeads === 0 && stats.totalViews > 5 ? (
                <>You have <strong>{stats.totalViews} visits</strong> but no leads yet. Try adding a <strong>WhatsApp number</strong> and a <strong>booking link</strong> below to convert visitors.</>
              ) : stats.leadsThisWeek > 0 ? (
                <>🔥 You got <strong>{stats.leadsThisWeek} new {stats.leadsThisWeek === 1 ? 'lead' : 'leads'}</strong> this week. Keep sharing your link — momentum is building.</>
              ) : (
                <>Track where your customers come from by creating <strong>campaign links</strong> below — one per channel (Instagram, WhatsApp, flyer…).</>
              )}
            </div>
          </div>
        )}

        {/* ── Block B: Visits by source ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
          <h2 className="text-lg font-bold text-navy mb-5">Visits by Source</h2>
          {viewsBySource.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-gray-400 text-sm">No visits yet. Share your page to see which channels bring the most traffic.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewsBySource.map(({ source, count }) => (
                <div key={source} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-gray-600 truncate flex-shrink-0">{source}</span>
                  <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all"
                      style={{ width: `${(count / maxViews) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-navy flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Block C: Leads list ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-navy">Leads</h2>
            {leads.length > 0 && (
              <span className="text-xs text-gray-400">{leads.length} total</span>
            )}
          </div>
          {leads.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-gray-400 text-sm">No leads yet. They&apos;ll appear here the moment someone contacts you through your page.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium hidden md:table-cell">Message</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium hidden sm:table-cell">Source</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-stone-50 hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 pr-4 font-medium text-navy">{lead.visitor_name}</td>
                      <td className="py-3 pr-4">
                        <a
                          href={`mailto:${lead.visitor_email}`}
                          className="text-gold hover:underline"
                        >
                          {lead.visitor_email}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 max-w-xs truncate hidden md:table-cell">
                        {lead.message}
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="bg-stone-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                          {lead.via ?? 'Direct'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(lead.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Block D: Campaign link creator ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-navy">Create a Campaign Link</h2>
          </div>
          <p className="text-gray-500 text-sm mb-5">
            Generate a unique link for each channel (Instagram, WhatsApp, a specific person…) to see exactly where your customers come from.
          </p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
              placeholder="e.g. Instagram Bio, Maria Influencer"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
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
            <div className="mt-4 bg-stone-50 rounded-xl p-4 flex items-center gap-3 flex-wrap">
              <span className="flex-1 font-mono text-sm text-navy break-all min-w-0">
                {generatedLink}
              </span>
              <button
                onClick={handleCopy}
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
        </div>

        {/* ── Block E: Booking & WhatsApp contact setup ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-navy">Booking &amp; WhatsApp</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Configure how customers can reach you and book appointments directly from your public page.
          </p>

          {/* Booking URL */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              📅 Booking / Scheduling link
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Paste your Calendly, Google Calendar, or any scheduling URL. Customers click directly to your calendar.
              You can also enter your email address.
            </p>
            <input
              type="text"
              value={bookingInput}
              onChange={(e) => setBookingInput(e.target.value)}
              placeholder="https://calendly.com/yourname or you@email.com"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
            />
            {data.business.bookingUrl && (() => {
              const href = safeBookingHref(data.business.bookingUrl!)
              return href ? (
                <p className="mt-1.5 text-xs text-gray-400">
                  Active:{' '}
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline break-all">
                    {data.business.bookingUrl}
                  </a>
                </p>
              ) : null
            })()}
          </div>

          {/* WhatsApp number */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              💬 WhatsApp number
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Enter your WhatsApp number in international format. A floating green button will appear on your page so customers can message you instantly.
            </p>
            <input
              type="tel"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
            />
            {data.business.whatsappNumber && (
              <p className="mt-1.5 text-xs text-gray-400">
                Active:{' '}
                <span className="text-[#25D366] font-medium">{data.business.whatsappNumber}</span>
              </p>
            )}
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
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  hint?: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-4 flex flex-col gap-2 hover:border-gold/30 transition-colors">
      <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-navy leading-none">
          {value}{suffix ? <span className="text-base ml-0.5 text-gray-400 font-semibold">{suffix}</span> : null}
        </p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
        {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}
