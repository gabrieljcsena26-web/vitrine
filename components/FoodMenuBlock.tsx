'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { ExternalLink, QrCode, Utensils, X } from 'lucide-react'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'
import type { Language } from '@/lib/translations'

interface Props {
  businessName: string
  sectionLabel?: string
  sectionTitle?: string
  sectionDescription?: string
  services?: { name: string; price: string; description?: string; photo?: string }[]
  photos?: string[]
  bookingUrl?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
  menuUrl?: string | null
  menuImageUrl?: string | null
  lang?: Language
  showDefaults?: boolean
}

type MenuItem = { name: string; price: string; description?: string; photo?: string }

const copy = {
  pt: {
    eyebrow: 'Menu',
    title: 'Menu em destaque',
    subtitle: 'Organize pratos, preços e acesso rápido ao menu completo.',
    reserve: 'Reservar ou pedir',
    fullMenu: 'Ver menu completo',
    menuAccess: 'Menu e QR',
    whatsapp: 'Falar no WhatsApp',
    today: 'Menu de hoje',
    highlights: 'Destaques',
    popular: 'Mais pedidos',
    itemFallback: 'Opção fresca do menu da casa',
    itemAlt: 'Item do menu',
    dishZoom: 'Toque para ampliar o prato',
    menuModalTitle: 'Menu completo e acesso rápido',
    openLink: 'Abrir link do menu',
    openQr: 'Abrir QR',
    previewMenu: 'Ver menu',
    close: 'Fechar',
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
    eyebrow: 'Menú',
    title: 'Menú destacado',
    subtitle: 'Organiza platos, precios y acceso rápido al menú completo.',
    reserve: 'Reservar o pedir',
    fullMenu: 'Ver menú completo',
    menuAccess: 'Menú y QR',
    whatsapp: 'Hablar por WhatsApp',
    today: 'Menú de hoy',
    highlights: 'Destacados',
    popular: 'Más pedidos',
    itemFallback: 'Opción fresca del menú de la casa',
    itemAlt: 'Elemento del menú',
    dishZoom: 'Toca para ampliar el plato',
    menuModalTitle: 'Menú completo y acceso rápido',
    openLink: 'Abrir enlace del menú',
    openQr: 'Abrir QR',
    previewMenu: 'Ver menú',
    close: 'Cerrar',
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
    eyebrow: 'Menu',
    title: 'Featured menu',
    subtitle: 'Organize dishes, pricing and quick access to the full menu.',
    reserve: 'Reserve or order',
    fullMenu: 'View full menu',
    menuAccess: 'Menu and QR',
    whatsapp: 'WhatsApp',
    today: 'Today\'s menu',
    highlights: 'Highlights',
    popular: 'Popular choices',
    itemFallback: 'Fresh option from the house menu',
    itemAlt: 'Menu item',
    dishZoom: 'Tap to zoom the dish',
    menuModalTitle: 'Full menu and quick access',
    openLink: 'Open menu link',
    openQr: 'Open QR',
    previewMenu: 'View menu',
    close: 'Close',
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
    eyebrow: 'Menu',
    title: 'Menu en vedette',
    subtitle: 'Organisez les plats, prix et accès rapide au menu complet.',
    reserve: 'Réserver ou commander',
    fullMenu: 'Voir le menu complet',
    menuAccess: 'Menu et QR',
    whatsapp: 'Parler sur WhatsApp',
    today: 'Menu du jour',
    highlights: 'Favoris',
    popular: 'Choix populaires',
    itemFallback: 'Option fraîche du menu maison',
    itemAlt: 'Élément du menu',
    dishZoom: 'Touchez pour agrandir le plat',
    menuModalTitle: 'Menu complet et accès rapide',
    openLink: 'Ouvrir le lien du menu',
    openQr: 'Ouvrir le QR',
    previewMenu: 'Voir le menu',
    close: 'Fermer',
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
  sectionLabel,
  sectionTitle,
  sectionDescription,
  services,
  photos,
  bookingUrl,
  whatsappNumber,
  whatsappMessage,
  menuUrl,
  menuImageUrl,
  lang = 'en',
  showDefaults = true,
}: Props) {
  const text = copy[lang] ?? copy.en
  const menuItems: MenuItem[] = services && services.length > 0 ? services : (showDefaults ? text.defaultMenu : [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuQrDataUrl, setMenuQrDataUrl] = useState('')
  const [dishLightboxOpen, setDishLightboxOpen] = useState(false)
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [menuModalView, setMenuModalView] = useState<'qr' | 'menu'>('qr')
  const highlightedItems = menuItems.slice(0, 5)
  const supportingPhotos = (photos ?? []).filter(Boolean)
  const resolvedHighlightedItems = useMemo(
    () => highlightedItems.map((item) => ({
      ...item,
      photo: item.photo || undefined,
    })),
    [highlightedItems],
  )
  const activeItem = resolvedHighlightedItems[activeIndex] ?? resolvedHighlightedItems[0]
  const firstDishPhoto = activeItem?.photo || resolvedHighlightedItems.find((item) => item.photo)?.photo
  const fallbackPhoto = showDefaults ? supportingPhotos[0] || photos?.[0] : undefined
  const menuPhoto = firstDishPhoto || menuImageUrl || fallbackPhoto
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber ? whatsAppHref(whatsappNumber, whatsappMessage ?? undefined) : null
  const hasCompleteMenu = Boolean(menuUrl || menuImageUrl)
  const visibleCarouselItems = resolvedHighlightedItems.filter((item) => item.photo)
  const headerLabel = sectionLabel?.trim() || text.eyebrow
  const headerTitle = sectionDescription?.trim() || (showDefaults ? text.title : '')
  const headerDescription = !services?.length && showDefaults ? text.subtitle : ''

  function WhatsAppIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    )
  }

  useEffect(() => {
    if (resolvedHighlightedItems.length <= 1) return
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % resolvedHighlightedItems.length)
    }, 3600)
    return () => window.clearInterval(interval)
  }, [resolvedHighlightedItems.length])

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
    <section id="menu" className="py-24 text-navy overflow-hidden relative" style={{ backgroundImage: 'var(--surface)' }}>
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl bg-[var(--accent-soft)]" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-[var(--accent-soft)]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[color:var(--accent-strong)] font-black text-sm uppercase tracking-wider"><span className="h-1 w-8 rounded-full bg-[var(--accent)]" />{headerLabel}</span>
            {sectionTitle ? <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{sectionTitle}</p> : null}
            {headerTitle ? (
              <h2 className="mt-2 mb-4 text-4xl font-black text-balance md:text-5xl">
                {headerTitle}
              </h2>
            ) : null}
            {headerDescription ? (
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                {headerDescription}
              </p>
            ) : null}
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
                <button
                  type="button"
                  onClick={() => { setMenuModalView('qr'); setMenuModalOpen(true) }}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-[color:var(--accent)]/40 text-navy px-6 py-3 rounded-full font-bold hover:bg-[var(--accent-soft)] transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  {text.menuAccess}
                </button>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#1ebe5d] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  {text.whatsapp}
                </a>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-[color:var(--line)] shadow-2xl shadow-black/10 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-[color:var(--line)] md:border-b-0 md:border-r md:border-[color:var(--line)] bg-stone-50/40">
                <button
                  type="button"
                  onClick={() => menuPhoto && setDishLightboxOpen(true)}
                  className="relative min-h-[320px] w-full bg-navy text-left"
                >
                {menuPhoto ? (
                  <Image
                    src={menuPhoto}
                    alt={`${businessName} menu preview`}
                    fill
                    className="object-cover opacity-90 transition-transform duration-500 hover:scale-[1.02]"
                    unoptimized={menuPhoto.startsWith('data:')}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-800 to-gold/60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                <div className="absolute left-5 right-5 bottom-5 text-white">
                  <span className="bg-[var(--accent)] text-white text-[10px] font-black px-2 py-1 rounded-full">{businessName}</span>
                  <h3 className="text-3xl font-black mt-3">{activeItem?.name || text.today}</h3>
                  {activeItem?.description && <p className="mt-2 line-clamp-2 text-sm text-white/80">{activeItem.description}</p>}
                  {menuPhoto ? <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/75">{text.dishZoom}</p> : null}
                </div>
                </button>

                {visibleCarouselItems.length > 0 ? (
                  <div className="border-t border-[color:var(--line)] bg-white px-4 py-4">
                    <div className="flex gap-3 pb-1">
                      {visibleCarouselItems.map((item) => {
                        const itemIndex = highlightedItems.findIndex((candidate) => candidate === item)
                        const active = itemIndex === activeIndex
                        return (
                          <button
                            key={`${item.name}-${itemIndex}-photo`}
                            type="button"
                            onClick={() => setActiveIndex(itemIndex)}
                            className={`group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${active ? 'border-[color:var(--accent)] shadow-lg ring-2 ring-[color:var(--accent)]/30 -translate-y-1' : 'border-stone-200 hover:border-[color:var(--accent)]/40 hover:-translate-y-0.5'}`}
                          >
                            {item.photo ? <Image src={item.photo} alt={item.name || text.itemAlt} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized={item.photo.startsWith('data:')} /> : null}
                            <div className={`absolute inset-0 ${active ? 'bg-black/10' : 'bg-black/20 group-hover:bg-black/10'}`} />
                            <span className="absolute inset-x-2 bottom-2 line-clamp-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-white drop-shadow">{item.name || text.itemAlt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-xs text-[color:var(--accent-strong)] font-black uppercase tracking-wider">{text.highlights}</p>
                    <h3 className="text-2xl font-black text-navy">{text.popular}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-[var(--accent-soft)] text-[color:var(--accent-strong)] flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {resolvedHighlightedItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-gray-400">
                      {text.subtitle}
                    </div>
                  ) : null}
                  {resolvedHighlightedItems.map((item, index) => {
                    const active = index === activeIndex
                    return (
                    <button key={`${item.name}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-3 text-left transition-all ${active ? 'border-[color:var(--accent)]/50 bg-[var(--accent-soft)] shadow-sm' : 'border-stone-100 bg-stone-50 hover:border-[color:var(--accent)]/30 hover:bg-white'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${active ? 'bg-[var(--accent)]' : 'bg-stone-300'}`} />
                        <div className="min-w-0">
                          <p className="font-black text-navy truncate">{item.name || text.itemAlt}</p>
                          <p className="text-xs text-gray-400 line-clamp-2">{item.description || text.itemFallback}</p>
                        </div>
                      </div>
                      {item.price && <span className="text-[color:var(--accent-strong)] font-black whitespace-nowrap">{item.price}€</span>}
                    </button>
                  )})}
                </div>

                {hasCompleteMenu ? (
                  <div className="mt-5 rounded-[1.5rem] border border-[color:var(--line)] bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">{text.menuAccess}</p>
                        <h4 className="mt-1 text-lg font-black text-navy">{text.menuModalTitle}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{text.qrText}</p>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--accent)]/20 bg-white">
                        {menuQrDataUrl ? <Image src={menuQrDataUrl} alt={text.qrTitle} width={52} height={52} unoptimized /> : <QrCode className="h-7 w-7 text-navy" />}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => { setMenuModalView('qr'); setMenuModalOpen(true) }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--accent)]/40 bg-white px-4 py-3 text-sm font-black text-navy transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        <QrCode className="h-4 w-4" />
                        {text.openQr}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuModalView('menu'); setMenuModalOpen(true) }}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {text.previewMenu}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {dishLightboxOpen && menuPhoto ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/82 px-4 py-6" onClick={() => setDishLightboxOpen(false)}>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-black" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setDishLightboxOpen(false)} className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-colors hover:bg-white">
              <X className="h-5 w-5" />
            </button>
            <div className="relative min-h-[70vh] w-full">
              <Image src={menuPhoto} alt={activeItem?.name || text.itemAlt} fill className="object-contain" unoptimized={menuPhoto.startsWith('data:')} />
            </div>
          </div>
        </div>
      ) : null}

      {menuModalOpen && hasCompleteMenu ? (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/82 px-4 py-6" onClick={() => setMenuModalOpen(false)}>
          <div className="relative w-full max-w-5xl rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-950/30 md:p-8" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setMenuModalOpen(false)} className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-900 shadow-sm transition-colors hover:bg-stone-50">
              <X className="h-5 w-5" />
            </button>
            <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-start">
              <div className="rounded-[1.75rem] bg-slate-900 p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--accent)]">{text.qrTitle}</p>
                <h3 className="mt-3 text-2xl font-black">{text.menuModalTitle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{text.qrText}</p>
                <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                  <button type="button" onClick={() => setMenuModalView('qr')} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-colors ${menuModalView === 'qr' ? 'bg-white text-navy' : 'text-white/70 hover:text-white'}`}>
                    QR
                  </button>
                  <button type="button" onClick={() => setMenuModalView('menu')} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-colors ${menuModalView === 'menu' ? 'bg-white text-navy' : 'text-white/70 hover:text-white'}`}>
                    {text.complete}
                  </button>
                </div>
                <div className="mt-6 inline-flex rounded-[1.5rem] bg-white p-4">
                  {menuQrDataUrl ? (
                    <Image src={menuQrDataUrl} alt={text.qrTitle} width={180} height={180} unoptimized />
                  ) : (
                    <div className="flex h-[180px] w-[180px] items-center justify-center text-slate-900">
                      <QrCode className="h-16 w-16" />
                    </div>
                  )}
                </div>
                {menuUrl ? (
                  <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[var(--accent-strong)]">
                    <ExternalLink className="h-4 w-4" />
                    {text.openLink}
                  </a>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--accent-strong)]">{text.complete}</p>
                {menuModalView === 'qr' ? (
                  <div className="mt-3 rounded-[1.75rem] border border-stone-100 bg-stone-50 p-8 text-sm text-slate-500">
                    <p className="font-bold text-slate-700">{text.qrTitle}</p>
                    <p className="mt-2 leading-relaxed">{text.qrText}</p>
                    {menuUrl ? (
                      <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-white px-4 py-3 text-sm font-black text-[color:var(--accent-strong)] transition-colors hover:bg-[var(--accent-soft)]">
                        <ExternalLink className="h-4 w-4" />
                        {text.openLink}
                      </a>
                    ) : null}
                  </div>
                ) : menuImageUrl ? (
                  <div id="full-menu" className="mt-3 relative min-h-[520px] w-full overflow-hidden rounded-[1.75rem] border border-stone-100 bg-stone-50">
                    <Image src={menuImageUrl} alt={`${businessName} full menu`} fill className="object-contain" unoptimized={menuImageUrl.startsWith('data:')} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1.75rem] border border-dashed border-stone-200 bg-stone-50 p-8 text-sm text-slate-500">
                    {text.openLink}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
