'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { ExternalLink, MessageCircle, QrCode, Utensils } from 'lucide-react'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
import type { Language } from '@/lib/translations'

interface Props {
  businessName: string
  services?: { name: string; price: string; description?: string; photo?: string }[]
  photos?: string[]
  bookingUrl?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
  menuUrl?: string | null
  menuImageUrl?: string | null
  lang?: Language
}

type MenuItem = { name: string; price: string; description?: string; photo?: string }

const copy = {
  pt: {
    eyebrow: 'Experiência de menu',
    title: 'Uma secção quente e visual para comida, bebidas e decisões rápidas.',
    subtitle: 'Os clientes veem destaques, abrem o menu completo, pedem pelo WhatsApp ou reservam mesa na mesma página mobile.',
    reserve: 'Reservar ou pedir',
    fullMenu: 'Ver menu completo',
    whatsapp: 'Pedir no WhatsApp',
    today: 'Menu de hoje',
    highlights: 'Destaques',
    popular: 'Mais pedidos',
    itemFallback: 'Opção fresca do menu da casa',
    itemAlt: 'Item do menu',
    qrTitle: 'QR do menu pronto',
    qrText: 'Use o QR do menu no painel para levar clientes direto ao menu completo.',
    complete: 'Menu completo',
    defaultMenu: [
      { name: 'Especial da casa', price: '14', description: 'Prato assinatura com ingredientes frescos' },
      { name: 'Bowl fresco', price: '11', description: 'Colorido, equilibrado e fácil de escolher' },
      { name: 'Sobremesa da casa', price: '6', description: 'Um final doce para a mesa' },
      { name: 'Bebida assinatura', price: '5', description: 'Favorita da casa para almoço ou jantar' },
    ],
  },
  es: {
    eyebrow: 'Experiencia de menú',
    title: 'Una sección cálida y visual para comida, bebidas y decisiones rápidas.',
    subtitle: 'Los clientes ven destacados, abren el menú completo, piden por WhatsApp o reservan mesa desde la misma página móvil.',
    reserve: 'Reservar o pedir',
    fullMenu: 'Ver menú completo',
    whatsapp: 'Pedir por WhatsApp',
    today: 'Menú de hoy',
    highlights: 'Destacados',
    popular: 'Más pedidos',
    itemFallback: 'Opción fresca del menú de la casa',
    itemAlt: 'Elemento del menú',
    qrTitle: 'QR del menú listo',
    qrText: 'Usa el QR del menú en el panel para llevar clientes directo al menú completo.',
    complete: 'Menú completo',
    defaultMenu: [
      { name: 'Especial de la casa', price: '14', description: 'Plato insignia con ingredientes frescos' },
      { name: 'Bowl fresco', price: '11', description: 'Colorido, equilibrado y fácil de elegir' },
      { name: 'Postre de la casa', price: '6', description: 'Un final dulce para la mesa' },
      { name: 'Bebida insignia', price: '5', description: 'Favorita de la casa para comida o cena' },
    ],
  },
  en: {
    eyebrow: 'Menu experience',
    title: 'A warm menu section made for food, drinks and table decisions.',
    subtitle: 'Customers can quickly see highlights, open your full menu, order through WhatsApp or reserve a table from the same mobile-friendly page.',
    reserve: 'Reserve or order',
    fullMenu: 'View full menu',
    whatsapp: 'Order on WhatsApp',
    today: 'Today\'s menu',
    highlights: 'Highlights',
    popular: 'Popular choices',
    itemFallback: 'Fresh option from the house menu',
    itemAlt: 'Menu item',
    qrTitle: 'Full menu QR ready',
    qrText: 'Use the dashboard menu QR to bring guests straight to the complete menu.',
    complete: 'Complete menu',
    defaultMenu: [
      { name: 'Chef special', price: '14', description: 'Signature dish with fresh ingredients' },
      { name: 'Fresh bowl', price: '11', description: 'Balanced, colorful and quick to choose' },
      { name: 'House dessert', price: '6', description: 'A sweet finish for the table' },
      { name: 'Signature drink', price: '5', description: 'House favorite for lunch or dinner' },
    ],
  },
  fr: {
    eyebrow: 'Expérience menu',
    title: 'Une section chaleureuse pour les plats, boissons et choix à table.',
    subtitle: 'Les clients voient les favoris, ouvrent le menu complet, commandent sur WhatsApp ou réservent depuis la même page mobile.',
    reserve: 'Réserver ou commander',
    fullMenu: 'Voir le menu complet',
    whatsapp: 'Commander sur WhatsApp',
    today: 'Menu du jour',
    highlights: 'Favoris',
    popular: 'Choix populaires',
    itemFallback: 'Option fraîche du menu maison',
    itemAlt: 'Élément du menu',
    qrTitle: 'QR du menu prêt',
    qrText: 'Utilisez le QR du menu dans le tableau de bord pour envoyer les clients vers le menu complet.',
    complete: 'Menu complet',
    defaultMenu: [
      { name: 'Spécialité du chef', price: '14', description: 'Plat signature avec des ingrédients frais' },
      { name: 'Bowl frais', price: '11', description: 'Coloré, équilibré et facile à choisir' },
      { name: 'Dessert maison', price: '6', description: 'Une touche sucrée pour finir' },
      { name: 'Boisson signature', price: '5', description: 'Favorite de la maison midi ou soir' },
    ],
  },
}

export default function FoodMenuBlock({
  businessName,
  services,
  photos,
  bookingUrl,
  whatsappNumber,
  whatsappMessage,
  menuUrl,
  menuImageUrl,
  lang = 'en',
}: Props) {
  const text = copy[lang] ?? copy.en
  const menuItems: MenuItem[] = services && services.length > 0 ? services : text.defaultMenu
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuQrDataUrl, setMenuQrDataUrl] = useState('')
  const highlightedItems = menuItems.slice(0, 5)
  const activeItem = highlightedItems[activeIndex] ?? highlightedItems[0]
  const firstDishPhoto = activeItem?.photo || menuItems.find((item) => item.photo)?.photo
  const menuPhoto = firstDishPhoto || menuImageUrl || photos?.[1] || photos?.[0]
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber ? whatsAppHref(whatsappNumber, whatsappMessage ?? undefined) : null
  const hasCompleteMenu = Boolean(menuUrl || menuImageUrl)

  useEffect(() => {
    if (highlightedItems.length <= 1) return
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlightedItems.length)
    }, 3600)
    return () => window.clearInterval(interval)
  }, [highlightedItems.length])

  useEffect(() => {
    if (!hasCompleteMenu) {
      setMenuQrDataUrl('')
      return
    }

    const targetUrl = menuUrl || `${window.location.href.split('#')[0]}#full-menu`
    QRCode.toDataURL(targetUrl, { width: 160, margin: 1, color: { dark: '#0B1226', light: '#FFFFFF' } })
      .then(setMenuQrDataUrl)
      .catch(() => setMenuQrDataUrl(''))
  }, [hasCompleteMenu, menuImageUrl, menuUrl])

  return (
    <section id="menu" className="py-24 bg-[#fffaf0] text-navy overflow-hidden relative">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <div>
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">{text.eyebrow}</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2 mb-5">
              {text.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {text.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {bookingHref && (
                <a
                  href={bookingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-bold hover:bg-navy/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {text.reserve}
                </a>
              )}
              {(menuUrl || menuImageUrl) && (
                <a
                  href={menuUrl || '#full-menu'}
                  target={menuUrl ? '_blank' : undefined}
                  rel={menuUrl ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-gold/30 text-navy px-6 py-3 rounded-full font-bold hover:bg-gold/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {text.fullMenu}
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#1ebe5d] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {text.whatsapp}
                </a>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-orange-100 shadow-2xl shadow-orange-100/70 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr]">
              <div className="relative min-h-[260px] bg-navy">
                {menuPhoto ? (
                  <Image
                    src={menuPhoto}
                    alt={`${businessName} menu preview`}
                    fill
                    className="object-cover opacity-90"
                    unoptimized={menuPhoto.startsWith('data:')}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-800 to-gold/60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                <div className="absolute left-5 right-5 bottom-5 text-white">
                  <span className="bg-gold text-navy text-[10px] font-black px-2 py-1 rounded-full">{businessName}</span>
                  <h3 className="text-3xl font-black mt-3">{activeItem?.name || text.today}</h3>
                  {activeItem?.description && <p className="mt-2 line-clamp-2 text-sm text-white/80">{activeItem.description}</p>}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-xs text-gold font-black uppercase tracking-wider">{text.highlights}</p>
                    <h3 className="text-2xl font-black text-navy">{text.popular}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {highlightedItems.map((item, index) => {
                    const active = index === activeIndex
                    return (
                    <button key={`${item.name}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-3 text-left transition-all ${active ? 'border-gold/50 bg-gold/10 shadow-sm' : 'border-stone-100 bg-stone-50 hover:border-gold/30 hover:bg-white'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {(item.photo || active) && (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200">
                            {item.photo ? (
                            <Image
                              src={item.photo}
                              alt={item.name || text.itemAlt}
                              fill
                              className="object-cover"
                              unoptimized={item.photo.startsWith('data:')}
                            />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-gold/40 to-navy/80" />
                            )}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-navy truncate">{item.name || text.itemAlt}</p>
                          <p className="text-xs text-gray-400 line-clamp-2">{item.description || text.itemFallback}</p>
                        </div>
                      </div>
                      {item.price && <span className="text-gold font-black whitespace-nowrap">{item.price}€</span>}
                    </button>
                  )})}
                </div>

                {hasCompleteMenu && (
                  <div className="mt-5 rounded-2xl bg-navy text-white p-4 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0">
                      {menuQrDataUrl ? (
                        <Image src={menuQrDataUrl} alt={text.qrTitle} width={72} height={72} unoptimized />
                      ) : (
                        <QrCode className="w-8 h-8 text-navy" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm">{text.qrTitle}</p>
                      <p className="mt-1 text-xs text-gray-300">{text.qrText}</p>
                      <a href={menuUrl || '#full-menu'} target={menuUrl ? '_blank' : undefined} rel={menuUrl ? 'noopener noreferrer' : undefined} className="mt-2 inline-flex text-xs font-black text-gold hover:text-yellow-300">{text.fullMenu}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
              {menuImageUrl && (
                <div id="full-menu" className="border-t border-orange-100 bg-white p-6">
                  <p className="text-xs text-gold font-black uppercase tracking-wider mb-3">{text.complete}</p>
                  <div className="relative w-full min-h-[420px] rounded-3xl overflow-hidden bg-stone-50 border border-stone-100">
                    <Image src={menuImageUrl} alt={`${businessName} full menu`} fill className="object-contain" unoptimized={menuImageUrl.startsWith('data:')} />
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  )
}
