import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateCampaignSlug, getBaseUrl } from '@/lib/utils'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

// GET/POST /api/dashboard/[token]/channels — owner tracking channels
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const db = createServiceClient()

  const { data: business, error: bizError } = await db
    .from('businesses')
    .select('id, slug')
    .eq('secret_token', token)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await db
    .from('channels')
    .select('id, name, slug, created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (error) {
    if (error.message?.includes('channels')) {
      return NextResponse.json({ channels: [] })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const baseUrl = getBaseUrl()
  return NextResponse.json({
    channels: (data ?? []).map((channel) => ({
      id: channel.id,
      name: channel.name,
      slug: channel.slug,
      url: `${baseUrl}/p/${business.slug}?via=${channel.slug}`,
      createdAt: channel.created_at,
    })),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const limited = rateLimit(rateLimitKey(req, 'dashboard-channel', token), { limit: 30, windowMs: 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  const { name } = await req.json()
  const channelName = String(name ?? '').trim().slice(0, 80)
  const channelSlug = generateCampaignSlug(channelName)

  if (!channelName || !channelSlug) {
    return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: business, error: bizError } = await db
    .from('businesses')
    .select('id, slug')
    .eq('secret_token', token)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await db
    .from('channels')
    .upsert({ business_id: business.id, name: channelName, slug: channelSlug }, { onConflict: 'business_id,slug' })
    .select('id, name, slug, created_at')
    .single()

  if (error || !data) {
    if (error?.message?.includes('channels')) {
      return NextResponse.json({ error: 'Run the channels migration in Supabase first.' }, { status: 500 })
    }
    return NextResponse.json({ error: error?.message ?? 'Could not save channel' }, { status: 500 })
  }

  const baseUrl = getBaseUrl()
  return NextResponse.json({
    channel: {
      id: data.id,
      name: data.name,
      slug: data.slug,
      url: `${baseUrl}/p/${business.slug}?via=${data.slug}`,
      createdAt: data.created_at,
    },
  })
}
