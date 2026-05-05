import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase'
import { hashPassword } from '@/lib/password-auth'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'
import { getBaseUrl, isEmail } from '@/lib/utils'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const CODE_TTL_MINUTES = 15

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'account-signup'), { limit: 5, windowMs: 15 * 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const { email, password, confirmPassword } = await req.json()
    const normalizedEmail = String(email ?? '').trim().toLowerCase()
    const cleanPassword = String(password ?? '')

    if (!isEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    if (cleanPassword.length < 12) {
      return NextResponse.json({ error: 'Create a password with at least 12 characters.' }, { status: 400 })
    }

    if (cleanPassword !== String(confirmPassword ?? '')) {
      return NextResponse.json({ error: 'The passwords do not match.' }, { status: 400 })
    }

    const db = createServiceClient()
    const { data: existingAccount, error: accountError } = await db
      .from('owner_accounts')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (accountError) return NextResponse.json({ error: accountError.message }, { status: 500 })
    if (existingAccount) return NextResponse.json({ error: 'This email already has an account. Please log in instead.' }, { status: 409 })

    const code = String(randomInt(100000, 999999))
    const codeHash = hashPassword(code)
    const passwordHash = hashPassword(cleanPassword)
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString()

    const { error: verificationError } = await db
      .from('account_verifications')
      .upsert({
        email: normalizedEmail,
        code_hash: codeHash.hash,
        code_salt: codeHash.salt,
        password_hash: passwordHash.hash,
        password_salt: passwordHash.salt,
        attempts: 0,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      }, { onConflict: 'email' })

    if (verificationError) return NextResponse.json({ error: verificationError.message }, { status: 500 })

    if (!resend && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Email verification is not configured yet.' }, { status: 500 })
    }

    const verifyLink = `${getBaseUrl()}/login?mode=verify&email=${encodeURIComponent(normalizedEmail)}&code=${encodeURIComponent(code)}`

    if (resend) {
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: normalizedEmail,
        subject: 'Confirm your Vitrine account',
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0F172A;max-width:520px;margin:0 auto">
            <h1 style="font-size:24px;margin:0 0 12px">Welcome to Vitrine</h1>
            <p style="color:#475569;line-height:1.6;margin:0 0 18px">Use this secure code to confirm your account and continue creating your business page.</p>
            <div style="font-size:32px;letter-spacing:8px;font-weight:800;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:18px 22px;text-align:center;margin:0 0 18px">${escapeHtml(code)}</div>
            <a href="${verifyLink}" style="display:inline-block;background:#D4AF37;color:#0F172A;text-decoration:none;font-weight:800;padding:12px 22px;border-radius:999px">Confirm account</a>
            <p style="color:#64748B;font-size:13px;line-height:1.6;margin:20px 0 0">This code expires in ${CODE_TTL_MINUTES} minutes. If you did not request this account, you can ignore this email.</p>
          </div>
        `,
      })
    }

    return NextResponse.json({
      ok: true,
      message: 'We sent a confirmation code to your email.',
      devCode: process.env.NODE_ENV !== 'production' && !resend ? code : undefined,
    })
  } catch (err) {
    console.error('POST /api/account/signup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
