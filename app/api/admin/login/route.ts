import { NextRequest, NextResponse } from 'next/server'
import { clearAdminCookie, setAdminCookie, verifyAdminPassword } from '@/lib/admin-auth'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = rateLimit(rateLimitKey(req, 'admin-login'), { limit: 6, windowMs: 15 * 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many login attempts' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  const { password } = await req.json()
  const result = await verifyAdminPassword(String(password ?? ''))

  if (!result.configured) {
    return NextResponse.json({ error: 'Owner password is not configured.' }, { status: 500 })
  }

  if (!result.valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  try {
    await setAdminCookie()
  } catch {
    return NextResponse.json({ error: 'Owner session secret is not configured.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearAdminCookie()
  return NextResponse.json({ ok: true })
}
