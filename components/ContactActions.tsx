'use client'
import { useState } from 'react'
import type { Translations } from '@/lib/translations'
import { CalendarDays, CheckCircle, MessageCircle, Send } from 'lucide-react'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
import LeadCaptureModal from './LeadCaptureModal'

interface Props {
  t: Translations
  bookingUrl?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
  businessId?: string
  via?: string
  showForm?: boolean
}

export default function ContactActions({
  t,
  bookingUrl,
  whatsappNumber,
  whatsappMessage,
  businessId,
  via,
  showForm = true,
}: Props) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leadAction, setLeadAction] = useState<{
    label: string
    href: string
    eventType: 'booking_click' | 'whatsapp_click'
  } | null>(null)
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber ? whatsAppHref(whatsappNumber, whatsappMessage ?? undefined) : null

  if (!bookingHref && !whatsappHref && !showForm) return null

  const submitLead = async (e: React.FormEvent) => {
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
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-navy">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${showForm ? 'lg:grid-cols-[0.9fr_1.1fr]' : ''} gap-10 items-start`}>
          <div className="text-center lg:text-left lg:pt-4">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">
              {t.contact.title}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              Choose how you want to book
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Message us instantly, schedule directly, or leave your details so we can contact you.
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 justify-center lg:justify-start">
              {bookingHref && (
                <a
                  href={bookingHref}
                  onClick={(e) => {
                    e.preventDefault()
                    setLeadAction({ label: t.booking.cta, href: bookingHref, eventType: 'booking_click' })
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg shadow-gold/20"
                >
                  <CalendarDays className="w-5 h-5" />
                  {t.booking.cta}
                </a>
              )}
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
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-white font-semibold text-sm mb-1">What gets tracked?</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Button clicks become booking/WhatsApp activity. Form submissions become leads with name, email, message and source.
              </p>
            </div>
          </div>

          {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/10">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle className="w-14 h-14 text-gold mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Request sent!</h3>
                <p className="text-gray-400 text-sm">We received your details and will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={submitLead} className="space-y-4">
                <div>
                  <p className="text-white font-bold text-xl mb-1">Prefer us to contact you?</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Leave your details. This appears as a lead in the dashboard.
                  </p>
                  {via && (
                    <span className="inline-flex bg-gold/10 text-gold border border-gold/20 rounded-full px-3 py-1 text-xs font-semibold mb-4">
                      Source: {via}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t.contact.namePlaceholder}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                  />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-navy py-3.5 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          )}
        </div>
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
