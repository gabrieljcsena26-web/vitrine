import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isHttpUrl, isEmail } from '@/lib/utils'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
}

const normalizePlan = (plan: unknown) => {
  const value = String(plan || 'starter').toLowerCase()
  return value in PLAN_LIMITS ? value : 'starter'
}

const normalizeSource = (source: string | null) => {
  const value = (source ?? 'direct').toLowerCase()
  if (value.startsWith('instagram')) return 'instagram'
  if (value.startsWith('whatsapp')) return 'whatsapp'
  if (value.startsWith('google')) return 'google'
  if (value.includes('qr') || value.includes('flyer')) return 'qr-code'
  return value || 'direct'
}

const missingColumnError = (error: { code?: string; message?: string } | null) => (
  error?.code === '42703' ||
  Boolean(error?.message?.includes('does not exist')) ||
  Boolean(error?.message?.includes('schema cache'))
)

const businessSelects = [
  'id, slug, owner_name, owner_email, category, description, address, services, photos, created_at, booking_url, whatsapp_number, menu_url, menu_image_url, whatsapp_message, plan',
  'id, slug, owner_name, owner_email, category, description, address, services, photos, created_at, booking_url, whatsapp_number, whatsapp_message, plan',
  'id, slug, owner_name, owner_email, category, description, address, services, photos, created_at, booking_url, whatsapp_number, whatsapp_message',
  'id, slug, owner_name, owner_email, category, description, address, photos, created_at, booking_url, whatsapp_number, whatsapp_message',
  'id, slug, owner_name, owner_email, category, description, address, created_at, booking_url, whatsapp_number, whatsapp_message',
  'id, slug, owner_name, owner_email, category, created_at, booking_url, whatsapp_number, whatsapp_message',
  'id, slug, owner_name, owner_email, category, created_at, booking_url, whatsapp_number',
  'id, slug, owner_name, owner_email, category, created_at',
]

async function findBusinessByToken(db: ReturnType<typeof createServiceClient>, token: string): Promise<{ business: any | null; error: any | null }> {
  let lastError = null

  for (const select of businessSelects) {
    const result = await db
      .from('businesses')
      .select(select)
      .eq('secret_token', token)
      .single()

    if (!result.error) return { business: result.data, error: null }
    lastError = result.error
    if (!missingColumnError(result.error)) break
  }

  return { business: null, error: lastError }
}

async function findOwnerPages(db: ReturnType<typeof createServiceClient>, ownerEmail: string): Promise<any[]> {
  for (const select of businessSelects) {
    const result = await db
      .from('businesses')
      .select(select)
      .eq('owner_email', ownerEmail)
      .order('created_at', { ascending: false })

    if (!result.error) return (result.data ?? []) as any[]
    if (!missingColumnError(result.error)) break
  }

  return []
}

async function getOwnerPageStats(db: ReturnType<typeof createServiceClient>, businessIds: string[], since: string | null) {
  const statsByPage: Record<string, { totalViews: number; bookingClicks: number; whatsappClicks: number; totalLeads: number; leadsThisWeek: number }> = {}
  for (const id of businessIds) {
    statsByPage[id] = { totalViews: 0, bookingClicks: 0, whatsappClicks: 0, totalLeads: 0, leadsThisWeek: 0 }
  }

  if (businessIds.length === 0) return statsByPage

  let ownerViewsQuery = db
    .from('page_views')
    .select('business_id, event_type')
    .in('business_id', businessIds)
  if (since) ownerViewsQuery = ownerViewsQuery.gte('visited_at', since)
  const { data: ownerViews } = await ownerViewsQuery

  for (const view of ownerViews ?? []) {
    const pageStats = statsByPage[view.business_id]
    if (!pageStats) continue
    if (view.event_type === 'booking_click') pageStats.bookingClicks += 1
    else if (view.event_type === 'whatsapp_click') pageStats.whatsappClicks += 1
    else pageStats.totalViews += 1
  }

  let ownerLeadsQuery = db
    .from('leads')
    .select('business_id, submitted_at')
    .in('business_id', businessIds)
  if (since) ownerLeadsQuery = ownerLeadsQuery.gte('submitted_at', since)
  const { data: ownerLeads } = await ownerLeadsQuery
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  for (const lead of ownerLeads ?? []) {
    const pageStats = statsByPage[lead.business_id]
    if (!pageStats) continue
    pageStats.totalLeads += 1
    if (new Date(lead.submitted_at).getTime() >= oneWeekAgo) pageStats.leadsThisWeek += 1
  }

  return statsByPage
}

// GET /api/dashboard/[token] — return stats for the owner dashboard
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const limited = rateLimit(rateLimitKey(req, 'dashboard-get', token), { limit: 120, windowMs: 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  const range = req.nextUrl.searchParams.get('range') ?? '30d'
  const rangeDays = range === '7d' ? 7 : range === '90d' ? 90 : range === 'all' ? null : 30
  const since = rangeDays ? new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString() : null

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const db = createServiceClient()

  // Look up business by secret token. Some deployments may not have every new
  // optional column yet, so progressively retry with older schema shapes.
  const { business, error: bizError } = await findBusinessByToken(db, token)

  if (bizError || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const businessId = business.id
  const plan = normalizePlan(business.plan || (business.owner_email === 'test@vitrine.local' ? 'pro' : 'starter'))
  const pageLimit = PLAN_LIMITS[plan]

  const { count: pagesUsed } = await db
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('owner_email', business.owner_email)

  const ownerPages = await findOwnerPages(db, business.owner_email)
  const ownerPageStats = await getOwnerPageStats(db, ownerPages.map((page) => page.id).filter(Boolean), since)

  // Total page views
  let totalViewsQuery = db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', 'visit')
  if (since) totalViewsQuery = totalViewsQuery.gte('visited_at', since)
  const { count: totalViews } = await totalViewsQuery

  // Booking button clicks
  let bookingClicksQuery = db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', 'booking_click')
  if (since) bookingClicksQuery = bookingClicksQuery.gte('visited_at', since)
  const { count: bookingClicks } = await bookingClicksQuery

  // WhatsApp button clicks
  let whatsappClicksQuery = db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', 'whatsapp_click')
  if (since) whatsappClicksQuery = whatsappClicksQuery.gte('visited_at', since)
  const { count: whatsappClicks } = await whatsappClicksQuery

  // Total leads
  let totalLeadsQuery = db
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
  if (since) totalLeadsQuery = totalLeadsQuery.gte('submitted_at', since)
  const { count: totalLeads } = await totalLeadsQuery

  // Leads this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: leadsThisWeek } = await db
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('submitted_at', oneWeekAgo)

  // Traffic and intent by source
  let viewRowsQuery = db
    .from('page_views')
    .select('via, event_type')
    .eq('business_id', businessId)
  if (since) viewRowsQuery = viewRowsQuery.gte('visited_at', since)
  const { data: viewRows } = await viewRowsQuery

  const sourceMap: Record<string, { count: number; bookingClicks: number; whatsappClicks: number }> = {}
  for (const row of viewRows ?? []) {
    const key = normalizeSource(row.via)
    if (!sourceMap[key]) sourceMap[key] = { count: 0, bookingClicks: 0, whatsappClicks: 0 }
    if (row.event_type === 'booking_click') sourceMap[key].bookingClicks += 1
    else if (row.event_type === 'whatsapp_click') sourceMap[key].whatsappClicks += 1
    else sourceMap[key].count += 1
  }
  const viewsBySource = Object.entries(sourceMap)
    .map(([source, values]) => ({ source, ...values }))
    .sort((a, b) => (b.bookingClicks + b.whatsappClicks) - (a.bookingClicks + a.whatsappClicks) || b.count - a.count)

  // Recent activity timeline: visits and CTA clicks with source and timestamp
  let recentEventsQuery = db
    .from('page_views')
    .select('id, via, event_type, visited_at')
    .eq('business_id', businessId)
    .order('visited_at', { ascending: false })
    .limit(25)
  if (since) recentEventsQuery = recentEventsQuery.gte('visited_at', since)
  const { data: recentEvents } = await recentEventsQuery

  // Leads list (newest first, max 100)
  let leadsQuery = db
    .from('leads')
    .select('id, visitor_name, visitor_email, message, via, status, interest, temperature, submitted_at')
    .eq('business_id', businessId)
    .order('submitted_at', { ascending: false })
    .limit(100)
  if (since) leadsQuery = leadsQuery.gte('submitted_at', since)
  let { data: leads, error: leadsError } = await leadsQuery

  if (leadsError && (leadsError.message?.includes('status') || leadsError.message?.includes('interest') || leadsError.message?.includes('temperature'))) {
    let fallbackLeadsQuery = db
      .from('leads')
      .select('id, visitor_name, visitor_email, message, via, submitted_at')
      .eq('business_id', businessId)
      .order('submitted_at', { ascending: false })
      .limit(100)
    if (since) fallbackLeadsQuery = fallbackLeadsQuery.gte('submitted_at', since)
    const fallback = await fallbackLeadsQuery
    leads = (fallback.data ?? []).map((lead) => ({
      ...lead,
      status: 'new',
      interest: null,
      temperature: null,
    }))
  }

  return NextResponse.json({
    business: {
      id: business.id,
      slug: business.slug,
      ownerName: business.owner_name,
      ownerEmail: business.owner_email,
      category: business.category,
      description: business.description ?? '',
      address: business.address ?? '',
      services: Array.isArray(business.services) ? business.services : [],
      photos: Array.isArray(business.photos) ? business.photos : [],
      createdAt: business.created_at,
      bookingUrl: business.booking_url ?? null,
      whatsappNumber: business.whatsapp_number ?? null,
      whatsappMessage: business.whatsapp_message ?? null,
      menuUrl: business.menu_url ?? null,
      menuImageUrl: business.menu_image_url ?? null,
      plan,
    },
    pageUsage: {
      plan,
      pagesUsed: pagesUsed ?? 1,
      pageLimit,
      canCreateMore: (pagesUsed ?? 1) < pageLimit,
    },
    pages: ownerPages.map((page) => ({
      id: page.id,
      slug: page.slug,
      ownerName: page.owner_name,
      category: page.category,
      createdAt: page.created_at,
      bookingUrl: page.booking_url ?? null,
      whatsappNumber: page.whatsapp_number ?? null,
      menuUrl: page.menu_url ?? null,
      plan: normalizePlan(page.plan || plan),
      isCurrent: page.id === business.id,
      stats: ownerPageStats[page.id] ?? { totalViews: 0, bookingClicks: 0, whatsappClicks: 0, totalLeads: 0, leadsThisWeek: 0 },
    })),
    stats: {
      totalViews: totalViews ?? 0,
      bookingClicks: bookingClicks ?? 0,
      whatsappClicks: whatsappClicks ?? 0,
      totalLeads: totalLeads ?? 0,
      leadsThisWeek: leadsThisWeek ?? 0,
    },
    range,
    viewsBySource,
    recentEvents: (recentEvents ?? []).map((event) => ({
      id: event.id,
      source: normalizeSource(event.via),
      eventType: event.event_type ?? 'visit',
      visitedAt: event.visited_at,
    })),
    leads: leads ?? [],
  })
}

// PATCH /api/dashboard/[token] — update mutable fields (booking_url, whatsapp_number, whatsapp_message)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const limited = rateLimit(rateLimitKey(req, 'dashboard-patch', token), { limit: 30, windowMs: 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const body = await req.json()
  const { bookingUrl, whatsappNumber, whatsappMessage, menuUrl, menuImageUrl, description, address, photos, services } = body

  // Validate bookingUrl: only allow http/https URLs or plain email addresses
  if (bookingUrl !== null && bookingUrl !== undefined && bookingUrl !== '') {
    if (!isHttpUrl(String(bookingUrl)) && !isEmail(String(bookingUrl))) {
      return NextResponse.json(
        { error: 'bookingUrl must be a valid http/https URL or email address' },
        { status: 400 }
      )
    }
  }

  // Validate whatsappNumber: digits, +, spaces, dashes only
  if (whatsappNumber !== null && whatsappNumber !== undefined && whatsappNumber !== '') {
    if (!/^\+?[\d\s\-().]{7,20}$/.test(String(whatsappNumber))) {
      return NextResponse.json(
        { error: 'whatsappNumber must be a valid phone number' },
        { status: 400 }
      )
    }
  }

  if (whatsappMessage !== null && whatsappMessage !== undefined && whatsappMessage !== '') {
    if (String(whatsappMessage).trim().length > 500) {
      return NextResponse.json(
        { error: 'whatsappMessage must be 500 characters or fewer' },
        { status: 400 }
      )
    }
  }

  if (menuUrl !== null && menuUrl !== undefined && menuUrl !== '') {
    if (!isHttpUrl(String(menuUrl))) {
      return NextResponse.json({ error: 'menuUrl must be a valid http/https URL' }, { status: 400 })
    }
  }

  if (description !== null && description !== undefined && String(description).trim().length > 2000) {
    return NextResponse.json({ error: 'description must be 2000 characters or fewer' }, { status: 400 })
  }

  if (address !== null && address !== undefined && String(address).trim().length > 240) {
    return NextResponse.json({ error: 'address must be 240 characters or fewer' }, { status: 400 })
  }

  if (photos !== null && photos !== undefined) {
    if (!Array.isArray(photos) || photos.length > 12 || photos.some((item) => typeof item !== 'string' || !String(item).trim())) {
      return NextResponse.json({ error: 'photos must be an array of up to 12 image URLs' }, { status: 400 })
    }
  }

  if (services !== null && services !== undefined) {
    if (!Array.isArray(services) || services.length > 12) {
      return NextResponse.json({ error: 'services must be an array of up to 12 items' }, { status: 400 })
    }

    const invalidService = services.some((item) => {
      if (!item || typeof item !== 'object') return true
      const name = typeof item.name === 'string' ? item.name.trim() : ''
      const price = typeof item.price === 'string' ? item.price.trim() : ''
      const serviceDescription = item.description == null ? '' : String(item.description).trim()
      const photo = item.photo == null ? '' : String(item.photo).trim()
      return !name || name.length > 120 || price.length > 80 || serviceDescription.length > 280 || photo.length > 2000
    })

    if (invalidService) {
      return NextResponse.json({ error: 'services contain invalid values' }, { status: 400 })
    }
  }

  const db = createServiceClient()

  const updates: Record<string, unknown> = {}
  if (bookingUrl !== undefined) updates.booking_url = bookingUrl ?? null
  if (whatsappNumber !== undefined) updates.whatsapp_number = whatsappNumber ?? null
  if (whatsappMessage !== undefined) updates.whatsapp_message = whatsappMessage ? String(whatsappMessage).trim() : null
  if (menuUrl !== undefined) updates.menu_url = menuUrl ? String(menuUrl).trim() : null
  if (menuImageUrl !== undefined) updates.menu_image_url = menuImageUrl ? String(menuImageUrl).trim() : null
  if (description !== undefined) updates.description = description ? String(description).trim() : null
  if (address !== undefined) updates.address = address ? String(address).trim() : null
  if (photos !== undefined) updates.photos = photos ?? []
  if (services !== undefined) {
    updates.services = services.map((item: any) => ({
      name: String(item.name).trim(),
      price: item.price ? String(item.price).trim() : '',
      description: item.description ? String(item.description).trim() : '',
      photo: item.photo ? String(item.photo).trim() : '',
    }))
  }

  let { error } = await db
    .from('businesses')
    .update(updates)
    .eq('secret_token', token)

  if (error && (
    error.message?.includes('whatsapp_message') ||
    error.message?.includes('menu_url') ||
    error.message?.includes('menu_image_url') ||
    error.message?.includes('description') ||
    error.message?.includes('address') ||
    error.message?.includes('photos') ||
    error.message?.includes('services')
  )) {
    const fallbackUpdates = { ...updates }
    if (error.message?.includes('whatsapp_message')) delete fallbackUpdates.whatsapp_message
    if (error.message?.includes('menu_url')) delete fallbackUpdates.menu_url
    if (error.message?.includes('menu_image_url')) delete fallbackUpdates.menu_image_url
    if (error.message?.includes('description')) delete fallbackUpdates.description
    if (error.message?.includes('address')) delete fallbackUpdates.address
    if (error.message?.includes('photos')) delete fallbackUpdates.photos
    if (error.message?.includes('services')) delete fallbackUpdates.services
    const fallback = await db
      .from('businesses')
      .update(fallbackUpdates)
      .eq('secret_token', token)

    error = fallback.error
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
