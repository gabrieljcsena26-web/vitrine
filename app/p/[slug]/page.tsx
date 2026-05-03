import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl } from '@/lib/utils'
import PublicPageClient from './PublicPageClient'
import type { BusinessData } from './PublicPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getBusiness(slug: string): Promise<BusinessData | null> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as BusinessData
}

function getDescription(business: Pick<BusinessData, 'description' | 'category' | 'address' | 'owner_name'>) {
  if (business.description) return business.description.slice(0, 155)
  const location = business.address ? ` in ${business.address}` : ''
  return `${business.owner_name} offers professional ${business.category || 'local'} services${location}. Contact us on WhatsApp or request a booking today.`.slice(0, 155)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    return {
      title: 'Business page not found — Vitrine',
      description: 'This Vitrine business page does not exist or has been removed.',
    }
  }

  const title = `${business.owner_name} — ${business.category || 'Local Business'}`
  const description = getDescription(business)
  const url = `${getBaseUrl()}/p/${business.slug}`
  const image = business.photos?.find((photo) => typeof photo === 'string' && photo.startsWith('http'))

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Vitrine',
      type: 'website',
      images: image ? [{ url: image, alt: business.owner_name }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) notFound()

  const contactMethods = business.social_links?.contactMethods?.length
    ? business.social_links.contactMethods
    : ['whatsapp', 'booking', 'email']
  const publicEmail = contactMethods.includes('email') && !business.owner_email.endsWith('@vitrine.local')
    ? business.owner_email
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.owner_name,
    description: getDescription(business),
    url: `${getBaseUrl()}/p/${business.slug}`,
    image: business.photos?.filter((photo) => typeof photo === 'string' && photo.startsWith('http')).slice(0, 5),
    address: business.address,
    telephone: business.phone || business.whatsapp_number || undefined,
    email: publicEmail,
    priceRange: business.services?.some((service) => service.price) ? '€€' : undefined,
    openingHours: business.hours?.filter((hour) => hour.open).map((hour) => `${hour.day} ${hour.from}-${hour.to}`),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PublicPageClient business={business} />
    </>
  )
}
