import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isHttpUrl, isEmail } from '@/lib/utils'

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
  business: 999,
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

// GET /api/dashboard/[token] — return stats for the owner dashboard
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const range = req.nextUrl.searchParams.get('range') ?? '30d'
  const rangeDays = range === '7d' ? 7 : range === '90d' ? 90 : range === 'all' ? null : 30
  const since = rangeDays ? new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString() : null

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const db = createServiceClient()

  // Look up business by secret token
  const baseBusinessSelect = 'id, slug, owner_name, owner_email, category, created_at, booking_url, whatsapp_number'
  const businessResult = await db
    .from('businesses')
    .select(`${baseBusinessSelect}, whatsapp_message, plan`)
    .eq('secret_token', token)
    .single()

  let business: any = businessResult.data
  let bizError = businessResult.error

  if (bizError && (bizError.message?.includes('whatsapp_message') || bizError.message?.includes('plan'))) {
    const fallback = await db
      .from('businesses')
      .select(baseBusinessSelect)
      .eq('secret_token', token)
      .single()

    business = fallback.data
    bizError = fallback.error
  }

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
      createdAt: business.created_at,
      bookingUrl: business.booking_url ?? null,
      whatsappNumber: business.whatsapp_number ?? null,
      whatsappMessage: business.whatsapp_message ?? null,
      plan,
    },
    pageUsage: {
      plan,
      pagesUsed: pagesUsed ?? 1,
      pageLimit,
      canCreateMore: pageLimit === 999 || (pagesUsed ?? 1) < pageLimit,
    },
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

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const body = await req.json()
  const { bookingUrl, whatsappNumber, whatsappMessage } = body

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

  const db = createServiceClient()

  const updates: Record<string, string | null> = {}
  if (bookingUrl !== undefined) updates.booking_url = bookingUrl ?? null
  if (whatsappNumber !== undefined) updates.whatsapp_number = whatsappNumber ?? null
  if (whatsappMessage !== undefined) updates.whatsapp_message = whatsappMessage ? String(whatsappMessage).trim() : null

  let { error } = await db
    .from('businesses')
    .update(updates)
    .eq('secret_token', token)

  if (error && error.message?.includes('whatsapp_message')) {
    const fallbackUpdates = { ...updates }
    delete fallbackUpdates.whatsapp_message
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
