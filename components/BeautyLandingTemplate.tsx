'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Calendar, Clock3, Mail, Menu, MessageCircle, Scissors, Sparkles, Star, X } from 'lucide-react'
import type { Language, Translations } from '@/lib/translations'
import { translations } from '@/lib/translations'
import ChatbotWidget from '@/components/ChatbotWidget'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import { getLandingTheme } from '@/lib/landing-themes'
import PreviewWatermark from '@/components/PreviewWatermark'
import Testimonials from '@/components/Testimonials'
import { beautyDemo } from '@/lib/vitrine-demo-data'
import type { BeautyConfig } from '@/lib/vitrine-types'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'

interface BeautyBusinessData {
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

interface BeautyPageConfig {
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
  business: BeautyBusinessData
  aiConfig?: BeautyPageConfig | null
  lang: Language
  setLang: (lang: Language) => void
  previewMode?: boolean
  showWatermark?: boolean
  businessId?: string
  via?: string
}

const copy = {
  pt: {
    badge: 'Beleza & bem-estar',
    servicesTitle: 'Os nossos serviços',
    servicesSubtitle: 'Tratamentos pensados para converter em poucos segundos',
    ambianceTitle: 'Ambiente, resultados e confiança',
    ambianceText: 'Mostramos o espaço, os destaques e a proposta do negócio para que a cliente perceba rapidamente o estilo do atendimento.',
    galleryTitle: 'Galeria do espaço',
    gallerySubtitle: 'Fotos que ajudam a vender a experiência antes do agendamento',
    teamTitle: 'Equipa em destaque',
    teamSubtitle: 'Especialistas que dão vida ao atendimento e à experiência do espaço',
    testimonialsTitle: 'O que dizem as clientes',
    finalTitle: 'Pronta para reservar?',
    finalText: 'Escolha o melhor canal para agendar, pedir preço ou esclarecer dúvidas sem sair da página.',
    book: 'Agendar agora',
    whatsapp: 'Falar no WhatsApp',
    emailCta: 'Enviar email',
    mapCta: 'Abrir no mapa',
    contact: 'Contacto',
    hours: 'Horário',
    closed: 'Fechado',
    category: 'Categoria',
    highlights: 'Destaques',
  },
  en: {
    badge: 'Beauty & wellness',
    servicesTitle: 'Our services',
    servicesSubtitle: 'Treatments arranged to convert in a few seconds',
    ambianceTitle: 'Ambience, results and trust',
    ambianceText: 'We show the space, key offers and positioning so customers quickly understand the experience before booking.',
    galleryTitle: 'Space gallery',
    gallerySubtitle: 'Photos that sell the experience before the appointment',
    teamTitle: 'Featured team',
    teamSubtitle: 'Specialists who bring the service and in-person experience to life',
    testimonialsTitle: 'What clients say',
    finalTitle: 'Ready to book?',
    finalText: 'Choose the fastest channel to book, ask for pricing or clear up questions without leaving the page.',
    book: 'Book now',
    whatsapp: 'Message on WhatsApp',
    emailCta: 'Send email',
    mapCta: 'Open map',
    contact: 'Contact',
    hours: 'Hours',
    closed: 'Closed',
    category: 'Category',
    highlights: 'Highlights',
  },
  es: {
    badge: 'Belleza y bienestar',
    servicesTitle: 'Nuestros servicios',
    servicesSubtitle: 'Tratamientos organizados para convertir en pocos segundos',
    ambianceTitle: 'Ambiente, resultados y confianza',
    ambianceText: 'Mostramos el espacio, los destacados y la propuesta para que la clienta entienda la experiencia antes de reservar.',
    galleryTitle: 'Galería del espacio',
    gallerySubtitle: 'Fotos que venden la experiencia antes de la cita',
    teamTitle: 'Equipo destacado',
    teamSubtitle: 'Especialistas que dan vida al servicio y a la experiencia del espacio',
    testimonialsTitle: 'Lo que dicen las clientas',
    finalTitle: '¿Lista para reservar?',
    finalText: 'Elige el canal más rápido para reservar, pedir precio o resolver dudas sin salir de la página.',
    book: 'Reservar ahora',
    whatsapp: 'Hablar por WhatsApp',
    emailCta: 'Enviar email',
    mapCta: 'Abrir en el mapa',
    contact: 'Contacto',
    hours: 'Horario',
    closed: 'Cerrado',
    category: 'Categoría',
    highlights: 'Destacados',
  },
  fr: {
    badge: 'Beauté et bien-être',
    servicesTitle: 'Nos services',
    servicesSubtitle: 'Des prestations organisées pour convertir rapidement',
    ambianceTitle: 'Ambiance, résultats et confiance',
    ambianceText: 'Nous montrons le lieu, les offres clés et le positionnement pour que la cliente comprenne l’expérience avant de réserver.',
    galleryTitle: 'Galerie du lieu',
    gallerySubtitle: 'Des photos qui vendent l’expérience avant le rendez-vous',
    teamTitle: 'Équipe en avant',
    teamSubtitle: 'Les spécialistes qui donnent vie au service et à l’expérience sur place',
    testimonialsTitle: 'Ce que disent les clientes',
    finalTitle: 'Prête à réserver ?',
    finalText: 'Choisissez le canal le plus rapide pour réserver, demander un prix ou poser vos questions sans quitter la page.',
    book: 'Réserver maintenant',
    whatsapp: 'Écrire sur WhatsApp',
    emailCta: 'Envoyer un email',
    mapCta: 'Ouvrir la carte',
    contact: 'Contact',
    hours: 'Horaires',
    closed: 'Fermé',
    category: 'Catégorie',
    highlights: 'Highlights',
  },
} as const

const navCopy = {
  pt: [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Contacto', href: '#contacto' },
  ],
  en: [
    { label: 'Services', href: '#servicos' },
    { label: 'Gallery', href: '#galeria' },
    { label: 'Contact', href: '#contacto' },
  ],
  es: [
    { label: 'Servicios', href: '#servicos' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Contacto', href: '#contacto' },
  ],
  fr: [
    { label: 'Services', href: '#servicos' },
    { label: 'Galerie', href: '#galeria' },
    { label: 'Contact', href: '#contacto' },
  ],
} as const

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

function deriveHighlightItems(business: BeautyBusinessData) {
  const serviceNames = business.services.filter((item) => item.name).slice(0, 3).map((item) => item.name)
  const benefitItems = business.benefits?.filter(Boolean).slice(0, 3) ?? []
  const items = [...serviceNames, ...benefitItems, business.category, business.address].filter(Boolean)
  return items.slice(0, 4)
}

function BeautyHeader({ businessName, lang, setLang, bookingHref, whatsappHref, text, businessId, via }: { businessName: string; lang: Language; setLang: (lang: Language) => void; bookingHref: string | null; whatsappHref: string | null; text: (typeof copy)[Language]; businessId?: string; via?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navItems = navCopy[lang] ?? navCopy.en

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${isScrolled ? 'border-b border-rose-900/10 bg-white/92 shadow-sm backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#top" className="text-lg font-black tracking-tight text-slate-900">{businessName}</a>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">
              {item.label}
            </a>
          ))}
          <select value={lang} onChange={(event) => setLang(event.target.value as Language)} className="rounded-full border border-rose-900/10 bg-white px-3 py-2 text-xs font-black text-slate-900 outline-none">
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
          {bookingHref ? (
            <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800">
              <Calendar className="h-4 w-4" />
              {text.book}
            </a>
          ) : whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-5 py-2.5 text-sm font-black text-[#168d46] transition-all hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white">
              <MessageCircle className="h-4 w-4" />
              {text.whatsapp}
            </a>
          ) : null}
        </nav>

        <button type="button" className="md:hidden" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Menu">
          {mobileMenuOpen ? <X className="h-6 w-6 text-slate-900" /> : <Menu className="h-6 w-6 text-slate-900" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-rose-900/10 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-bold text-slate-600" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export default function BeautyLandingTemplate({ business, aiConfig, lang, setLang, previewMode = false, showWatermark = previewMode, businessId, via }: Props) {
  const t: Translations = translations[lang]
  const text = copy[lang] ?? copy.en
  const strictLivePreview = via === 'dashboard-live-preview'
  const activeSections = aiConfig?.sections ?? []
  const focusedSection = aiConfig?.focusSection ?? null
  const showSection = (section: string) => !strictLivePreview || activeSections.includes(section)
  const sectionState = (sections: string[], tone: 'rose' | 'neutral' = 'neutral') => {
    if (!strictLivePreview) return ''
    const isFocused = focusedSection ? sections.includes(focusedSection) : false
    const isActive = sections.some((section) => activeSections.includes(section))
    return `transition-all duration-500 ${isFocused ? tone === 'rose' ? 'ring-2 ring-rose-300/95 shadow-[0_14px_36px_rgba(244,114,182,0.12)]' : 'ring-2 ring-stone-300 shadow-[0_14px_36px_rgba(28,25,23,0.08)]' : isActive ? tone === 'rose' ? 'ring-1 ring-rose-200/90 shadow-[0_10px_30px_rgba(244,114,182,0.08)]' : 'ring-1 ring-stone-200 shadow-[0_10px_30px_rgba(28,25,23,0.05)]' : 'opacity-90 saturate-[0.98]'}`
  }
  const contactMethods = business.contactMethods?.length ? business.contactMethods : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')
  const bookingHref = showBooking && business.bookingUrl ? safeBookingHref(business.bookingUrl) : null
  const whatsappHref = showWhatsapp && business.whatsappNumber ? whatsAppHref(business.whatsappNumber, business.whatsappMessage) : null
  const beautyConfig: BeautyConfig = useMemo(() => {
    const baseBeauty = strictLivePreview
      ? {
          ...beautyDemo,
          businessName: '',
          tagline: '',
          heroImage: '',
          bookingUrl: '',
          hours: [],
          services: [],
          gallery: [],
          testimonials: [],
          team: [],
          contact: {
            ...beautyDemo.contact,
            phone: '',
            whatsapp: '',
            email: '',
            address: '',
            googleMapsUrl: '',
          },
        }
      : beautyDemo
    const serviceItems = business.services?.filter((service) => service.name).slice(0, 8).map((service, index) => ({
      id: String(index + 1),
      name: service.name,
      description: service.description,
      price: service.price,
      image: service.photo,
    }))
    const galleryItems = business.photos?.filter(Boolean).map((photo, index) => ({
      id: String(index + 1),
      src: photo,
      alt: `${business.businessName} ${index === 0 ? 'hero' : `gallery ${index}`}`,
    }))
    const hourItems = business.hours?.filter(Boolean).map((item) => ({
      day: item.day,
      hours: item.open ? `${item.from} - ${item.to}` : '',
      closed: !item.open,
    }))

    return {
      ...baseBeauty,
      businessName: business.businessName || baseBeauty.businessName,
      tagline: aiConfig?.copy?.subheadline?.trim() || business.description || baseBeauty.tagline,
      heroImage: business.photos?.[0] || baseBeauty.heroImage,
      bookingUrl: business.bookingUrl || baseBeauty.bookingUrl,
      contact: {
        ...baseBeauty.contact,
        phone: business.phone || baseBeauty.contact.phone,
        whatsapp: business.whatsappNumber || baseBeauty.contact.whatsapp,
        email: business.email || baseBeauty.contact.email,
        address: business.address || baseBeauty.contact.address,
        googleMapsUrl: business.mapUrl || baseBeauty.contact.googleMapsUrl,
      },
      hours: hourItems?.length ? hourItems : baseBeauty.hours,
      services: serviceItems?.length ? serviceItems : baseBeauty.services,
      gallery: galleryItems?.length ? galleryItems : baseBeauty.gallery,
      testimonials: business.testimonials?.length ? business.testimonials as any : baseBeauty.testimonials,
    }
  }, [aiConfig?.copy?.subheadline, business, strictLivePreview])
  const heroPhoto = beautyConfig.heroImage || (strictLivePreview ? '' : 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80')
  const aboutPhoto = beautyConfig.gallery?.[1]?.src || beautyConfig.gallery?.[0]?.src || heroPhoto
  const galleryPhotos = (beautyConfig.gallery ?? []).map((item) => item.src).filter(Boolean)
  const theme = getLandingTheme(aiConfig?.style?.themeId ?? aiConfig?.style?.mood ?? business.themeId)
  const headline = aiConfig?.copy?.headline?.trim() || beautyConfig.businessName
  const subtitle = business.subtitle?.trim() || aiConfig?.copy?.subheadline?.trim() || ''
  const services = beautyConfig.services.map((service) => ({
    name: service.name,
    price: service.price || '',
    description: service.description,
    photo: service.image,
  }))
  const highlights = useMemo(() => deriveHighlightItems(business), [business])
  const publicEmail = showEmail ? business.email : undefined
  const aboutText = business.description?.trim() || ''
  const mapEmbedUrl = getMapEmbedUrl(beautyConfig.contact.address, beautyConfig.contact.googleMapsUrl)
  const directionsUrl = getDirectionsUrl(beautyConfig.contact.address, beautyConfig.contact.googleMapsUrl)
  const emailHref = publicEmail ? `mailto:${publicEmail}` : null
  const shouldShowAbout = showSection('about') && Boolean(aboutPhoto || aboutText)
  const shouldShowServices = showSection('services') && services.length > 0
  const shouldShowContact = showSection('contact') && (Boolean(bookingHref) || Boolean(whatsappHref) || Boolean(emailHref) || beautyConfig.hours.length > 0 || Boolean(mapEmbedUrl))

  return (
    <main id="top" className="min-h-screen text-slate-900" style={{ backgroundImage: theme.pageBackground }}>
      {showWatermark ? <PreviewWatermark lang={lang} businessName={beautyConfig.businessName} /> : null}
      <BeautyHeader businessName={beautyConfig.businessName} lang={lang} setLang={setLang} bookingHref={bookingHref} whatsappHref={whatsappHref} text={text} businessId={businessId} via={via} />

      <section data-preview-section="hero" className={`relative overflow-hidden pt-20 ${sectionState(['hero'], 'rose')}`}>
        <div className="absolute inset-0" style={{ backgroundImage: theme.heroBackground }} />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-rose-900/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {business.category || beautyConfig.ambiance || text.badge}
            </span>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">{headline}</h1>
            {subtitle ? <p className="mt-4 max-w-xl text-base font-semibold uppercase tracking-[0.14em]" style={{ color: theme.accentStrong }}>{subtitle}</p> : null}

            <div className="mt-8 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-rose-900/10 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              {bookingHref ? (
                <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-slate-900/15 transition-all hover:-translate-y-1 hover:bg-slate-800">
                  <Calendar className="h-6 w-6 transition-transform group-hover:scale-110" />
                  {aiConfig?.copy?.primaryCta || text.book}
                </a>
              ) : null}
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="group inline-flex items-center gap-3 rounded-full border-2 border-[#25D366] bg-[#25D366]/10 px-8 py-4 text-lg font-black text-[#168d46] transition-all hover:-translate-y-1 hover:bg-[#25D366] hover:text-white">
                  <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
                  {text.whatsapp}
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-rose-300/30 blur-3xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl shadow-rose-950/10">
              {heroPhoto ? <Image src={heroPhoto} alt={beautyConfig.businessName} fill className="object-cover" priority unoptimized={heroPhoto.startsWith('data:')} /> : <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-white to-stone-100" />}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-80">
              <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl shadow-rose-950/10 backdrop-blur">
                <p className="font-black text-slate-900">{beautyConfig.businessName}</p>
                <p className="mt-1 text-sm font-bold text-rose-700">{business.category}</p>
                <div className="mt-3 flex items-center gap-1 text-amber-500">
                  {[0, 1, 2, 3, 4].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {shouldShowServices ? (
      <section data-preview-section="services" id="servicos" className={`py-20 ${sectionState(['services'], 'rose')}`} style={{ backgroundImage: theme.softSectionBackground }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">{text.servicesTitle}</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">{text.servicesTitle}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <div key={`${service.name}-${index}`} className="group overflow-hidden rounded-[1.5rem] border border-rose-900/10 bg-[#fff7fa] p-5 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-rose-950/10">
                {service.photo ? (
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-rose-100">
                    <Image src={service.photo} alt={service.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized={service.photo.startsWith('data:')} />
                  </div>
                ) : (
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                    <Scissors className="h-6 w-6" />
                  </div>
                )}
                <h3 className="text-xl font-black text-slate-900">{service.name}</h3>
                {service.description ? <p className="mt-3 text-sm leading-relaxed text-slate-600">{service.description}</p> : null}
                <div className="mt-5 flex items-center justify-between gap-3">
                  {formatPrice(service.price) ? <p className="text-lg font-black text-rose-700">{formatPrice(service.price)}</p> : <span className="text-sm font-bold text-slate-400">&nbsp;</span>}
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
                    <Clock3 className="h-3.5 w-3.5" />
                    {business.hours?.some((item) => item.open) ? text.book : text.contact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {shouldShowAbout ? (
      <section data-preview-section="about" id="ambiente" className={`py-20 ${sectionState(['about'], 'rose')}`}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl shadow-rose-950/10">
            {aboutPhoto ? <Image src={aboutPhoto} alt={`${beautyConfig.businessName} space`} fill className="object-cover" unoptimized={aboutPhoto.startsWith('data:')} /> : <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-white to-stone-100" />}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-rose-950/5 md:p-12">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">{text.ambianceTitle}</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">{beautyConfig.businessName}</h2>
            {aboutText ? <p className="mt-5 text-lg leading-relaxed text-slate-600">{aboutText}</p> : null}
          </div>
        </div>
      </section>
      ) : null}

      {beautyConfig.team && beautyConfig.team.length > 0 ? (
        <section className="bg-[#fff7fa] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">{text.teamTitle}</p>
              <h2 className="mt-3 text-4xl font-black text-slate-900">{text.teamSubtitle}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {beautyConfig.team.slice(0, 3).map((member) => (
                <div key={member.id} className="overflow-hidden rounded-[1.75rem] border border-rose-900/10 bg-white p-5 shadow-lg shadow-rose-950/5">
                  {member.image ? (
                    <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-rose-100">
                      <Image src={member.image} alt={member.name} fill className="object-cover" unoptimized={member.image.startsWith('data:')} />
                    </div>
                  ) : null}
                  <h3 className="text-xl font-black text-slate-900">{member.name}</h3>
                  <p className="mt-1 text-sm font-bold text-rose-700">{member.role}</p>
                  {member.specialties?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.specialties.slice(0, 3).map((specialty) => (
                        <span key={specialty} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showSection('gallery') && galleryPhotos.length > 0 ? (
        <section data-preview-section="gallery" id="galeria" className={`bg-white py-20 ${sectionState(['gallery'], 'rose')}`}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">{text.galleryTitle}</p>
              <h2 className="mt-3 text-4xl font-black text-slate-900">{text.gallerySubtitle}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-12">
              {galleryPhotos.slice(0, 5).map((photo, index) => (
                <div key={`${photo}-${index}`} className={`relative overflow-hidden rounded-[1.75rem] ${index === 0 ? 'md:col-span-7 md:row-span-2 min-h-[420px]' : index === 1 ? 'md:col-span-5 min-h-[200px]' : 'md:col-span-4 min-h-[220px]'}`}>
                  <Image src={photo} alt={`Beauty gallery ${index + 1}`} fill className="object-cover transition-transform duration-500 hover:scale-105" unoptimized={photo.startsWith('data:')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {beautyConfig.testimonials && beautyConfig.testimonials.length > 0 ? (
        <div className="bg-white">
          <div className="mx-auto max-w-6xl px-4 pt-6 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">{text.testimonialsTitle}</p>
          </div>
          <Testimonials testimonials={beautyConfig.testimonials as any} showDefaults={previewMode} />
        </div>
      ) : null}

      {shouldShowContact ? (
      <section data-preview-section="contact" id="contacto" className={`py-20 ${sectionState(['contact', 'hours'], 'rose')}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] p-8 shadow-xl shadow-rose-950/5 md:p-12" style={{ backgroundColor: theme.cardBackground }}>
            <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
              <div className="overflow-hidden rounded-[1.75rem] border border-rose-900/10 bg-white shadow-lg shadow-rose-950/5">
                {mapEmbedUrl ? (
                  <>
                    <iframe title={`${beautyConfig.businessName} map`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-[420px] w-full border-0" />
                    {directionsUrl ? (
                      <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border-t border-rose-900/10 px-5 py-4 text-sm font-black text-rose-700 transition-colors hover:bg-rose-50">
                        <ArrowUpRight className="h-4 w-4" />
                        {text.mapCta}
                      </a>
                    ) : null}
                  </>
                ) : (
                  <div className="flex min-h-[420px] items-end bg-gradient-to-br from-rose-100 via-white to-stone-100 p-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">{text.finalTitle}</p>
                      <h2 className="mt-3 text-4xl font-black text-slate-900">{beautyConfig.businessName}</h2>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-[1.75rem] border border-rose-900/10 p-7 shadow-sm" style={{ backgroundImage: theme.softSectionBackground }}>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-700">{text.finalTitle}</p>
                  <h2 className="mt-3 text-3xl font-black text-slate-900">{beautyConfig.businessName}</h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">{text.finalText}</p>
                  <div className="mt-6 grid gap-3">
                    {bookingHref ? (
                      <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] bg-slate-900 px-5 py-4 text-left text-base font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800">
                        <span className="inline-flex items-center gap-3"><Calendar className="h-5 w-5 transition-transform group-hover:scale-110" />{text.book}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                    {whatsappHref ? (
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#25D366]/40 bg-[#25D366]/12 px-5 py-4 text-left text-base font-black text-[#168d46] transition-all hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white">
                        <span className="inline-flex items-center gap-3"><MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />{text.whatsapp}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                    {emailHref ? (
                      <a href={emailHref} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] border border-rose-900/10 bg-white px-5 py-4 text-left text-base font-black text-slate-900 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700">
                        <span className="inline-flex items-center gap-3"><Mail className="h-5 w-5 transition-transform group-hover:scale-110" />{text.emailCta}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>

                {beautyConfig.hours.length > 0 ? (
                  <div className="rounded-[1.75rem] border border-rose-900/10 bg-white p-6 shadow-sm">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-700">{text.hours}</p>
                    <div className="mt-4 space-y-3 text-sm">
                      {beautyConfig.hours.slice(0, 7).map((item) => (
                        <div key={item.day} className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50/60 px-4 py-3">
                          <span className="font-black text-slate-900">{item.day}</span>
                          <span className={item.closed ? 'font-semibold text-rose-500' : 'font-semibold text-slate-500'}>{item.closed ? text.closed : item.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
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
              email: publicEmail,
              phone: business.phone,
              hours: business.hours,
              services: business.services,
              bookingUrl: bookingHref ?? undefined,
              whatsappNumber: showWhatsapp ? business.whatsappNumber : undefined,
            }}
          />
          <Footer t={t} businessName={business.businessName} />
        </>
      ) : null}
    </main>
  )
}