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

interface AiPreviewConfig {
  template?: string
  imageCount?: number
  sections?: string[]
  style?: {
    mood?: string
    primaryColor?: string
    accentColor?: string
  }
  copy?: {
    headline?: string
    subheadline?: string
    primaryCta?: string
    secondaryCta?: string
  }
  recommendations?: string[]
}

const AI_PREVIEW_STORAGE_KEY = 'vitrine_ai_page_config'

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
  const [aiConfig, setAiConfig] = useState<AiPreviewConfig | null>(null)
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
      const savedAiConfig = localStorage.getItem(AI_PREVIEW_STORAGE_KEY)
      if (savedAiConfig) setAiConfig(JSON.parse(savedAiConfig) as AiPreviewConfig)
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
  const pageTemplate = aiConfig?.template === 'food' ? 'food' : getPageTemplate(userData.category)
  const contactMethods = userData.contactMethods?.length ? userData.contactMethods : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')
  const previewSections = Array.isArray(aiConfig?.sections) ? aiConfig.sections.slice(0, 6) : []
  const previewAccent = aiConfig?.style?.accentColor || '#D4AF37'
  const previewHeadline = aiConfig?.copy?.headline?.trim() || userData.businessName
  const previewTagline = aiConfig?.copy?.subheadline?.trim() || null
  const previewCategoryLabel = aiConfig?.template ? `${userData.category} · ${aiConfig.template}` : userData.category

  return (
    <main className="bg-white">
      <PreviewWatermark lang={lang} businessName={userData.businessName} />
      {aiConfig && (
        <div className="fixed left-4 top-20 z-[75] max-w-sm rounded-3xl border border-white/10 bg-navy/95 p-4 text-white shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: previewAccent }} />
            <p className="text-[10px] font-black uppercase tracking-wider text-gold">{lang === 'pt' ? 'Prévia estruturada por IA' : lang === 'es' ? 'Vista previa estructurada por IA' : lang === 'fr' ? 'Aperçu structuré par IA' : 'AI structured preview'}</p>
          </div>
          <p className="mt-2 text-sm font-bold">{aiConfig.template ?? pageTemplate} layout · {aiConfig.imageCount ?? userData.photos?.length ?? 0} {lang === 'pt' ? 'fotos analisadas' : lang === 'es' ? 'fotos analizadas' : lang === 'fr' ? 'photos analysées' : 'photos analyzed'}</p>
          {aiConfig.style?.mood && <p className="mt-1 text-xs text-gray-300">{lang === 'pt' ? 'Estilo' : lang === 'es' ? 'Estilo' : lang === 'fr' ? 'Style' : 'Mood'}: {aiConfig.style.mood.replace(/_/g, ' ')}</p>}
          {previewSections.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {previewSections.map((section) => (
                <span key={section} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-200">
                  {section}
                </span>
              ))}
            </div>
          )}
          {aiConfig.recommendations && aiConfig.recommendations.length > 0 && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-gold">{lang === 'pt' ? 'Leitura da IA' : lang === 'es' ? 'Lectura de IA' : lang === 'fr' ? 'Lecture IA' : 'AI readout'}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-200">{aiConfig.recommendations[0]}</p>
            </div>
          )}
        </div>
      )}
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
        categoryLabel={previewCategoryLabel}
        heroPhoto={userData.photos?.[0]}
        headline={previewHeadline}
        tagline={previewTagline}
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
