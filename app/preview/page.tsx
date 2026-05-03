'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { translations } from '@/lib/translations'
import type { Language } from '@/lib/translations'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Benefits from '@/components/Benefits'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Testimonials from '@/components/Testimonials'
import Hours from '@/components/Hours'
import LocationMap from '@/components/LocationMap'
import FAQ from '@/components/FAQ'
import ContactActions from '@/components/ContactActions'
import ContactForm from '@/components/ContactForm'
import ChatbotWidget from '@/components/ChatbotWidget'
import Footer from '@/components/Footer'
import FoodMenuBlock from '@/components/FoodMenuBlock'
import PreviewWatermark from '@/components/PreviewWatermark'

interface BusinessData {
  businessName: string
  category: string
  description: string
  address: string
  email: string
  phone: string
  bookingUrl?: string
  whatsappNumber?: string
  whatsappMessage?: string
  contactMethods?: ('whatsapp' | 'booking' | 'email')[]
  menuUrl?: string
  menuImageUrl?: string
  lang: string
  services: { name: string; price: string; description?: string; photo?: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
  photos: string[]
}

const FOOD_CATEGORIES = ['restaurant', 'café', 'cafe', 'bar', 'food truck', 'bakery', 'bistro', 'lanchonete', 'confeitaria']

function getPageTemplate(category?: string | null) {
  const normalized = String(category ?? '').toLowerCase()
  if (FOOD_CATEGORIES.some((item) => normalized.includes(item))) return 'food'
  return 'service'
}

export default function PreviewPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [userData, setUserData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitrine_business_data')
      if (!saved) {
        router.replace('/dashboard')
        return
      }
      const data = JSON.parse(saved) as BusinessData
      if (!data.businessName) {
        router.replace('/dashboard')
        return
      }
      setUserData(data)
      if (data.lang && ['pt', 'es', 'en', 'fr'].includes(data.lang)) {
        setLang(data.lang as Language)
      }
    } catch {
      router.replace('/dashboard')
      return
    }
    setLoading(false)
  }, [router])

  if (loading || !userData) return null

  const t = translations[lang]
  const pageTemplate = getPageTemplate(userData.category)
  const contactMethods = userData.contactMethods?.length ? userData.contactMethods : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')

  return (
    <main className="bg-white">
      <PreviewWatermark lang={lang} businessName={userData.businessName} />
      <Navbar
        t={t}
        lang={lang}
        setLang={setLang}
        businessName={userData.businessName}
        bookingUrl={showBooking ? userData.bookingUrl : undefined}
        whatsappNumber={showWhatsapp ? userData.whatsappNumber : undefined}
        whatsappMessage={showWhatsapp ? userData.whatsappMessage : undefined}
      />
      <Hero
        t={t}
        businessName={userData.businessName}
        category={userData.category}
        heroPhoto={userData.photos?.[0]}
        bookingUrl={showBooking ? userData.bookingUrl : undefined}
        whatsappNumber={showWhatsapp ? userData.whatsappNumber : undefined}
        whatsappMessage={showWhatsapp ? userData.whatsappMessage : undefined}
      />
      <About
        t={t}
        address={userData.address}
        email={showEmail ? userData.email : undefined}
        description={userData.description}
        businessName={userData.businessName}
        aboutPhoto={userData.photos?.[1]}
      />
      {pageTemplate === 'food' ? (
        <FoodMenuBlock
          businessName={userData.businessName}
          services={userData.services}
          photos={userData.photos}
          bookingUrl={showBooking ? userData.bookingUrl : undefined}
          whatsappNumber={showWhatsapp ? userData.whatsappNumber : undefined}
          whatsappMessage={showWhatsapp ? userData.whatsappMessage : undefined}
          menuUrl={userData.menuUrl}
          menuImageUrl={userData.menuImageUrl}
          lang={lang}
        />
      ) : (
        <>
          <Benefits businessName={userData.businessName} />
          <Services t={t} services={userData.services} />
        </>
      )}
      <Gallery t={t} photos={userData.photos} />
      <Testimonials showDefaults />
      <Hours t={t} hours={userData.hours} businessName={userData.businessName} />
      <LocationMap address={userData.address} businessName={userData.businessName} />
      <FAQ />
      {(showBooking && userData.bookingUrl) || (showWhatsapp && userData.whatsappNumber) ? (
        <ContactActions
          t={t}
          bookingUrl={showBooking ? userData.bookingUrl : undefined}
          whatsappNumber={showWhatsapp ? userData.whatsappNumber : undefined}
          whatsappMessage={showWhatsapp ? userData.whatsappMessage : undefined}
          showForm={showEmail}
        />
      ) : showEmail ? (
        <ContactForm t={t} />
      ) : null}
      <ChatbotWidget
        t={t}
        businessInfo={{
          name: userData.businessName,
          category: userData.category,
          description: userData.description,
          address: userData.address,
          email: userData.email,
          phone: userData.phone,
          hours: userData.hours,
          services: userData.services,
          bookingUrl: showBooking ? userData.bookingUrl : undefined,
          whatsappNumber: showWhatsapp ? userData.whatsappNumber : undefined,
        }}
      />
      <Footer t={t} businessName={userData.businessName} />
    </main>
  )
}
