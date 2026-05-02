'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ThumbsUp, Copy, Check, ExternalLink, Users, Eye, TrendingUp,
  CalendarDays, Plus, Save, MousePointerClick, MessageCircle, Sparkles, Download, QrCode,
} from 'lucide-react'
import QRCode from 'qrcode'
import { generateCampaignSlug, safeBookingHref } from '@/lib/utils'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type DashboardLang = 'pt' | 'es' | 'en' | 'fr'

const dashboardCopy = {
  pt: {
    newPage: 'Nova página', upgrade: 'Melhorar plano', viewPage: 'Ver página', copyPage: 'Copiar link', copied: 'Copiado!', openPage: 'Abrir página', publicUrl: 'Seu link público',
    liveFor: 'Online há', day: 'dia', days: 'dias', since: 'desde', period: 'Período do dashboard', updated: 'atualizado', ranges: { '7d': '7 dias', '30d': '30 dias', '90d': '90 dias', all: 'Tudo' },
    currentPlan: 'Plano atual', pageUsed: 'página usada', pagesUsed: 'páginas usadas', createAnother: 'Criar outra página', limitReached: 'Limite de páginas atingido.', upgradeHint: 'Melhore para o Pro para criar até 3 páginas com este email.',
    tabs: { overview: 'Visão geral', leads: 'Leads', channels: 'Canais', settings: 'Ajustes' }, visits: 'Visitas', intent: 'Ações de intenção', leadsLabel: 'Leads', conversion: 'Conversão', noVisits: 'Sem visitas ainda',
    recommended: 'Ação recomendada', next: 'O que fazer agora', recentLeads: 'Leads recentes', recentLeadsHint: 'Últimas pessoas que deixaram contato.', viewAll: 'Ver todos', noLeads: 'Nenhum lead ainda. Compartilhe sua página e eles aparecerão aqui.',
    topChannels: 'Top canais', topChannelsHint: 'Melhores fontes por visitas e intenção.', manage: 'Gerenciar', noChannelData: 'Ainda não há dados de canais. Crie um link rastreável para começar.',
    settingsTitle: 'Agendamento e WhatsApp', settingsHint: 'Configure como os clientes podem falar com você e agendar diretamente pela página pública.', saveChanges: 'Salvar alterações', saved: 'Salvo!',
    qrTitle: 'QR Code rastreável', qrHint: 'Crie um QR Code da sua landing page para colocar na loja, cartões, flyers ou recepção. Cada leitura entra no dashboard como canal rastreado.', qrCreate: 'Criar QR Code rastreável', qrCreating: 'Criando...', qrReady: 'QR Code pronto', qrDownload: 'Baixar QR Code', qrCopy: 'Copiar link rastreado', qrCopied: 'Link copiado', qrStats: 'As visitas deste QR aparecem em Canais e também entram no relatório por email.',
  },
  en: {
    newPage: 'New page', upgrade: 'Upgrade plan', viewPage: 'View my page', copyPage: 'Copy page link', copied: 'Copied!', openPage: 'Open page', publicUrl: 'Your public URL',
    liveFor: 'Live for', day: 'day', days: 'days', since: 'since', period: 'Dashboard period', updated: 'updated', ranges: { '7d': '7 days', '30d': '30 days', '90d': '90 days', all: 'All' },
    currentPlan: 'Current plan', pageUsed: 'page used', pagesUsed: 'pages used', createAnother: 'Create another page', limitReached: 'Page limit reached.', upgradeHint: 'Upgrade to Pro to create up to 3 pages for this email.',
    tabs: { overview: 'Overview', leads: 'Leads', channels: 'Channels', settings: 'Settings' }, visits: 'Visits', intent: 'Intent actions', leadsLabel: 'Leads', conversion: 'Conversion', noVisits: 'No visits yet',
    recommended: 'Recommended action', next: 'What to do next', recentLeads: 'Recent leads', recentLeadsHint: 'Latest people who left contact details.', viewAll: 'View all', noLeads: 'No leads yet. Share your page and they will appear here.',
    topChannels: 'Top channels', topChannelsHint: 'Best sources by visits and intent.', manage: 'Manage', noChannelData: 'No channel data yet. Create one tracked link to start.', settingsTitle: 'Booking & WhatsApp', settingsHint: 'Configure how customers can reach you and book appointments directly from your public page.', saveChanges: 'Save Changes', saved: 'Saved!',
    qrTitle: 'Tracked QR Code', qrHint: 'Create a QR Code for your landing page to place in your shop, cards, flyers or reception. Every scan appears in the dashboard as a tracked channel.', qrCreate: 'Create tracked QR Code', qrCreating: 'Creating...', qrReady: 'QR Code ready', qrDownload: 'Download QR Code', qrCopy: 'Copy tracked link', qrCopied: 'Link copied', qrStats: 'Visits from this QR appear in Channels and are included in the email report.',
  },
  es: {
    newPage: 'Nueva página', upgrade: 'Mejorar plan', viewPage: 'Ver mi página', copyPage: 'Copiar enlace', copied: '¡Copiado!', openPage: 'Abrir página', publicUrl: 'Tu URL pública', liveFor: 'Online hace', day: 'día', days: 'días', since: 'desde', period: 'Período del dashboard', updated: 'actualizado', ranges: { '7d': '7 días', '30d': '30 días', '90d': '90 días', all: 'Todo' }, currentPlan: 'Plan actual', pageUsed: 'página usada', pagesUsed: 'páginas usadas', createAnother: 'Crear otra página', limitReached: 'Límite de páginas alcanzado.', upgradeHint: 'Mejora a Pro para crear hasta 3 páginas con este email.', tabs: { overview: 'Resumen', leads: 'Leads', channels: 'Canales', settings: 'Ajustes' }, visits: 'Visitas', intent: 'Acciones de intención', leadsLabel: 'Leads', conversion: 'Conversión', noVisits: 'Sin visitas todavía', recommended: 'Acción recomendada', next: 'Qué hacer ahora', recentLeads: 'Leads recientes', recentLeadsHint: 'Últimas personas que dejaron contacto.', viewAll: 'Ver todos', noLeads: 'Sin leads todavía. Comparte tu página y aparecerán aquí.', topChannels: 'Top canales', topChannelsHint: 'Mejores fuentes por visitas e intención.', manage: 'Gestionar', noChannelData: 'Aún no hay datos de canales. Crea un enlace rastreable para empezar.', settingsTitle: 'Reservas y WhatsApp', settingsHint: 'Configura cómo los clientes pueden contactarte y reservar directamente desde la página pública.', saveChanges: 'Guardar cambios', saved: '¡Guardado!', qrTitle: 'QR Code rastreable', qrHint: 'Crea un QR Code de tu landing page para poner en la tienda, tarjetas, flyers o recepción. Cada lectura aparece en el dashboard como canal rastreado.', qrCreate: 'Crear QR Code rastreable', qrCreating: 'Creando...', qrReady: 'QR Code listo', qrDownload: 'Descargar QR Code', qrCopy: 'Copiar enlace rastreado', qrCopied: 'Enlace copiado', qrStats: 'Las visitas de este QR aparecen en Canales y entran en el reporte por email.',
  },
  fr: {
    newPage: 'Nouvelle page', upgrade: 'Améliorer le plan', viewPage: 'Voir ma page', copyPage: 'Copier le lien', copied: 'Copié !', openPage: 'Ouvrir la page', publicUrl: 'Votre URL publique', liveFor: 'En ligne depuis', day: 'jour', days: 'jours', since: 'depuis', period: 'Période du dashboard', updated: 'mis à jour', ranges: { '7d': '7 jours', '30d': '30 jours', '90d': '90 jours', all: 'Tout' }, currentPlan: 'Plan actuel', pageUsed: 'page utilisée', pagesUsed: 'pages utilisées', createAnother: 'Créer une autre page', limitReached: 'Limite de pages atteinte.', upgradeHint: 'Passez au Pro pour créer jusqu’à 3 pages avec cet email.', tabs: { overview: 'Vue générale', leads: 'Leads', channels: 'Canaux', settings: 'Réglages' }, visits: 'Visites', intent: 'Actions d’intention', leadsLabel: 'Leads', conversion: 'Conversion', noVisits: 'Aucune visite pour le moment', recommended: 'Action recommandée', next: 'Que faire maintenant', recentLeads: 'Leads récents', recentLeadsHint: 'Dernières personnes ayant laissé leurs coordonnées.', viewAll: 'Voir tout', noLeads: 'Aucun lead pour le moment. Partagez votre page et ils apparaîtront ici.', topChannels: 'Top canaux', topChannelsHint: 'Meilleures sources par visites et intention.', manage: 'Gérer', noChannelData: 'Aucune donnée de canal pour le moment. Créez un lien suivi pour commencer.', settingsTitle: 'Réservation et WhatsApp', settingsHint: 'Configurez comment les clients peuvent vous contacter et réserver depuis votre page publique.', saveChanges: 'Enregistrer', saved: 'Enregistré !', qrTitle: 'QR Code suivi', qrHint: 'Créez un QR Code pour votre landing page à placer en boutique, sur cartes, flyers ou à l’accueil. Chaque scan apparaît dans le dashboard comme canal suivi.', qrCreate: 'Créer un QR Code suivi', qrCreating: 'Création...', qrReady: 'QR Code prêt', qrDownload: 'Télécharger le QR Code', qrCopy: 'Copier le lien suivi', qrCopied: 'Lien copié', qrStats: 'Les visites de ce QR apparaissent dans Canaux et sont incluses dans le rapport email.',
  },
} as const

const QR_CHANNEL_NAME = 'Store QR Code'

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
  const [activeSection, setActiveSection] = useState<'overview' | 'leads' | 'channels' | 'settings'>('overview')
  const [dashboardLang, setDashboardLang] = useState<DashboardLang>('pt')

  // Campaign link creator
  const [campaignName, setCampaignName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedChannelId, setCopiedChannelId] = useState('')
  const [savedChannels, setSavedChannels] = useState<SavedChannel[]>([])
  const [showChannelForm, setShowChannelForm] = useState(false)
  const [qrCreating, setQrCreating] = useState(false)
  const [qrPreviewUrl, setQrPreviewUrl] = useState('')
  const [qrTrackedLink, setQrTrackedLink] = useState('')
  const [qrCopied, setQrCopied] = useState(false)
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
    try {
      const savedLang = localStorage.getItem('vitrine_dashboard_language') as DashboardLang | null
      if (savedLang && savedLang in dashboardCopy) setDashboardLang(savedLang)
    } catch {
      // ignore localStorage issues
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('vitrine_dashboard_language', dashboardLang)
    } catch {
      // ignore localStorage issues
    }
  }, [dashboardLang])

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

  const buildQrDataUrl = async (url: string) => QRCode.toDataURL(url, {
    width: 1200,
    margin: 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  })

  const downloadQrDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCreateTrackedQr = async () => {
    if (!token || !data) return
    setQrCreating(true)
    try {
      const qrSlug = generateCampaignSlug(QR_CHANNEL_NAME)
      let channel = savedChannels.find((item) => item.slug === qrSlug)

      if (!channel) {
        const res = await fetch(`/api/dashboard/${token}/channels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: QR_CHANNEL_NAME }),
        })
        if (!res.ok) {
          alert('Could not create the QR tracking channel. Make sure the channels migration is applied in Supabase.')
          return
        }
        const json = await res.json()
        channel = json.channel as SavedChannel
        setSavedChannels((items) => [channel!, ...items.filter((item) => item.slug !== channel!.slug)])
      }

      const dataUrl = await buildQrDataUrl(channel.url)
      setQrTrackedLink(channel.url)
      setQrPreviewUrl(dataUrl)
    } catch {
      alert('Could not create the QR Code. Please try again.')
    } finally {
      setQrCreating(false)
    }
  }

  const handleCopyQrLink = async () => {
    if (!qrTrackedLink) return
    try {
      await navigator.clipboard.writeText(qrTrackedLink)
      setQrCopied(true)
      copyTimeoutRef.current = setTimeout(() => setQrCopied(false), 2000)
    } catch {
      alert(`Copy this link manually:\n\n${qrTrackedLink}`)
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

  const t = dashboardCopy[dashboardLang]

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
  const pageLimitLabel = pageUsage.pageLimit
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
  const recentLeads = leads.slice(0, 5)
  const topChannelRows = channelRows.length > 0
    ? [...channelRows].sort((a, b) => (b.intentCount - a.intentCount) || (b.visits - a.visits)).slice(0, 3)
    : sourceInsights.slice(0, 3).map((item) => ({
      id: item.source,
      name: formatSourceLabel(item.source),
      slug: item.source,
      url: '',
      createdAt: '',
      visits: item.count,
      bookingCount: item.bookingCount,
      whatsappCount: item.whatsappCount,
      intentCount: item.intentCount,
      isTracked: false,
    }))
  const recommendedAction = stats.totalViews === 0
    ? 'Share your page on Instagram bio, WhatsApp status and Google Business to get the first visits.'
    : stats.totalLeads === 0 && stats.totalViews > 5
    ? 'You have visits but no captured leads yet. Keep WhatsApp visible and add the page link to your strongest channel.'
    : stats.leadsThisWeek > 0
    ? `Follow up with ${stats.leadsThisWeek} new ${stats.leadsThisWeek === 1 ? 'lead' : 'leads'} this week while interest is fresh.`
    : topSource
    ? `${formatSourceLabel(topSource.source)} is currently your strongest source. Keep sharing there and test one more channel.`
    : 'Create one tracking channel for Instagram, WhatsApp or Google to see where customers come from.'

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
              <ThumbsUp className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="text-white font-bold">Vitrine</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LanguageSwitcher lang={dashboardLang} setLang={(value) => setDashboardLang(value as DashboardLang)} />
            </div>
            {pageUsage.canCreateMore ? (
              <Link
                href={newPageHref}
                className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 text-gold text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.newPage}
              </Link>
            ) : (
              <Link
                href={newPageHref}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-gray-300 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {t.upgrade}
              </Link>
            )}
            <a
              href={`/p/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              {t.viewPage}
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
                {t.liveFor} {daysLive} {daysLive === 1 ? t.day : t.days} · {t.since} {createdDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="md:hidden w-full mb-1">
                <LanguageSwitcher lang={dashboardLang} setLang={(value) => setDashboardLang(value as DashboardLang)} />
              </div>
              <button
                onClick={handleCopyPageUrl}
                className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-gold/40 text-navy text-sm px-3.5 py-2 rounded-xl transition-colors font-medium"
              >
                {pageUrlCopied ? <><Check className="w-4 h-4 text-green-500" />{t.copied}</> : <><Copy className="w-4 h-4" />{t.copyPage}</>}
              </button>
              <a
                href={`/p/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-navy hover:bg-navy/90 text-white text-sm px-3.5 py-2 rounded-xl transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                {t.openPage}
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-200/60">
            <p className="text-xs text-gray-400 mb-1">{t.publicUrl}</p>
            <p className="text-navy/70 font-mono text-sm break-all">{pageUrl}</p>
          </div>
        </div>

        {/* ── Date range filter ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-3 mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="px-2">
            <p className="text-sm font-bold text-navy">{t.period}</p>
            <p className="text-xs text-gray-400">{weekdayLabel} · {t.updated} {lastUpdatedLabel}</p>
          </div>
          <div className="flex gap-2 bg-stone-50 rounded-xl p-1 border border-stone-100">
            {[
              { id: '7d', label: t.ranges['7d'] },
              { id: '30d', label: t.ranges['30d'] },
              { id: '90d', label: t.ranges['90d'] },
              { id: 'all', label: t.ranges.all },
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
            <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">{t.currentPlan}</p>
            <h2 className="text-xl font-bold">{planName}</h2>
            <p className="text-sm text-gray-300 mt-1">
              {pageUsage.pagesUsed}/{pageLimitLabel} {pageUsage.pagesUsed === 1 ? t.pageUsed : t.pagesUsed}
            </p>
          </div>
          {pageUsage.canCreateMore ? (
            <Link
              href={newPageHref}
              className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              {t.createAnother}
            </Link>
          ) : (
            <div className="text-sm text-gray-200 max-w-md">
              <p className="font-semibold text-white">{t.limitReached}</p>
              <p className="text-gray-300">{t.upgradeHint}</p>
            </div>
          )}
        </div>

        {/* ── Simple navigation ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-2 mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'overview', label: t.tabs.overview },
            { id: 'leads', label: `${t.tabs.leads} (${leads.length})` },
            { id: 'channels', label: t.tabs.channels },
            { id: 'settings', label: t.tabs.settings },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id as typeof activeSection)}
              className={`rounded-xl px-4 py-3 text-sm font-black transition-all ${
                activeSection === item.id ? 'bg-navy text-white shadow-sm' : 'text-gray-500 hover:bg-stone-50 hover:text-navy'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeSection === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<Eye className="w-5 h-5 text-gold" />} label={t.visits} value={stats.totalViews} hint={dashboardLang === 'pt' ? 'pessoas abriram a página' : 'people opened the page'} />
              <StatCard icon={<MousePointerClick className="w-5 h-5 text-gold" />} label={t.intent} value={totalClicks} hint={`${stats.bookingClicks} booking · ${stats.whatsappClicks} WhatsApp`} />
              <StatCard icon={<Users className="w-5 h-5 text-gold" />} label={t.leadsLabel} value={stats.totalLeads} hint={dashboardLang === 'pt' ? `${stats.leadsThisWeek} esta semana` : `${stats.leadsThisWeek} this week`} />
              <StatCard icon={<Sparkles className="w-5 h-5 text-gold" />} label={t.conversion} value={conversionRate} suffix="%" hint={stats.totalViews === 0 ? t.noVisits : `${stats.totalLeads}/${stats.totalViews} became leads`} />
            </div>

            <div className="bg-gradient-to-br from-navy to-slate-900 rounded-3xl p-6 mb-6 text-white shadow-xl overflow-hidden relative">
              <div className="absolute -right-16 -top-16 w-44 h-44 bg-gold/10 rounded-full blur-2xl" />
              <div className="relative flex items-start gap-4">
                <div className="w-11 h-11 bg-gold rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="text-gold text-xs font-black uppercase tracking-wider mb-1">{t.recommended}</p>
                  <h2 className="text-2xl font-black mb-2">{t.next}</h2>
                  <p className="text-gray-300 leading-relaxed max-w-3xl">{recommendedAction}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-black text-navy">{t.recentLeads}</h2>
                    <p className="text-sm text-gray-400">{t.recentLeadsHint}</p>
                  </div>
                  <button onClick={() => setActiveSection('leads')} className="text-gold text-sm font-black hover:underline">{t.viewAll}</button>
                </div>
                {recentLeads.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-stone-50 rounded-2xl p-5">{t.noLeads}</p>
                ) : (
                  <div className="space-y-3">
                    {recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 border border-stone-100 p-3">
                        <div className="min-w-0">
                          <p className="font-bold text-navy truncate">{lead.visitor_name}</p>
                          <p className="text-xs text-gray-400 truncate">{lead.interest ?? getLeadInterest(lead.message)} · {formatSourceLabel(lead.via)}</p>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{new Date(lead.submitted_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-black text-navy">{t.topChannels}</h2>
                    <p className="text-sm text-gray-400">{t.topChannelsHint}</p>
                  </div>
                  <button onClick={() => setActiveSection('channels')} className="text-gold text-sm font-black hover:underline">{t.manage}</button>
                </div>
                {topChannelRows.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-stone-50 rounded-2xl p-5">{t.noChannelData}</p>
                ) : (
                  <div className="space-y-3">
                    {topChannelRows.map((channel) => (
                      <div key={channel.id} className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-black text-navy truncate">{channel.name}</p>
                          <span className="text-xs text-gray-400 font-bold">{channel.visits} visits</span>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden border border-stone-100">
                          <div className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full" style={{ width: `${maxViews ? Math.min(100, (channel.visits / maxViews) * 100) : 0}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{channel.intentCount} intent actions</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Block B: Traffic & intent by source ── */}
        {activeSection === 'channels' && <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
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
          <div className="mt-5 rounded-3xl border border-gold/20 bg-gradient-to-br from-white via-gold/5 to-stone-50 p-5 overflow-hidden relative">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-gold/10 rounded-full blur-2xl" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-center">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy text-gold flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-navy text-lg">{t.qrTitle}</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-2xl">{t.qrHint}</p>
                  <p className="text-xs text-gold font-bold mt-3">{t.qrStats}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap lg:justify-end">
                {qrPreviewUrl && (
                  <div className="bg-white rounded-2xl border border-stone-100 p-3 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrPreviewUrl} alt="Tracked QR Code preview" className="w-28 h-28" />
                  </div>
                )}
                <div className="flex flex-col gap-2 min-w-[190px]">
                  <button
                    onClick={handleCreateTrackedQr}
                    disabled={qrCreating}
                    className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-4 py-3 rounded-xl text-sm font-black hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <QrCode className="w-4 h-4" />
                    {qrCreating ? t.qrCreating : qrPreviewUrl ? t.qrReady : t.qrCreate}
                  </button>
                  {qrPreviewUrl && (
                    <>
                      <button
                        onClick={() => downloadQrDataUrl(qrPreviewUrl, `vitrine-${business.slug}-tracked-qr.png`)}
                        className="inline-flex items-center justify-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-navy/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        {t.qrDownload}
                      </button>
                      <button
                        onClick={handleCopyQrLink}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 text-navy px-4 py-2.5 rounded-xl text-sm font-bold hover:border-gold/40 transition-colors"
                      >
                        {qrCopied ? <><Check className="w-4 h-4 text-green-500" />{t.qrCopied}</> : <><Copy className="w-4 h-4" />{t.qrCopy}</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* ── Block C: Leads list ── */}
        {activeSection === 'leads' && <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 mb-6">
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
                        {lead.visitor_email ? (
                          <a href={`mailto:${lead.visitor_email}`} className="text-sm text-gold hover:underline break-all">{lead.visitor_email}</a>
                        ) : (
                          <p className="text-sm text-gray-400">No email captured</p>
                        )}
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
        </div>}

        {/* ── Block E: Booking & WhatsApp contact setup ── */}
        {activeSection === 'settings' && <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-navy">{t.settingsTitle}</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            {t.settingsHint}
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
                {t.saved}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.saveChanges}
              </>
            )}
          </button>
        </div>}
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
