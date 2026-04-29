'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Scissors, Copy, Check, ExternalLink, Users, Eye, TrendingUp,
  CalendarDays, Plus, Save, MousePointerClick, MessageCircle, Sparkles, Download,
} from 'lucide-react'
import QRCode from 'qrcode'
import { generateCampaignSlug, safeBookingHref } from '@/lib/utils'

interface Lead {
  id: string
  visitor_name: string
  visitor_email: string
  message: string
  via: string | null
  status?: string | null
  interest?: string | null
  temperature?: string | null
  submitted_at: string
}

interface ViewsBySource {
  source: string
  count: number
  bookingClicks?: number
  whatsappClicks?: number
}

interface RecentEvent {
  id: string
  source: string
  eventType: 'visit' | 'booking_click' | 'whatsapp_click' | string
  visitedAt: string
}

interface SavedChannel {
  id: string
  name: string
  slug: string
  url: string
  createdAt: string
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
    plan: string
  }
  pageUsage: {
    plan: string
    pagesUsed: number
    pageLimit: number
    canCreateMore: boolean
  }
  stats: {
    totalViews: number
    bookingClicks: number
    whatsappClicks: number
    totalLeads: number
    leadsThisWeek: number
  }
  viewsBySource: ViewsBySource[]
  recentEvents: RecentEvent[]
  leads: Lead[]
}

const demoViewsBySource: ViewsBySource[] = [
  { source: 'instagram-bio', count: 4 },
  { source: 'google-profile', count: 3 },
  { source: 'whatsapp-status', count: 3 },
  { source: 'flyer-qr', count: 2 },
  { source: 'Direct', count: 3 },
]

const demoRecentEvents: RecentEvent[] = [
  { id: 'demo-activity-1', source: 'instagram-bio', eventType: 'whatsapp_click', visitedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
  { id: 'demo-activity-2', source: 'google-profile', eventType: 'booking_click', visitedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
  { id: 'demo-activity-3', source: 'whatsapp-status', eventType: 'visit', visitedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString() },
  { id: 'demo-activity-4', source: 'flyer-qr', eventType: 'booking_click', visitedAt: new Date(Date.now() - 76 * 60 * 1000).toISOString() },
]

const demoLeads: Lead[] = [
  {
    id: 'demo-lead-1',
    visitor_name: 'Maria Silva',
    visitor_email: 'maria@example.com',
    message: 'Hi! I saw your page on Instagram and would like to book a consultation this week.',
    via: 'instagram-bio',
    submitted_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-lead-2',
    visitor_name: 'João Pereira',
    visitor_email: 'joao@example.com',
    message: 'I came from Google and want to know available times for Saturday.',
    via: 'google-profile',
    submitted_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-lead-3',
    visitor_name: 'Ana Costa',
    visitor_email: 'ana@example.com',
    message: 'Can you send me more information about the premium service?',
    via: 'whatsapp-status',
    submitted_at: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
  },
]

const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  'instagram-bio': 'Instagram Bio',
  'instagram-story': 'Instagram Stories',
  whatsapp: 'WhatsApp',
  google: 'Google',
  'qr-code': 'QR Code',
  'google-profile': 'Google Business',
  'google-business': 'Google Business',
  'whatsapp-status': 'WhatsApp Status',
  'flyer-qr': 'Flyer / QR Code',
  'partner-link': 'Partner Link',
  'paid-ads': 'Paid Ads',
  direct: 'Direct',
  Direct: 'Direct',
}

const formatSourceLabel = (source?: string | null) => {
  if (!source) return 'Direct'
  if (SOURCE_LABELS[source]) return SOURCE_LABELS[source]
  return source
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function OwnerDashboard({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [range, setRange] = useState('30d')

  // Campaign link creator
  const [campaignName, setCampaignName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedChannelId, setCopiedChannelId] = useState('')
  const [savedChannels, setSavedChannels] = useState<SavedChannel[]>([])
  const [showChannelForm, setShowChannelForm] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout>()

  // Public page URL copy
  const [pageUrlCopied, setPageUrlCopied] = useState(false)
  const pageUrlCopyTimeoutRef = useRef<NodeJS.Timeout>()

  // Booking & WhatsApp editor
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
      const res = await fetch(`/api/dashboard/${t}?range=${range}`)
      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const json = await res.json()
      setData(json)
      const channelsRes = await fetch(`/api/dashboard/${t}/channels`)
      if (channelsRes.ok) {
        const channelsJson = await channelsRes.json()
        setSavedChannels(channelsJson.channels ?? [])
      }
      setBookingInput(json.business.bookingUrl ?? '')
      setWhatsappInput(json.business.whatsappNumber ?? '')
      setWhatsappMessageInput(json.business.whatsappMessage ?? '')
      setLoading(false)
    }
    load()
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      if (contactSaveTimeoutRef.current) clearTimeout(contactSaveTimeoutRef.current)
      if (pageUrlCopyTimeoutRef.current) clearTimeout(pageUrlCopyTimeoutRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, range])

  const handleGenerateLink = async () => {
    if (!data) return
    if (!generateCampaignSlug(campaignName)) return
    const res = await fetch(`/api/dashboard/${token}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: campaignName.trim() }),
    })
    if (!res.ok) {
      alert('Could not save this channel. Make sure the channels migration is applied in Supabase.')
      return
    }
    const json = await res.json()
    const channel = json.channel as SavedChannel
    const nextChannels = [channel, ...savedChannels.filter((item) => item.slug !== channel.slug)]
    setSavedChannels(nextChannels)
    setGeneratedLink(channel.url)
    setShowChannelForm(false)
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

  const handleCopyChannel = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedChannelId(id)
      copyTimeoutRef.current = setTimeout(() => setCopiedChannelId(''), 2000)
    } catch {
      alert(`Copy this link manually:\n\n${url}`)
    }
  }

  const handleLeadStatus = async (leadId: string, status: string) => {
    if (!token || !data) return
    setData({
      ...data,
      leads: data.leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
    })
    await fetch(`/api/dashboard/${token}/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => undefined)
  }

  const handleDownloadQr = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(pageUrl, {
        width: 1200,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `vitrine-${business.slug}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      alert('Could not generate the QR code. Please try again.')
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

  const { business, pageUsage, stats } = data
  const isDemoDashboard = business.ownerEmail === 'test@vitrine.local'
  const viewsBySource = data.viewsBySource.length > 0 ? data.viewsBySource : isDemoDashboard ? demoViewsBySource : []
  const recentEvents = data.recentEvents.length > 0 ? data.recentEvents : isDemoDashboard ? demoRecentEvents : []
  const leads = data.leads.length > 0 ? data.leads : isDemoDashboard ? demoLeads : []
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
  const planName = pageUsage.plan.charAt(0).toUpperCase() + pageUsage.plan.slice(1)
  const pageLimitLabel = pageUsage.pageLimit === 999 ? 'Unlimited' : pageUsage.pageLimit
  const newPageHref = `/dashboard?new=1&ownerEmail=${encodeURIComponent(business.ownerEmail)}&plan=${encodeURIComponent(pageUsage.plan)}`
  const now = new Date()
  const weekdayLabel = now.toLocaleDateString(undefined, { weekday: 'long' })
  const lastUpdatedLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const sourceTotal = viewsBySource.reduce((sum, item) => sum + item.count, 0)
  const topSource = viewsBySource[0]
  const sourceInsights = viewsBySource.map((sourceItem) => {
    const sourceEvents = recentEvents.filter((event) => event.source === sourceItem.source)
    const bookingCount = sourceItem.bookingClicks ?? sourceEvents.filter((event) => event.eventType === 'booking_click').length
    const whatsappCount = sourceItem.whatsappClicks ?? sourceEvents.filter((event) => event.eventType === 'whatsapp_click').length
    return {
      ...sourceItem,
      bookingCount,
      whatsappCount,
      intentCount: bookingCount + whatsappCount,
    }
  }).sort((a, b) => (b.intentCount - a.intentCount) || (b.count - a.count))
  const channelRows = savedChannels.map((channel) => {
    const sourceItem = sourceInsights.find((item) => item.source === channel.slug)
    return {
      id: channel.slug,
      name: channel.name,
      slug: channel.slug,
      url: channel.url,
      createdAt: channel.createdAt,
      visits: sourceItem?.count ?? 0,
      bookingCount: sourceItem?.bookingCount ?? 0,
      whatsappCount: sourceItem?.whatsappCount ?? 0,
      intentCount: sourceItem?.intentCount ?? 0,
      isTracked: true,
    }
  })

  const getLeadInterest = (message: string) => {
    const capturedInterest = message.match(/Interest:\s*([^.]*)/i)?.[1]?.trim()
    if (capturedInterest) return capturedInterest
    const lower = message.toLowerCase()
    if (lower.includes('book') || lower.includes('appointment') || lower.includes('agendar')) return 'Book an appointment'
    if (lower.includes('available') || lower.includes('availability') || lower.includes('horário')) return 'Check availability'
    if (lower.includes('price') || lower.includes('cost') || lower.includes('preço')) return 'Ask about prices'
    return 'General information'
  }

  const getLeadTemperature = (message: string) => {
    const lower = message.toLowerCase()
    if (lower.includes('book') || lower.includes('appointment') || lower.includes('availability') || lower.includes('agendar')) return 'Hot'
    if (lower.includes('price') || lower.includes('service') || lower.includes('information')) return 'Warm'
    return 'New'
  }

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
            {pageUsage.canCreateMore ? (
              <Link
                href={newPageHref}
                className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 text-gold text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                New Page
              </Link>
            ) : (
              <Link
                href={newPageHref}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-gray-300 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Upgrade plan
              </Link>
            )}
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

        {/* ── Date range filter ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-3 mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="px-2">
            <p className="text-sm font-bold text-navy">Dashboard period</p>
            <p className="text-xs text-gray-400">{weekdayLabel} · updated {lastUpdatedLabel}</p>
          </div>
          <div className="flex gap-2 bg-stone-50 rounded-xl p-1 border border-stone-100">
            {[
              { id: '7d', label: '7 days' },
              { id: '30d', label: '30 days' },
              { id: '90d', label: '90 days' },
              { id: 'all', label: 'All' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRange(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  range === item.id ? 'bg-navy text-white shadow-sm' : 'text-gray-500 hover:text-navy'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Plan usage ── */}
        <div className="bg-navy rounded-2xl shadow-sm border border-white/10 p-5 mb-6 text-white flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">Current plan</p>
            <h2 className="text-xl font-bold">{planName}</h2>
            <p className="text-sm text-gray-300 mt-1">
              {pageUsage.pagesUsed}/{pageLimitLabel} {pageUsage.pagesUsed === 1 ? 'page used' : 'pages used'}
            </p>
          </div>
          {pageUsage.canCreateMore ? (
            <Link
              href={newPageHref}
              className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create another page
            </Link>
          ) : (
            <div className="text-sm text-gray-200 max-w-md">
              <p className="font-semibold text-white">Page limit reached.</p>
              <p className="text-gray-300">Upgrade to Pro or Business to create more pages for this email.</p>
            </div>
          )}
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

        {/* ── Dashboard guide ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-navy">How to read this dashboard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="font-bold text-navy mb-1">Traffic</p>
              <p className="text-gray-500">Shows how many people visited the public page and which source brought them in.</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="font-bold text-navy mb-1">Intent</p>
              <p className="text-gray-500">Booking and WhatsApp clicks show who is interested enough to take action.</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="font-bold text-navy mb-1">Leads</p>
              <p className="text-gray-500">Names, emails and messages from customers who contacted the business through the page.</p>
            </div>
          </div>
        </div>

        {/* ── Block B: Traffic & intent by source ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-navy">Tracking Channels</h2>
              <p className="text-sm text-gray-400 mt-1">Add only the platforms your client will use, then track visits and intent by channel.</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {topSource && (
                <div className="bg-gold/10 border border-gold/20 rounded-xl px-3 py-2 text-right hidden sm:block">
                  <p className="text-[10px] uppercase tracking-wider text-gold font-bold">Top source</p>
                  <p className="text-sm font-bold text-navy">{formatSourceLabel(topSource.source)}</p>
                </div>
              )}
              <div className="bg-navy text-white rounded-xl px-3 py-2 text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider text-gray-300 font-bold">Total intent</p>
                <p className="text-sm font-bold">{totalClicks} actions</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChannelForm((value) => !value)}
                className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2.5 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add channel
              </button>
            </div>
          </div>

          {showChannelForm && (
            <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 to-white p-5 mb-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <p className="font-bold text-navy">Create a tracking link</p>
                  <p className="text-sm text-gray-500">Type the platform or campaign name your client will use. We create one tracked link for that channel.</p>
                </div>
                {generatedLink && (
                  <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-xs font-bold">Link ready</span>
                )}
              </div>
              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
                  placeholder="e.g. Instagram, WhatsApp, Google, Influencer Maria"
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm bg-white"
                />
                <button
                  onClick={handleGenerateLink}
                  disabled={!campaignName.trim()}
                  className="bg-navy text-white px-6 py-3 rounded-xl font-semibold hover:bg-navy/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  Create link
                </button>
              </div>
              {generatedLink && (
                <div className="mt-4 bg-white rounded-2xl border border-stone-100 p-3 flex items-center gap-3 flex-wrap">
                  <span className="flex-1 font-mono text-xs text-navy break-all min-w-0">{generatedLink}</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 bg-gold text-navy px-3 py-2 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-colors flex-shrink-0"
                  >
                    {copied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {channelRows.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-gray-400 text-sm">No channels yet. Add the first platform your client will use to share this page.</p>
            </div>
          ) : (
            <div className="space-y-3">
                {channelRows.map((channel) => (
                  <div key={channel.id} className="rounded-3xl border border-stone-100 bg-stone-50/50 p-4 hover:border-gold/30 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-lg font-black text-navy truncate">{channel.name}</p>
                          <span className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Tracked link</span>
                        </div>
                        <p className="text-xs text-gray-400 break-all">{channel.url}</p>
                        <div className="h-2 bg-white rounded-full overflow-hidden mt-3 border border-stone-100">
                          <div className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full" style={{ width: `${maxViews ? (channel.visits / maxViews) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyChannel(channel.url!, channel.id)}
                        className="inline-flex items-center gap-1.5 bg-navy text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-navy/90 transition-colors"
                      >
                        {copiedChannelId === channel.id ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy link</>}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="rounded-2xl bg-white border border-stone-100 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Visits</p>
                        <p className="text-2xl font-black text-navy mt-1">{channel.visits}</p>
                        <p className="text-[11px] text-gray-400">{sourceTotal ? Math.round((channel.visits / sourceTotal) * 100) : 0}% of total</p>
                      </div>
                      <div className="rounded-2xl bg-white border border-stone-100 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Booking</p>
                        <p className="text-2xl font-black text-blue-700 mt-1">{channel.bookingCount}</p>
                      </div>
                      <div className="rounded-2xl bg-white border border-stone-100 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">WhatsApp</p>
                        <p className="text-2xl font-black text-green-700 mt-1">{channel.whatsappCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-stone-100 bg-white p-4 flex-wrap">
            <div>
              <p className="font-bold text-navy">Store QR Code</p>
              <p className="text-sm text-gray-400">Download one QR Code for the main public page.</p>
            </div>
            <button
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-2 bg-gold/10 text-navy border border-gold/30 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gold/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
          </div>
        </div>

        {/* ── Block C: Leads list ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-navy">Leads</h2>
              <p className="text-sm text-gray-400 mt-1">People who left contact details, summarized by interest and source.</p>
            </div>
            {leads.length > 0 && (
              <span className="bg-stone-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">{leads.length} total</span>
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
            <div className="max-h-[390px] overflow-y-auto pr-2 space-y-3">
              {leads.map((lead) => {
                const temperature = lead.temperature ?? getLeadTemperature(lead.message)
                const tempClass = temperature === 'Hot'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : temperature === 'hot'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : temperature === 'Warm' || temperature === 'warm'
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-stone-50 text-gray-600 border-stone-100'
                const displayTemperature = temperature.charAt(0).toUpperCase() + temperature.slice(1)
                return (
                  <div key={lead.id} className="rounded-2xl border border-stone-100 p-4 hover:border-gold/30 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-bold text-navy truncate">{lead.visitor_name}</p>
                        <a href={`mailto:${lead.visitor_email}`} className="text-sm text-gold hover:underline break-all">{lead.visitor_email}</a>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`border px-2.5 py-1 rounded-full text-xs font-bold ${tempClass}`}>{displayTemperature}</span>
                        <span className="bg-stone-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold">{formatSourceLabel(lead.via)}</span>
                        <select
                          value={lead.status ?? 'new'}
                          onChange={(e) => handleLeadStatus(lead.id, e.target.value)}
                          className="bg-white border border-stone-200 text-gray-600 rounded-full px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-gold"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Interest</p>
                        <p className="text-sm text-navy font-semibold">{lead.interest ?? getLeadInterest(lead.message)}</p>
                      </div>
                      <p className="text-xs text-gray-400 md:text-right whitespace-nowrap">
                        {new Date(lead.submitted_at).toLocaleDateString()} · {new Date(lead.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
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
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              💬 WhatsApp number
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Enter your WhatsApp number in international format. Customers will see it in the hero and final contact block.
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

          {/* WhatsApp pre-filled message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              ✏️ Pre-filled WhatsApp message
            </label>
            <p className="text-xs text-gray-400 mb-2">
              This message will be pre-typed when a customer taps the WhatsApp button. Max 500 characters.
            </p>
            <textarea
              rows={3}
              maxLength={500}
              value={whatsappMessageInput}
              onChange={(e) => setWhatsappMessageInput(e.target.value)}
              placeholder="Olá! Vim pela sua página e gostaria de mais informações."
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{whatsappMessageInput.length}/500</p>
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
