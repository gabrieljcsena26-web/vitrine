import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl, isEmail, isHttpUrl } from '@/lib/utils'
import { Resend } from 'resend'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'
import { getCustomerEmailFromRequest } from '@/lib/customer-auth'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
}

const normalizePlan = (plan: unknown) => {
  const value = String(plan || 'starter').toLowerCase()
  return value in PLAN_LIMITS ? value : 'starter'
}

const normalizeSlug = (value: unknown) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 80)

type EmailLang = 'pt' | 'es' | 'en' | 'fr'

const normalizeLang = (lang: unknown): EmailLang => {
  const value = String(lang ?? '')
  return value === 'pt' || value === 'es' || value === 'fr' || value === 'en' ? value : 'en'
}

const welcomeCopy = {
  pt: {
    subject: 'Sua página Vitrine está online — guarde seu dashboard',
    title: (name: string) => `🎉 Bem-vindo à Vitrine, ${name}!`,
    intro: 'Sua landing page está online e pronta para receber visitas, leads e reservas.',
    publicPage: 'Sua página pública',
    privateDashboard: '🔒 Seu dashboard privado',
    keepSafe: 'Acesse com o email e a senha criados no cadastro. Não enviamos link privado de dashboard sem senha.',
    cta: 'Entrar no dashboard →',
    footer: 'Precisa de ajuda? Responda este email.',
  },
  es: {
    subject: 'Tu página Vitrine está online — guarda tu dashboard',
    title: (name: string) => `🎉 ¡Bienvenido a Vitrine, ${name}!`,
    intro: 'Tu landing page está online y lista para recibir visitas, leads y reservas.',
    publicPage: 'Tu página pública',
    privateDashboard: '🔒 Tu dashboard privado',
    keepSafe: 'Accede con el email y la contraseña creados en el registro. No enviamos enlaces privados sin contraseña.',
    cta: 'Entrar al dashboard →',
    footer: '¿Necesitas ayuda? Responde a este email.',
  },
  en: {
    subject: 'Your Vitrine page is live — save your dashboard',
    title: (name: string) => `🎉 Welcome to Vitrine, ${name}!`,
    intro: 'Your landing page is live and ready to receive visits, leads and bookings.',
    publicPage: 'Your public page',
    privateDashboard: '🔒 Your private dashboard',
    keepSafe: 'Log in with the email and password you created. We do not send private dashboard links without a password.',
    cta: 'Log in to dashboard →',
    footer: 'Need help? Just reply to this email.',
  },
  fr: {
    subject: 'Votre page Vitrine est en ligne — gardez votre dashboard',
    title: (name: string) => `🎉 Bienvenue sur Vitrine, ${name} !`,
    intro: 'Votre landing page est en ligne et prête à recevoir visites, leads et réservations.',
    publicPage: 'Votre page publique',
    privateDashboard: '🔒 Votre dashboard privé',
    keepSafe: 'Connectez-vous avec l’email et le mot de passe créés. Nous n’envoyons pas de lien privé sans mot de passe.',
    cta: 'Se connecter au dashboard →',
    footer: 'Besoin d’aide ? Répondez à cet email.',
  },
} as const

// POST /api/businesses — create a new business record and return the secret token
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'create-business'), { limit: 10, windowMs: 10 * 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const body = await req.json()
    const {
      businessName,
      category,
      description,
      address,
      email,
      phone,
      lang,
      services,
      hours,
      photos,
      benefits,
      testimonials,
      faqs,
      socialLinks,
      logoUrl,
      primaryColor,
      accentColor,
      mapUrl,
      menuUrl,
      menuImageUrl,
      seoTitle,
      seoDescription,
      ogImageUrl,
      slug,
      bookingUrl,
      whatsappNumber,
      whatsappMessage,
      plan,
    } = body

    const normalizedSlug = normalizeSlug(slug)
    const normalizedEmail = getCustomerEmailFromRequest(req)
    const contactEmail = String(email ?? '').trim().toLowerCase()
    const cleanedBusinessName = String(businessName ?? '').trim().slice(0, 120)
    const normalizedLang = normalizeLang(lang)

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Please log in before publishing your page.' }, { status: 401 })
    }

    if (!cleanedBusinessName || !normalizedSlug) {
      return NextResponse.json(
        { error: 'businessName and slug are required' },
        { status: 400 }
      )
    }

    if (contactEmail && !isEmail(contactEmail)) {
      return NextResponse.json({ error: 'email must be a valid email address' }, { status: 400 })
    }

    if (bookingUrl && !isHttpUrl(String(bookingUrl)) && !isEmail(String(bookingUrl))) {
      return NextResponse.json({ error: 'bookingUrl must be a valid http/https URL or email address' }, { status: 400 })
    }

    if (menuUrl && !isHttpUrl(String(menuUrl))) {
      return NextResponse.json({ error: 'menuUrl must be a valid http/https URL' }, { status: 400 })
    }

    if (whatsappNumber && !/^\+?[\d\s\-().]{7,20}$/.test(String(whatsappNumber))) {
      return NextResponse.json({ error: 'whatsappNumber must be a valid phone number' }, { status: 400 })
    }

    const db = createServiceClient()
    const normalizedPlan = normalizePlan(plan)
    const pageLimit = PLAN_LIMITS[normalizedPlan]

    // Detect whether this slug already exists so we can send the welcome
    // email only on the first creation (not on subsequent edits).
    const { data: existing } = await db
      .from('businesses')
      .select('id')
      .eq('slug', normalizedSlug)
      .maybeSingle()
    const isNew = !existing

    if (!isNew) {
      return NextResponse.json(
        { error: 'This page URL is already taken. Please choose another business name or URL.' },
        { status: 409 }
      )
    }

    if (isNew) {
      const { count: existingPages } = await db
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('owner_email', normalizedEmail)

      if ((existingPages ?? 0) >= pageLimit) {
        return NextResponse.json(
          {
            error: `Your ${normalizedPlan} plan allows ${pageLimit} page${pageLimit === 1 ? '' : 's'}. Upgrade to Pro to create more pages.`,
            code: 'PAGE_LIMIT_REACHED',
            plan: normalizedPlan,
            pageLimit,
            pagesUsed: existingPages ?? 0,
          },
          { status: 403 }
        )
      }
    }

    // Insert only. Public creation must never update an existing slug or reveal
    // another owner's secret dashboard token.
    const businessPayload = {
      slug: normalizedSlug,
      owner_name: cleanedBusinessName,
      owner_email: normalizedEmail,
      contact_email: contactEmail || null,
      plan: normalizedPlan,
      category: category ? String(category).trim().slice(0, 80) : null,
      description: description ? String(description).trim().slice(0, 2000) : null,
      address: address ? String(address).trim().slice(0, 240) : null,
      phone: phone ? String(phone).trim().slice(0, 40) : null,
      lang: normalizedLang,
      services,
      hours,
      photos,
      benefits: Array.isArray(benefits) ? benefits : null,
      testimonials: Array.isArray(testimonials) ? testimonials : null,
      faqs: Array.isArray(faqs) ? faqs : null,
      social_links: socialLinks && typeof socialLinks === 'object' ? socialLinks : null,
      logo_url: logoUrl || null,
      primary_color: primaryColor || null,
      accent_color: accentColor || null,
      map_url: mapUrl || null,
      menu_url: menuUrl ? String(menuUrl).trim() : null,
      menu_image_url: menuImageUrl ? String(menuImageUrl).trim() : null,
      seo_title: seoTitle ? String(seoTitle).trim().slice(0, 120) : null,
      seo_description: seoDescription ? String(seoDescription).trim().slice(0, 240) : null,
      og_image_url: ogImageUrl || null,
      booking_url: bookingUrl ? String(bookingUrl).trim() : null,
      whatsapp_number: whatsappNumber ? String(whatsappNumber).trim() : null,
      whatsapp_message: whatsappMessage ? String(whatsappMessage).trim().slice(0, 500) : null,
    }

    let { data, error } = await db
      .from('businesses')
      .insert(businessPayload)
      .select('id, slug, secret_token')
      .single()

    if (error && (
      error.message?.includes('whatsapp_message') ||
      error.message?.includes('contact_email') ||
      error.message?.includes('plan') ||
      error.message?.includes('benefits') ||
      error.message?.includes('testimonials') ||
      error.message?.includes('faqs') ||
      error.message?.includes('social_links') ||
      error.message?.includes('logo_url') ||
      error.message?.includes('primary_color') ||
      error.message?.includes('accent_color') ||
      error.message?.includes('map_url') ||
      error.message?.includes('menu_url') ||
      error.message?.includes('menu_image_url') ||
      error.message?.includes('seo_title') ||
      error.message?.includes('seo_description') ||
      error.message?.includes('og_image_url')
    )) {
      const fallbackPayload: Record<string, unknown> = { ...businessPayload }
      if (error.message?.includes('whatsapp_message')) delete fallbackPayload.whatsapp_message
      if (error.message?.includes('contact_email')) delete fallbackPayload.contact_email
      if (error.message?.includes('plan')) delete fallbackPayload.plan
      ;[
        'benefits',
        'testimonials',
        'faqs',
        'social_links',
        'logo_url',
        'primary_color',
        'accent_color',
        'map_url',
        'menu_url',
        'menu_image_url',
        'seo_title',
        'seo_description',
        'og_image_url',
      ].forEach((key) => delete fallbackPayload[key])
      const fallback = await db
        .from('businesses')
        .insert(fallbackPayload)
        .select('id, slug, secret_token')
        .single()

      data = fallback.data
      error = fallback.error
    }

    if (error || !data) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: error?.message ?? 'Could not save business' }, { status: 500 })
    }

    // Fire-and-forget welcome email with the public page and secure login link (first creation only).
    // Failures here should never break the API response — the token is already
    // returned to the client and also displayed on the success screen.
    if (isNew && resend && email) {
      const copy = welcomeCopy[normalizedLang]
      const baseUrl = getBaseUrl()
      const dashboardLink = `${baseUrl}/login`
      const pageLink = `${baseUrl}/p/${data.slug}`
      resend.emails
        .send({
          from: 'Vitrine <noreply@vitrine.app>',
          to: normalizedEmail,
          subject: copy.subject,
          html: `
            <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0F172A;max-width:520px;margin:0 auto">
              <h1 style="color:#0F172A;font-size:22px;margin:0 0 12px">${escapeHtml(copy.title(cleanedBusinessName))}</h1>
              <p style="color:#475569;line-height:1.6;margin:0 0 18px">${copy.intro}</p>

              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:0 0 14px">
                <p style="margin:0 0 6px;font-size:12px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">${copy.publicPage}</p>
                <a href="${pageLink}" style="color:#0F172A;font-family:ui-monospace,monospace;font-size:14px;word-break:break-all">${pageLink}</a>
              </div>

              <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:16px;margin:0 0 20px">
                <p style="margin:0 0 6px;font-size:12px;color:#92400E;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">${copy.privateDashboard}</p>
                <a href="${dashboardLink}" style="color:#0F172A;font-family:ui-monospace,monospace;font-size:13px;word-break:break-all">${dashboardLink}</a>
                <p style="margin:10px 0 0;font-size:12px;color:#92400E">${copy.keepSafe}</p>
              </div>

              <a href="${dashboardLink}" style="display:inline-block;background:#D4AF37;color:#0F172A;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">${copy.cta}</a>

              <p style="margin:24px 0 0;font-size:12px;color:#94A3B8">${copy.footer}</p>
            </div>
          `,
        })
        .catch((err) => console.error('Welcome email error:', err))
    }

    return NextResponse.json({ id: data.id, slug: data.slug, token: data.secret_token, plan: normalizedPlan })
  } catch (err) {
    console.error('POST /api/businesses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
