import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/demo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  try {
    const db = createServiceClient()
    const { data } = await db
      .from('businesses')
      .select('slug, created_at')
      .order('created_at', { ascending: false })
      .limit(500)

    const businessRoutes = (data ?? []).map((item) => ({
      url: `${baseUrl}/p/${item.slug}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...staticRoutes, ...businessRoutes]
  } catch {
    return staticRoutes
  }
}
