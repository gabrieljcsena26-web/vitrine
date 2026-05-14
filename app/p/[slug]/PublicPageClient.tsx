'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Language } from '@/lib/translations'
import type { Testimonial } from '@/components/Testimonials'
import AiLandingRenderer, { type AiPageConfig } from '@/components/AiLandingRenderer'

export interface FAQItem {
  question: string
  answer: string
}

export interface BusinessData {
  id: string
  slug: string
  owner_name: string
  category: string
  description: string
  address: string
  owner_email: string
  contact_email?: string | null
  phone: string
  lang: string
  services: { name: string; price: string; description?: string; photo?: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
  photos: string[]
  booking_url: string | null
  whatsapp_number: string | null
  whatsapp_message: string | null
  menu_url?: string | null
  menu_image_url?: string | null
  subscription_status?: string | null
  social_links?: { contactMethods?: ('whatsapp' | 'booking' | 'email')[] } | null
  benefits?: string[] | null
  testimonials?: Testimonial[] | null
  faqs?: FAQItem[] | null
  map_url?: string | null
}

interface Props {
  business: BusinessData
  aiConfig?: AiPageConfig | null
}

export default function PublicPageClient({ business, aiConfig }: Props) {
  const searchParams = useSearchParams()
  const via = searchParams.get('via') ?? undefined
  const initialLang = business.lang && ['pt', 'es', 'en', 'fr'].includes(business.lang)
    ? business.lang as Language
    : 'en'
  const [lang, setLang] = useState<Language>(initialLang)
  const isPaidActive = String(business.subscription_status ?? '').toLowerCase() === 'active'

  useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business.id, via: via ?? null }),
    }).catch(() => undefined)
  }, [business.id, via])

  return (
    <AiLandingRenderer
      business={{
        id: business.id,
        businessName: business.owner_name,
        category: business.category,
        description: business.description,
        address: business.address,
        email: business.contact_email || (!business.owner_email.endsWith('@vitrine.local') ? business.owner_email : undefined),
        phone: business.phone,
        bookingUrl: business.booking_url ?? undefined,
        whatsappNumber: business.whatsapp_number ?? undefined,
        whatsappMessage: business.whatsapp_message ?? undefined,
        contactMethods: business.social_links?.contactMethods?.length ? business.social_links.contactMethods : ['whatsapp', 'booking', 'email'],
        menuUrl: business.menu_url ?? undefined,
        menuImageUrl: business.menu_image_url ?? undefined,
        lang: business.lang,
        services: business.services ?? [],
        hours: business.hours ?? [],
        photos: business.photos ?? [],
        mapUrl: business.map_url,
        benefits: business.benefits,
        testimonials: business.testimonials,
        faqs: business.faqs,
      }}
      aiConfig={aiConfig}
      lang={lang}
      setLang={setLang}
      previewMode={false}
      showWatermark={!isPaidActive}
      businessId={business.id}
      via={via}
    />
  )
}
