import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl, isEmail } from '@/lib/utils'
import { Resend } from 'resend'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

type EmailLang = 'pt' | 'es' | 'en' | 'fr'

const normalizeLang = (lang?: string | null): EmailLang => (
  lang === 'pt' || lang === 'es' || lang === 'fr' || lang === 'en' ? lang : 'en'
)

const loginCopy = {
  pt: {
    subject: 'Seus links de acesso ao dashboard Vitrine',
    title: (count: number) => `Seu${count > 1 ? 's' : ''} link${count > 1 ? 's' : ''} de dashboard`,
    intro: (count: number) => `Encontramos ${count} página${count > 1 ? 's' : ''} associada${count > 1 ? 's' : ''} a este email. Use o botão abaixo para acessar com segurança.`,
    business: 'Página',
    dashboard: 'Dashboard',
    open: 'Abrir dashboard',
    warning: '🔒 Guarde estes links com cuidado — eles dão acesso aos leads e estatísticas.',
    footer: 'Você solicitou este email na página de login da Vitrine.',
  },
  es: {
    subject: 'Tus enlaces de acceso al dashboard Vitrine',
    title: (count: number) => `Tu${count > 1 ? 's' : ''} enlace${count > 1 ? 's' : ''} de dashboard`,
    intro: (count: number) => `Encontramos ${count} página${count > 1 ? 's' : ''} asociada${count > 1 ? 's' : ''} a este email. Usa el botón para acceder.`,
    business: 'Página',
    dashboard: 'Dashboard',
    open: 'Abrir dashboard',
    warning: '🔒 Guarda estos enlaces con cuidado — dan acceso a leads y estadísticas.',
    footer: 'Solicitaste este email desde la página de login de Vitrine.',
  },
  en: {
    subject: 'Your Vitrine dashboard access links',
    title: (count: number) => `Your dashboard link${count > 1 ? 's' : ''}`,
    intro: (count: number) => `We found ${count} page${count > 1 ? 's' : ''} associated with this email. Use the button below to access securely.`,
    business: 'Page',
    dashboard: 'Dashboard',
    open: 'Open dashboard',
    warning: '🔒 Keep these links safe — they give access to leads and statistics.',
    footer: 'You requested this email from the Vitrine login page.',
  },
  fr: {
    subject: 'Vos liens d’accès au dashboard Vitrine',
    title: (count: number) => `Vos lien${count > 1 ? 's' : ''} de dashboard`,
    intro: (count: number) => `Nous avons trouvé ${count} page${count > 1 ? 's' : ''} associée${count > 1 ? 's' : ''} à cet email. Utilisez le bouton ci-dessous.`,
    business: 'Page',
    dashboard: 'Dashboard',
    open: 'Ouvrir le dashboard',
    warning: '🔒 Gardez ces liens avec soin — ils donnent accès aux leads et statistiques.',
    footer: 'Vous avez demandé cet email depuis la page de login Vitrine.',
  },
} as const

// POST /api/dashboard/recover — send dashboard link(s) to the owner's email
// Body: { email: string }
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'dashboard-recover'), { limit: 5, windowMs: 15 * 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ ok: true }, { status: 200, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const { email } = await req.json()

    if (!email || typeof email !== 'string' || email.trim().length > 254 || !isEmail(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const db = createServiceClient()

    const { data: businesses } = await db
      .from('businesses')
      .select('owner_name, slug, secret_token, lang')
      .eq('owner_email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(10)

    // Always return success to avoid email enumeration.
    if (!businesses || businesses.length === 0 || !resend) {
      return NextResponse.json({ ok: true })
    }

    const baseUrl = getBaseUrl()
    const lang = normalizeLang(businesses[0]?.lang)
    const copy = loginCopy[lang]

    const linksHtml = businesses
      .map(
        (b) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee">
            <strong style="color:#1a1a2e">${escapeHtml(b.owner_name)}</strong><br/>
            <a href="${baseUrl}/p/${b.slug}" style="font-size:12px;color:#888">${baseUrl}/p/${b.slug}</a>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee">
            <a href="${baseUrl}/dashboard/${b.secret_token}" style="display:inline-block;background:#f5c518;color:#1a1a2e;padding:8px 16px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:13px">
              ${copy.open}
            </a>
          </td>
        </tr>`
      )
      .join('')

    await resend.emails.send({
      from: 'Vitrine <noreply@vitrine.app>',
      to: normalizedEmail,
      subject: copy.subject,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#1a1a2e">${copy.title(businesses.length)}</h2>
          <p style="color:#444">${copy.intro(businesses.length)}</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:10px 12px;text-align:left;color:#888;font-size:13px">${copy.business}</th>
                <th style="padding:10px 12px;text-align:left;color:#888;font-size:13px">${copy.dashboard}</th>
              </tr>
            </thead>
            <tbody>${linksHtml}</tbody>
          </table>

          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-top:16px">
            <p style="margin:0;font-size:13px;color:#92400e">${copy.warning}</p>
          </div>

          <p style="margin-top:32px;color:#aaa;font-size:12px">
            ${copy.footer}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/dashboard/recover error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
