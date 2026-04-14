'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Scissors, Copy, Check, ExternalLink, Users, Eye, TrendingUp, Link2 } from 'lucide-react'
import { generateCampaignSlug } from '@/lib/utils'

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
    category: string
    createdAt: string
  }
  stats: {
    totalViews: number
    totalLeads: number
    leadsThisWeek: number
  }
  viewsBySource: ViewsBySource[]
  leads: Lead[]
}

export default function OwnerDashboard({ params }: { params: Promise<{ token: string }> }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Campaign link creator
  const [campaignName, setCampaignName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    async function load() {
      const { token } = await params
      const res = await fetch(`/api/dashboard/${token}`)
      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    load()
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-2">Dashboard not found</h1>
          <p className="text-gray-500 mb-6">The link may be invalid or expired.</p>
          <Link href="/dashboard" className="text-gold hover:underline">Create a new page →</Link>
        </div>
      </div>
    )
  }

  const { business, stats, viewsBySource, leads } = data
  const maxViews = viewsBySource[0]?.count ?? 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-navy border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-white font-bold">Vitrine</span>
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">{business.ownerName}</h1>
          <p className="text-gray-500 text-sm mt-1">{business.category}</p>
        </div>

        {/* ── Block A: Summary cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Eye className="w-5 h-5 text-gold" />}
            label="Total Visits"
            value={stats.totalViews}
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
        </div>

        {/* ── Block B: Visits by source ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-navy mb-5">Visits by Source</h2>
          {viewsBySource.length === 0 ? (
            <p className="text-gray-400 text-sm">No visits yet. Share your page to get traffic!</p>
          ) : (
            <div className="space-y-3">
              {viewsBySource.map(({ source, count }) => (
                <div key={source} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-gray-600 truncate flex-shrink-0">{source}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-navy mb-5">Leads</h2>
          {leads.length === 0 ? (
            <p className="text-gray-400 text-sm">No leads yet. They&apos;ll appear here when someone contacts you.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium hidden md:table-cell">Message</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium hidden sm:table-cell">Source</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
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
            <div className="mt-4 bg-gray-50 rounded-xl p-4 flex items-center gap-3 flex-wrap">
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
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}
