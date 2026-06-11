'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Check, Mail, MapPin, Menu, Palette, Phone, Utensils, X } from 'lucide-react'
import type { Language, Translations } from '@/lib/translations'
import { translations } from '@/lib/translations'
import ChatbotWidget from '@/components/ChatbotWidget'
import FAQ from '@/components/FAQ'
import FoodMenuBlock from '@/components/FoodMenuBlock'
import Footer from '@/components/Footer'
import { getLandingTheme } from '@/lib/landing-themes'
import PreviewWatermark from '@/components/PreviewWatermark'
import Reveal from '@/components/Reveal'
import Testimonials from '@/components/Testimonials'
import { foodDemo } from '@/lib/vitrine-demo-data'
import type { FoodConfig } from '@/lib/vitrine-types'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'

interface FoodBusinessData {
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
  menuUrl?: string
  menuImageUrl?: string
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

interface FoodPageConfig {
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
  business: FoodBusinessData
  aiConfig?: FoodPageConfig | null
  lang: Language
  setLang: (lang: Language) => void
  previewMode?: boolean
  showWatermark?: boolean
  businessId?: string
  via?: string
}

const copy = {
  pt: {
    menu: 'Menu',
    gallery: 'Galeria',
    testimonials: 'Testemunhos',
    contact: 'Contacto',
    reserve: 'Reservar mesa',
    order: 'Falar no WhatsApp',
    cuisine: 'Restaurante',
    galleryTitle: 'O nosso espaço',
    gallerySubtitle: 'Ambiente, pratos e detalhes que ajudam a decidir mais rápido',
    finalTitle: 'Pronto para reservar ou pedir?',
    finalText: 'Use o canal mais rápido para reservar mesa, fazer uma encomenda ou tirar dúvidas sem sair da página.',
    hours: 'Horário',
    closed: 'Fechado',
      emailCta: 'Enviar email',
      mapCta: 'Abrir no mapa',
  },
  en: {
    menu: 'Menu',
    gallery: 'Gallery',
    testimonials: 'Testimonials',
    contact: 'Contact',
    reserve: 'Reserve table',
    order: 'WhatsApp',
    cuisine: 'Restaurant',
    galleryTitle: 'Our space',
    gallerySubtitle: 'Atmosphere, dishes and details that help guests decide faster',
    finalTitle: 'Ready to book or order?',
    finalText: 'Use the fastest channel to reserve a table, place an order or ask questions without leaving the page.',
    hours: 'Hours',
    closed: 'Closed',
      emailCta: 'Send email',
      mapCta: 'Open map',
  },
  es: {
    menu: 'Menú',
    gallery: 'Galería',
    testimonials: 'Testimonios',
    contact: 'Contacto',
    reserve: 'Reservar mesa',
    order: 'Hablar por WhatsApp',
    cuisine: 'Restaurante',
    galleryTitle: 'Nuestro espacio',
    gallerySubtitle: 'Ambiente, platos y detalles que ayudan a decidir más rápido',
    finalTitle: '¿Listo para reservar o pedir?',
    finalText: 'Usa el canal más rápido para reservar mesa, pedir o resolver dudas sin salir de la página.',
    hours: 'Horario',
    closed: 'Cerrado',
      emailCta: 'Enviar email',
      mapCta: 'Abrir en el mapa',
  },
  fr: {
    menu: 'Menu',
    gallery: 'Galerie',
    testimonials: 'Témoignages',
    contact: 'Contact',
    reserve: 'Réserver une table',
    order: 'Parler sur WhatsApp',
    cuisine: 'Restaurant',
    galleryTitle: 'Notre espace',
    gallerySubtitle: 'Ambiance, plats et détails qui aident à décider plus vite',
    finalTitle: 'Prêt à réserver ou commander ?',
    finalText: 'Utilisez le canal le plus rapide pour réserver, commander ou poser vos questions sans quitter la page.',
    hours: 'Horaires',
    closed: 'Fermé',
      emailCta: 'Envoyer un email',
      mapCta: 'Ouvrir la carte',
  },
} as const

const navCopy = {
  pt: [
    { label: 'Menu', href: '#menu' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Testemunhos', href: '#testemunhos' },
    { label: 'Contacto', href: '#contacto' },
  ],
  en: [
    { label: 'Menu', href: '#menu' },
    { label: 'Gallery', href: '#galeria' },
    { label: 'Testimonials', href: '#testemunhos' },
    { label: 'Contact', href: '#contacto' },
  ],
  es: [
    { label: 'Menú', href: '#menu' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Testimonios', href: '#testemunhos' },
    { label: 'Contacto', href: '#contacto' },
  ],
  fr: [
    { label: 'Menu', href: '#menu' },
    { label: 'Galerie', href: '#galeria' },
    { label: 'Témoignages', href: '#testemunhos' },
    { label: 'Contact', href: '#contacto' },
  ],
} as const

const VIVID_PALETTES = [
  { id: 'amber', label: 'Âmbar', dot: '#F59E0B', accent: '#F59E0B', accentStrong: '#B45309', accentSoft: 'rgba(245,158,11,0.16)', page: 'linear-gradient(180deg,#f7e7c4 0%,#fdf3df 45%,#eccf95 100%)', surface: 'linear-gradient(180deg,rgba(180,108,20,0.12),rgba(180,108,20,0.04))', card: '#fffdf6', line: 'rgba(120,72,10,0.20)', ink: '#3a2a08' },
  { id: 'emerald', label: 'Esmeralda', dot: '#10B981', accent: '#10B981', accentStrong: '#047857', accentSoft: 'rgba(16,185,129,0.16)', page: 'linear-gradient(180deg,#cdeede 0%,#ecfaf3 45%,#aee4cd 100%)', surface: 'linear-gradient(180deg,rgba(4,120,87,0.12),rgba(4,120,87,0.04))', card: '#f7fffb', line: 'rgba(4,120,87,0.20)', ink: '#063b2c' },
  { id: 'royal', label: 'Azul Royal', dot: '#3B82F6', accent: '#3B82F6', accentStrong: '#1D4ED8', accentSoft: 'rgba(59,130,246,0.16)', page: 'linear-gradient(180deg,#d2e2ff 0%,#ecf3ff 45%,#b5d0ff 100%)', surface: 'linear-gradient(180deg,rgba(29,78,216,0.12),rgba(29,78,216,0.04))', card: '#f6faff', line: 'rgba(29,78,216,0.20)', ink: '#0c2a6b' },
  { id: 'magenta', label: 'Magenta', dot: '#EC4899', accent: '#EC4899', accentStrong: '#BE185D', accentSoft: 'rgba(236,72,153,0.16)', page: 'linear-gradient(180deg,#fbd2e7 0%,#fde9f3 45%,#f7b6d6 100%)', surface: 'linear-gradient(180deg,rgba(190,24,93,0.12),rgba(190,24,93,0.04))', card: '#fffafc', line: 'rgba(190,24,93,0.20)', ink: '#6b0f3a' },
  { id: 'violet', label: 'Violeta', dot: '#8B5CF6', accent: '#8B5CF6', accentStrong: '#6D28D9', accentSoft: 'rgba(139,92,246,0.16)', page: 'linear-gradient(180deg,#e0d2ff 0%,#f0eaff 45%,#cfb8ff 100%)', surface: 'linear-gradient(180deg,rgba(109,40,217,0.12),rgba(109,40,217,0.04))', card: '#fbfaff', line: 'rgba(109,40,217,0.20)', ink: '#3a1a78' },
] as const

type VividPalette = (typeof VIVID_PALETTES)[number]

function trackClick(businessId: string | undefined, via: string | undefined, eventType: 'booking_click' | 'whatsapp_click') {
  if (!businessId) return
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId, via: via ?? null, eventType }),
  }).catch(() => undefined)
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function PalettePicker({ paletteId, setPaletteId, label }: { paletteId: string | null; setPaletteId: (id: string | null) => void; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)
        }
        title={label}
        aria-label={label}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[color:var(--accent-strong)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <Palette className="h-4 w-4" />
      </button>
      {open ? (
        <>
          <button type="button" aria-hidden className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
            <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <div className="flex items-center justify-between gap-1">
              {VIVID_PALETTES.map((palette) => {
                const active = palette.id === paletteId
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => { setPaletteId(active ? null : palette.id); setOpen(false) }}
                    title={palette.label}
                    aria-label={palette.label}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${active ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                    style={{ backgroundColor: palette.dot }}
                  >
                    {active ? <Check className="h-4 w-4 text-white" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function FoodHeader({ businessName, lang, setLang, bookingHref, whatsappHref, text, businessId, via, paletteId, setPaletteId, paletteLabel }: { businessName: string; lang: Language; setLang: (lang: Language) => void; bookingHref: string | null; whatsappHref: string | null; text: (typeof copy)[Language]; businessId?: string; via?: string; paletteId: string | null; setPaletteId: (id: string | null) => void; paletteLabel: string }) {
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
    <header className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${isScrolled ? 'border-b border-[color:var(--line)] bg-white/92 shadow-sm backdrop-blur-xl' : 'bg-white/20 backdrop-blur-xl'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#top" className="text-lg font-black tracking-tight text-slate-900">{businessName}</a>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-bold text-slate-600 transition-colors hover:text-slate-900">
              {item.label}
            </a>
          ))}
          <select value={lang} onChange={(event) => setLang(event.target.value as Language)} className="rounded-full border border-amber-900/10 bg-white px-3 py-2 text-xs font-black text-slate-900 outline-none">
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
          <PalettePicker paletteId={paletteId} setPaletteId={setPaletteId} label={paletteLabel} />
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/12 px-4 py-2.5 text-sm font-black text-[#168d46] transition-all hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white">
              <WhatsAppIcon className="h-4 w-4" />
              {text.order}
            </a>
          ) : null}
          {bookingHref ? (
            <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]">
              {text.reserve}
            </a>
          ) : null}
        </nav>

        <button type="button" className="md:hidden" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Menu">
          {mobileMenuOpen ? <X className="h-6 w-6 text-slate-900" /> : <Menu className="h-6 w-6 text-slate-900" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-[color:var(--line)] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-bold text-slate-600" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{paletteLabel}</span>
              <div className="flex items-center gap-1.5">
                {VIVID_PALETTES.map((palette) => {
                  const active = palette.id === paletteId
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setPaletteId(active ? null : palette.id)}
                      title={palette.label}
                      aria-label={palette.label}
                      className={`h-7 w-7 rounded-full transition-transform ${active ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                      style={{ backgroundColor: palette.dot }}
                    />
                  )
                })}
              </div>
            </div>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => { setMobileMenuOpen(false); trackClick(businessId, via, 'whatsapp_click') }} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/12 px-4 py-3 text-sm font-black text-[#168d46] transition-all hover:bg-[#25D366] hover:text-white">
                <WhatsAppIcon className="h-4 w-4" />
                {text.order}
              </a>
            ) : null}
            {bookingHref ? (
              <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => { setMobileMenuOpen(false); trackClick(businessId, via, 'booking_click') }} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-black text-white transition-all hover:bg-[var(--accent-strong)]">
                {text.reserve}
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export default function FoodLandingTemplate({ business, aiConfig, lang, setLang, previewMode = false, showWatermark = previewMode, businessId, via }: Props) {
  const t: Translations = translations[lang]
  const text = copy[lang] ?? copy.en
  const [paletteId, setPaletteId] = useState<string | null>(null)
  const activePalette: VividPalette | undefined = VIVID_PALETTES.find((palette) => palette.id === paletteId)
  const paletteLabel = lang === 'pt' ? 'Cor do ambiente' : lang === 'es' ? 'Color del ambiente' : lang === 'fr' ? 'Couleur d’ambiance' : 'Ambient color'
  const strictLivePreview = via === 'dashboard-live-preview'
  const activeSections = aiConfig?.sections ?? []
  const focusedSection = aiConfig?.focusSection ?? null
  const showSection = (section: string) => !strictLivePreview || activeSections.includes(section)
  const sectionState = (sections: string[]) => {
    if (!strictLivePreview) return ''
    const isFocused = focusedSection ? sections.includes(focusedSection) : false
    const isActive = sections.some((section) => activeSections.includes(section))
    return `transition-all duration-500 ${isFocused ? 'ring-2 ring-amber-300/95 shadow-[0_14px_36px_rgba(245,158,11,0.12)]' : isActive ? 'ring-1 ring-amber-200/90 shadow-[0_10px_30px_rgba(245,158,11,0.08)]' : 'opacity-90 saturate-[0.98]'}`
  }
  const contactMethods = business.contactMethods?.length ? business.contactMethods : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')
  const bookingHref = showBooking && business.bookingUrl ? safeBookingHref(business.bookingUrl) : null
  const whatsappHref = showWhatsapp && business.whatsappNumber ? whatsAppHref(business.whatsappNumber, business.whatsappMessage) : null
  const foodConfig: FoodConfig = useMemo(() => {
    const normalizedBusinessPhotos = business.photos?.filter(Boolean) ?? []
    const baseFood = strictLivePreview
      ? {
          ...foodDemo,
          businessName: '',
          tagline: '',
          heroImage: '',
          reservationUrl: '',
          deliveryUrl: '',
          menu: [],
          hours: [],
          services: [],
          gallery: [],
          testimonials: [],
          contact: {
            ...foodDemo.contact,
            phone: '',
            whatsapp: '',
            email: '',
            address: '',
            googleMapsUrl: '',
          },
        }
      : foodDemo
    const galleryItems = normalizedBusinessPhotos.map((photo, index) => ({
      id: String(index + 1),
      src: photo,
      alt: `${business.businessName} ${index === 0 ? 'hero' : `gallery ${index}`}`,
    }))
    const hourItems = business.hours?.filter(Boolean).map((item) => ({
      day: item.day,
      hours: item.open ? `${item.from} - ${item.to}` : '',
      closed: !item.open,
    }))
    const serviceItems = business.services?.filter((service) => service.name).map((service, index) => ({
      id: String(index + 1),
      name: service.name,
      description: service.description || '',
      price: service.price || '',
      image: service.photo,
      category: business.category,
    }))
    const menuSections = serviceItems?.length
      ? [
          {
            id: 'menu-highlights',
            name: 'Menu',
            description: business.subtitle || business.description || '',
            items: serviceItems.map((service) => ({
              id: service.id,
              name: service.name,
              description: service.description || '',
              price: service.price || '',
              image: service.image,
              category: service.category || business.category || 'food',
              featured: true,
            })),
          },
        ]
      : baseFood.menu

    return {
      ...baseFood,
      businessName: business.businessName || '',
      tagline: aiConfig?.copy?.subheadline?.trim() || business.description || '',
      heroImage: normalizedBusinessPhotos[0] || baseFood.heroImage,
      cuisineType: business.category || '',
      reservationUrl: business.bookingUrl || baseFood.reservationUrl,
      deliveryUrl: business.menuUrl || baseFood.deliveryUrl,
      contact: {
        ...baseFood.contact,
        phone: business.phone || baseFood.contact.phone,
        whatsapp: business.whatsappNumber || baseFood.contact.whatsapp,
        email: business.email || baseFood.contact.email,
        address: business.address || baseFood.contact.address,
        googleMapsUrl: business.mapUrl || baseFood.contact.googleMapsUrl,
      },
      hours: hourItems?.length ? hourItems : baseFood.hours,
      services: serviceItems?.length ? serviceItems : baseFood.services,
      menu: menuSections,
      gallery: galleryItems?.length ? galleryItems : (strictLivePreview ? [] : baseFood.gallery),
      testimonials: business.testimonials?.length ? business.testimonials as any : baseFood.testimonials,
    }
  }, [aiConfig?.copy?.subheadline, business, strictLivePreview])
  const menuItems = useMemo(
    () => foodConfig.menu?.flatMap((section) => section.items) ?? foodConfig.services ?? [],
    [foodConfig],
  )
  const theme = getLandingTheme(aiConfig?.style?.themeId ?? aiConfig?.style?.mood ?? business.themeId)
  const headline = business.businessName?.trim() || aiConfig?.copy?.headline?.trim() || foodConfig.businessName
  const tagline = business.subtitle?.trim() || aiConfig?.copy?.subheadline?.trim() || foodConfig.tagline
  const publicEmail = showEmail ? business.email : undefined
  const uploadedServicePhotos = business.services.map((service) => service.photo).filter(Boolean) as string[]
  const uploadedGalleryPhotos = (foodConfig.gallery ?? []).map((item) => item.src).filter(Boolean)
  const heroPhoto = uploadedGalleryPhotos[0] || uploadedServicePhotos[0] || business.menuImageUrl || foodConfig.heroImage || (strictLivePreview ? '' : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80')
  const galleryPhotos = Array.from(new Set(uploadedGalleryPhotos.filter((photo) => photo !== heroPhoto && photo !== business.menuImageUrl))).slice(0, 4)
  const mapEmbedUrl = getMapEmbedUrl(business.address || foodConfig.contact.address, business.mapUrl || foodConfig.contact.googleMapsUrl)
  const directionsUrl = getDirectionsUrl(business.address || foodConfig.contact.address, business.mapUrl || foodConfig.contact.googleMapsUrl)
  const emailHref = publicEmail ? `mailto:${publicEmail}` : null

  const accentStyle = {
    backgroundImage: activePalette?.page ?? theme.pageBackground,
    ['--accent' as string]: activePalette?.accent ?? theme.accentColor,
    ['--accent-strong' as string]: activePalette?.accentStrong ?? theme.accentStrong,
    ['--accent-soft' as string]: activePalette?.accentSoft ?? theme.accentSoft,
    ['--surface' as string]: activePalette?.surface ?? theme.softSectionBackground,
    ['--card' as string]: activePalette?.card ?? theme.cardBackground,
    ['--line' as string]: activePalette?.line ?? 'rgba(120,53,15,0.12)',
  } as CSSProperties

  return (
    <main id="top" className="min-h-screen text-slate-900" style={accentStyle}>
      {showWatermark ? <PreviewWatermark lang={lang} businessName={foodConfig.businessName} /> : null}
      <FoodHeader businessName={foodConfig.businessName} lang={lang} setLang={setLang} bookingHref={bookingHref} whatsappHref={whatsappHref} text={text} businessId={businessId} via={via} paletteId={paletteId} setPaletteId={setPaletteId} paletteLabel={paletteLabel} />

      <section data-preview-section="hero" className={`relative flex min-h-screen items-center overflow-hidden ${sectionState(['hero'])}`}>
        <div className="absolute inset-0">
          {heroPhoto ? (
            <>
              <Image src={heroPhoto} alt={foodConfig.businessName} fill className="object-cover" priority unoptimized={heroPhoto.startsWith('data:')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
              <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'radial-gradient(circle at 25% 20%, var(--accent), transparent 60%)' }} />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-stone-100" />
              <div className="absolute inset-0" style={{ backgroundImage: theme.heroBackground }} />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-white/10" />
            </>
          )}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-32 text-center sm:px-6 lg:px-8">
          <span className={`inline-flex animate-float-slow items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-sm ${heroPhoto ? 'border-white/30 bg-white/15 text-white backdrop-blur-md' : 'border-black/5 bg-white text-[color:var(--accent-strong)]'}`}>
            <Utensils className="h-3.5 w-3.5" />
            {foodConfig.cuisineType || business.category || text.cuisine}
          </span>
          <h1 className={`mt-6 text-balance text-4xl font-black tracking-tight md:text-5xl lg:text-6xl ${heroPhoto ? 'text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]' : 'text-slate-900'}`}>{headline}</h1>
          {tagline ? <p className={`mx-auto mt-4 max-w-2xl text-lg md:text-xl ${heroPhoto ? 'text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]' : 'text-slate-600'}`}>{tagline}</p> : null}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {bookingHref ? (
              <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-base font-black text-white shadow-2xl shadow-black/15 transition-all hover:-translate-y-1 hover:bg-[var(--accent-strong)]">
                {text.reserve}
              </a>
            ) : null}
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className={`group inline-flex items-center gap-2 rounded-full border-2 px-6 py-3 text-base font-black transition-all hover:-translate-y-1 hover:bg-[#25D366] hover:text-white ${heroPhoto ? 'border-white/70 bg-white/10 text-white backdrop-blur-md' : 'border-[#25D366] bg-[#25D366]/10 text-[#168d46]'}`}>
                <WhatsAppIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                {text.order}
              </a>
            ) : null}
          </div>

          <div className={`mt-10 flex flex-wrap justify-center gap-6 text-sm ${heroPhoto ? 'text-white/80' : 'text-slate-500'}`}>
            {(business.address || foodConfig.contact.address) ? (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {business.address || foodConfig.contact.address}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {showSection('menu') ? (
      <div data-preview-section="menu" className={sectionState(['menu'])}>
      <FoodMenuBlock
        businessName={foodConfig.businessName}
        sectionLabel={foodConfig.cuisineType || business.category || text.menu}
        sectionTitle={headline}
        sectionDescription={tagline || business.description}
        services={menuItems.map((item) => ({
          name: item.name,
          price: item.price || '',
          description: item.description,
          photo: item.image,
        }))}
        photos={(foodConfig.gallery ?? []).map((item) => item.src)}
        bookingUrl={showBooking ? business.bookingUrl : undefined}
        whatsappNumber={showWhatsapp ? business.whatsappNumber : undefined}
        whatsappMessage={showWhatsapp ? business.whatsappMessage : undefined}
        menuUrl={business.menuUrl || foodConfig.deliveryUrl}
        menuImageUrl={business.menuImageUrl}
        lang={lang}
        showDefaults={previewMode && !strictLivePreview}
      />
      </div>
      ) : null}

      {showSection('gallery') && galleryPhotos.length > 0 ? (
        <section data-preview-section="gallery" id="galeria" className={`py-20 ${sectionState(['gallery'])}`} style={{ backgroundImage: 'var(--surface)' }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 text-center">
              <span className="mx-auto mb-3 block h-1 w-12 rounded-full bg-[var(--accent)]" />
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">{text.galleryTitle}</p>
              <h2 className="mt-3 text-4xl font-black text-slate-900">{text.gallerySubtitle}</h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-12">
              {galleryPhotos.map((photo, index) => (
                <Reveal key={`${photo}-${index}`} delay={index * 90} className={`group relative overflow-hidden rounded-[1.75rem] ${index === 0 ? 'md:col-span-7 md:row-span-2 min-h-[420px]' : index === 1 ? 'md:col-span-5 min-h-[200px]' : 'md:col-span-4 min-h-[220px]'}`}>
                  <Image src={photo} alt={`Food gallery ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized={photo.startsWith('data:')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {foodConfig.testimonials && foodConfig.testimonials.length > 0 ? (
        <section id="testemunhos" className="bg-white">
          <Testimonials testimonials={foodConfig.testimonials as any} showDefaults={previewMode} />
        </section>
      ) : null}

      {showSection('contact') ? (
      <section data-preview-section="contact" id="contacto" className={`py-20 ${sectionState(['contact', 'hours'])}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] p-8 shadow-xl shadow-amber-950/5 md:p-12" style={{ backgroundColor: 'var(--card)' }}>
            <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
              <div className="overflow-hidden rounded-[1.75rem] border border-[color:var(--line)] bg-white shadow-lg shadow-amber-950/5">
                {mapEmbedUrl ? (
                  <>
                    <div className="flex items-start justify-between gap-4 border-b border-[color:var(--line)] bg-[var(--accent-soft)] px-6 py-5">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">{text.contact}</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">{foodConfig.businessName}</h2>
                        {(business.address || foodConfig.contact.address) ? <p className="mt-2 max-w-xl text-sm text-slate-600">{business.address || foodConfig.contact.address}</p> : null}
                      </div>
                      {directionsUrl ? (
                        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-white px-4 py-2.5 text-sm font-black text-[color:var(--accent-strong)] transition-colors hover:bg-[var(--accent-soft)]">
                          <ArrowUpRight className="h-4 w-4" />
                          {text.mapCta}
                        </a>
                      ) : null}
                    </div>
                    <iframe title={`${foodConfig.businessName} map`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-[420px] w-full border-0" />
                  </>
                ) : (
                  <div className="flex min-h-[420px] items-end bg-[var(--accent-soft)] p-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">{text.finalTitle}</p>
                      <h2 className="mt-3 text-4xl font-black text-slate-900">{foodConfig.businessName}</h2>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-[1.75rem] border border-[color:var(--line)] p-7 shadow-sm" style={{ backgroundImage: 'var(--surface)' }}>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">{text.finalTitle}</p>
                  <h2 className="mt-3 text-3xl font-black text-slate-900">{foodConfig.businessName}</h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">{text.finalText}</p>
                  <div className="mt-6 grid gap-3">
                    {bookingHref ? (
                      <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] bg-slate-900 px-5 py-4 text-left text-base font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800">
                        <span>{text.reserve}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                    {whatsappHref ? (
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#25D366]/40 bg-[#25D366]/12 px-5 py-4 text-left text-base font-black text-[#168d46] transition-all hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white">
                        <span className="inline-flex items-center gap-3"><WhatsAppIcon className="h-5 w-5 transition-transform group-hover:scale-110" />{text.order}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                    {emailHref ? (
                      <a href={emailHref} className="group inline-flex items-center justify-between gap-3 rounded-[1.25rem] border border-[color:var(--line)] bg-white px-5 py-4 text-left text-base font-black text-slate-900 transition-all hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]">
                        <span className="inline-flex items-center gap-3"><Mail className="h-5 w-5 transition-transform group-hover:scale-110" />{text.emailCta}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">{text.hours}</p>
                  <div className="mt-4 space-y-3 text-sm">
                    {foodConfig.hours.slice(0, 7).map((item) => (
                      <div key={item.day} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-3">
                        <span className="font-black text-slate-900">{item.day}</span>
                        <span className={item.closed ? 'font-semibold text-red-500' : 'font-semibold text-slate-500'}>{item.closed ? text.closed : item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
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