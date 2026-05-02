'use client'
import { useState, useEffect } from 'react'
import { Menu, X, Scissors } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import type { Language, Translations } from '@/lib/translations'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
import LeadCaptureModal from './LeadCaptureModal'

interface Props {
  t: Translations
  lang: Language
  setLang: (lang: Language) => void
  businessName: string
  bookingUrl?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
  businessId?: string
  via?: string
}

export default function Navbar({
  t,
  lang,
  setLang,
  businessName,
  bookingUrl,
  whatsappNumber,
  whatsappMessage,
  businessId,
  via,
}: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [leadAction, setLeadAction] = useState<{
    label: string
    href: string
    eventType: 'booking_click' | 'whatsapp_click'
  } | null>(null)

  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber ? whatsAppHref(whatsappNumber, whatsappMessage ?? undefined) : null
  const bookNowHref = bookingHref ?? whatsappHref ?? '#contact'
  const bookNowEventType = bookingHref ? 'booking_click' : whatsappHref ? 'whatsapp_click' : null

  const handleBookNowClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!bookNowEventType || bookNowHref === '#contact') return
    e.preventDefault()
    setOpen(false)
    setLeadAction({ label: t.nav.bookNow, href: bookNowHref, eventType: bookNowEventType })
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { href: '#about', label: t.nav.about },
    { href: '#services', label: t.nav.services },
    { href: '#gallery', label: t.nav.gallery },
    { href: '#testimonials', label: 'Reviews' },
    { href: '#hours', label: t.nav.hours },
    { href: '#location', label: 'Location' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contact', label: t.nav.contact },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-navy" />
            </div>
            <span className="text-white font-bold text-lg">{businessName}</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-gold transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <a
              href={bookNowHref}
              onClick={handleBookNowClick}
              className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-colors"
            >
              {t.nav.bookNow}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy/98 backdrop-blur-sm border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-gray-300 hover:text-gold transition-colors py-2 font-medium"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex items-center justify-between">
              <LanguageSwitcher lang={lang} setLang={setLang} />
              <a
                href={bookNowHref}
                className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-semibold"
                onClick={handleBookNowClick}
              >
                {t.nav.bookNow}
              </a>
            </div>
          </div>
        </div>
      )}
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
    </nav>
  )
}
