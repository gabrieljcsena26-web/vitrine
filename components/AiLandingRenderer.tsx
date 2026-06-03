'use client'

import Image from 'next/image'
import { BadgeCheck, Clock3, MapPin, ShieldCheck, Sparkles, Store } from 'lucide-react'
import { translations } from '@/lib/translations'
import type { Language } from '@/lib/translations'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Benefits from '@/components/Benefits'
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
import { inferBusinessTemplate } from '@/lib/business-categories'

export interface AiBusinessData {
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
  menuUrl?: string
  menuImageUrl?: string
  lang: string
  services: { name: string; price: string; description?: string; photo?: string }[]
  hours: { day: string; open: boolean; from: string; to: string }[]
  photos: string[]
  mapUrl?: string | null
  benefits?: string[] | null
  testimonials?: any[] | null
  faqs?: { question: string; answer: string }[] | null
}

export interface AiPageConfig {
  template?: string
  imageCount?: number
  sections?: string[]
  photoRoles?: {
    hero?: string | null
    about?: string | null
    gallery?: string[]
  }
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

type VisualVariant = 'cafe' | 'restaurant' | 'service' | 'technical'

const ALLOWED_PREVIEW_SECTIONS = ['about', 'benefits', 'services', 'menu', 'gallery', 'reviews', 'hours', 'location', 'faq', 'contact']

const previewCopy = {
  pt: {
    setupReadout: 'Leitura do setup',
    mood: 'Clima',
    builtFrom: 'Montada com base em fotos, categoria e proposta do cliente',
    setupSummary: 'Resumo inteligente',
    category: 'Categoria',
    photos: 'Fotos',
    sections: 'Secoes',
    ctas: 'CTAs',
    strategy: 'Direcao da IA',
    ready: 'Pronta para publicar',
    signature: 'Assinatura visual',
    experience: 'Experiência pensada para converter rápido',
    servicesTitle: 'Destaques que o cliente entende em segundos',
    galleryTitle: 'Galeria organizada para vender melhor',
    quickFacts: 'Fatos rápidos',
    storyTitle: 'História, espaço e proposta',
    trustTitle: 'Layout de confiança e clareza',
  },
  en: {
    setupReadout: 'Setup readout',
    mood: 'Mood',
    builtFrom: 'Built from photos, category and client positioning',
    setupSummary: 'Intelligent summary',
    category: 'Category',
    photos: 'Photos',
    sections: 'Sections',
    ctas: 'CTAs',
    strategy: 'AI direction',
    ready: 'Ready to publish',
    signature: 'Visual signature',
    experience: 'An experience shaped for quick conversion',
    servicesTitle: 'Highlights customers understand in seconds',
    galleryTitle: 'A gallery arranged to sell better',
    quickFacts: 'Quick facts',
    storyTitle: 'Story, place and positioning',
    trustTitle: 'Trust-first layout with clarity',
  },
  es: {
    setupReadout: 'Lectura del setup',
    mood: 'Estilo',
    builtFrom: 'Construida con fotos, categoría y propuesta del cliente',
    setupSummary: 'Resumen inteligente',
    category: 'Categoría',
    photos: 'Fotos',
    sections: 'Secciones',
    ctas: 'CTAs',
    strategy: 'Dirección de IA',
    ready: 'Lista para publicar',
    signature: 'Firma visual',
    experience: 'Experiencia pensada para convertir rápido',
    servicesTitle: 'Destacados que el cliente entiende en segundos',
    galleryTitle: 'Galería organizada para vender mejor',
    quickFacts: 'Datos rápidos',
    storyTitle: 'Historia, espacio y propuesta',
    trustTitle: 'Layout de confianza y claridad',
  },
  fr: {
    setupReadout: 'Lecture du setup',
    mood: 'Style',
    builtFrom: 'Construit à partir des photos, de la catégorie et du positionnement',
    setupSummary: 'Résumé intelligent',
    category: 'Catégorie',
    photos: 'Photos',
    sections: 'Sections',
    ctas: 'CTAs',
    strategy: 'Direction IA',
    ready: 'Prête à publier',
    signature: 'Signature visuelle',
    experience: 'Une expérience pensée pour convertir vite',
    servicesTitle: 'Des highlights compris en quelques secondes',
    galleryTitle: 'Une galerie organisée pour mieux vendre',
    quickFacts: 'Infos rapides',
    storyTitle: 'Histoire, lieu et positionnement',
    trustTitle: 'Mise en page de confiance et clarté',
  },
} as const

function getVisualVariant(category: string, template: string, mood?: string | null): VisualVariant {
  const normalizedCategory = category.toLowerCase()
  const normalizedMood = String(mood ?? '').toLowerCase()
  if (template === 'food') {
    if (['café', 'cafe', 'bakery', 'confeitaria', 'coffee'].some((item) => normalizedCategory.includes(item)) || normalizedMood.includes('artesanal')) {
      return 'cafe'
    }
    return 'restaurant'
  }
  if (template === 'technical') return 'technical'
  return 'service'
}

function PreviewMoodBand({ lang, accentColor, mood, recommendations, variant, categoryLabel, imageCount, sectionCount, primaryCta, secondaryCta }: { lang: Language; accentColor: string; mood?: string | null; recommendations?: string[]; variant: VisualVariant; categoryLabel: string; imageCount: number; sectionCount: number; primaryCta?: string | null; secondaryCta?: string | null }) {
  const copy = previewCopy[lang] ?? previewCopy.en
  const cards = (recommendations ?? []).filter(Boolean).slice(0, 3)
  const ctaLabel = [primaryCta, secondaryCta].filter(Boolean).join(' + ') || copy.experience
  const surfaceClass = variant === 'restaurant'
    ? 'bg-[#0b1120] text-white'
    : variant === 'technical'
    ? 'bg-slate-50 text-slate-900'
    : 'bg-[#fffaf0] text-slate-900'
  const panelClass = variant === 'restaurant'
    ? 'border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20'
    : 'border-slate-200 bg-white shadow-xl shadow-slate-200/70'
  const mutedTextClass = variant === 'restaurant' ? 'text-slate-300' : 'text-slate-500'

  return (
    <section className={`relative overflow-hidden ${surfaceClass}`}>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: accentColor }}>{copy.setupReadout}</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight md:text-4xl">{copy.builtFrom}</h2>
            <p className={`mt-4 max-w-xl text-base leading-relaxed ${mutedTextClass}`}>
              {copy.strategy}: {mood ? mood.replace(/_/g, ' ') : copy.signature}. {copy.ready}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[categoryLabel, `${imageCount} ${copy.photos.toLowerCase()}`, `${sectionCount} ${copy.sections.toLowerCase()}`].map((item) => (
                <span key={item} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${variant === 'restaurant' ? 'border-white/10 bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                  <BadgeCheck className="h-4 w-4" style={{ color: accentColor }} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.75rem] border p-5 ${panelClass}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>{copy.setupSummary}</p>
                <p className={`mt-1 text-sm ${mutedTextClass}`}>{copy.ctas}: {ctaLabel}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accentColor}22`, color: accentColor }}>
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: copy.category, value: categoryLabel },
                { label: copy.photos, value: String(imageCount) },
                { label: copy.sections, value: String(sectionCount) },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border p-4 ${variant === 'restaurant' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${mutedTextClass}`}>{item.label}</p>
                  <p className="mt-2 text-lg font-black">{item.value}</p>
                </div>
              ))}
            </div>

            {cards.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
              {cards.map((item, index) => (
                <div key={`${item}-${index}`} className={`rounded-2xl border p-4 text-sm leading-relaxed ${variant === 'restaurant' ? 'border-white/10 bg-white/[0.04] text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}>
                  {item}
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function VariantAboutSection({ variant, lang, businessName, description, address, email, aboutPhoto, accentColor, services }: { variant: VisualVariant; lang: Language; businessName: string; description: string; address?: string; email?: string; aboutPhoto?: string; accentColor: string; services: { name: string; price: string; description?: string }[] }) {
  const copy = previewCopy[lang] ?? previewCopy.en
  const highlightItems = services.filter((item) => item.name).slice(0, 3)
  const imageSrc = aboutPhoto || 'https://picsum.photos/seed/vitrine-preview-about/1200/900'

  if (variant === 'technical') {
    return (
      <section id="about" className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/70">
            <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: accentColor }}>{copy.trustTitle}</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">{businessName}</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <ShieldCheck className="h-6 w-6" style={{ color: accentColor }} />
                <p className="mt-3 font-bold text-slate-900">{copy.quickFacts}</p>
                <p className="mt-2 text-sm text-slate-600">{highlightItems[0]?.description || description}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <Clock3 className="h-6 w-6" style={{ color: accentColor }} />
                <p className="mt-3 font-bold text-slate-900">{copy.signature}</p>
                <p className="mt-2 text-sm text-slate-600">{highlightItems[1]?.name || businessName}</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl">
            <Image src={imageSrc} alt={businessName} fill className="object-cover opacity-80" unoptimized={imageSrc.startsWith('data:')} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {address && <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm"><MapPin className="h-4 w-4" />{address}</p>}
              {email && <p className="mt-3 text-sm text-slate-200">{email}</p>}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className={variant === 'restaurant' ? 'bg-[#111827] py-24 text-white' : variant === 'cafe' ? 'bg-[#fff8ef] py-24' : 'bg-white py-24'}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] shadow-2xl">
          <Image src={imageSrc} alt={businessName} fill className="object-cover" unoptimized={imageSrc.startsWith('data:')} />
          <div className={`absolute inset-0 ${variant === 'restaurant' ? 'bg-gradient-to-t from-black/70 to-transparent' : 'bg-gradient-to-t from-navy/45 to-transparent'}`} />
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
            {highlightItems.map((item) => (
              <span key={item.name} className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-900">{item.name}</span>
            ))}
          </div>
        </div>
        <div className="self-center">
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: accentColor }}>{copy.storyTitle}</p>
          <h2 className={`mt-3 text-4xl font-black ${variant === 'restaurant' ? 'text-white' : 'text-slate-900'}`}>{businessName}</h2>
          <p className={`mt-5 text-lg leading-relaxed ${variant === 'restaurant' ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className={`rounded-3xl border p-5 ${variant === 'restaurant' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
              <Store className="h-6 w-6" style={{ color: accentColor }} />
              <p className={`mt-3 font-bold ${variant === 'restaurant' ? 'text-white' : 'text-slate-900'}`}>{copy.signature}</p>
              <p className={`mt-2 text-sm ${variant === 'restaurant' ? 'text-slate-300' : 'text-slate-600'}`}>{highlightItems[0]?.description || description}</p>
            </div>
            <div className={`rounded-3xl border p-5 ${variant === 'restaurant' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
              <MapPin className="h-6 w-6" style={{ color: accentColor }} />
              <p className={`mt-3 font-bold ${variant === 'restaurant' ? 'text-white' : 'text-slate-900'}`}>{copy.quickFacts}</p>
              <p className={`mt-2 text-sm ${variant === 'restaurant' ? 'text-slate-300' : 'text-slate-600'}`}>{address || email || businessName}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function VariantOffersSection({ variant, lang, businessName, services, photos, menuUrl, menuImageUrl, bookingUrl, whatsappNumber, whatsappMessage, accentColor }: { variant: VisualVariant; lang: Language; businessName: string; services: { name: string; price: string; description?: string; photo?: string }[]; photos: string[]; menuUrl?: string; menuImageUrl?: string; bookingUrl?: string; whatsappNumber?: string; whatsappMessage?: string; accentColor: string }) {
  if (variant === 'cafe' || variant === 'restaurant') {
    return <FoodMenuBlock businessName={businessName} services={services} photos={photos} bookingUrl={bookingUrl} whatsappNumber={whatsappNumber} whatsappMessage={whatsappMessage} menuUrl={menuUrl} menuImageUrl={menuImageUrl} lang={lang} />
  }

  const copy = previewCopy[lang] ?? previewCopy.en
  const offerItems = services.filter((item) => item.name).slice(0, 6)

  return (
    <section id="services" className={variant === 'technical' ? 'bg-slate-900 py-24 text-white' : 'bg-[#0f172a] py-24 text-white'}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: accentColor }}>{copy.servicesTitle}</p>
            <h2 className="mt-3 text-4xl font-black">{businessName}</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{variant === 'technical' ? copy.trustTitle : copy.experience}</div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offerItems.map((item, index) => (
            <div key={`${item.name}-${index}`} className={`rounded-[1.75rem] border p-6 ${variant === 'technical' ? 'border-white/10 bg-white/[0.04]' : 'border-white/10 bg-white/[0.05]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-black text-white">{item.name}</p>
                  {item.description && <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.description}</p>}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10" style={{ color: accentColor }}>
                  {variant === 'technical' ? <ShieldCheck className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
              </div>
              {item.price && <p className="mt-6 text-3xl font-black" style={{ color: accentColor }}>{item.price}€</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VariantGallerySection({ variant, lang, photos, accentColor }: { variant: VisualVariant; lang: Language; photos: string[]; accentColor: string }) {
  const copy = previewCopy[lang] ?? previewCopy.en
  const displayPhotos = photos.filter(Boolean).slice(0, 5)

  if (displayPhotos.length === 0) {
    return null
  }

  return (
    <section id="gallery" className={variant === 'cafe' ? 'bg-[#fffdf7] py-24' : variant === 'restaurant' ? 'bg-[#0b1120] py-24 text-white' : 'bg-slate-50 py-24'}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: accentColor }}>{copy.galleryTitle}</p>
            <h2 className={`mt-3 text-4xl font-black ${variant === 'restaurant' ? 'text-white' : 'text-slate-900'}`}>{copy.signature}</h2>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm ${variant === 'restaurant' ? 'bg-white/10 text-slate-200' : 'bg-white text-slate-600 shadow-sm'}`}>{displayPhotos.length} fotos</div>
        </div>
        <div className="grid gap-4 md:grid-cols-12">
          {displayPhotos.map((src, index) => (
            <div key={`${src}-${index}`} className={`relative overflow-hidden rounded-[1.75rem] ${index === 0 ? 'md:col-span-7 md:row-span-2 min-h-[420px]' : index === 1 ? 'md:col-span-5 min-h-[200px]' : 'md:col-span-4 min-h-[220px]'}`}>
              <Image src={src} alt={`Preview gallery ${index + 1}`} fill className="object-cover transition-transform duration-500 hover:scale-105" unoptimized={src.startsWith('data:')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AiLandingRenderer({
  business,
  aiConfig,
  lang,
  setLang,
  previewMode = false,
  showWatermark = previewMode,
  businessId,
  via,
}: {
  business: AiBusinessData
  aiConfig?: AiPageConfig | null
  lang: Language
  setLang: (lang: Language) => void
  previewMode?: boolean
  showWatermark?: boolean
  businessId?: string
  via?: string
}) {
  const t = translations[lang]
  const pageTemplate = aiConfig?.template === 'food' || aiConfig?.template === 'technical' || aiConfig?.template === 'service'
    ? aiConfig.template
    : inferBusinessTemplate(business.category, business.description)
  const contactMethods = business.contactMethods?.length ? business.contactMethods : ['whatsapp', 'booking', 'email']
  const showWhatsapp = contactMethods.includes('whatsapp')
  const showBooking = contactMethods.includes('booking')
  const showEmail = contactMethods.includes('email')
  const previewSections = Array.isArray(aiConfig?.sections) ? aiConfig.sections.slice(0, 8) : []
  const previewAccent = aiConfig?.style?.accentColor || '#D4AF37'
  const previewHeadline = aiConfig?.copy?.headline?.trim() || business.businessName
  const previewTagline = aiConfig?.copy?.subheadline?.trim() || null
  const previewPrimaryCta = aiConfig?.copy?.primaryCta?.trim() || null
  const previewSecondaryCta = aiConfig?.copy?.secondaryCta?.trim() || null
  const previewCategoryLabel = aiConfig?.template ? `${business.category} · ${aiConfig.template}` : business.category
  const visualVariant = getVisualVariant(business.category, pageTemplate, aiConfig?.style?.mood)
  const resolvePhotoRole = (role?: string | null) => {
    const match = typeof role === 'string' ? role.match(/^photo_(\d+)$/) : null
    if (!match) return null
    return business.photos?.[Number(match[1]) - 1] ?? null
  }
  const heroPhoto = resolvePhotoRole(aiConfig?.photoRoles?.hero) || business.photos?.[0]
  const aboutPhoto = resolvePhotoRole(aiConfig?.photoRoles?.about) || business.photos?.[1]
  const galleryFromRoles = aiConfig?.photoRoles?.gallery?.map(resolvePhotoRole).filter(Boolean) as string[] | undefined
  const galleryPhotos = galleryFromRoles?.length ? galleryFromRoles : business.photos
  const aiSections = previewSections
    .filter((section) => ALLOWED_PREVIEW_SECTIONS.includes(section))
    .filter((section) => !(pageTemplate === 'food' && section === 'services' && previewSections.includes('menu')))
    .filter((section, index, all) => all.indexOf(section) === index)
  const orderedSections = aiSections.length ? aiSections : pageTemplate === 'food' ? ['about', 'menu', 'gallery', 'reviews', 'hours', 'location', 'faq', 'contact'] : ['about', 'benefits', 'services', 'gallery', 'reviews', 'hours', 'location', 'faq', 'contact']
  const publicEmail = showEmail ? business.email : undefined
  const contactSection = ((showBooking && business.bookingUrl) || (showWhatsapp && business.whatsappNumber)) ? (
    <ContactActions
      t={t}
      bookingUrl={showBooking ? business.bookingUrl : undefined}
      whatsappNumber={showWhatsapp ? business.whatsappNumber : undefined}
      whatsappMessage={showWhatsapp ? business.whatsappMessage : undefined}
      businessId={businessId}
      via={via}
      showForm={showEmail}
    />
  ) : showEmail ? (
    <ContactForm t={t} businessId={businessId} via={via} />
  ) : null

  const renderSection = (section: string) => {
    switch (section) {
      case 'about':
        return <VariantAboutSection key="about" variant={visualVariant} lang={lang} businessName={business.businessName} description={business.description} address={business.address} email={publicEmail} aboutPhoto={aboutPhoto} accentColor={previewAccent} services={business.services} />
      case 'benefits':
        return <Benefits key="benefits" businessName={business.businessName} benefits={business.benefits ?? undefined} />
      case 'menu':
      case 'services':
        return <VariantOffersSection key={section} variant={visualVariant} lang={lang} businessName={business.businessName} services={business.services} photos={galleryPhotos} bookingUrl={showBooking ? business.bookingUrl : undefined} whatsappNumber={showWhatsapp ? business.whatsappNumber : undefined} whatsappMessage={showWhatsapp ? business.whatsappMessage : undefined} menuUrl={business.menuUrl} menuImageUrl={business.menuImageUrl} accentColor={previewAccent} />
      case 'gallery':
        return <VariantGallerySection key="gallery" variant={visualVariant} lang={lang} photos={galleryPhotos} accentColor={previewAccent} />
      case 'reviews':
        return <Testimonials key="reviews" testimonials={business.testimonials as any} showDefaults={previewMode} />
      case 'hours':
        return <Hours key="hours" t={t} hours={business.hours} businessName={business.businessName} />
      case 'location':
        return <LocationMap key="location" address={business.address} mapUrl={business.mapUrl} businessName={business.businessName} />
      case 'faq':
        return <FAQ key="faq" items={business.faqs as any} />
      case 'contact':
        return contactSection ? <div key="contact">{contactSection}</div> : null
      default:
        return null
    }
  }

  return (
    <main className="bg-white" style={{ ['--vitrine-ai-primary' as string]: aiConfig?.style?.primaryColor || '#0F172A', ['--vitrine-ai-accent' as string]: previewAccent }}>
      {showWatermark && <PreviewWatermark lang={lang} businessName={business.businessName} />}
      {aiConfig && previewMode && (
        <div className="fixed left-4 top-20 z-[75] max-w-sm rounded-3xl border border-white/10 bg-navy/95 p-4 text-white shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: previewAccent }} />
            <p className="text-[10px] font-black uppercase tracking-wider text-gold">{lang === 'pt' ? 'Prévia estruturada por IA' : lang === 'es' ? 'Vista previa estructurada por IA' : lang === 'fr' ? 'Aperçu structuré par IA' : 'AI structured preview'}</p>
          </div>
          <p className="mt-2 text-sm font-bold">{aiConfig.template ?? pageTemplate} layout · {aiConfig.imageCount ?? business.photos?.length ?? 0} {lang === 'pt' ? 'fotos analisadas' : lang === 'es' ? 'fotos analizadas' : lang === 'fr' ? 'photos analysées' : 'photos analyzed'}</p>
          {aiConfig.style?.mood && <p className="mt-1 text-xs text-gray-300">{lang === 'pt' ? 'Estilo' : lang === 'es' ? 'Estilo' : lang === 'fr' ? 'Style' : 'Mood'}: {aiConfig.style.mood.replace(/_/g, ' ')}</p>}
        </div>
      )}
      <Navbar
        t={t}
        lang={lang}
        setLang={setLang}
        businessName={business.businessName}
        bookingUrl={showBooking ? business.bookingUrl : undefined}
        whatsappNumber={showWhatsapp ? business.whatsappNumber : undefined}
        whatsappMessage={showWhatsapp ? business.whatsappMessage : undefined}
        businessId={businessId}
        via={via}
      />
      <Hero
        t={t}
        businessName={business.businessName}
        category={business.category}
        categoryLabel={previewCategoryLabel}
        heroPhoto={heroPhoto}
        headline={previewHeadline}
        tagline={previewTagline}
        primaryCtaLabel={previewPrimaryCta}
        secondaryCtaLabel={previewSecondaryCta}
        businessId={businessId}
        via={via}
        bookingUrl={showBooking ? business.bookingUrl : undefined}
        whatsappNumber={showWhatsapp ? business.whatsappNumber : undefined}
        whatsappMessage={showWhatsapp ? business.whatsappMessage : undefined}
      />
      {orderedSections.map(renderSection)}
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
          bookingUrl: showBooking ? business.bookingUrl : undefined,
          whatsappNumber: showWhatsapp ? business.whatsappNumber : undefined,
        }}
      />
      <Footer t={t} businessName={business.businessName} />
    </main>
  )
}