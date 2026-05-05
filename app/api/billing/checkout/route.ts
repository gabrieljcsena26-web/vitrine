import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getBaseUrl, isEmail } from '@/lib/utils'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
  : null

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(rateLimitKey(req, 'billing-checkout'), { limit: 10, windowMs: 10 * 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many checkout attempts' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const plan = String(body?.plan ?? 'starter').toLowerCase()
  const ownerEmail = String(body?.email ?? '').trim().toLowerCase()
  const priceId = PRICE_IDS[plan]

  if (!priceId || !['starter', 'pro'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid or unconfigured plan.' }, { status: 400 })
  }

  if (!ownerEmail || !isEmail(ownerEmail)) {
    return NextResponse.json({ error: 'A valid email is required for checkout.' }, { status: 400 })
  }

  const baseUrl = getBaseUrl()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: ownerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/billing?cancelled=1`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: {
      ownerEmail,
      plan,
      product: 'vitrine',
    },
    subscription_data: {
      metadata: {
        ownerEmail,
        plan,
        product: 'vitrine',
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
