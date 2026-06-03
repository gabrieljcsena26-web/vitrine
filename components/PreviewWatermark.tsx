'use client'

import Link from 'next/link'
import { Eye, Lock, Sparkles } from 'lucide-react'
import type { Language } from '@/lib/translations'

interface Props {
  lang?: Language
  businessName?: string
}

const copy = {
  pt: {
    label: 'Prévia Vitrine',
    title: 'Esta página ainda está em prévia.',
    text: 'Veja o resultado com suas fotos e informações. Escolha um plano para publicar sem marca d’água.',
    cta: 'Publicar sem marca d’água',
    watermark: 'PRÉVIA VITRINE',
    ribbon: 'Preview não publicado',
  },
  en: {
    label: 'Vitrine Preview',
    title: 'This page is still in preview mode.',
    text: 'Review the result with your photos and details. Choose a plan to publish without the watermark.',
    cta: 'Publish without watermark',
    watermark: 'VITRINE PREVIEW',
    ribbon: 'Unpublished preview',
  },
  es: {
    label: 'Vista previa Vitrine',
    title: 'Esta página aún está en vista previa.',
    text: 'Mira el resultado con tus fotos e información. Elige un plan para publicar sin marca de agua.',
    cta: 'Publicar sin marca de agua',
    watermark: 'VISTA PREVIA',
    ribbon: 'Vista previa no publicada',
  },
  fr: {
    label: 'Aperçu Vitrine',
    title: 'Cette page est encore en aperçu.',
    text: 'Visualisez le résultat avec vos photos et informations. Choisissez un plan pour publier sans filigrane.',
    cta: 'Publier sans filigrane',
    watermark: 'APERÇU VITRINE',
    ribbon: 'Aperçu non publié',
  },
} as const

export default function PreviewWatermark({ lang = 'en', businessName }: Props) {
  const t = copy[lang] ?? copy.en

  return (
    <>
      <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.035]">
          <div className="absolute left-1/2 top-1/2 w-[130vw] -translate-x-1/2 -translate-y-1/2 -rotate-12 grid grid-cols-2 md:grid-cols-3 gap-16 text-center">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} className="text-3xl md:text-5xl font-black tracking-[0.18em] text-navy whitespace-nowrap">
                {t.watermark}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-24 -right-16 rotate-45 bg-gold/95 text-navy px-20 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
          {t.ribbon}
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-[70] pointer-events-none">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gold/30 bg-navy/95 text-white shadow-2xl shadow-navy/30 backdrop-blur-xl pointer-events-auto overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-center p-4 md:p-5">
            <div className="w-12 h-12 rounded-2xl bg-gold text-navy flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-gold">
                  <Sparkles className="w-3 h-3" />
                  {t.label}
                </span>
                {businessName && <span className="text-xs text-gray-300 font-bold">{businessName}</span>}
              </div>
              <p className="font-black text-base md:text-lg">{t.title}</p>
              <p className="text-sm text-gray-300 mt-0.5">{t.text}</p>
            </div>
            <Link href="/dashboard#plans" className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-5 py-3 rounded-2xl font-black hover:bg-yellow-400 transition-colors whitespace-nowrap">
              <Lock className="w-4 h-4" />
              {t.cta}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
