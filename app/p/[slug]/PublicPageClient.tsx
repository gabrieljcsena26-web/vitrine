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
import FoodMenuBlock from '@/components/FoodMenuBlock'

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
  social_links?: { contactMethods?: ('whatsapp' | 'booking' | 'email')[] } | null
  benefits?: string[] | null
  testimonials?: Testimonial[] | null
  faqs?: FAQItem[] | null
  map_url?: string | null
}

interface Props {
  business: BusinessData
}

const FOOD_CATEGORIES = ['restaurant', 'café', 'cafe', 'bar', 'food truck', 'bakery', 'bistro', 'lanchonete', 'confeitaria']

function getPageTemplate(category?: string | null) {
  const normalized = String(category ?? '').toLowerCase()
  if (FOOD_CATEGORIES.some((item) => normalized.includes(item))) return 'food'
  return 'service'
}

export default function PublicPageClient({ business }: Props) {
  const searchParams = useSearchParams()
  const via = searchParams.get('via') ?? undefined
  const initialLang = business.lang && ['pt', 'es', 'en', 'fr'].includes(business.lang)
    ? business.lang as Language
    : 'en'
  const [lang, setLang] = useState<Language>(initialLang)
  const pageTemplate = getPageTemplate(business.category)

  useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business.id, via: via ?? null }),
    }).catch(() => undefined)
  }, [business.id, via])

  const t = translations[lang]
  const contactMethods = business.social_links?.contactMethods?.length
    ? business.social_links.contactMethods
    : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')
  const publicEmail = showEmail
    ? (business.contact_email || (!business.owner_email.endsWith('@vitrine.local') ? business.owner_email : undefined))
    : undefined

  return (
    <main className="bg-white">
      <Navbar
        t={t}
        lang={lang}
        setLang={setLang}
        businessName={business.owner_name}
        bookingUrl={showBooking ? business.booking_url : undefined}
        whatsappNumber={showWhatsapp ? business.whatsapp_number : undefined}
        whatsappMessage={showWhatsapp ? business.whatsapp_message : undefined}
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
        bookingUrl={showBooking ? business.booking_url : undefined}
        whatsappNumber={showWhatsapp ? business.whatsapp_number : undefined}
        whatsappMessage={showWhatsapp ? business.whatsapp_message : undefined}
      />
      <About
        t={t}
        address={business.address}
        email={publicEmail}
        description={business.description}
        businessName={business.owner_name}
        aboutPhoto={business.photos?.[1]}
      />
      {pageTemplate === 'food' ? (
        <FoodMenuBlock
          businessName={business.owner_name}
          services={business.services ?? []}
          photos={business.photos ?? []}
          bookingUrl={showBooking ? business.booking_url : undefined}
          whatsappNumber={showWhatsapp ? business.whatsapp_number : undefined}
          whatsappMessage={showWhatsapp ? business.whatsapp_message : undefined}
          menuUrl={business.menu_url}
          menuImageUrl={business.menu_image_url}
          lang={lang}
        />
      ) : (
        <>
          <Benefits businessName={business.owner_name} benefits={business.benefits} />
          <Services t={t} services={business.services ?? []} />
        </>
      )}
      <Gallery t={t} photos={business.photos ?? []} />
      <Testimonials testimonials={business.testimonials} />
      <Hours t={t} hours={business.hours ?? []} businessName={business.owner_name} />
      <LocationMap address={business.address} mapUrl={business.map_url} businessName={business.owner_name} />
      <FAQ items={business.faqs} />
      {(showBooking && business.booking_url) || (showWhatsapp && business.whatsapp_number) ? (
        <ContactActions
          t={t}
          bookingUrl={showBooking ? business.booking_url : undefined}
          whatsappNumber={showWhatsapp ? business.whatsapp_number : undefined}
          whatsappMessage={showWhatsapp ? business.whatsapp_message : undefined}
          businessId={business.id}
          via={via}
          showForm={showEmail}
        />
      ) : showEmail ? (
        <ContactForm t={t} businessId={business.id} via={via} />
      ) : null}
      <ChatbotWidget
        t={t}
        businessInfo={{
          name: business.owner_name,
          category: business.category,
          description: business.description,
          address: business.address,
          email: publicEmail,
          phone: business.phone,
          hours: business.hours ?? [],
          services: business.services ?? [],
          bookingUrl: showBooking ? business.booking_url ?? undefined : undefined,
          whatsappNumber: showWhatsapp ? business.whatsapp_number ?? undefined : undefined,
        }}
      />
      <Footer t={t} businessName={business.owner_name} />
    </main>
  )
}
