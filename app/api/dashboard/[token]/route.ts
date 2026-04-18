import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isHttpUrl, isEmail } from '@/lib/utils'

// GET /api/dashboard/[token] — return stats for the owner dashboard
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const db = createServiceClient()

  // Look up business by secret token
  const { data: business, error: bizError } = await db
    .from('businesses')
    .select('id, slug, owner_name, owner_email, category, created_at, booking_url, whatsapp_number')
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
  const { bookingUrl, whatsappNumber } = body

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

  const db = createServiceClient()

  const updates: Record<string, string | null> = {}
  if (bookingUrl !== undefined) updates.booking_url = bookingUrl ?? null
  if (whatsappNumber !== undefined) updates.whatsapp_number = whatsappNumber ?? null

  const { error } = await db
    .from('businesses')
    .update(updates)
    .eq('secret_token', token)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
