import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isHttpUrl, isEmail } from '@/lib/utils'

// Demo token — when used, the API returns illustrative mock data instead of
// hitting Supabase. This lets anyone preview the dashboard UI at
// /dashboard/demo without having a real account.
const DEMO_TOKEN = 'demo'

function buildDemoPayload() {
  const now = Date.now()
  const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString()
  return {
    business: {
      id: 'demo-business',
      slug: 'studio-bella',
      ownerName: 'Maria Silva',
      ownerEmail: 'maria@studiobella.com',
      category: 'Salão de Beleza',
      createdAt: hoursAgo(24 * 21),
      bookingUrl: 'https://calendly.com/studio-bella',
      whatsappNumber: '+5511999998888',
      whatsappMessage: 'Olá! Vim pelo site e gostaria de agendar.',
    },
    stats: {
      totalViews: 248,
      bookingClicks: 37,
      whatsappClicks: 52,
      totalLeads: 18,
      leadsThisWeek: 6,
    },
    viewsBySource: [
      { source: 'instagram', count: 112 },
      { source: 'whatsapp', count: 64 },
      { source: 'Direct', count: 41 },
      { source: 'google', count: 31 },
    ],
    leads: [
      { id: 'demo-1', visitor_name: 'Ana Costa', visitor_email: 'ana@email.com', message: 'Quero agendar corte e escova pra sábado.', via: 'instagram', submitted_at: hoursAgo(3) },
      { id: 'demo-2', visitor_name: 'João Pereira', visitor_email: 'joao@email.com', message: 'Vocês fazem barba também?', via: 'whatsapp', submitted_at: hoursAgo(26) },
      { id: 'demo-3', visitor_name: 'Carla Mendes', visitor_email: 'carla@email.com', message: 'Tem horário na quinta de manhã?', via: 'instagram', submitted_at: hoursAgo(50) },
      { id: 'demo-4', visitor_name: 'Pedro Alves', visitor_email: 'pedro@email.com', message: 'Quanto custa a escova progressiva?', via: 'google', submitted_at: hoursAgo(74) },
      { id: 'demo-5', visitor_name: 'Beatriz Lima', visitor_email: 'bia@email.com', message: 'Atendem aos domingos?', via: 'instagram', submitted_at: hoursAgo(120) },
    ],
  }
}

// GET /api/dashboard/[token] — return stats for the owner dashboard
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  if (token === DEMO_TOKEN) {
    return NextResponse.json(buildDemoPayload())
  }

  const db = createServiceClient()

  // Look up business by secret token
  const { data: business, error: bizError } = await db
    .from('businesses')
    .select('id, slug, owner_name, owner_email, category, created_at, booking_url, whatsapp_number, whatsapp_message')
    .eq('secret_token', token)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const businessId = business.id

  // Total page views
  const { count: totalViews } = await db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', 'visit')

  // Booking button clicks
  const { count: bookingClicks } = await db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', 'booking_click')

  // WhatsApp button clicks
  const { count: whatsappClicks } = await db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', 'whatsapp_click')

  // Total leads
  const { count: totalLeads } = await db
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)

  // Leads this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: leadsThisWeek } = await db
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('submitted_at', oneWeekAgo)

  // Views by source (only real visits, not clicks)
  const { data: viewRows } = await db
    .from('page_views')
    .select('via')
    .eq('business_id', businessId)
    .eq('event_type', 'visit')

  const sourceMap: Record<string, number> = {}
  for (const row of viewRows ?? []) {
    const key = row.via ?? 'Direct'
    sourceMap[key] = (sourceMap[key] ?? 0) + 1
  }
  const viewsBySource = Object.entries(sourceMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  // Leads list (newest first, max 100)
  const { data: leads } = await db
    .from('leads')
    .select('id, visitor_name, visitor_email, message, via, submitted_at')
    .eq('business_id', businessId)
    .order('submitted_at', { ascending: false })
    .limit(100)

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
    },
    stats: {
      totalViews: totalViews ?? 0,
      bookingClicks: bookingClicks ?? 0,
      whatsappClicks: whatsappClicks ?? 0,
      totalLeads: totalLeads ?? 0,
      leadsThisWeek: leadsThisWeek ?? 0,
    },
    viewsBySource,
    leads: leads ?? [],
  })
}

// PATCH /api/dashboard/[token] — update mutable fields (booking_url, whatsapp_number)
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

  // Validate whatsappMessage: free text, max 500 chars
  if (whatsappMessage !== null && whatsappMessage !== undefined && whatsappMessage !== '') {
    if (String(whatsappMessage).trim().length > 500) {
      return NextResponse.json(
        { error: 'whatsappMessage must be 500 characters or fewer' },
        { status: 400 }
      )
    }
  }

  // Demo mode: validate input but do not persist anything.
  if (token === DEMO_TOKEN) {
    return NextResponse.json({ ok: true, demo: true })
  }

  const db = createServiceClient()

  const updates: Record<string, string | null> = {}
  if (bookingUrl !== undefined) updates.booking_url = bookingUrl ?? null
  if (whatsappNumber !== undefined) updates.whatsapp_number = whatsappNumber ?? null
  if (whatsappMessage !== undefined) updates.whatsapp_message = whatsappMessage ?? null

  const { error } = await db
    .from('businesses')
    .update(updates)
    .eq('secret_token', token)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
