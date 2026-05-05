import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { createServiceClient } from './supabase'
import { hashPassword, safeEqual, verifyPassword } from './password-auth'

const COOKIE_NAME = 'vitrine_owner_session'
const OWNER_AUTH_KEY = 'owner_auth'

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

export function getOwnerSetupCode() {
  return process.env.VITRINE_OWNER_SETUP_CODE || ''
}

async function getStoredOwnerAuth() {
  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('dev_settings')
      .select('value')
      .eq('key', OWNER_AUTH_KEY)
      .maybeSingle()

    if (error || !data?.value || typeof data.value !== 'object') return null
    const value = data.value as Record<string, unknown>
    const salt = typeof value.salt === 'string' ? value.salt : ''
    const hash = typeof value.hash === 'string' ? value.hash : ''
    if (!salt || !hash) return null
    return { salt, hash }
  } catch {
    return null
  }
}

export async function verifyAdminPassword(password: string) {
  const candidate = String(password ?? '')
  const stored = await getStoredOwnerAuth()

  if (stored && verifyPassword(candidate, stored.salt, stored.hash)) {
    return { configured: true, valid: true }
  }

  const expected = getAdminPassword()
  if (!expected && !stored) return { configured: false, valid: false }
  if (expected && safeEqual(candidate, expected)) return { configured: true, valid: true }
  return { configured: true, valid: false }
}

export async function setStoredAdminPassword(password: string) {
  const cleaned = String(password ?? '')
  if (cleaned.length < 12) {
    throw new Error('Owner password must have at least 12 characters.')
  }

  const passwordRecord = hashPassword(cleaned)
  const db = createServiceClient()
  const { error } = await db
    .from('dev_settings')
    .upsert({
      key: OWNER_AUTH_KEY,
      value: { ...passwordRecord, updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })

  if (error) throw new Error(error.message)
}

export function verifyOwnerSetupCode(code: string) {
  const expected = getOwnerSetupCode()
  return Boolean(expected) && safeEqual(String(code ?? ''), expected)
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
