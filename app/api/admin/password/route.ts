import { NextRequest, NextResponse } from 'next/server'
import {
  isAdminAuthenticated,
  setAdminCookie,
  setStoredAdminPassword,
  verifyAdminPassword,
  verifyOwnerSetupCode,
} from '@/lib/admin-auth'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = rateLimit(rateLimitKey(req, 'owner-password'), { limit: 8, windowMs: 15 * 60_000 })
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Too many password attempts' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  const body = await req.json().catch(() => null)
  const currentPassword = String(body?.currentPassword ?? '')
  const setupCode = String(body?.setupCode ?? '')
  const newPassword = String(body?.newPassword ?? '')

  if (newPassword.length < 12) {
    return NextResponse.json({ error: 'New password must have at least 12 characters.' }, { status: 400 })
  }

  const hasSession = await isAdminAuthenticated()
  const hasSetupCode = verifyOwnerSetupCode(setupCode)
  const passwordCheck = currentPassword ? await verifyAdminPassword(currentPassword) : { valid: false }

  if (!hasSession && !hasSetupCode && !passwordCheck.valid) {
    return NextResponse.json({ error: 'Use the current owner password or VITRINE_OWNER_SETUP_CODE to change it.' }, { status: 401 })
  }

  try {
    await setStoredAdminPassword(newPassword)
    await setAdminCookie()
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not update owner password.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}