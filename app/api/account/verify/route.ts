import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { setCustomerSessionCookie } from '@/lib/customer-auth'
import { verifyPassword } from '@/lib/password-auth'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'
import { isEmail } from '@/lib/utils'

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

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'account-verify'), { limit: 10, windowMs: 15 * 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const { email, code } = await req.json()
    const normalizedEmail = String(email ?? '').trim().toLowerCase()
    const cleanCode = String(code ?? '').trim()

    if (!isEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json({ error: 'Enter the 6-digit confirmation code.' }, { status: 400 })
    }

    const db = createServiceClient()
    const { data: verification, error: verificationError } = await db
      .from('account_verifications')
      .select('email, code_hash, code_salt, password_hash, password_salt, attempts, expires_at')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (verificationError) return NextResponse.json({ error: verificationError.message }, { status: 500 })
    if (!verification) return NextResponse.json({ error: 'Start the account creation again to receive a new code.' }, { status: 404 })

    if (new Date(verification.expires_at).getTime() < Date.now()) {
      await db.from('account_verifications').delete().eq('email', normalizedEmail)
      return NextResponse.json({ error: 'This code expired. Please request a new one.' }, { status: 410 })
    }

    if ((verification.attempts ?? 0) >= 5) {
      await db.from('account_verifications').delete().eq('email', normalizedEmail)
      return NextResponse.json({ error: 'Too many incorrect codes. Please request a new one.' }, { status: 429 })
    }

    if (!verifyPassword(cleanCode, verification.code_salt, verification.code_hash)) {
      await db
        .from('account_verifications')
        .update({ attempts: (verification.attempts ?? 0) + 1 })
        .eq('email', normalizedEmail)
      return NextResponse.json({ error: 'Invalid confirmation code.' }, { status: 401 })
    }

    const { error: accountError } = await db
      .from('owner_accounts')
      .upsert({
        email: normalizedEmail,
        password_hash: verification.password_hash,
        password_salt: verification.password_salt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })

    if (accountError) return NextResponse.json({ error: accountError.message }, { status: 500 })

    await db.from('account_verifications').delete().eq('email', normalizedEmail)

    const response = NextResponse.json({
      ok: true,
      email: normalizedEmail,
      dashboards: await getDashboards(normalizedEmail),
    })
    setCustomerSessionCookie(response, normalizedEmail)
    return response
  } catch (err) {
    console.error('POST /api/account/verify error:', err)
    if (err instanceof Error && err.message.startsWith('Missing environment variable:')) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
