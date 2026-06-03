'use client'

import { Eye } from 'lucide-react'
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
    watermark: 'PRÉVIA VITRINE',
  },
  en: {
    label: 'Vitrine Preview',
    title: 'This page is still in preview mode.',
    text: 'Review the result with your photos and details. Choose a plan to publish without the watermark.',
    watermark: 'VITRINE PREVIEW',
  },
  es: {
    label: 'Vista previa Vitrine',
    title: 'Esta página aún está en vista previa.',
    text: 'Mira el resultado con tus fotos e información. Elige un plan para publicar sin marca de agua.',
    watermark: 'VISTA PREVIA',
  },
  fr: {
    label: 'Aperçu Vitrine',
    title: 'Cette page est encore en aperçu.',
    text: 'Visualisez le résultat avec vos photos et informations. Choisissez un plan pour publier sans filigrane.',
    watermark: 'APERÇU VITRINE',
  },
} as const

export default function PreviewWatermark({ lang = 'en', businessName }: Props) {
  const t = copy[lang] ?? copy.en

  return (
    <>
      <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.035]">
          <div className="absolute left-1/2 top-1/2 w-[130vw] -translate-x-1/2 -translate-y-1/2 -rotate-12 grid grid-cols-2 md:grid-cols-3 gap-16 text-center">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} className="text-2xl md:text-4xl font-black tracking-[0.18em] text-navy whitespace-nowrap">
                {t.watermark}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute left-4 top-20 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-navy/90 px-3 py-2 text-xs font-black text-gold shadow-lg backdrop-blur">
          <Eye className="h-3.5 w-3.5" />
          {t.label}
        </div>
      </div>
    </>
  )
}
