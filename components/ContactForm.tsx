'use client'
import { useState } from 'react'
import type { Translations } from '@/lib/translations'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
import { Send, CheckCircle, CalendarDays, MessageCircle } from 'lucide-react'

interface Props {
  t: Translations
  businessId?: string
  via?: string
  bookingUrl?: string | null
  whatsappNumber?: string | null
}

export default function ContactForm({ t, businessId, via, bookingUrl, whatsappNumber }: Props) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber
    ? whatsAppHref(whatsappNumber, 'Hi, I found your page and would like to book an appointment.')
    : null

  const trackClick = (eventType: 'booking_click' | 'whatsapp_click') => {
    if (!businessId) return
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, via: via ?? null, eventType }),
    }).catch(() => undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (businessId) {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            visitorName: form.name,
            visitorEmail: form.email,
            message: form.message,
            via: via ?? null,
          }),
        })
      }
    } catch {
      // fail silently — submission still shows success to the user
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <section id="contact" className="py-24 bg-navy">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">
            Get in touch
          </span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-4">
            {t.contact.title}
          </h2>
          <p className="text-gray-400 text-lg">{t.contact.subtitle}</p>
        </div>

        {(bookingHref || whatsappHref) && (
          <div className="grid gap-3 sm:grid-cols-2 mb-8">
            {bookingHref && (
              <a
                href={bookingHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('booking_click')}
                className="flex items-center justify-center gap-2 bg-gold text-navy px-5 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all text-center"
              >
                <CalendarDays className="w-5 h-5" />
                Book appointment
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('whatsapp_click')}
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-5 py-4 rounded-xl font-bold hover:bg-[#1ebe5d] transition-all text-center"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="flex flex-col leading-tight">
                  <span>Chat on WhatsApp</span>
                  <span className="text-xs font-semibold text-white/85">{whatsappNumber}</span>
                </span>
              </a>
            )}
          </div>
        )}

        {submitted ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gold mx-auto mb-4" />
            <p className="text-white text-lg">{t.contact.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t.contact.name}
              </label>
              <input
                type="text"
                required
                placeholder={t.contact.namePlaceholder}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t.contact.email}
              </label>
              <input
                type="email"
                required
                placeholder={t.contact.emailPlaceholder}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t.contact.message}
              </label>
              <textarea
                required
                rows={5}
                placeholder={t.contact.messagePlaceholder}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-navy py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t.contact.send}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
