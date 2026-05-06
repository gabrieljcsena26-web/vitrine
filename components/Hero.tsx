'use client'
import { useState } from 'react'
import type { Translations } from '@/lib/translations'
import Image from 'next/image'
import { CalendarDays, MessageCircle } from 'lucide-react'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
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
}: Props) {
  const [leadAction, setLeadAction] = useState<{
    label: string
    href: string
    eventType: 'booking_click' | 'whatsapp_click'
  } | null>(null)
  const normalizedCategory = String(category ?? '').toLowerCase()
  const isFood = normalizedCategory.includes('restaurant') || normalizedCategory.includes('café') || normalizedCategory.includes('cafe') || normalizedCategory.includes('bar') || normalizedCategory.includes('food') || normalizedCategory.includes('bakery')
  const defaultHero = isFood
    ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop'
    : normalizedCategory.includes('cleaning') || normalizedCategory.includes('auto') || normalizedCategory.includes('mechanic')
    ? 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1920&auto=format&fit=crop'
    : 'https://picsum.photos/seed/salon1/1920/1080'
  const bgSrc = heroPhoto || defaultHero
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber ? whatsAppHref(whatsappNumber, whatsappMessage ?? undefined) : null

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
        <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 rounded-full px-4 py-2 mb-6">
          <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
          <span className="text-gold text-sm font-medium">{category || 'Hair Salon · Madrid'}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
          {businessName}
        </h1>
        <p className="text-xl md:text-2xl text-gold font-light mb-10 italic">
          &ldquo;{tagline || t.hero.tagline}&rdquo;
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={bookingHref ?? '#contact'}
            onClick={(e) => {
              if (!bookingHref) return
              e.preventDefault()
              setLeadAction({ label: t.hero.bookNow, href: bookingHref, eventType: 'booking_click' })
            }}
            className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-gold/30"
          >
            <CalendarDays className="w-5 h-5" />
            {isFood ? 'Reserve or order' : t.hero.bookNow}
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
            {isFood ? 'View menu' : t.hero.seeServices}
          </a>
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
