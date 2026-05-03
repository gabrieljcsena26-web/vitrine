'use client'

import Image from 'next/image'
import { ExternalLink, MessageCircle, QrCode, Utensils } from 'lucide-react'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'

interface Props {
  businessName: string
  services?: { name: string; price: string }[]
  photos?: string[]
  bookingUrl?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
}

const defaultMenu = [
  { name: 'Chef special', price: '14' },
  { name: 'Fresh bowl', price: '11' },
  { name: 'House dessert', price: '6' },
  { name: 'Signature drink', price: '5' },
]

export default function FoodMenuBlock({
  businessName,
  services,
  photos,
  bookingUrl,
  whatsappNumber,
  whatsappMessage,
}: Props) {
  const menuItems = services && services.length > 0 ? services : defaultMenu
  const menuPhoto = photos?.find(Boolean)
  const bookingHref = bookingUrl ? safeBookingHref(bookingUrl) : null
  const whatsappHref = whatsappNumber ? whatsAppHref(whatsappNumber, whatsappMessage ?? undefined) : null

  return (
    <section id="menu" className="py-24 bg-[#fffaf0] text-navy overflow-hidden relative">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <div>
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Menu experience</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2 mb-5">
              A warm menu section made for food, drinks and table decisions.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Customers can quickly see highlights, open your full menu, order through WhatsApp or reserve a table from the same mobile-friendly page.
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
                  Reserve or order
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
                  Order on WhatsApp
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
                  <h3 className="text-3xl font-black mt-3">Today&apos;s menu</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-xs text-gold font-black uppercase tracking-wider">Highlights</p>
                    <h3 className="text-2xl font-black text-navy">Popular choices</h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {menuItems.slice(0, 5).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
                      <div>
                        <p className="font-black text-navy">{item.name || 'Menu item'}</p>
                        <p className="text-xs text-gray-400">Fresh option from the house menu</p>
                      </div>
                      {item.price && <span className="text-gold font-black whitespace-nowrap">{item.price}€</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-navy text-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold text-navy flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm">Menu QR ready</p>
                    <p className="text-xs text-gray-300">Use the dashboard QR to bring guests straight to this menu on mobile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
