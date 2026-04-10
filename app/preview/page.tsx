'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
      if (data.lang && ['pt', 'es', 'en'].includes(data.lang)) {
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

  return (
    <main className="bg-white">
      <Navbar t={t} lang={lang} setLang={setLang} businessName={userData.businessName} />
      <Hero t={t} businessName={userData.businessName} category={userData.category} />
      <About
        t={t}
        address={userData.address}
        email={userData.email}
        description={userData.description}
        businessName={userData.businessName}
      />
      <Services t={t} services={userData.services} />
      <Gallery t={t} photos={userData.photos} />
      <Hours t={t} hours={userData.hours} businessName={userData.businessName} />
      <ContactForm t={t} />
      <ChatbotWidget t={t} />
      <Footer t={t} businessName={userData.businessName} />
    </main>
  )
}
