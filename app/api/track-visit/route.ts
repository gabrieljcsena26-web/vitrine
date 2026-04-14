import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/track-visit — log a page view for a business
// Body: { businessId: string, via?: string }
export async function POST(req: NextRequest) {
  try {
    const { businessId, via } = await req.json()

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    const db = createServiceClient()
    const { error } = await db.from('page_views').insert({
      business_id: businessId,
      via: via || null,
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
