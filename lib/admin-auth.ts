import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'vitrine_dev_session'

function getSecret() {
  return process.env.VITRINE_DEV_SESSION_SECRET || process.env.VITRINE_DEV_PASSWORD || 'local-dev-secret'
}

export function getAdminPassword() {
  return process.env.VITRINE_DEV_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'dev' : '')
}

export function createAdminToken() {
  return createHmac('sha256', getSecret()).update('vitrine-developer-console').digest('hex')
}

export async function setAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, createAdminToken(), {
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
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}
