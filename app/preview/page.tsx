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
  lang: string
  services: { name: string; price: string }[]
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

  return (
    <main className="bg-white">
      <Navbar
        t={t}
        lang={lang}
        setLang={setLang}
        businessName={userData.businessName}
        bookingUrl={userData.bookingUrl}
        whatsappNumber={userData.whatsappNumber}
        whatsappMessage={userData.whatsappMessage}
      />
      <Hero
        t={t}
        businessName={userData.businessName}
        category={userData.category}
        heroPhoto={userData.photos?.[0]}
        bookingUrl={userData.bookingUrl}
        whatsappNumber={userData.whatsappNumber}
        whatsappMessage={userData.whatsappMessage}
      />
      <About
        t={t}
        address={userData.address}
        email={userData.email}
        description={userData.description}
        businessName={userData.businessName}
        aboutPhoto={userData.photos?.[1]}
      />
      {pageTemplate === 'food' ? (
        <FoodMenuBlock
          businessName={userData.businessName}
          services={userData.services}
          photos={userData.photos}
          bookingUrl={userData.bookingUrl}
          whatsappNumber={userData.whatsappNumber}
          whatsappMessage={userData.whatsappMessage}
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
      {userData.bookingUrl || userData.whatsappNumber ? (
        <ContactActions
          t={t}
          bookingUrl={userData.bookingUrl}
          whatsappNumber={userData.whatsappNumber}
          whatsappMessage={userData.whatsappMessage}
        />
      ) : (
        <ContactForm t={t} />
      )}
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
          bookingUrl: userData.bookingUrl,
          whatsappNumber: userData.whatsappNumber,
        }}
      />
      <Footer t={t} businessName={userData.businessName} />
    </main>
  )
}
