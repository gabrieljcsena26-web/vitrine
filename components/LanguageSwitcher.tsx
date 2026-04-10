'use client'
import type { Language } from '@/lib/translations'

interface Props {
  lang: Language
  setLang: (lang: Language) => void
}

export default function LanguageSwitcher({ lang, setLang }: Props) {
  const langs: Language[] = ['pt', 'es', 'en']
  return (
    <div className="flex gap-1">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2 py-1 text-xs font-semibold rounded uppercase transition-all ${
            lang === l
              ? 'bg-gold text-navy'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
