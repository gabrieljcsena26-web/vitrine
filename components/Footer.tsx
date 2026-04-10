'use client'
import type { Translations } from '@/lib/translations'
import { Scissors } from 'lucide-react'

interface Props {
  t: Translations
  businessName: string
}

export default function Footer({ t, businessName }: Props) {
  return (
    <footer className="bg-gray-900 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-navy" />
            </div>
            <span className="text-white font-bold text-lg">{businessName}</span>
          </div>

          {/* Links */}
          <div className="flex gap-6">
            {['#about', '#services', '#gallery', '#hours', '#contact'].map((href) => (
              <a key={href} href={href} className="text-gray-400 hover:text-gold transition-colors text-sm">
                {href.replace('#', '').charAt(0).toUpperCase() + href.replace('#', '').slice(1)}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {businessName}. {t.footer.rights}.
            </p>
            <a href="/" className="text-gold/60 hover:text-gold text-xs transition-colors">
              {t.footer.poweredBy}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
