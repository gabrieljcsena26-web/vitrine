'use client'
import { useState } from 'react'
import { X, ArrowRight, CheckCircle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  actionLabel: string
  destinationHref: string
  businessId?: string
  via?: string
  eventType: 'booking_click' | 'whatsapp_click'
}

const BOOKING_INTERESTS = [
  'Book an appointment',
  'Check available times',
  'Schedule a first visit',
  'Confirm service before booking',
]

const WHATSAPP_INTERESTS = [
  'Ask a question on WhatsApp',
  'Ask about prices',
  'Check availability',
  'Know more about services',
]

export default function LeadCaptureModal({
  open,
  onClose,
  actionLabel,
  destinationHref,
  businessId,
  via,
  eventType,
}: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const isBooking = eventType === 'booking_click'
  const interests = isBooking ? BOOKING_INTERESTS : WHATSAPP_INTERESTS
  const [interest, setInterest] = useState(interests[0])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!open) return null

  const trackClick = () => {
    if (!businessId) return
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, via: via ?? null, eventType }),
    }).catch(() => undefined)
  }

  const redirect = () => {
    window.location.href = destinationHref
  }

  const continueWithoutSaving = () => {
    trackClick()
    redirect()
  }

  const submitAndContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    trackClick()
    try {
      if (businessId) {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            visitorName: name.trim(),
            visitorEmail: email.trim(),
            message: `Interest: ${interest}. Intended action: ${actionLabel}.`,
            interest,
            via: via ?? null,
          }),
        })
      }
      setSaved(true)
      setTimeout(redirect, 450)
    } catch {
      redirect()
    } finally {
      setLoading(false)
    }
  }

  const modalCopy = isBooking
    ? {
        badge: 'Booking step',
        title: 'Before opening the booking page',
        description: 'Leave your details so the business knows who is trying to book. After this, you go directly to the scheduling platform chosen by the business.',
        selectLabel: 'What do you want to schedule?',
        primary: 'Continue to booking platform',
        success: 'Opening booking platform...',
        successText: 'Your interest was saved. Now you will complete the booking on the external scheduling page.',
        footnote: 'Email is optional. You will finish the appointment on the business booking platform.',
      }
    : {
        badge: 'WhatsApp step',
        title: 'Before opening WhatsApp',
        description: 'Leave just your name so the business can recognize your request. After this, WhatsApp opens with the message ready to send.',
        selectLabel: 'What do you want to ask?',
        primary: 'Continue to WhatsApp',
        success: 'Opening WhatsApp...',
        successText: 'Your interest was saved. Now WhatsApp will open with the message ready.',
        footnote: 'WhatsApp will open after this step. No account is needed here.',
      }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto px-4 py-4 sm:py-6">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="fixed inset-0 bg-navy/80 backdrop-blur-sm"
      />
      <div className="relative z-10 min-h-full flex items-center justify-center pointer-events-none">
      <div className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-3xl shadow-2xl p-5 sm:p-6 pointer-events-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 text-gray-500 hover:text-navy flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {saved ? (
          <div className="text-center py-8 sm:py-10">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy mb-2">{modalCopy.success}</h3>
            <p className="text-gray-500 text-sm">{modalCopy.successText}</p>
          </div>
        ) : (
          <form onSubmit={submitAndContinue}>
            <div className="pr-9">
              <span className="inline-flex bg-gold/10 text-gold border border-gold/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
                {modalCopy.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-navy mb-2">
                {modalCopy.title}
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mb-5 leading-relaxed">
                {modalCopy.description}
              </p>
            </div>

            <div className="space-y-3">
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
              />
              {isBooking && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email optional"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  {modalCopy.selectLabel}
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm bg-white"
                >
                  {interests.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            {via && (
              <p className="mt-3 text-xs text-gray-400">Source tracked: <span className="font-semibold text-navy">{via}</span></p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full bg-gold text-navy py-4 rounded-xl font-black hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-gold/20"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
              ) : (
                <>
                  {modalCopy.primary}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={continueWithoutSaving}
              className="mt-3 w-full rounded-xl border border-stone-200 py-3 text-gray-500 hover:text-navy hover:border-gold/40 text-sm font-bold transition-colors"
            >
              Continue without leaving details
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-3">
              {modalCopy.footnote}
            </p>
          </form>
        )}
      </div>
      </div>
    </div>
  )
}
