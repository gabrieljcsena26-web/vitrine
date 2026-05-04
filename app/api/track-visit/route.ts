import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const MAX_SOURCE_LENGTH = 120

// POST /api/track-visit — log a page view or click event for a business
// Body: { businessId: string, via?: string, eventType?: 'visit' | 'booking_click' | 'whatsapp_click' }
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'track-visit'), { limit: 120, windowMs: 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const { businessId, via, eventType } = await req.json()
    const cleanBusinessId = String(businessId ?? '').trim()
    const cleanVia = via ? String(via).trim().slice(0, MAX_SOURCE_LENGTH) : null

    if (!cleanBusinessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    const allowedTypes = ['visit', 'booking_click', 'whatsapp_click']
    const resolvedType = allowedTypes.includes(eventType) ? eventType : 'visit'

    const db = createServiceClient()
    const { error } = await db.from('page_views').insert({
      business_id: cleanBusinessId,
      via: cleanVia,
      event_type: resolvedType,
    })

    if (error) {
      console.error('track-visit error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/track-visit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
