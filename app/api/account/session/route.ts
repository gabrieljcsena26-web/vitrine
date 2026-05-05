import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { clearCustomerSessionCookie, getCustomerEmailFromRequest } from '@/lib/customer-auth'

async function getDashboards(email: string) {
  const db = createServiceClient()
  const { data } = await db
    .from('businesses')
    .select('owner_name, slug, secret_token, plan, subscription_status, created_at')
    .eq('owner_email', email)
    .order('created_at', { ascending: false })
    .limit(10)

  return (data ?? []).map((business) => ({
    name: business.owner_name,
    slug: business.slug,
    token: business.secret_token,
    plan: business.plan,
    subscriptionStatus: business.subscription_status,
    createdAt: business.created_at,
  }))
}

export async function GET(req: NextRequest) {
  const email = getCustomerEmailFromRequest(req)
  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    email,
    dashboards: await getDashboards(email),
  })
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  clearCustomerSessionCookie(response)
  return response
}
