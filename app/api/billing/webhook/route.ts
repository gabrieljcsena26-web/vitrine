import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
  : null

async function updateBillingState({
  ownerEmail,
  plan,
  status,
  customerId,
  subscriptionId,
}: {
  ownerEmail: string
  plan: string
  status: string
  customerId?: string | null
  subscriptionId?: string | null
}) {
  if (!ownerEmail) return
  const db = createServiceClient()
  const fullUpdate = {
    plan,
    subscription_status: status,
    billing_provider: 'stripe',
    billing_customer_id: customerId ?? null,
    billing_subscription_id: subscriptionId ?? null,
  }

  let { error } = await db
    .from('businesses')
    .update(fullUpdate)
    .eq('owner_email', ownerEmail)

  if (error && (
    error.message?.includes('subscription_status') ||
    error.message?.includes('billing_provider') ||
    error.message?.includes('billing_customer_id') ||
    error.message?.includes('billing_subscription_id')
  )) {
    const fallback = await db
      .from('businesses')
      .update({ plan })
      .eq('owner_email', ownerEmail)
    error = fallback.error
  }

  if (error) throw error
}

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 })
  }

  const rawBody = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid signature.' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const ownerEmail = String(session.metadata?.ownerEmail || session.customer_details?.email || '').toLowerCase()
      const plan = String(session.metadata?.plan || 'starter').toLowerCase()
      await updateBillingState({
        ownerEmail,
        plan,
        status: 'active',
        customerId: typeof session.customer === 'string' ? session.customer : null,
        subscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
      })
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const ownerEmail = String(subscription.metadata?.ownerEmail || '').toLowerCase()
      const plan = String(subscription.metadata?.plan || 'starter').toLowerCase()
      await updateBillingState({
        ownerEmail,
        plan,
        status: subscription.status,
        customerId: typeof subscription.customer === 'string' ? subscription.customer : null,
        subscriptionId: subscription.id,
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook handling error:', err)
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }
}
