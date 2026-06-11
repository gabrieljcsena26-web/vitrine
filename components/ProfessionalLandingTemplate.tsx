'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Calendar, CheckCircle2, Clock3, Heart, Mail, Menu, MessageCircle, Quote, Sparkles, X } from 'lucide-react'
import type { Language, Translations } from '@/lib/translations'
import { translations } from '@/lib/translations'
import ChatbotWidget from '@/components/ChatbotWidget'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import { getLandingTheme } from '@/lib/landing-themes'
import PreviewWatermark from '@/components/PreviewWatermark'
import Testimonials from '@/components/Testimonials'
import { professionalDemo } from '@/lib/vitrine-demo-data'
import type { ProfessionalConfig } from '@/lib/vitrine-types'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'

interface ProfessionalBusinessData {
  id?: string
  businessName: string
  subtitle?: string
  category: string
  description: string
  address: string
  email?: string
  phone?: string
  bookingUrl?: string
  whatsappNumber?: string
  whatsappMessage?: string
  contactMethods?: ('whatsapp' | 'booking' | 'email')[]
  lang: string
  themeId?: string
  services: { name: string; price: string; description?: string; photo?: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
  photos: string[]
  mapUrl?: string | null
  benefits?: string[] | null
  testimonials?: any[] | null
  faqs?: { question: string; answer: string }[] | null
}

interface ProfessionalPageConfig {
  sections?: string[]
  focusSection?: string | null
  focusLabel?: string
  style?: {
    mood?: string
    primaryColor?: string
    accentColor?: string
    themeId?: string
  }
  copy?: {
    headline?: string
    subheadline?: string
    primaryCta?: string
    secondaryCta?: string
  }
}

interface Props {
  business: ProfessionalBusinessData
  aiConfig?: ProfessionalPageConfig | null
  lang: Language
  setLang: (lang: Language) => void
  previewMode?: boolean
  showWatermark?: boolean
  businessId?: string
  via?: string
}

const navCopy = {
  pt: [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Contacto', href: '#contacto' },
  ],
  en: [
    { label: 'Services', href: '#servicos' },
    { label: 'Contact', href: '#contacto' },
  ],
  es: [
    { label: 'Servicios', href: '#servicos' },
    { label: 'Contacto', href: '#contacto' },
  ],
  fr: [
    { label: 'Services', href: '#servicos' },
    { label: 'Contact', href: '#contacto' },
  ],
} as const

const copy = {
  pt: {
    areas: 'Áreas de atuação',
    approach: 'A minha abordagem',
    approachFallback: 'Criamos uma experiência clara e acolhedora para que o visitante entenda rapidamente o serviço, sinta confiança e consiga tomar o próximo passo sem fricção.',
    servicesTitle: 'Serviços',
    servicesSubtitle: 'Como posso ajudá-lo(a)',
    prioritiesTitle: 'Formação, prioridades e confiança',
    prioritiesSubtitle: 'Os pontos mais importantes para ajudar o cliente a decidir com clareza.',
    credentialsTitle: 'Credenciais e especialidades',
    credentialsSubtitle: 'O que sustenta a confiança logo nos primeiros segundos.',
    testimonialsTitle: 'O que dizem os meus clientes',
    testimonialsSubtitle: 'A sua confiança é o meu maior ativo',
    finalTitle: 'Pronto(a) para dar o primeiro passo?',
    finalText: 'A primeira conversa é o momento ideal para perceber prioridades, esclarecer dúvidas e definir o melhor próximo passo.',
    book: 'Marcar consulta',
    bookFirst: 'Agendar primeira consulta',
    whatsapp: 'Fale comigo',
    whatsappHelp: 'Esclarecer dúvidas',
    emailCta: 'Enviar email',
    mapCta: 'Abrir no mapa',
    hoursTitle: 'Horário',
    priorities: 'Prioridades',
  },
  en: {
    areas: 'Practice areas',
    approach: 'My approach',
    approachFallback: 'We create a clear and welcoming experience so visitors understand the service quickly, feel trust and can take the next step without friction.',
    servicesTitle: 'Services',
    servicesSubtitle: 'How I can help',
    prioritiesTitle: 'Credentials, priorities and trust',
    prioritiesSubtitle: 'The most important signals to help customers decide clearly.',
    credentialsTitle: 'Credentials and specialities',
    credentialsSubtitle: 'The signals that build trust in the first few seconds.',
    testimonialsTitle: 'What my clients say',
    testimonialsSubtitle: 'Your trust is my biggest asset',
    finalTitle: 'Ready to take the first step?',
    finalText: 'The first conversation is the right moment to understand priorities, answer questions and define the next step.',
    book: 'Book consultation',
    bookFirst: 'Book first consultation',
    whatsapp: 'Message me',
    whatsappHelp: 'Ask questions',
    emailCta: 'Send email',
    mapCta: 'Open map',
    hoursTitle: 'Hours',
    priorities: 'Priorities',
  },
  es: {
    areas: 'Áreas de actuación',
    approach: 'Mi enfoque',
    approachFallback: 'Creamos una experiencia clara y cercana para que el visitante entienda el servicio, sienta confianza y avance sin fricción.',
    servicesTitle: 'Servicios',
    servicesSubtitle: 'Cómo puedo ayudar',
    prioritiesTitle: 'Formación, prioridades y confianza',
    prioritiesSubtitle: 'Las señales más importantes para ayudar al cliente a decidir con claridad.',
    credentialsTitle: 'Credenciales y especialidades',
    credentialsSubtitle: 'Las señales que construyen confianza en los primeros segundos.',
    testimonialsTitle: 'Lo que dicen mis clientes',
    testimonialsSubtitle: 'Su confianza es mi mayor activo',
    finalTitle: '¿Listo para dar el primer paso?',
    finalText: 'La primera conversación es el mejor momento para entender prioridades, aclarar dudas y definir el siguiente paso.',
    book: 'Reservar consulta',
    bookFirst: 'Agendar primera consulta',
    whatsapp: 'Hablar conmigo',
    whatsappHelp: 'Aclarar dudas',
    emailCta: 'Enviar email',
    mapCta: 'Abrir en el mapa',
    hoursTitle: 'Horario',
    priorities: 'Prioridades',
  },
  fr: {
    areas: 'Domaines d’intervention',
    approach: 'Mon approche',
    approachFallback: 'Nous créons une expérience claire et rassurante pour que le visiteur comprenne le service, se sente en confiance et passe à l’étape suivante sans friction.',
    servicesTitle: 'Services',
    servicesSubtitle: 'Comment je peux aider',
    prioritiesTitle: 'Qualifications, priorités et confiance',
    prioritiesSubtitle: 'Les signaux les plus importants pour aider le client à décider clairement.',
    credentialsTitle: 'Qualifications et spécialités',
    credentialsSubtitle: 'Les signaux qui inspirent confiance dès les premières secondes.',
    testimonialsTitle: 'Ce que disent mes clients',
    testimonialsSubtitle: 'Votre confiance est mon plus grand atout',
    finalTitle: 'Prêt(e) à faire le premier pas ?',
    finalText: 'Le premier échange est le bon moment pour comprendre les priorités, répondre aux questions et définir la suite.',
    book: 'Réserver une consultation',
    bookFirst: 'Réserver la première consultation',
    whatsapp: 'Écrire sur WhatsApp',
    whatsappHelp: 'Poser des questions',
    emailCta: 'Envoyer un email',
    mapCta: 'Ouvrir la carte',
    hoursTitle: 'Horaires',
    priorities: 'Priorités',
  },
} as const

function ConsultationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  )
}

function WhatsAppPremiumIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function trackClick(businessId: string | undefined, via: string | undefined, eventType: 'booking_click' | 'whatsapp_click') {
  if (!businessId) return
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId, via: via ?? null, eventType }),
  }).catch(() => undefined)
}

function formatPrice(price?: string) {
  if (!price) return null
  if (/quote|consulta|consultation|sob orçamento|orçamento/i.test(price)) return price
  if (/€|eur|\$|£/i.test(price)) return price
  return `${price}€`
}

function getMapEmbedUrl(address?: string, mapUrl?: string | null) {
  if (mapUrl?.startsWith('https://www.google.com/maps/embed')) return mapUrl
  if (address) return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  return null
}

function getDirectionsUrl(address?: string, mapUrl?: string | null) {
  if (mapUrl?.startsWith('http')) return mapUrl
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  return null
}

function ProfessionalHeader({ businessName, logo, lang, setLang, bookingHref, whatsappHref, text, businessId, via }: { businessName: string; logo?: string; lang: Language; setLang: (lang: Language) => void; bookingHref: string | null; whatsappHref: string | null; text: (typeof copy)[Language]; businessId?: string; via?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navItems = navCopy[lang] ?? navCopy.en

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-white/90'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2">
          {logo ? (
            <Image src={logo} alt={businessName} width={40} height={40} className="rounded-full object-cover" unoptimized={logo.startsWith('data:')} />
          ) : (
            <Heart className="h-8 w-8 text-sky-700" />
          )}
          <span className="text-xl font-semibold text-slate-900">{businessName}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-slate-500 transition-colors hover:text-slate-900">
              {item.label}
            </a>
          ))}
          <select value={lang} onChange={(event) => setLang(event.target.value as Language)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 outline-none">
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
          {bookingHref ? (
            <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-sky-700/20 transition-all hover:-translate-y-0.5 hover:bg-sky-800">
              <ConsultationIcon className="h-4 w-4" />
              {text.book}
            </a>
          ) : whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5">
              <WhatsAppPremiumIcon className="h-4 w-4" />
              {text.whatsapp}
            </a>
          ) : null}
        </nav>

        <button type="button" className="md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-slate-600 transition-colors hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export default function ProfessionalLandingTemplate({ business, aiConfig, lang, setLang, previewMode = false, showWatermark = previewMode, businessId, via }: Props) {
  const t: Translations = translations[lang]
  const text = copy[lang] ?? copy.en
  const strictLivePreview = via === 'dashboard-live-preview'
  const activeSections = aiConfig?.sections ?? []
  const focusedSection = aiConfig?.focusSection ?? null
  const showSection = (section: string) => !strictLivePreview || activeSections.includes(section)
  const sectionState = (sections: string[]) => {
    if (!strictLivePreview) return ''
    const isFocused = focusedSection ? sections.includes(focusedSection) : false
    const isActive = sections.some((section) => activeSections.includes(section))
    return `transition-all duration-500 ${isFocused ? 'ring-2 ring-sky-300/95 shadow-[0_14px_36px_rgba(56,189,248,0.12)]' : isActive ? 'ring-1 ring-sky-200/90 shadow-[0_10px_30px_rgba(56,189,248,0.08)]' : 'opacity-90 saturate-[0.98]'}`
  }
  const contactMethods = business.contactMethods?.length ? business.contactMethods : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')
  const bookingHref = showBooking && business.bookingUrl ? safeBookingHref(business.bookingUrl) : null
  const whatsappHref = showWhatsapp && business.whatsappNumber ? whatsAppHref(business.whatsappNumber, business.whatsappMessage) : null
  const professionalConfig: ProfessionalConfig = useMemo(() => {
    const baseProfessional = strictLivePreview
      ? {
          ...professionalDemo,
          businessName: '',
          tagline: '',
          heroImage: '',
          consultationUrl: '',
          areas: [],
          hours: [],
          services: [],
          testimonials: [],
          team: [],
          contact: {
            ...professionalDemo.contact,
            phone: '',
            whatsapp: '',
            email: '',
            address: '',
            googleMapsUrl: '',
          },
        }
      : professionalDemo
    const hourItems = business.hours?.filter(Boolean).map((item) => ({
      day: item.day,
      hours: item.open ? `${item.from} - ${item.to}` : '',
      closed: !item.open,
    }))
    const serviceItems = business.services?.filter((service) => service.name).slice(0, 6).map((service, index) => ({
      id: String(index + 1),
      name: service.name,
      description: service.description,
      price: service.price,
      image: service.photo,
    }))
    const areaItems = serviceItems?.length ? serviceItems.slice(0, 5).map((item) => item.name) : undefined

    return {
      ...baseProfessional,
      businessName: business.businessName || baseProfessional.businessName,
      tagline: aiConfig?.copy?.subheadline?.trim() || business.description || baseProfessional.tagline,
      heroImage: business.photos?.[0] || baseProfessional.heroImage,
      consultationUrl: business.bookingUrl || baseProfessional.consultationUrl,
      areas: areaItems?.length ? areaItems : baseProfessional.areas,
      contact: {
        ...baseProfessional.contact,
        phone: business.phone || baseProfessional.contact.phone,
        whatsapp: business.whatsappNumber || baseProfessional.contact.whatsapp,
        email: business.email || baseProfessional.contact.email,
        address: business.address || baseProfessional.contact.address,
        googleMapsUrl: business.mapUrl || baseProfessional.contact.googleMapsUrl,
      },
      hours: hourItems?.length ? hourItems : baseProfessional.hours,
      services: serviceItems?.length ? serviceItems : baseProfessional.services,
      testimonials: business.testimonials?.length ? business.testimonials as any : baseProfessional.testimonials,
    }
  }, [aiConfig?.copy?.subheadline, business, strictLivePreview])
  const heroPhoto = professionalConfig.heroImage || (strictLivePreview ? '' : 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80')
  const logo = business.photos?.[2] || professionalConfig.team?.[0]?.image
  const theme = getLandingTheme(aiConfig?.style?.themeId ?? aiConfig?.style?.mood ?? business.themeId)
  const headline = aiConfig?.copy?.headline?.trim() || professionalConfig.businessName
  const subtitle = business.subtitle?.trim() || aiConfig?.copy?.subheadline?.trim() || ''
  const services = useMemo(
    () => professionalConfig.services.map((service) => ({
      name: service.name,
      price: service.price || '',
      description: service.description,
      photo: service.image,
    })),
    [professionalConfig.services],
  )
  const publicEmail = showEmail ? business.email : undefined
  const aboutText = business.description?.trim() || ''
  const mapEmbedUrl = getMapEmbedUrl(professionalConfig.contact.address, professionalConfig.contact.googleMapsUrl)
  const directionsUrl = getDirectionsUrl(professionalConfig.contact.address, professionalConfig.contact.googleMapsUrl)
  const emailHref = publicEmail ? `mailto:${publicEmail}` : null
  const shouldShowAbout = showSection('about') && Boolean(aboutText)
  const shouldShowServices = showSection('services') && services.length > 0
  const shouldShowContact = showSection('contact') && (Boolean(bookingHref) || Boolean(whatsappHref) || Boolean(emailHref) || professionalConfig.hours.length > 0 || Boolean(mapEmbedUrl))

  return (
    <main id="top" className="min-h-screen text-slate-900" style={{ backgroundImage: theme.pageBackground }}>
      {showWatermark ? <PreviewWatermark lang={lang} businessName={professionalConfig.businessName} /> : null}
      <ProfessionalHeader businessName={professionalConfig.businessName} logo={logo} lang={lang} setLang={setLang} bookingHref={bookingHref} whatsappHref={whatsappHref} text={text} businessId={businessId} via={via} />

      <section data-preview-section="hero" className={`relative overflow-hidden pt-20 ${sectionState(['hero'])}`}>
        <div className="absolute inset-0" style={{ backgroundImage: theme.heroBackground }} />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <Sparkles className="h-3 w-3" />
              {business.category}
            </span>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{headline}</h1>
            {subtitle ? <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em]" style={{ color: theme.accentStrong }}>{subtitle}</p> : null}

            <div className="mt-10 flex flex-wrap gap-4">
              {bookingHref ? (
                <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center gap-3 rounded-full bg-sky-700 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-sky-700/20 transition-all hover:scale-105">
                  <ConsultationIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                  {aiConfig?.copy?.primaryCta || text.book}
                </a>
              ) : null}
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="group inline-flex items-center gap-3 rounded-full border-2 border-green-500 bg-green-500/10 px-8 py-4 text-lg font-semibold text-green-600 transition-all hover:scale-105 hover:bg-green-500 hover:text-white">
                  <WhatsAppPremiumIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                  {text.whatsapp}
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
              {heroPhoto ? <Image src={heroPhoto} alt={professionalConfig.businessName} fill className="object-cover" priority unoptimized={heroPhoto.startsWith('data:')} /> : <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-stone-100" />}
            </div>
            <div className="absolute -bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-72">
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
                <p className="font-semibold text-slate-900">{professionalConfig.businessName}</p>
                <p className="text-sm text-sky-700">{business.category}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {shouldShowAbout ? (
      <section data-preview-section="about" id="sobre" className={`py-20 ${sectionState(['about'])}`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-100/70 p-8 md:p-12">
            <div className="flex items-start gap-4">
              <Quote className="h-10 w-10 shrink-0 text-sky-700/30" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{text.approach}</h2>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-slate-500">{aboutText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {shouldShowServices ? (
      <section data-preview-section="services" id="servicos" className={`py-20 ${sectionState(['services', 'benefits'])}`} style={{ backgroundImage: theme.softSectionBackground }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">{text.servicesTitle}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div key={`${service.name}-${index}`} className="group rounded-3xl bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                {service.photo ? (
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-slate-100">
                    <Image src={service.photo} alt={service.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized={service.photo.startsWith('data:')} />
                  </div>
                ) : (
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-700/10 transition-colors group-hover:bg-sky-700/20">
                    <CheckCircle2 className="h-6 w-6 text-sky-700" />
                  </div>
                )}
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{service.name}</h3>
                {service.description ? <p className="text-sm text-slate-500">{service.description}</p> : null}
                {formatPrice(service.price) ? <p className="mt-4 text-lg font-semibold text-sky-700">{formatPrice(service.price)}</p> : null}
              </div>
            ))}
          </div>

        </div>
      </section>
      ) : null}

      <div className="h-px w-full bg-slate-200" />

      {shouldShowContact ? (
      <section data-preview-section="contact" id="contacto" className={`py-16 ${sectionState(['contact'])}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 backdrop-blur-sm">
              {mapEmbedUrl ? (
                <>
                  <iframe title={`${professionalConfig.businessName} map`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-[420px] w-full border-0" />
                  {directionsUrl ? (
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-4 text-sm font-black transition-colors hover:bg-slate-50" style={{ color: theme.accentStrong }}>
                      <ArrowUpRight className="h-4 w-4" />
                      {text.mapCta}
                    </a>
                  ) : null}
                </>
              ) : (
                <div className="flex min-h-[420px] items-end bg-gradient-to-br from-slate-100 via-white to-sky-50 p-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.accentStrong }}>{text.priorities}</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{professionalConfig.businessName}</h3>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-5">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-7 shadow-xl backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.accentStrong }}>{text.finalTitle}</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{professionalConfig.businessName}</h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">{text.finalText}</p>
                <div className="mt-6 grid gap-3">
                  {bookingHref ? (
                    <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] px-5 py-4 text-left text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5" style={{ backgroundColor: theme.accentStrong, boxShadow: `0 16px 40px ${theme.accentSoft}` }}>
                      <span className="inline-flex items-center gap-3"><Calendar className="h-5 w-5 transition-transform group-hover:scale-110" />{text.book}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                  {whatsappHref ? (
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#25D366]/40 bg-[#25D366]/12 px-5 py-4 text-left text-base font-bold text-[#168d46] transition-all hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white">
                      <span className="inline-flex items-center gap-3"><MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />{text.whatsappHelp}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                  {emailHref ? (
                    <a href={emailHref} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-5 py-4 text-left text-base font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:border-sky-200">
                      <span className="inline-flex items-center gap-3"><Mail className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: theme.accentStrong }} />{text.emailCta}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>

              {professionalConfig.hours.length > 0 ? (
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: theme.accentStrong }}>{text.hoursTitle}</p>
                  <div className="mt-4 space-y-3 text-sm">
                    {professionalConfig.hours.slice(0, 7).map((item) => (
                      <div key={item.day} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-2 font-bold text-slate-900"><Clock3 className="h-4 w-4" style={{ color: theme.accentStrong }} />{item.day}</span>
                        <span className={item.closed ? 'font-semibold text-red-400' : 'font-semibold text-slate-500'}>{item.closed ? t.hours.closed : item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {!strictLivePreview ? (
        <>
          <FAQ items={business.faqs as any} />
          <ChatbotWidget
            t={t}
            businessInfo={{
              name: business.businessName,
              category: business.category,
              description: business.description,
              address: business.address,
              email: publicEmail || professionalConfig.contact.email,
              phone: business.phone || professionalConfig.contact.phone,
              hours: business.hours,
              services: services,
              bookingUrl: bookingHref ?? undefined,
              whatsappNumber: showWhatsapp ? business.whatsappNumber : undefined,
            }}
          />
          <Footer t={t} businessName={professionalConfig.businessName} />
        </>
      ) : null}
    </main>
  )
}
