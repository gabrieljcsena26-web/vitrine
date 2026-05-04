import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { clearAdminCookie, getAdminPassword, setAdminCookie } from '@/lib/admin-auth'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue)
  const right = Buffer.from(rightValue)
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(rateLimitKey(req, 'admin-login'), { limit: 6, windowMs: 15 * 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many login attempts' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  const { password } = await req.json()
  const expected = getAdminPassword()

  if (!expected) {
    return NextResponse.json({ error: 'Developer password is not configured.' }, { status: 500 })
  }

  if (!safeEqual(String(password ?? ''), expected)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  try {
    await setAdminCookie()
  } catch {
    return NextResponse.json({ error: 'Developer session secret is not configured.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearAdminCookie()
  return NextResponse.json({ ok: true })
}
