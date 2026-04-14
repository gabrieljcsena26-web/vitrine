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
