import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import MenuPageClient from './MenuPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ via?: string }>
}

async function getBusiness(slug: string) {
  const db = createServiceClient()
  let { data, error } = await db
    .from('businesses')
    .select('id, slug, owner_name, category, lang, menu_url, menu_image_url, whatsapp_number, whatsapp_message')
    .eq('slug', slug)
    .single()

  if (error && (error.message?.includes('menu_url') || error.message?.includes('menu_image_url'))) {
    const fallback = await db
      .from('businesses')
      .select('id, slug, owner_name, category, lang, whatsapp_number, whatsapp_message')
      .eq('slug', slug)
      .single()
    data = fallback.data as any
    error = fallback.error
  }

  if (error || !data) return null
  return data
}

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { via } = await searchParams
  const business = await getBusiness(slug)

  if (!business) notFound()

  return <MenuPageClient business={business} via={via ?? null} />
}
