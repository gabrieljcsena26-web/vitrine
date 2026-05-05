import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

const CUSTOMER_SESSION_COOKIE = 'vitrine_customer_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

type CustomerSessionPayload = {
  email: string
  exp: number
}

const base64UrlEncode = (value: string) => Buffer.from(value, 'utf8').toString('base64url')
const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

function getCustomerSessionSecret() {
  const secret =
    process.env.VITRINE_CUSTOMER_SESSION_SECRET ||
    process.env.VITRINE_OWNER_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET

  if (secret) return secret
  if (process.env.NODE_ENV !== 'production') return 'local-vitrine-customer-session-secret'
  return ''
}

function sign(value: string) {
  return createHmac('sha256', getCustomerSessionSecret()).update(value).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function setCustomerSessionCookie(response: NextResponse, email: string) {
  const secret = getCustomerSessionSecret()
  if (!secret) return response

  const payload: CustomerSessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(encodedPayload)

  response.cookies.set(CUSTOMER_SESSION_COOKIE, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return response
}

export function clearCustomerSessionCookie(response: NextResponse) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export function getCustomerEmailFromRequest(req: NextRequest): string | null {
  const secret = getCustomerSessionSecret()
  if (!secret) return null

  const rawCookie = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
  if (!rawCookie) return null

  const [encodedPayload, signature] = rawCookie.split('.')
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as CustomerSessionPayload
    if (!payload.email || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload.email.trim().toLowerCase()
  } catch {
    return null
  }
}
