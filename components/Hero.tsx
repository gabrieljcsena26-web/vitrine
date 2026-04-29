'use client'
import type { Translations } from '@/lib/translations'
import { safeBookingHref } from '@/lib/utils'
import Image from 'next/image'

interface Props {
  t: Translations
  businessName: string
  category?: string
  heroPhoto?: string
  bookingUrl?: string | null
  businessId?: string
  via?: string
}

export default function Hero({ t, businessName, category, heroPhoto, bookingUrl, businessId, via }: Props) {
  const bgSrc = heroPhoto || 'https://picsum.photos/seed/salon1/1920/1080'
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null

  const handleBookingClick = () => {
    if (!businessId || !bookingHref) return
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, via: via ?? null, eventType: 'booking_click' }),
    }).catch(() => undefined)
  }

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
          &ldquo;{t.hero.tagline}&rdquo;
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={bookingHref ?? '#contact'}
            target={bookingHref ? '_blank' : undefined}
            rel={bookingHref ? 'noopener noreferrer' : undefined}
            onClick={handleBookingClick}
            className="bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-gold/30"
          >
            {t.hero.bookNow}
          </a>
          <a
            href="#services"
            className="bg-white/10 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
          >
            {t.hero.seeServices}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  )
}
