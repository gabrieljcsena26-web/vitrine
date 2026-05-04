import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'vitrine_owner_session'

function getSecret() {
  if (process.env.VITRINE_OWNER_SESSION_SECRET) return process.env.VITRINE_OWNER_SESSION_SECRET
  if (process.env.VITRINE_OWNER_PASSWORD) return process.env.VITRINE_OWNER_PASSWORD
  if (process.env.VITRINE_DEV_SESSION_SECRET) return process.env.VITRINE_DEV_SESSION_SECRET
  if (process.env.VITRINE_DEV_PASSWORD) return process.env.VITRINE_DEV_PASSWORD
  return process.env.NODE_ENV !== 'production' ? 'local-dev-secret' : ''
}

export function getAdminPassword() {
  return process.env.VITRINE_OWNER_PASSWORD || process.env.VITRINE_DEV_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'dev' : '')
}

export function createAdminToken() {
  const secret = getSecret()
  if (!secret) return ''
  return createHmac('sha256', secret).update('vitrine-owner-console').digest('hex')
}

export async function setAdminCookie() {
  const token = createAdminToken()
  if (!token) throw new Error('Developer session secret is not configured.')
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value
  if (!value) return false
  const expected = createAdminToken()
  if (!expected) return false
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}
