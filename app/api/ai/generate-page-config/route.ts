import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getCustomerEmailFromRequest } from '@/lib/customer-auth'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'
import { inferBusinessTemplate, type BusinessTemplate } from '@/lib/business-categories'

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-5.5'
const MAX_PHOTOS = 7

type GenerationType = 'initial_preview' | 'full_redesign' | 'menu_ocr' | 'copy_update'

interface SetupPayload {
  businessName?: string
  category?: string
  description?: string
  address?: string
  lang?: string
  contactMethods?: string[]
  bookingUrl?: string | null
  whatsappNumber?: string | null
  menuUrl?: string | null
  services?: Array<{ name?: string; price?: string; description?: string }>
  hours?: Array<{ day?: string; open?: boolean; from?: string; to?: string }>
  photos?: string[]
  generationType?: GenerationType
}

const allowedSections = ['hero', 'about', 'benefits', 'services', 'menu', 'gallery', 'reviews', 'hours', 'location', 'faq', 'contact']

const pageConfigSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['template', 'style', 'sections', 'copy', 'photoRoles', 'recommendations'],
  properties: {
    template: { type: 'string', enum: ['food', 'service', 'technical'] },
    style: {
      type: 'object',
      additionalProperties: false,
      required: ['primaryColor', 'accentColor', 'mood'],
      properties: {
        primaryColor: { type: 'string' },
        accentColor: { type: 'string' },
        mood: { type: 'string' },
      },
    },
    sections: {
      type: 'array',
      items: { type: 'string', enum: allowedSections },
      minItems: 5,
      maxItems: 10,
    },
    copy: {
      type: 'object',
      additionalProperties: false,
      required: ['headline', 'subheadline', 'primaryCta', 'secondaryCta'],
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        primaryCta: { type: 'string' },
        secondaryCta: { type: 'string' },
      },
    },
    photoRoles: {
      type: 'object',
      additionalProperties: false,
      required: ['hero', 'about', 'gallery'],
      properties: {
        hero: { type: ['string', 'null'] },
        about: { type: ['string', 'null'] },
        gallery: { type: 'array', items: { type: 'string' }, maxItems: 5 },
      },
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 6,
    },
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as SetupPayload | null
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const photos = Array.isArray(body.photos) ? body.photos.filter(Boolean).slice(0, MAX_PHOTOS) : []
    const generationType = normalizeGenerationType(body.generationType)
    const ownerEmail = getCustomerEmailFromRequest(req)
    if (!ownerEmail && generationType !== 'initial_preview') {
      return NextResponse.json({ error: 'Please log in before generating this AI update.' }, { status: 401 })
    }

    const rateOwner = ownerEmail ?? 'guest-preview'
    const limited = rateLimit(rateLimitKey(req, 'ai-page-config', rateOwner), { limit: ownerEmail ? 8 : 4, windowMs: 10 * 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many AI preview attempts' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const costCents = generationType === 'full_redesign' || generationType === 'menu_ocr' ? 100 : 0
    const template = inferBusinessTemplate(body.category, body.description)

    const logId = await createGenerationLog({ ownerEmail: ownerEmail ?? null, body, photos, generationType, costCents })
    const fallbackConfig = buildFallbackConfig(body, photos, template)

    let config = fallbackConfig
    let source: 'openai' | 'local-fallback' = 'local-fallback'

    if (process.env.OPENAI_API_KEY && photos.length > 0) {
      try {
        const aiConfig = await generateWithOpenAI(body, photos, template)
        config = sanitizeConfig(aiConfig, fallbackConfig)
        source = 'openai'
      } catch (err) {
        console.error('AI page config fallback:', err)
      }
    }

    await completeGenerationLog(logId, config, source)

    return NextResponse.json({
      ok: true,
      source,
      billable: costCents > 0,
      costCents,
      config: {
        ...config,
        generatedAt: new Date().toISOString(),
        imageCount: photos.length,
        source: source === 'openai' ? 'gpt_vision' : 'local_preview_logic',
      },
    })
  } catch (err) {
    console.error('POST /api/ai/generate-page-config error:', err)
    return NextResponse.json({ error: 'Could not generate AI preview' }, { status: 500 })
  }
}

async function generateWithOpenAI(body: SetupPayload, photos: string[], template: BusinessTemplate) {
  const prompt = `You are Vitrine GPT-5.5 Vision. Create a landing-page JSON config only.\n\nBusiness setup:\n- Name: ${body.businessName || 'Unknown'}\n- Category: ${body.category || template}\n- Short intro: ${body.description || 'No description'}\n- Address/city: ${body.address || 'Not provided'}\n- Contact methods: ${(body.contactMethods ?? []).join(', ') || 'not provided'}\n- Has booking link: ${Boolean(body.bookingUrl)}\n- Has WhatsApp: ${Boolean(body.whatsappNumber)}\n- Has menu URL/image: ${Boolean(body.menuUrl)}\n- Existing service/menu items: ${(body.services ?? []).map((item) => item.name).filter(Boolean).join(', ') || 'none'}\n\nRules:\n- Use setup as truth and photos as visual/context evidence.\n- Choose from allowed Vitrine sections only.\n- Do not invent phone, address, prices or legal claims.\n- Prefer conversion: WhatsApp/booking/menu/contact.\n- Return JSON matching the schema.`

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            ...photos.map((photo) => ({ type: 'input_image', image_url: photo })),
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'vitrine_page_config',
          schema: pageConfigSchema,
          strict: true,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`)
  }

  const data = await response.json()
  const text = extractOutputText(data)
  if (!text) throw new Error('OpenAI response did not include output text')
  return JSON.parse(text)
}

function extractOutputText(data: any): string {
  if (typeof data?.output_text === 'string') return data.output_text
  const chunks = data?.output?.flatMap((item: any) => item?.content ?? []) ?? []
  const textChunk = chunks.find((chunk: any) => typeof chunk?.text === 'string')
  return textChunk?.text ?? ''
}

function buildFallbackConfig(body: SetupPayload, photos: string[], template: BusinessTemplate) {
  const hasBooking = Boolean(body.bookingUrl)
  const hasWhatsapp = Boolean(body.whatsappNumber)
  const hasMenu = template === 'food' && Boolean(body.menuUrl || body.services?.length)
  const businessName = String(body.businessName || (template === 'food' ? 'Your restaurant' : 'Your business')).trim()
  const subheadline = body.description?.trim()
    ? body.description.trim().slice(0, 220)
    : template === 'food'
    ? 'A visual landing page built from your photos to help customers choose, order or reserve faster.'
    : 'A professional landing page built from your setup and photos to turn visitors into real contacts.'

  return {
    template,
    style: template === 'food'
      ? { primaryColor: '#1F2937', accentColor: '#D4AF37', mood: 'warm_premium' }
      : template === 'technical'
      ? { primaryColor: '#0F172A', accentColor: '#38BDF8', mood: 'clean_trust' }
      : { primaryColor: '#0F172A', accentColor: '#D4AF37', mood: 'modern_local' },
    sections: template === 'food'
      ? ['hero', 'about', 'menu', 'gallery', 'hours', 'location', 'contact']
      : ['hero', 'about', 'benefits', 'services', 'gallery', 'hours', 'contact'],
    copy: {
      headline: template === 'food'
        ? `${businessName} — menu, atmosphere and easy ordering`
        : template === 'technical'
        ? `${businessName} — trust, clarity and direct contact`
        : `${businessName} — services, photos and booking in one page`,
      subheadline,
      primaryCta: hasBooking ? 'Book now' : hasWhatsapp ? 'Message on WhatsApp' : 'Contact us',
      secondaryCta: hasMenu ? 'View menu' : 'View services',
    },
    photoRoles: {
      hero: photos[0] ? 'photo_1' : null,
      about: photos[1] ? 'photo_2' : null,
      gallery: photos.slice(2).map((_, index) => `photo_${index + 3}`),
    },
    recommendations: [
      photos.length >= 3 ? 'Use the strongest photo as the hero and keep the rest as visual proof.' : 'Add more real photos to make the landing feel more trustworthy.',
      hasWhatsapp ? 'Keep WhatsApp visible as the fastest conversion action.' : 'Add WhatsApp if you want faster customer conversations.',
      hasMenu ? 'Show menu highlights before the gallery so customers decide faster.' : 'Keep services clear and easy to scan before the contact section.',
    ],
  }
}

function sanitizeConfig(config: any, fallback: ReturnType<typeof buildFallbackConfig>) {
  const template = ['food', 'service', 'technical'].includes(config?.template) ? config.template : fallback.template
  const sections = Array.isArray(config?.sections)
    ? config.sections.filter((section: string) => allowedSections.includes(section)).slice(0, 10)
    : fallback.sections
  const normalizePhotoRole = (value: unknown, fallbackValue: string | null) => {
    if (typeof value !== 'string') return fallbackValue
    return /^photo_\d+$/.test(value) ? value : fallbackValue
  }
  const normalizeGalleryRoles = (value: unknown, fallbackValue: string[]) => {
    if (!Array.isArray(value)) return fallbackValue
    const validRoles = value
      .map((item) => String(item))
      .filter((item) => /^photo_\d+$/.test(item))
      .slice(0, 5)
    return validRoles.length ? validRoles : fallbackValue
  }

  return {
    template,
    style: {
      primaryColor: validHex(config?.style?.primaryColor) ? config.style.primaryColor : fallback.style.primaryColor,
      accentColor: validHex(config?.style?.accentColor) ? config.style.accentColor : fallback.style.accentColor,
      mood: String(config?.style?.mood || fallback.style.mood).slice(0, 40),
    },
    sections: sections.length >= 5 ? sections : fallback.sections,
    copy: {
      headline: String(config?.copy?.headline || fallback.copy.headline).slice(0, 140),
      subheadline: String(config?.copy?.subheadline || fallback.copy.subheadline).slice(0, 260),
      primaryCta: String(config?.copy?.primaryCta || fallback.copy.primaryCta).slice(0, 40),
      secondaryCta: String(config?.copy?.secondaryCta || fallback.copy.secondaryCta).slice(0, 40),
    },
    photoRoles: {
      hero: normalizePhotoRole(config?.photoRoles?.hero, fallback.photoRoles.hero),
      about: normalizePhotoRole(config?.photoRoles?.about, fallback.photoRoles.about),
      gallery: normalizeGalleryRoles(config?.photoRoles?.gallery, fallback.photoRoles.gallery),
    },
    recommendations: Array.isArray(config?.recommendations) ? config.recommendations.slice(0, 6).map((item: unknown) => String(item).slice(0, 180)) : fallback.recommendations,
  }
}

function validHex(value: unknown) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

function normalizeGenerationType(value: unknown): GenerationType {
  return value === 'full_redesign' || value === 'menu_ocr' || value === 'copy_update' ? value : 'initial_preview'
}

async function createGenerationLog({ ownerEmail, body, photos, generationType, costCents }: { ownerEmail: string | null; body: SetupPayload; photos: string[]; generationType: GenerationType; costCents: number }) {
  try {
    const db = createServiceClient()
    const { data } = await db
      .from('ai_generation_logs')
      .insert({
        generation_type: generationType === 'initial_preview' ? 'page_config' : generationType,
        model: DEFAULT_MODEL,
        status: 'processing',
        image_count: photos.length,
        cost_cents: costCents,
        input_summary: {
          ownerEmail,
          businessName: body.businessName ?? null,
          category: body.category ?? null,
          hasDescription: Boolean(body.description),
          hasBookingUrl: Boolean(body.bookingUrl),
          hasWhatsappNumber: Boolean(body.whatsappNumber),
          photoCount: photos.length,
          billable: costCents > 0,
        },
      })
      .select('id')
      .single()
    return data?.id ?? null
  } catch (err) {
    console.error('AI generation log create skipped:', err)
    return null
  }
}

async function completeGenerationLog(logId: string | null, config: unknown, source: string) {
  if (!logId) return
  try {
    const db = createServiceClient()
    await db
      .from('ai_generation_logs')
      .update({
        status: 'succeeded',
        output_config: { source, config },
        completed_at: new Date().toISOString(),
      })
      .eq('id', logId)
  } catch (err) {
    console.error('AI generation log complete skipped:', err)
  }
}
