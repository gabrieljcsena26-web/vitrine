'use client'
import { useState, useEffect } from 'react'
import { translations } from '@/lib/translations'
import type { Language } from '@/lib/translations'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Hours from '@/components/Hours'
import ContactForm from '@/components/ContactForm'
import ChatbotWidget from '@/components/ChatbotWidget'
import Footer from '@/components/Footer'

interface BusinessData {
  businessName: string
  category: string
  description: string
  address: string
  email: string
  lang: string
  services: { name: string; price: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
  photos: string[]
}

const DEFAULT = {
  name: 'Studio Elegance',
  address: 'Calle Gran Vía 45, Madrid, Spain',
  email: 'contact@studioelegance.com',
}

export default function DemoPage() {
  const [lang, setLang] = useState<Language>('en')
  const [userData, setUserData] = useState<BusinessData | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitrine_business_data')
      if (saved) {
        const data = JSON.parse(saved) as BusinessData
        setUserData(data)
        if (data.lang && ['pt', 'es', 'en'].includes(data.lang)) {
          setLang(data.lang as Language)
        }
      }
    } catch {
      // ignore parse errors — fall back to defaults
    }
  }, [])

  const t = translations[lang]
  const name = userData?.businessName || DEFAULT.name
  const address = userData?.address || DEFAULT.address
  const email = userData?.email || DEFAULT.email

  return (
    <main className="bg-white">
      <Navbar t={t} lang={lang} setLang={setLang} businessName={name} />
      <Hero t={t} businessName={name} category={userData?.category} />
      <About t={t} address={address} email={email} description={userData?.description} businessName={name} />
      <Services t={t} services={userData?.services} />
      <Gallery t={t} photos={userData?.photos} />
      <Hours t={t} hours={userData?.hours} businessName={name} />
      <ContactForm t={t} />
      <ChatbotWidget t={t} />
      <Footer t={t} businessName={name} />
    </main>
  )
}
