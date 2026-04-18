import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

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
    .select('id, slug, owner_name, owner_email, category, created_at, booking_url')
    .eq('secret_token', token)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const businessId = business.id

  // Total views
  const { count: totalViews } = await db
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)

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

  // Views by source
  const { data: viewRows } = await db
    .from('page_views')
    .select('via')
    .eq('business_id', businessId)

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
    },
    stats: {
      totalViews: totalViews ?? 0,
      totalLeads: totalLeads ?? 0,
      leadsThisWeek: leadsThisWeek ?? 0,
    },
    viewsBySource,
    leads: leads ?? [],
  })
}

// PATCH /api/dashboard/[token] — update mutable fields (booking_url)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const body = await req.json()
  const { bookingUrl } = body

  // Validate: only allow http/https URLs or plain email addresses
  if (bookingUrl !== null && bookingUrl !== undefined && bookingUrl !== '') {
    const isUrl = /^https?:\/\//i.test(String(bookingUrl))
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(bookingUrl))
    if (!isUrl && !isEmail) {
      return NextResponse.json(
        { error: 'bookingUrl must be a valid http/https URL or email address' },
        { status: 400 }
      )
    }
  }

  const db = createServiceClient()

  const { error } = await db
    .from('businesses')
    .update({ booking_url: bookingUrl ?? null })
    .eq('secret_token', token)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
