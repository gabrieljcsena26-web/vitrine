import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, Mail, MapPin, MessageCircle, Phone, Star } from 'lucide-react'
import type { CommercialDemo } from '@/lib/demo-pages'
import { whatsAppHref } from '@/lib/utils'

interface Props {
  demo: CommercialDemo
}

export default function CommercialDemoPage({ demo }: Props) {
  const whatsappHref = whatsAppHref(demo.whatsappNumber, demo.whatsappMessage) ?? '#contact'
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(demo.address)}`

  return (
    <main className="bg-white text-navy">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/demo" className="text-white/80 hover:text-white text-sm inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Demos
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-white/70">
            <a href="#services" className="hover:text-white">Serviços</a>
            <a href="#gallery" className="hover:text-white">Fotos</a>
            <a href="#reviews" className="hover:text-white">Reviews</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-black hover:bg-yellow-400 transition-colors">
            WhatsApp
          </a>
        </div>
      </nav>

      <section className={`relative min-h-screen flex items-center overflow-hidden ${demo.theme.primary}`}>
        <Image src={demo.photos[0]} alt={demo.businessName} fill priority className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-32 text-white">
          <div className="max-w-3xl">
            <span className={`inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold ${demo.theme.accent}`}>
              {demo.theme.badge}
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mt-6 mb-6">{demo.headline}</h1>
            <p className="text-xl text-white/75 leading-relaxed mb-8 max-w-2xl">{demo.subheadline}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full font-black text-lg hover:bg-[#1ebe5d] transition-all hover:scale-105">
                <MessageCircle className="w-5 h-5" />
                Pedir pelo WhatsApp
              </a>
              <a href="#services" className="inline-flex items-center justify-center bg-white/10 border border-white/25 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-white/20 transition-colors">
                Ver serviços
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            [<Phone key="phone" className="w-5 h-5" />, demo.phone],
            [<Mail key="mail" className="w-5 h-5" />, demo.email],
            [<MapPin key="pin" className="w-5 h-5" />, demo.address],
          ].map(([icon, text]) => (
            <div key={String(text)} className="rounded-2xl border border-stone-100 bg-stone-50 p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">{icon}</div>
              <p className="font-bold text-navy text-sm leading-snug">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-gold uppercase tracking-wider text-sm font-bold">Benefícios</span>
            <h2 className="text-4xl font-black mt-2">Por que esta página vende melhor?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {demo.benefits.map((benefit) => (
              <div key={benefit} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                <CheckCircle className="w-6 h-6 text-gold mb-4" />
                <p className="font-black text-navy text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-gold uppercase tracking-wider text-sm font-bold">Serviços</span>
            <h2 className="text-4xl font-black mt-2">Ofertas claras para decisão rápida</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demo.services.map((service) => (
              <article key={service.name} className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:border-gold/40 transition-colors">
                <p className="text-xl font-black mb-2">{service.name}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{service.description}</p>
                <p className="text-gold text-2xl font-black">{service.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-gold uppercase tracking-wider text-sm font-bold">Galeria</span>
            <h2 className="text-4xl font-black mt-2">Fotos que geram confiança</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {demo.photos.map((photo, index) => (
              <div key={photo} className={`relative rounded-3xl overflow-hidden shadow-xl ${index === 0 ? 'md:col-span-2 md:row-span-2 h-96' : 'h-44'}`}>
                <Image src={photo} alt={`${demo.businessName} ${index + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-gold uppercase tracking-wider text-sm font-bold">Reviews</span>
            <h2 className="text-4xl font-black mt-2">Prova social antes do contacto</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demo.testimonials.map((item) => (
              <article key={item.name} className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-100 flex-shrink-0">
                    <Image src={item.photo} alt={item.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-navy">{item.name}</p>
                    <div className="flex text-gold mt-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`w-4 h-4 ${index < item.rating ? 'fill-current' : 'text-stone-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-5">“{item.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="text-gold uppercase tracking-wider text-sm font-bold">Horário</span>
            <h2 className="text-4xl font-black mt-2 mb-8">Aberto nos melhores horários</h2>
            <div className="rounded-3xl border border-stone-100 overflow-hidden">
              {demo.hours.map((hour) => (
                <div key={hour.day} className="flex items-center justify-between px-5 py-4 border-b last:border-b-0 border-stone-100">
                  <span className="font-bold text-navy">{hour.day}</span>
                  <span className={hour.open ? 'text-gray-500 font-semibold' : 'text-red-500 font-semibold'}>
                    {hour.open ? `${hour.from} – ${hour.to}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div id="location">
            <span className="text-gold uppercase tracking-wider text-sm font-bold">Localização</span>
            <h2 className="text-4xl font-black mt-2 mb-8">Direções em um clique</h2>
            <div className="rounded-3xl overflow-hidden border border-stone-100 shadow-xl">
              <iframe title={`${demo.businessName} map`} src={`https://www.google.com/maps?q=${encodeURIComponent(demo.address)}&output=embed`} loading="lazy" className="w-full h-[390px] border-0" />
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex mt-5 bg-navy text-white px-5 py-3 rounded-full font-bold hover:bg-navy/90 transition-colors">
              Abrir no Google Maps
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-gold uppercase tracking-wider text-sm font-bold">FAQ</span>
            <h2 className="text-4xl font-black mt-2">Dúvidas respondidas antes da mensagem</h2>
          </div>
          <div className="space-y-4">
            {demo.faqs.map((item) => (
              <details key={item.question} className="group rounded-2xl bg-white border border-stone-100 p-5 shadow-sm">
                <summary className="cursor-pointer list-none flex justify-between gap-4 font-black text-navy">
                  {item.question}
                  <span className="text-gold text-2xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-gray-500 leading-relaxed mt-4">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Clock className="w-10 h-10 text-gold mx-auto mb-5" />
          <h2 className="text-4xl md:text-5xl font-black mb-5">Pronto para transformar visitantes em clientes?</h2>
          <p className="text-gray-400 text-lg mb-8">Esta demo mostra como uma landing page pode apresentar o negócio e levar o cliente direto para o WhatsApp.</p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-9 py-4 rounded-full font-black text-lg hover:bg-[#1ebe5d] transition-all hover:scale-105">
            <MessageCircle className="w-5 h-5" />
            Simular contacto no WhatsApp
          </a>
        </div>
      </section>
    </main>
  )
}
