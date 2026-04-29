'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { translations } from '@/lib/translations'
import type { Language } from '@/lib/translations'
import { getSupabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Hours from '@/components/Hours'
import ContactActions from '@/components/ContactActions'
import ContactForm from '@/components/ContactForm'
import ChatbotWidget from '@/components/ChatbotWidget'
import Footer from '@/components/Footer'

interface BusinessData {
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
}

export default function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams()
  const via = searchParams.get('via') ?? undefined

  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [lang, setLang] = useState<Language>('en')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { slug } = await params
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setBusiness(data as BusinessData)
      if (data.lang && ['pt', 'es', 'en', 'fr'].includes(data.lang)) {
        setLang(data.lang as Language)
      }
      setLoading(false)

      // Track the visit silently
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: data.id, via: via ?? null }),
      }).catch(() => undefined)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Page not found</h1>
          <p className="text-gray-400">This business page doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  if (!business) return null

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
      <Services t={t} services={business.services ?? []} />
      <Gallery t={t} photos={business.photos ?? []} />
      <Hours t={t} hours={business.hours ?? []} businessName={business.owner_name} />
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
