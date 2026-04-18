'use client'
import type { Translations } from '@/lib/translations'
import { CalendarDays, ArrowRight } from 'lucide-react'

interface Props {
  t: Translations
  bookingUrl: string
  businessId?: string
  via?: string
}

/** Returns a safe href only for http/https URLs or mailto: addresses. */
function safeHref(url: string): string | null {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`
  return null
}

export default function BookingBlock({ t, bookingUrl, businessId, via }: Props) {
  const href = safeHref(bookingUrl)
  if (!href) return null

  const handleClick = () => {
    if (!businessId) return
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, via: via ?? null, eventType: 'booking_click' }),
    }).catch(() => undefined)
  }

  return (
    <section id="booking" className="py-20 bg-gradient-to-br from-slate-50 to-stone-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-2xl mb-6">
          <CalendarDays className="w-7 h-7 text-gold" />
        </div>
        <h2 className="text-3xl font-bold text-navy mb-3">{t.booking.title}</h2>
        <p className="text-gray-500 text-lg mb-8">{t.booking.subtitle}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-md shadow-gold/20"
        >
          {t.booking.cta}
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  )
}
