import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl } from '@/lib/utils'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FEEDBACK_AFTER_DAYS = 4
const FEEDBACK_WINDOW_DAYS = 5
const PRO_REPORT_DAYS = 7
const STARTER_REPORT_DAYS = 14

type EmailLang = 'pt' | 'es' | 'en' | 'fr'

const normalizeLang = (lang?: string | null): EmailLang => (
  lang === 'pt' || lang === 'es' || lang === 'fr' || lang === 'en' ? lang : 'en'
)

const reportCopy = {
  pt: {
    onboardingSubject: 'Sua Vitrine — check-in de 4 dias',
    recurringSubject: (label: string) => `Seu relatório Vitrine ${label}`,
    greeting: (name: string) => `Olá, ${name}!`,
    onboardingTitle: 'Seu primeiro relatório já está pronto',
    onboardingIntro: 'Sua página está online há 4 dias. Aqui está um resumo claro do que aconteceu até agora.',
    recurringTitle: (label: string) => `Aqui está seu relatório ${label}`,
    recurringIntro: (days: number) => `Resumo dos últimos ${days} dias da sua página Vitrine.`,
    weeklyLabel: 'semanal Pro',
    biweeklyLabel: 'quinzenal Starter',
    visits: 'Visitas totais',
    leads: 'Leads recebidos',
    qrVisits: 'Visitas por QR',
    suggestions: 'Sugestões para melhorar sua página',
    dashboardCta: 'Abrir meu dashboard',
    pageCta: 'Ver minha página',
    footer: 'Você recebeu este email porque criou uma página na Vitrine.',
    tips: {
      noLeads: 'Você ainda tem 0 leads — adicione ou destaque WhatsApp, telefone ou formulário para facilitar o contato.',
      noViews: 'Sua página ainda não recebeu visitas. Compartilhe o link no Instagram, WhatsApp e Google para começar a gerar tráfego.',
      noQr: 'Teste o QR Code rastreável do dashboard. Use em balcão, cartão, flyer ou recepção para trazer clientes presenciais para a página.',
      noDescription: 'Sua página está sem descrição. Uma bio curta aumenta confiança e ajuda o cliente a entender o que você oferece.',
      noPhone: 'Não encontramos telefone na página. Adicionar um número facilita contato direto.',
      noPhotos: 'Sua página ainda não tem fotos. Fotos reais aumentam confiança e ajudam a converter mais contatos.',
      allGood: 'Sua página está bem montada. Continue compartilhando para atrair mais clientes.',
    },
  },
  es: {
    onboardingSubject: 'Tu Vitrine — revisión de 4 días',
    recurringSubject: (label: string) => `Tu reporte Vitrine ${label}`,
    greeting: (name: string) => `¡Hola, ${name}!`,
    onboardingTitle: 'Tu primer reporte ya está listo',
    onboardingIntro: 'Tu página lleva 4 días online. Aquí tienes un resumen claro de lo ocurrido hasta ahora.',
    recurringTitle: (label: string) => `Aquí está tu reporte ${label}`,
    recurringIntro: (days: number) => `Resumen de los últimos ${days} días de tu página Vitrine.`,
    weeklyLabel: 'semanal Pro',
    biweeklyLabel: 'quincenal Starter',
    visits: 'Visitas totales',
    leads: 'Leads recibidos',
    qrVisits: 'Visitas por QR',
    suggestions: 'Sugerencias para mejorar tu página',
    dashboardCta: 'Abrir mi dashboard',
    pageCta: 'Ver mi página',
    footer: 'Recibes este email porque creaste una página en Vitrine.',
    tips: {
      noLeads: 'Aún tienes 0 leads — destaca WhatsApp, teléfono o formulario para facilitar el contacto.',
      noViews: 'Tu página aún no recibió visitas. Comparte el enlace en Instagram, WhatsApp y Google para empezar.',
      noQr: 'Prueba el QR rastreable del dashboard. Úsalo en mostrador, tarjetas, flyers o recepción.',
      noDescription: 'Tu página no tiene descripción. Una bio corta aumenta confianza y explica tu oferta.',
      noPhone: 'No encontramos teléfono en la página. Agregar uno facilita el contacto directo.',
      noPhotos: 'Tu página aún no tiene fotos. Las fotos reales aumentan confianza y conversión.',
      allGood: 'Tu página se ve bien. Sigue compartiéndola para atraer más clientes.',
    },
  },
  en: {
    onboardingSubject: 'Your Vitrine page — 4-day check-in',
    recurringSubject: (label: string) => `Your Vitrine ${label}`,
    greeting: (name: string) => `Hi ${name},`,
    onboardingTitle: 'Your first report is ready',
    onboardingIntro: "Your Vitrine page has been live for 4 days. Here's a clear summary of what happened so far.",
    recurringTitle: (label: string) => `Here is your ${label}`,
    recurringIntro: (days: number) => `Here is what happened in the last ${days} days on your Vitrine page.`,
    weeklyLabel: 'weekly Pro report',
    biweeklyLabel: '14-day Starter report',
    visits: 'Total visits',
    leads: 'Leads received',
    qrVisits: 'QR visits',
    suggestions: 'Suggestions to improve your page',
    dashboardCta: 'Open my dashboard',
    pageCta: 'View my page',
    footer: "You're receiving this because you created a page on Vitrine.",
    tips: {
      noLeads: 'You have 0 leads so far — consider adding or highlighting WhatsApp, phone or a form to make contact easier.',
      noViews: "Your page hasn't received visits yet. Share the link on Instagram, WhatsApp and Google to start getting traffic.",
      noQr: 'Try the tracked QR Code from your dashboard. Place it in your store, reception, business cards or flyers.',
      noDescription: 'Your page has no description. A short bio increases trust and helps customers understand what you offer.',
      noPhone: 'No phone number was found on your page. Adding one makes direct contact easier.',
      noPhotos: 'Your page has no photos yet. Real photos build trust and help convert more contacts.',
      allGood: 'Your page looks great. Keep sharing it to attract more customers.',
    },
  },
  fr: {
    onboardingSubject: 'Votre Vitrine — point après 4 jours',
    recurringSubject: (label: string) => `Votre rapport Vitrine ${label}`,
    greeting: (name: string) => `Bonjour ${name},`,
    onboardingTitle: 'Votre premier rapport est prêt',
    onboardingIntro: 'Votre page est en ligne depuis 4 jours. Voici un résumé clair de ce qui s’est passé.',
    recurringTitle: (label: string) => `Voici votre rapport ${label}`,
    recurringIntro: (days: number) => `Résumé des ${days} derniers jours sur votre page Vitrine.`,
    weeklyLabel: 'hebdomadaire Pro',
    biweeklyLabel: '14 jours Starter',
    visits: 'Visites totales',
    leads: 'Leads reçus',
    qrVisits: 'Visites QR',
    suggestions: 'Suggestions pour améliorer votre page',
    dashboardCta: 'Ouvrir mon dashboard',
    pageCta: 'Voir ma page',
    footer: 'Vous recevez cet email parce que vous avez créé une page sur Vitrine.',
    tips: {
      noLeads: 'Vous avez encore 0 lead — mettez en avant WhatsApp, téléphone ou formulaire pour faciliter le contact.',
      noViews: 'Votre page n’a pas encore reçu de visites. Partagez le lien sur Instagram, WhatsApp et Google.',
      noQr: 'Essayez le QR Code suivi depuis votre dashboard. Placez-le en boutique, réception, cartes ou flyers.',
      noDescription: 'Votre page n’a pas de description. Une courte bio augmente la confiance.',
      noPhone: 'Aucun téléphone trouvé sur la page. Ajouter un numéro facilite le contact direct.',
      noPhotos: 'Votre page n’a pas encore de photos. Des photos réelles renforcent la confiance.',
      allGood: 'Votre page est bien prête. Continuez à la partager pour attirer plus de clients.',
    },
  },
} as const

// GET /api/cron/feedback-email — called by Vercel Cron daily
// Sends a feedback email to any business created 4 days ago that hasn't received one yet.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()

  const onboardingSent = await sendOnboardingReports(db)
  const recurringSent = await sendRecurringPlanReports(db)

  return NextResponse.json({ sent: onboardingSent + recurringSent, onboardingSent, recurringSent })
}

// ─── helpers ──────────────────────────────────────────────────────────────────

async function sendOnboardingReports(db: ReturnType<typeof createServiceClient>) {

  // Find businesses created between FEEDBACK_AFTER_DAYS and FEEDBACK_WINDOW_DAYS ago
  // (24-hour window to avoid re-sending)
  const fourDaysAgo = new Date(Date.now() - FEEDBACK_AFTER_DAYS * ONE_DAY_MS).toISOString()
  const fiveDaysAgo = new Date(Date.now() - FEEDBACK_WINDOW_DAYS * ONE_DAY_MS).toISOString()

  const { data: businesses } = await db
    .from('businesses')
    .select('id, slug, owner_name, owner_email, secret_token, description, phone, photos, services, lang')
    .gte('created_at', fiveDaysAgo)
    .lte('created_at', fourDaysAgo)

  if (!businesses || businesses.length === 0) {
    return 0
  }

  let sent = 0

  for (const business of businesses) {
    const lang = normalizeLang(business.lang)
    const copy = reportCopy[lang]

    const { data: existingReport, error: reportLogError } = await db
      .from('email_reports')
      .select('id')
      .eq('business_id', business.id)
      .eq('report_type', 'onboarding')
      .limit(1)

    if (!reportLogError && existingReport && existingReport.length > 0) continue

    const { views, leads, qrViews } = await getReportMetrics(db, business.id)

    const tips = buildTips(business, views, leads, qrViews, lang)
    const baseUrl = getBaseUrl()
    const dashboardUrl = `${baseUrl}/dashboard/${business.secret_token}`
    const pageUrl = `${baseUrl}/p/${business.slug}`

    if (resend) {
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: business.owner_email,
        subject: copy.onboardingSubject,
        html: buildEmailHtml({
          greeting: copy.greeting(business.owner_name),
          title: copy.onboardingTitle,
          intro: copy.onboardingIntro,
          views,
          leads,
          qrViews,
          tips,
          dashboardUrl,
          pageUrl,
          lang,
        }),
      })

      if (!reportLogError) {
        await db.from('email_reports').insert({
          business_id: business.id,
          report_type: 'onboarding',
          period_days: FEEDBACK_AFTER_DAYS,
        })
      }

      sent++
    }
  }

  return sent
}

async function sendRecurringPlanReports(db: ReturnType<typeof createServiceClient>) {
  const { data: businesses } = await db
    .from('businesses')
    .select('id, slug, owner_name, owner_email, secret_token, description, phone, photos, services, plan, created_at, lang')
    .limit(200)

  if (!businesses || businesses.length === 0) return 0

  let sent = 0

  for (const business of businesses) {
    const isPro = String(business.plan ?? 'starter').toLowerCase() === 'pro'
    const periodDays = isPro ? PRO_REPORT_DAYS : STARTER_REPORT_DAYS
    const reportType = isPro ? 'weekly' : 'biweekly'
    const createdAt = new Date(business.created_at).getTime()
    if (Number.isFinite(createdAt) && Date.now() - createdAt < periodDays * ONE_DAY_MS) continue

    const periodStart = new Date(Date.now() - periodDays * ONE_DAY_MS).toISOString()
    const lang = normalizeLang(business.lang)
    const copy = reportCopy[lang]

    const { data: existingReport, error: reportLogError } = await db
      .from('email_reports')
      .select('id')
      .eq('business_id', business.id)
      .eq('report_type', reportType)
      .gte('sent_at', periodStart)
      .limit(1)

    if (reportLogError) {
      // If the migration has not been applied yet, skip recurring reports safely.
      continue
    }

    if (existingReport && existingReport.length > 0) continue

    const { views, leads, qrViews } = await getReportMetrics(db, business.id, periodStart)
    const tips = buildTips(business, views, leads, qrViews, lang)
    const baseUrl = getBaseUrl()
    const dashboardUrl = `${baseUrl}/dashboard/${business.secret_token}`
    const pageUrl = `${baseUrl}/p/${business.slug}`
    const reportLabel = isPro ? copy.weeklyLabel : copy.biweeklyLabel

    if (resend) {
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: business.owner_email,
        subject: copy.recurringSubject(reportLabel),
        html: buildEmailHtml({
          greeting: copy.greeting(business.owner_name),
          title: copy.recurringTitle(reportLabel),
          intro: copy.recurringIntro(periodDays),
          views,
          leads,
          qrViews,
          tips,
          dashboardUrl,
          pageUrl,
          lang,
        }),
      })

      await db.from('email_reports').insert({
        business_id: business.id,
        report_type: reportType,
        period_days: periodDays,
      })

      sent++
    }
  }

  return sent
}

async function getReportMetrics(db: ReturnType<typeof createServiceClient>, businessId: string, since?: string) {
  let viewsQuery = db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
  let leadsQuery = db
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
  let qrQuery = db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .ilike('via', '%qr%')

  if (since) {
    viewsQuery = viewsQuery.gte('visited_at', since)
    leadsQuery = leadsQuery.gte('submitted_at', since)
    qrQuery = qrQuery.gte('visited_at', since)
  }

  const [{ count: views }, { count: leads }, { count: qrViews }] = await Promise.all([
    viewsQuery,
    leadsQuery,
    qrQuery,
  ])

  return {
    views: views ?? 0,
    leads: leads ?? 0,
    qrViews: qrViews ?? 0,
  }
}

interface BusinessRecord {
  description?: string
  phone?: string
  photos?: unknown
  services?: unknown
}

function buildTips(
  business: BusinessRecord,
  views: number,
  leads: number,
  qrViews: number,
  lang: EmailLang
): string[] {
  const text = reportCopy[lang].tips
  const tips: string[] = []

  if (leads === 0 && views > 0) {
    tips.push(text.noLeads)
  }
  if (views === 0) {
    tips.push(text.noViews)
  }
  if (qrViews === 0 && views > 0) {
    tips.push(text.noQr)
  }
  if (!business.description) {
    tips.push(text.noDescription)
  }
  if (!business.phone) {
    tips.push(text.noPhone)
  }
  const photos = business.photos as unknown[]
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    tips.push(text.noPhotos)
  }

  if (tips.length === 0) {
    tips.push(text.allGood)
  }

  return tips
}

function buildEmailHtml({
  greeting,
  title,
  intro,
  views,
  leads,
  qrViews,
  tips,
  dashboardUrl,
  pageUrl,
  lang,
}: {
  greeting: string
  title: string
  intro: string
  views: number
  leads: number
  qrViews: number
  tips: string[]
  dashboardUrl: string
  pageUrl: string
  lang: EmailLang
}): string {
  const copy = reportCopy[lang]
  const tipsHtml = tips
    .map((t) => `<li style="margin-bottom:8px">${escapeHtml(t)}</li>`)
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <p style="color:#64748B;margin:0 0 8px">${escapeHtml(greeting)}</p>
      <h2 style="color:#1a1a2e;margin:0 0 12px">${escapeHtml(title)}</h2>
      <p style="color:#444;line-height:1.6">${escapeHtml(intro)}</p>

      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr>
          <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#1a1a2e">${views}</div>
            <div style="color:#888;font-size:14px">${copy.visits}</div>
          </td>
          <td style="width:16px"></td>
          <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#1a1a2e">${leads}</div>
            <div style="color:#888;font-size:14px">${copy.leads}</div>
          </td>
          <td style="width:16px"></td>
          <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#1a1a2e">${qrViews}</div>
            <div style="color:#888;font-size:14px">${copy.qrVisits}</div>
          </td>
        </tr>
      </table>

      <h3 style="color:#1a1a2e">${copy.suggestions}</h3>
      <ul style="padding-left:20px;color:#444;line-height:1.6">
        ${tipsHtml}
      </ul>

      <div style="margin-top:32px">
        <a href="${dashboardUrl}" style="display:inline-block;background:#f5c518;color:#1a1a2e;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none">
          ${copy.dashboardCta}
        </a>
        &nbsp;&nbsp;
        <a href="${pageUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none">
          ${copy.pageCta}
        </a>
      </div>

      <p style="margin-top:32px;color:#aaa;font-size:12px">
        ${copy.footer}
      </p>
    </div>
  `
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
