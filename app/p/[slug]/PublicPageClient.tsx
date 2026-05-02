'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { translations } from '@/lib/translations'
import type { Language } from '@/lib/translations'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Benefits from '@/components/Benefits'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Testimonials from '@/components/Testimonials'
import type { Testimonial } from '@/components/Testimonials'
import Hours from '@/components/Hours'
import LocationMap from '@/components/LocationMap'
import FAQ from '@/components/FAQ'
import ContactActions from '@/components/ContactActions'
import ContactForm from '@/components/ContactForm'
import ChatbotWidget from '@/components/ChatbotWidget'
import Footer from '@/components/Footer'

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
  phone: string
  lang: string
  services: { name: string; price: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
  photos: string[]
  booking_url: string | null
  whatsapp_number: string | null
  whatsapp_message: string | null
  benefits?: string[] | null
  testimonials?: Testimonial[] | null
  faqs?: FAQItem[] | null
  map_url?: string | null
}

interface Props {
  business: BusinessData
}

export default function PublicPageClient({ business }: Props) {
  const searchParams = useSearchParams()
  const via = searchParams.get('via') ?? undefined
  const initialLang = business.lang && ['pt', 'es', 'en', 'fr'].includes(business.lang)
    ? business.lang as Language
    : 'en'
  const [lang, setLang] = useState<Language>(initialLang)

  useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business.id, via: via ?? null }),
    }).catch(() => undefined)
  }, [business.id, via])

  const t = translations[lang]

  return (
    <main className="bg-white">
      <Navbar
        t={t}
        lang={lang}
        setLang={setLang}
        businessName={business.owner_name}
        bookingUrl={business.booking_url}
        whatsappNumber={business.whatsapp_number}
        whatsappMessage={business.whatsapp_message}
        businessId={business.id}
        via={via}
      />
      <Hero
        t={t}
        businessName={business.owner_name}
        category={business.category}
        heroPhoto={business.photos?.[0]}
        businessId={business.id}
        via={via}
        bookingUrl={business.booking_url}
        whatsappNumber={business.whatsapp_number}
        whatsappMessage={business.whatsapp_message}
      />
      <About
        t={t}
        address={business.address}
        email={business.owner_email}
        description={business.description}
        businessName={business.owner_name}
        aboutPhoto={business.photos?.[1]}
      />
      <Benefits businessName={business.owner_name} benefits={business.benefits} />
      <Services t={t} services={business.services ?? []} />
      <Gallery t={t} photos={business.photos ?? []} />
      <Testimonials testimonials={business.testimonials} />
      <Hours t={t} hours={business.hours ?? []} businessName={business.owner_name} />
      <LocationMap address={business.address} mapUrl={business.map_url} businessName={business.owner_name} />
      <FAQ items={business.faqs} />
      {business.booking_url || business.whatsapp_number ? (
        <ContactActions
          t={t}
          bookingUrl={business.booking_url}
          whatsappNumber={business.whatsapp_number}
          whatsappMessage={business.whatsapp_message}
          businessId={business.id}
          via={via}
        />
      ) : (
        <ContactForm t={t} businessId={business.id} via={via} />
      )}
      <ChatbotWidget
        t={t}
        businessInfo={{
          name: business.owner_name,
          category: business.category,
          description: business.description,
          address: business.address,
          email: business.owner_email,
          phone: business.phone,
          hours: business.hours ?? [],
          services: business.services ?? [],
          bookingUrl: business.booking_url ?? undefined,
          whatsappNumber: business.whatsapp_number ?? undefined,
        }}
      />
      <Footer t={t} businessName={business.owner_name} />
    </main>
  )
}
