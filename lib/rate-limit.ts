import type { NextRequest } from 'next/server'

interface RateLimitOptions {
  limit: number
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = globalThis as typeof globalThis & {
  __vitrineRateLimitStore?: Map<string, RateLimitEntry>
}

const buckets = store.__vitrineRateLimitStore ?? new Map<string, RateLimitEntry>()
store.__vitrineRateLimitStore = buckets

export function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = req.headers.get('x-real-ip')?.trim()
  return forwardedFor || realIp || 'unknown'
}

export function rateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.limit - 1, retryAfter: 0 }
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    }
  }

  current.count += 1
  return {
    allowed: true,
    remaining: Math.max(0, options.limit - current.count),
    retryAfter: 0,
  }
}

export function rateLimitKey(req: NextRequest, scope: string, suffix = '') {
  return `${scope}:${getClientIp(req)}:${suffix}`
}
