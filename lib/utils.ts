/**
 * Generate a URL-safe slug from an arbitrary name string.
 * e.g. "Instagram Bio" → "instagram-bio"
 */
export function generateCampaignSlug(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Returns the public base URL of the app.
 * Uses NEXT_PUBLIC_BASE_URL if set, then VERCEL_URL, then falls back to localhost.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/**
 * Returns a safe href for a booking URL or email string.
 * Only allows http/https URLs and plain email addresses.
 * Returns null for any other input to prevent javascript:/data: injection.
 */
export function safeBookingHref(url: string): string | null {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`
  return null
}

/**
 * Converts a phone number string (e.g. "+55 11 99999-9999") into a wa.me URL.
 * wa.me expects only digits — no +, spaces, or dashes.
 */
export function whatsAppHref(number: string): string {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

/** Returns true if the string is a valid http/https URL. */
export const isHttpUrl = (s: string) => /^https?:\/\//i.test(s)

/** Returns true if the string looks like a plain email address. */
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
