'use client'
import { useState, useEffect } from 'react'
import { Menu, X, Scissors } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import type { Language, Translations } from '@/lib/translations'

interface Props {
  t: Translations
  lang: Language
  setLang: (lang: Language) => void
  businessName: string
}

export default function Navbar({ t, lang, setLang, businessName }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { href: '#about', label: t.nav.about },
    { href: '#services', label: t.nav.services },
    { href: '#gallery', label: t.nav.gallery },
    { href: '#hours', label: t.nav.hours },
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
          <div className="hidden md:flex items-center gap-6">
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
              href="#contact"
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
                href="#contact"
                className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                {t.nav.bookNow}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
