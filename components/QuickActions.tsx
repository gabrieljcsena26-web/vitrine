'use client'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
import { CalendarDays, MessageCircle } from 'lucide-react'

interface Props {
  bookingUrl?: string | null
  whatsappNumber?: string | null
  businessId?: string
  via?: string
}

export default function QuickActions({ bookingUrl, whatsappNumber, businessId, via }: Props) {
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber
    ? whatsAppHref(whatsappNumber, 'Hi, I found your page and would like to book an appointment.')
    : null

  if (!bookingHref && !whatsappHref) return null

  const trackClick = (eventType: 'booking_click' | 'whatsapp_click') => {
    if (!businessId) return
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, via: via ?? null, eventType }),
    }).catch(() => undefined)
  }

  return (
    <section className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Quick contact</p>
          <div className="flex flex-wrap justify-center gap-3">
            {bookingHref && (
              <a
                href={bookingHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('booking_click')}
                className="group flex items-center gap-3 bg-white border border-gold/30 text-navy px-5 py-3 rounded-full font-bold shadow-sm hover:border-gold hover:bg-gold hover:shadow-md transition-all"
              >
                <span className="w-9 h-9 rounded-full bg-gold/15 group-hover:bg-navy/10 flex items-center justify-center transition-colors">
                  <CalendarDays className="w-4 h-4 text-gold group-hover:text-navy" />
                </span>
                <span>Book online</span>
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('whatsapp_click')}
                className="group flex items-center gap-3 bg-white border border-[#25D366]/30 text-navy px-5 py-3 rounded-full font-bold shadow-sm hover:border-[#25D366] hover:bg-[#25D366] hover:text-white hover:shadow-md transition-all"
              >
                <span className="w-9 h-9 rounded-full bg-[#25D366]/10 group-hover:bg-white/15 flex items-center justify-center transition-colors">
                  <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                </span>
                <span className="flex flex-col leading-tight text-left">
                  <span>WhatsApp</span>
                  <span className="text-[11px] font-semibold text-gray-400 group-hover:text-white/85">{whatsappNumber}</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
