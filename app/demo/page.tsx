'use client'
import { useState } from 'react'
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

const BUSINESS = {
  name: 'Studio Elegance',
  address: 'Calle Gran Vía 45, Madrid, Spain',
  email: 'contact@studioelegance.com',
}

export default function DemoPage() {
  const [lang, setLang] = useState<Language>('en')
  const t = translations[lang]

  return (
    <main className="bg-white">
      <Navbar t={t} lang={lang} setLang={setLang} businessName={BUSINESS.name} />
      <Hero t={t} businessName={BUSINESS.name} />
      <About t={t} address={BUSINESS.address} email={BUSINESS.email} />
      <Services t={t} />
      <Gallery t={t} />
      <Hours t={t} />
      <ContactForm t={t} />
      <ChatbotWidget t={t} />
      <Footer t={t} businessName={BUSINESS.name} />
    </main>
  )
}
