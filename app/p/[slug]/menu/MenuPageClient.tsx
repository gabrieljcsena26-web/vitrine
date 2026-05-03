'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, MessageCircle } from 'lucide-react'
import { whatsAppHref } from '@/lib/utils'
import type { Language } from '@/lib/translations'

interface Props {
  business: {
    id: string
    slug: string
    owner_name: string
    category?: string | null
    menu_url?: string | null
    menu_image_url?: string | null
    whatsapp_number?: string | null
    whatsapp_message?: string | null
    lang?: string | null
  }
  via?: string | null
}

const copy = {
  pt: {
    back: 'Voltar para a página',
    external: 'Abrir menu externo',
    whatsapp: 'Pedir no WhatsApp',
    eyebrow: 'Menu completo',
    subtitle: 'Veja o menu completo no telemóvel, depois peça ou reserve no mesmo lugar.',
    externalOnly: 'Este negócio de comida usa um menu externo. Abra-o abaixo.',
    viewFull: 'Ver menu completo',
    empty: 'O menu completo ainda não foi adicionado.',
  },
  es: {
    back: 'Volver a la página',
    external: 'Abrir menú externo',
    whatsapp: 'Pedir por WhatsApp',
    eyebrow: 'Menú completo',
    subtitle: 'Consulta el menú completo en móvil, luego pide o reserva desde el mismo lugar.',
    externalOnly: 'Este negocio de comida usa un menú externo. Ábrelo abajo.',
    viewFull: 'Ver menú completo',
    empty: 'El menú completo aún no se ha añadido.',
  },
  en: {
    back: 'Back to page',
    external: 'Open external menu',
    whatsapp: 'Order on WhatsApp',
    eyebrow: 'Complete menu',
    subtitle: 'Browse the full menu on mobile, then order or reserve from the same place.',
    externalOnly: 'This food business uses an external menu. Open it below.',
    viewFull: 'View full menu',
    empty: 'The full menu has not been added yet.',
  },
  fr: {
    back: 'Retour à la page',
    external: 'Ouvrir le menu externe',
    whatsapp: 'Commander sur WhatsApp',
    eyebrow: 'Menu complet',
    subtitle: 'Consultez le menu complet sur mobile, puis commandez ou réservez au même endroit.',
    externalOnly: 'Ce commerce alimentaire utilise un menu externe. Ouvrez-le ci-dessous.',
    viewFull: 'Voir le menu complet',
    empty: 'Le menu complet n’a pas encore été ajouté.',
  },
}

export default function MenuPageClient({ business, via }: Props) {
  const lang: Language = business.lang && ['pt', 'es', 'en', 'fr'].includes(business.lang) ? business.lang as Language : 'en'
  const text = copy[lang]
  const whatsappHref = business.whatsapp_number ? whatsAppHref(business.whatsapp_number, business.whatsapp_message ?? undefined) : null

  useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business.id, via: via ?? 'menu-direct' }),
    }).catch(() => undefined)
  }, [business.id, via])

  return (
    <main className="min-h-screen bg-[#fffaf0] text-navy">
      <section className="relative overflow-hidden py-10 px-4">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <Link href={`/p/${business.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-navy transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {text.back}
            </Link>
            <div className="flex gap-2 flex-wrap">
              {business.menu_url && (
                <a href={business.menu_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-navy/90 transition-colors">
                  {text.external}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-[#1ebe5d] transition-colors">
                  {text.whatsapp}
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="text-gold font-black uppercase tracking-wider text-sm">{text.eyebrow}</p>
            <h1 className="text-4xl md:text-6xl font-black mt-2">{business.owner_name}</h1>
            <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">{text.subtitle}</p>
          </div>

          <div className="rounded-[2rem] bg-white border border-orange-100 shadow-2xl shadow-orange-100/70 p-4 md:p-6">
            {business.menu_image_url ? (
              <div className="relative w-full min-h-[70vh] rounded-3xl overflow-hidden bg-stone-50 border border-stone-100">
                <Image src={business.menu_image_url} alt={`${business.owner_name} full menu`} fill className="object-contain" unoptimized={business.menu_image_url.startsWith('data:')} priority />
              </div>
            ) : business.menu_url ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-6">{text.externalOnly}</p>
                <a href={business.menu_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gold text-navy px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition-colors">
                  {text.viewFull}
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">{text.empty}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
