import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const ALLOWED_STATUSES = new Set(['new', 'contacted', 'won', 'lost'])

// PATCH /api/dashboard/[token]/leads/[leadId] — update lead status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; leadId: string }> }
) {
  const { token, leadId } = await params
  const limited = rateLimit(rateLimitKey(req, 'dashboard-lead', token), { limit: 60, windowMs: 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  const { status } = await req.json()
  const nextStatus = String(status ?? '').toLowerCase()

  if (!ALLOWED_STATUSES.has(nextStatus)) {
    return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: business, error: bizError } = await db
    .from('businesses')
    .select('id')
    .eq('secret_token', token)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await db
    .from('leads')
    .update({ status: nextStatus })
    .eq('id', leadId)
    .eq('business_id', business.id)

  if (error) {
    if (error.message?.includes('status')) {
      return NextResponse.json({ error: 'Run the leads status migration in Supabase first.' }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: nextStatus })
}
