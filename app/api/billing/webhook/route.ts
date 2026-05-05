import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl } from '@/lib/utils'
import { EMAIL_FROM } from '@/lib/email'
import { Resend } from 'resend'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
  : null
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
  const isPublishable = status === 'active' || status === 'trialing'
  const fullUpdate = {
    plan,
    subscription_status: status,
    billing_provider: 'stripe',
    billing_customer_id: customerId ?? null,
    billing_subscription_id: subscriptionId ?? null,
    published_at: isPublishable ? new Date().toISOString() : null,
  }

  let { error } = await db
    .from('businesses')
    .update(fullUpdate)
    .eq('owner_email', ownerEmail)

  if (error && (
    error.message?.includes('subscription_status') ||
    error.message?.includes('billing_provider') ||
    error.message?.includes('billing_customer_id') ||
    error.message?.includes('billing_subscription_id') ||
    error.message?.includes('published_at')
  )) {
    const fallback = await db
      .from('businesses')
      .update({ plan })
      .eq('owner_email', ownerEmail)
    error = fallback.error
  }

  if (error) throw error
}

async function sendPaymentWelcomeEmail(ownerEmail: string, plan: string) {
  if (!resend || !ownerEmail) return

  const db = createServiceClient()
  const { data: business } = await db
    .from('businesses')
    .select('owner_name, slug, secret_token')
    .eq('owner_email', ownerEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const baseUrl = getBaseUrl()
  const normalizedPlan = plan === 'pro' ? 'Pro' : 'Starter'
  const cadence = plan === 'pro' ? 'weekly' : 'every 14 days'
  const pageUrl = business?.slug ? `${baseUrl}/p/${business.slug}` : `${baseUrl}/dashboard`
  const dashboardUrl = business?.secret_token ? `${baseUrl}/dashboard/${business.secret_token}` : `${baseUrl}/login`
  const ownerName = business?.owner_name || 'there'

  await resend.emails.send({
    from: EMAIL_FROM,
    to: ownerEmail,
    subject: `Payment confirmed — welcome to Vitrine ${normalizedPlan}`,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0F172A;max-width:560px;margin:0 auto">
        <p style="margin:0 0 10px;color:#D4AF37;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em">Payment confirmed</p>
        <h1 style="margin:0 0 12px;font-size:24px;color:#0F172A">Welcome to Vitrine ${escapeHtml(normalizedPlan)}, ${escapeHtml(ownerName)}.</h1>
        <p style="margin:0 0 18px;color:#475569;line-height:1.6">Your secure Stripe payment was confirmed. Your Vitrine page and dashboard are ready to use.</p>

        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:18px;margin:0 0 14px">
          <p style="margin:0 0 6px;font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Your plan</p>
          <p style="margin:0;font-size:18px;font-weight:800;color:#0F172A">${escapeHtml(normalizedPlan)}</p>
          <p style="margin:8px 0 0;color:#475569;font-size:14px">You will receive performance reports ${cadence}, including visits, leads, QR/channel activity and practical recommendations.</p>
        </div>

        <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:16px;padding:18px;margin:0 0 20px">
          <p style="margin:0 0 8px;font-size:12px;color:#92400E;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Next steps</p>
          <ol style="margin:0;padding-left:18px;color:#475569;line-height:1.7;font-size:14px">
            <li>Open your public page and review the final details.</li>
            <li>Share your link on Instagram, WhatsApp and Google Business.</li>
            <li>Create tracked QR/campaign links in the dashboard.</li>
            <li>Watch leads, visits and intent actions from the dashboard.</li>
          </ol>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin:0 0 22px">
          <a href="${dashboardUrl}" style="display:inline-block;background:#D4AF37;color:#0F172A;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:999px">Open dashboard</a>
          <a href="${pageUrl}" style="display:inline-block;background:#0F172A;color:#FFFFFF;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:999px">View public page</a>
        </div>

        <p style="margin:0;color:#94A3B8;font-size:12px;line-height:1.6">Card details are handled by Stripe. Vitrine never stores card number, CVC or banking data.</p>
      </div>
    `,
  })
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
      await sendPaymentWelcomeEmail(ownerEmail, plan)
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

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
