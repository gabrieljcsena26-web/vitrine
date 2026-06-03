'use client'
import { useState } from 'react'
import type { Translations } from '@/lib/translations'
import Image from 'next/image'
import { CalendarDays, MessageCircle } from 'lucide-react'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
import { isFoodBusinessCategory } from '@/lib/business-categories'
import LeadCaptureModal from './LeadCaptureModal'

interface Props {
  t: Translations
  businessName: string
  category?: string
  heroPhoto?: string
  businessId?: string
  via?: string
  bookingUrl?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
  tagline?: string | null
  headline?: string | null
  categoryLabel?: string | null
  primaryCtaLabel?: string | null
  secondaryCtaLabel?: string | null
}

export default function Hero({
  t,
  businessName,
  category,
  heroPhoto,
  businessId,
  via,
  bookingUrl,
  whatsappNumber,
  whatsappMessage,
  tagline,
  headline,
  categoryLabel,
  primaryCtaLabel,
  secondaryCtaLabel,
}: Props) {
  const [leadAction, setLeadAction] = useState<{
    label: string
    href: string
    eventType: 'booking_click' | 'whatsapp_click'
  } | null>(null)
  const normalizedCategory = String(category ?? '').toLowerCase()
  const isFood = isFoodBusinessCategory(category)
  const defaultHero = isFood
    ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop'
    : normalizedCategory.includes('cleaning') || normalizedCategory.includes('auto') || normalizedCategory.includes('mechanic')
    ? 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1920&auto=format&fit=crop'
    : 'https://picsum.photos/seed/salon1/1920/1080'
  const bgSrc = heroPhoto || defaultHero
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber ? whatsAppHref(whatsappNumber, whatsappMessage ?? undefined) : null
  const foodPrimaryLabel = t.hero.bookNow === 'Agendar' ? 'Pedir ou reservar' : t.hero.bookNow === 'Reservar' ? 'Pedir ou reservar' : 'Reserve or order'
  const foodSecondaryLabel = t.hero.seeServices === 'Ver serviços' ? 'Ver menu' : 'View menu'
  const resolvedPrimaryLabel = primaryCtaLabel && !['Contact us', 'Book now'].includes(primaryCtaLabel) ? primaryCtaLabel : (isFood ? foodPrimaryLabel : t.hero.bookNow)
  const resolvedSecondaryLabel = secondaryCtaLabel && !['View services'].includes(secondaryCtaLabel) ? secondaryCtaLabel : (isFood ? foodSecondaryLabel : t.hero.seeServices)

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={bgSrc}
          alt={businessName}
          fill
          className="object-cover"
          priority
          unoptimized={bgSrc.startsWith('data:')}
        />
        <div className="absolute inset-0 bg-navy/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 rounded-full px-4 py-2 mb-6 backdrop-blur">
          <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
          <span className="text-gold text-sm font-medium">{categoryLabel || category || 'Hair Salon · Madrid'}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
          {headline || businessName}
        </h1>
        <p className="text-xl md:text-2xl text-gold font-light mb-10 italic">
          &ldquo;{tagline || t.hero.tagline}&rdquo;
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={bookingHref ?? whatsappHref ?? '#contact'}
            onClick={(e) => {
              if (!bookingHref && !whatsappHref) return
              e.preventDefault()
              setLeadAction(bookingHref ? { label: resolvedPrimaryLabel, href: bookingHref, eventType: 'booking_click' } : { label: 'WhatsApp', href: whatsappHref!, eventType: 'whatsapp_click' })
            }}
            className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-gold/30"
          >
            <CalendarDays className="w-5 h-5" />
            {resolvedPrimaryLabel}
          </a>
          {whatsappHref && (
            <a
              href={whatsappHref}
              onClick={(e) => {
                e.preventDefault()
                setLeadAction({ label: 'WhatsApp', href: whatsappHref, eventType: 'whatsapp_click' })
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#1ebe5d] transition-all hover:scale-105 shadow-lg shadow-green-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          )}
          <a
            href={isFood ? '#menu' : '#services'}
            className="inline-flex items-center justify-center bg-white/10 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
          >
            {resolvedSecondaryLabel}
          </a>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-bold text-white/75">
          {(isFood ? ['Menu visual', 'WhatsApp direto', 'Horários e localização'] : ['Serviços claros', 'Contato direto', 'Agendamento fácil']).map((item) => (
            <span key={item} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">{item}</span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
      {leadAction && (
        <LeadCaptureModal
          open
          onClose={() => setLeadAction(null)}
          actionLabel={leadAction.label}
          destinationHref={leadAction.href}
          businessId={businessId}
          via={via}
          eventType={leadAction.eventType}
        />
      )}
    </section>
  )
}
