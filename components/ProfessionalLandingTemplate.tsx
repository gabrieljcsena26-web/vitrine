'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Calendar, CheckCircle2, HeartPulse, MapPin, Menu, MessageCircle, Quote, ShieldCheck, Sparkles, Star, X } from 'lucide-react'
import type { Language, Translations } from '@/lib/translations'
import { translations } from '@/lib/translations'
import ChatbotWidget from '@/components/ChatbotWidget'
import ContactActions from '@/components/ContactActions'
import ContactForm from '@/components/ContactForm'
import FAQ from '@/components/FAQ'
import Testimonials from '@/components/Testimonials'
import PreviewWatermark from '@/components/PreviewWatermark'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'

interface ProfessionalBusinessData {
  id?: string
  businessName: string
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
  services: { name: string; price: string; description?: string; photo?: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
  photos: string[]
  mapUrl?: string | null
  benefits?: string[] | null
  testimonials?: any[] | null
  faqs?: { question: string; answer: string }[] | null
}

interface ProfessionalPageConfig {
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

const navCopy = {
  pt: [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Confiança', href: '#confianca' },
    { label: 'Contacto', href: '#contacto' },
  ],
  en: [
    { label: 'About', href: '#sobre' },
    { label: 'Services', href: '#servicos' },
    { label: 'Trust', href: '#confianca' },
    { label: 'Contact', href: '#contacto' },
  ],
  es: [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Servicios', href: '#servicos' },
    { label: 'Confianza', href: '#confianca' },
    { label: 'Contacto', href: '#contacto' },
  ],
  fr: [
    { label: 'À propos', href: '#sobre' },
    { label: 'Services', href: '#servicos' },
    { label: 'Confiance', href: '#confianca' },
    { label: 'Contact', href: '#contacto' },
  ],
} as const

const copy = {
  pt: {
    badge: 'Atendimento profissional',
    areas: 'Áreas de atuação',
    book: 'Marcar consulta',
    whatsapp: 'Falar no WhatsApp',
    approach: 'A nossa abordagem',
    approachText: 'Criamos uma experiência clara, segura e humana para que cada visitante entenda rapidamente como o serviço funciona e consiga tomar o próximo passo com confiança.',
    servicesTitle: 'Serviços',
    servicesSubtitle: 'Como podemos ajudar',
    trustTitle: 'Formação, confiança e clareza',
    trustSubtitle: 'Sinais de credibilidade que ajudam o cliente a decidir sem fricção.',
    finalTitle: 'Pronto para dar o primeiro passo?',
    finalText: 'Use o botão de agendamento do negócio ou fale diretamente no WhatsApp para esclarecer dúvidas antes de avançar.',
    location: 'Localização',
    hours: 'Horário',
    closed: 'Fechado',
    footer: 'Todos os direitos reservados.',
  },
  en: {
    badge: 'Professional care',
    areas: 'Practice areas',
    book: 'Book consultation',
    whatsapp: 'Message on WhatsApp',
    approach: 'Our approach',
    approachText: 'We create a clear, safe and human experience so each visitor quickly understands the service and can take the next step with confidence.',
    servicesTitle: 'Services',
    servicesSubtitle: 'How we can help',
    trustTitle: 'Credentials, trust and clarity',
    trustSubtitle: 'Credibility signals that help customers decide with less friction.',
    finalTitle: 'Ready to take the first step?',
    finalText: 'Use the business booking link or message directly on WhatsApp to ask questions before moving forward.',
    location: 'Location',
    hours: 'Hours',
    closed: 'Closed',
    footer: 'All rights reserved.',
  },
  es: {
    badge: 'Atención profesional',
    areas: 'Áreas de actuación',
    book: 'Reservar consulta',
    whatsapp: 'Hablar por WhatsApp',
    approach: 'Nuestro enfoque',
    approachText: 'Creamos una experiencia clara, segura y humana para que cada visitante entienda el servicio y avance con confianza.',
    servicesTitle: 'Servicios',
    servicesSubtitle: 'Cómo podemos ayudar',
    trustTitle: 'Formación, confianza y claridad',
    trustSubtitle: 'Señales de credibilidad que ayudan al cliente a decidir sin fricción.',
    finalTitle: '¿Listo para dar el primer paso?',
    finalText: 'Usa el enlace de reserva del negocio o escribe por WhatsApp para aclarar dudas antes de avanzar.',
    location: 'Ubicación',
    hours: 'Horario',
    closed: 'Cerrado',
    footer: 'Todos los derechos reservados.',
  },
  fr: {
    badge: 'Accompagnement professionnel',
    areas: 'Domaines d’intervention',
    book: 'Réserver une consultation',
    whatsapp: 'Écrire sur WhatsApp',
    approach: 'Notre approche',
    approachText: 'Nous créons une expérience claire, sûre et humaine pour que chaque visiteur comprenne le service et passe à l’étape suivante avec confiance.',
    servicesTitle: 'Services',
    servicesSubtitle: 'Comment nous pouvons aider',
    trustTitle: 'Qualifications, confiance et clarté',
    trustSubtitle: 'Des signaux de crédibilité qui aident le client à décider sans friction.',
    finalTitle: 'Prêt à faire le premier pas ?',
    finalText: 'Utilisez le lien de réservation ou écrivez sur WhatsApp pour poser vos questions avant d’avancer.',
    location: 'Localisation',
    hours: 'Horaires',
    closed: 'Fermé',
    footer: 'Tous droits réservés.',
  },
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

function ProfessionalHeader({ businessName, logo, lang, setLang, bookingHref, whatsappHref, t, businessId, via }: { businessName: string; logo?: string; lang: Language; setLang: (lang: Language) => void; bookingHref: string | null; whatsappHref: string | null; t: (typeof copy)[Language]; businessId?: string; via?: string }) {
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
    <header className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${isScrolled ? 'border-b border-emerald-900/10 bg-white/92 shadow-sm backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#top" className="flex items-center gap-3">
          {logo ? (
            <Image src={logo} alt={businessName} width={42} height={42} className="rounded-2xl object-cover" unoptimized={logo.startsWith('data:')} />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-emerald-100 shadow-lg shadow-emerald-900/15">
              <HeartPulse className="h-5 w-5" />
            </span>
          )}
          <span className="text-lg font-black tracking-tight text-emerald-950">{businessName}</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-bold text-slate-500 transition-colors hover:text-emerald-950">
              {item.label}
            </a>
          ))}
          <select value={lang} onChange={(event) => setLang(event.target.value as Language)} className="rounded-full border border-emerald-900/10 bg-white px-3 py-2 text-xs font-black text-emerald-950 outline-none">
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
          {bookingHref ? (
            <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800">
              <ConsultationIcon className="h-4 w-4" />
              {t.book}
            </a>
          ) : whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5">
              <WhatsAppPremiumIcon className="h-4 w-4" />
              {t.whatsapp}
            </a>
          ) : null}
        </nav>

        <button className="rounded-full border border-emerald-900/10 p-2 md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-emerald-900/10 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="font-bold text-slate-600" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            {bookingHref && (
              <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-5 py-3 font-black text-white">
                <ConsultationIcon className="h-4 w-4" />
                {t.book}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

function ProfessionalContactSummary({ business, text }: { business: ProfessionalBusinessData; text: (typeof copy)[Language] }) {
  const schedule = business.hours?.filter(Boolean).slice(0, 7) ?? []

  return (
    <section id="contacto" className="bg-emerald-950 py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300 text-emerald-950">
            <MapPin className="h-6 w-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">{text.location}</p>
          <h3 className="mt-3 text-2xl font-black">{business.businessName}</h3>
          {business.address && <p className="mt-4 text-lg leading-relaxed text-emerald-50/80">{business.address}</p>}
          {business.email && <p className="mt-3 text-sm font-semibold text-emerald-200">{business.email}</p>}
        </div>

        {schedule.length > 0 && (
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white text-emerald-950 shadow-2xl shadow-emerald-950/20">
            <div className="flex items-center gap-3 bg-emerald-900 px-6 py-5 text-white">
              <Calendar className="h-5 w-5 text-emerald-200" />
              <p className="font-black">{text.hours}</p>
            </div>
            <div className="divide-y divide-emerald-50">
              {schedule.map((item) => (
                <div key={item.day} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                  <span className="font-black">{item.day}</span>
                  <span className={item.open ? 'font-semibold text-slate-500' : 'font-semibold text-red-400'}>{item.open ? `${item.from} - ${item.to}` : text.closed}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default function ProfessionalLandingTemplate({ business, aiConfig, lang, setLang, previewMode = false, showWatermark = previewMode, businessId, via }: Props) {
  const t: Translations = translations[lang]
  const text = copy[lang] ?? copy.en
  const contactMethods = business.contactMethods?.length ? business.contactMethods : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')
  const bookingHref = showBooking && business.bookingUrl ? safeBookingHref(business.bookingUrl) : null
  const whatsappHref = showWhatsapp && business.whatsappNumber ? whatsAppHref(business.whatsappNumber, business.whatsappMessage) : null
  const heroPhoto = business.photos?.[0] || 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80'
  const secondaryPhoto = business.photos?.[1] || heroPhoto
  const headline = aiConfig?.copy?.headline?.trim() || business.businessName
  const tagline = aiConfig?.copy?.subheadline?.trim() || business.description
  const services = business.services?.filter((service) => service.name).slice(0, 6) ?? []
  const areas = services.length ? services.slice(0, 4).map((service) => service.name) : [business.category]
  const trustItems = (business.benefits?.filter(Boolean).slice(0, 4) ?? [])
  const defaultTrust = [business.category, business.address ? text.location : text.trustTitle, bookingHref ? text.book : text.whatsapp].filter(Boolean)
  const credentials = trustItems.length ? trustItems : defaultTrust
  const publicEmail = showEmail ? business.email : undefined
  const contactSection = ((bookingHref && showBooking) || (whatsappHref && showWhatsapp)) ? (
    <ContactActions
      t={t}
      bookingUrl={bookingHref ?? undefined}
      whatsappNumber={showWhatsapp ? business.whatsappNumber : undefined}
      whatsappMessage={showWhatsapp ? business.whatsappMessage : undefined}
      businessId={businessId}
      via={via}
      showForm={showEmail}
    />
  ) : showEmail ? (
    <ContactForm t={t} businessId={businessId} via={via} />
  ) : null

  return (
    <main id="top" className="min-h-screen bg-[#f3faf6] text-emerald-950">
      {showWatermark && <PreviewWatermark lang={lang} businessName={business.businessName} />}
      <ProfessionalHeader businessName={business.businessName} logo={business.photos?.[2]} lang={lang} setLang={setLang} bookingHref={bookingHref} whatsappHref={whatsappHref} t={text} businessId={businessId} via={via} />

      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_38%),linear-gradient(135deg,#f3faf6_0%,#ffffff_48%,#e8f7ef_100%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {areas[0] || text.badge}
            </span>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-emerald-950 md:text-6xl">
              {headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {tagline}
            </p>

            {areas.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-black text-slate-500">{text.areas}:</p>
                <div className="flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <span key={area} className="rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              {bookingHref && (
                <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center gap-3 rounded-full bg-emerald-900 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-emerald-900/25 transition-all hover:-translate-y-1 hover:bg-emerald-800">
                  <ConsultationIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                  {aiConfig?.copy?.primaryCta || text.book}
                </a>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="group inline-flex items-center gap-3 rounded-full border-2 border-[#25D366] bg-[#25D366]/10 px-8 py-4 text-lg font-black text-[#168d46] transition-all hover:-translate-y-1 hover:bg-[#25D366] hover:text-white">
                  <WhatsAppPremiumIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                  {text.whatsapp}
                </a>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 h-44 w-44 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-emerald-950 shadow-2xl shadow-emerald-950/25">
              <Image src={heroPhoto} alt={business.businessName} fill className="object-cover" priority unoptimized={heroPhoto.startsWith('data:')} />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/55 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-80">
              <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl shadow-emerald-950/15 backdrop-blur">
                <p className="font-black text-emerald-950">{business.businessName}</p>
                <p className="mt-1 text-sm font-bold text-emerald-700">{business.category}</p>
                <div className="mt-3 flex items-center gap-1 text-amber-500">
                  {[0, 1, 2, 3, 4].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{credentials[0] || text.trustTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-emerald-950 shadow-2xl shadow-emerald-950/15">
            <Image src={secondaryPhoto} alt={`${business.businessName} practice`} fill className="object-cover opacity-85" unoptimized={secondaryPhoto.startsWith('data:')} />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-black backdrop-blur">{text.badge}</p>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-emerald-950/5 md:p-12">
            <Quote className="h-10 w-10 text-emerald-700/30" />
            <h2 className="mt-5 text-3xl font-black text-emerald-950 md:text-4xl">{text.approach}</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{business.description || text.approachText}</p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{text.approachText}</p>
          </div>
        </div>
      </section>

      <section id="servicos" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">{text.servicesTitle}</p>
            <h2 className="mt-3 text-4xl font-black text-emerald-950">{text.servicesSubtitle}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(services.length ? services : [{ name: business.category, price: '', description: business.description }]).map((service, index) => (
              <div key={`${service.name}-${index}`} className="group rounded-[1.5rem] border border-emerald-900/10 bg-[#f7fbf8] p-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-emerald-950/10">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 transition-colors group-hover:bg-emerald-900 group-hover:text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-emerald-950">{service.name}</h3>
                {service.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{service.description}</p>}
                {formatPrice(service.price) && <p className="mt-5 text-lg font-black text-emerald-700">{formatPrice(service.price)}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="confianca" className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">{text.trustTitle}</p>
            <h2 className="mt-3 text-4xl font-black text-emerald-950">{text.trustSubtitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.slice(0, 4).map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-900/5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-emerald-950">{item}</p>
                  <p className="mt-1 text-sm text-slate-500">{text.trustSubtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {business.testimonials && business.testimonials.length > 0 && (
        <div className="bg-white">
          <Testimonials testimonials={business.testimonials as any} showDefaults={previewMode} />
        </div>
      )}

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-emerald-950 md:text-5xl">{text.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{text.finalText}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {bookingHref && (
              <a href={bookingHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'booking_click')} className="group inline-flex items-center gap-3 rounded-full bg-emerald-900 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-emerald-900/25 transition-all hover:-translate-y-1 hover:bg-emerald-800">
                <ConsultationIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                {text.book}
              </a>
            )}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(businessId, via, 'whatsapp_click')} className="group inline-flex items-center gap-3 rounded-full border-2 border-[#25D366] bg-[#25D366]/10 px-8 py-4 text-lg font-black text-[#168d46] transition-all hover:-translate-y-1 hover:bg-[#25D366] hover:text-white">
                <WhatsAppPremiumIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                {text.whatsapp}
              </a>
            )}
          </div>
        </div>
      </section>

      <ProfessionalContactSummary business={business} text={text} />
      {contactSection ? <div>{contactSection}</div> : null}
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
      <footer className="border-t border-emerald-900/10 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-semibold text-slate-500">&copy; {new Date().getFullYear()} {business.businessName}. {text.footer}</p>
        </div>
      </footer>
    </main>
  )
}
