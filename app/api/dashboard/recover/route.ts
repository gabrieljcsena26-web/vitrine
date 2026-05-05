import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isEmail } from '@/lib/utils'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'
import { verifyPassword } from '@/lib/password-auth'

// POST /api/dashboard/recover — authenticate the owner and return their dashboard pages.
// Body: { email: string, password: string }
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'dashboard-recover'), { limit: 5, windowMs: 15 * 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ ok: true }, { status: 200, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const { email, password } = await req.json()

    if (!email || typeof email !== 'string' || email.trim().length > 254 || !isEmail(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const db = createServiceClient()

    const { data: ownerAccount, error: ownerAccountError } = await db
      .from('owner_accounts')
      .select('email, password_hash, password_salt')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (ownerAccountError) {
      return NextResponse.json({ error: ownerAccountError.message }, { status: 500 })
    }

    if (!ownerAccount || !verifyPassword(password, ownerAccount.password_salt, ownerAccount.password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const { data: businesses } = await db
      .from('businesses')
      .select('owner_name, slug, secret_token, plan, subscription_status, created_at')
      .eq('owner_email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      ok: true,
      dashboards: (businesses ?? []).map((business) => ({
        name: business.owner_name,
        slug: business.slug,
        token: business.secret_token,
        plan: business.plan,
        subscriptionStatus: business.subscription_status,
        createdAt: business.created_at,
      })),
    })
  } catch (err) {
    console.error('POST /api/dashboard/recover error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
