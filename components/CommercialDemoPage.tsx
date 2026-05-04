'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CalendarCheck, CheckCircle, ChefHat, Clock, HeartPulse, Mail, MapPin, MessageCircle, Phone, QrCode, Scale, Star, Utensils, Wine, X } from 'lucide-react'
import type { CommercialDemo } from '@/lib/demo-pages'
import { whatsAppHref } from '@/lib/utils'

interface Props {
  demo: CommercialDemo
}

export default function CommercialDemoPage({ demo }: Props) {
  const [activeMenuItem, setActiveMenuItem] = useState(0)
  const [showFullMenu, setShowFullMenu] = useState(false)
  const whatsappHref = whatsAppHref(demo.whatsappNumber, demo.whatsappMessage) ?? '#contact'
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(demo.address)}`
  const isFood = demo.variant === 'food'
  const isProfessional = demo.variant === 'professional'
  const isClinic = demo.variant === 'clinic'
  const serviceLabel = isFood ? 'Cardápio' : isProfessional ? 'Áreas' : isClinic ? 'Tratamentos' : 'Serviços'
  const serviceTitle = isFood ? 'Destaques do menu para decisão rápida' : isProfessional ? 'Áreas de atuação com confiança' : isClinic ? 'Tratamentos explicados antes da marcação' : 'Ofertas claras para decisão rápida'
  const primaryCta = isFood ? 'Pedir pelo WhatsApp' : isProfessional ? 'Agendar consulta' : 'Pedir pelo WhatsApp'
  const secondaryCta = isFood ? 'Ver cardápio' : isProfessional ? 'Ver áreas' : 'Ver serviços'
  const activeDish = demo.services[activeMenuItem] ?? demo.services[0]
  const activeDishPhoto = activeDish?.photo ?? demo.photos[(activeMenuItem % Math.max(demo.photos.length, 1))] ?? demo.photos[0]

  useEffect(() => {
    if (!isFood || demo.services.length <= 1) return
    const interval = window.setInterval(() => {
      setActiveMenuItem((value) => (value + 1) % demo.services.length)
    }, 3200)
    return () => window.clearInterval(interval)
  }, [demo.services.length, isFood])

  return (
    <main className="bg-white text-navy">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/demo" className="text-white/80 hover:text-white text-sm inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Demos
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-white/70">
            <a href="#services" className="hover:text-white">{serviceLabel}</a>
            <a href="#gallery" className="hover:text-white">Fotos</a>
            <a href="#reviews" className="hover:text-white">Reviews</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="bg-gold text-navy px-4 py-2 rounded-full text-sm font-black hover:bg-yellow-400 transition-colors">
            WhatsApp
          </a>
        </div>
      </nav>

      <section className={`relative min-h-[92vh] flex items-center overflow-hidden ${demo.theme.primary}`}>
        <Image src={demo.photos[0]} alt={demo.businessName} fill priority className="object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(212,175,55,0.24),transparent_30%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fffaf0] to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-28 md:py-36 text-white w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
            <div className="max-w-2xl">
              <span className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold ${demo.theme.accent}`}>
                <ChefHat className="w-4 h-4" />
                {demo.theme.badge}
              </span>
              {isFood ? (
                <>
                  <p className="mt-7 text-gold text-sm font-black uppercase tracking-[0.28em]">Demonstração de restaurante premium</p>
                  <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mt-3 tracking-tight">{demo.businessName}</h1>
                  <h2 className="text-2xl md:text-4xl font-black leading-tight mt-5 max-w-xl">Pratos desejáveis, ambiente elegante e reservas em poucos segundos.</h2>
                </>
              ) : (
                <h1 className="text-4xl md:text-6xl font-black leading-[0.98] mt-6 mb-6 tracking-tight">{demo.headline}</h1>
              )}
              <p className="text-lg md:text-xl text-white/75 leading-relaxed mt-6 mb-8 max-w-xl">{demo.subheadline}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full font-black text-lg hover:bg-[#1ebe5d] transition-all hover:scale-105 shadow-xl shadow-green-500/20">
                  <MessageCircle className="w-5 h-5" />
                  {primaryCta}
                </a>
                <button type="button" onClick={() => setShowFullMenu(true)} className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-white/20 transition-colors">
                  <Utensils className="w-5 h-5" />
                  {secondaryCta}
                </button>
              </div>
              {isFood && (
                <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
                  {['Reservas rápidas', 'QR na mesa', 'Menu visual'].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur">
                      <CheckCircle className="w-4 h-4 text-gold mb-2" />
                      <p className="text-xs font-black text-white/85">{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isFood && (
              <div className="relative hidden lg:block">
                <div className="absolute -inset-8 rounded-[3rem] bg-gold/20 blur-3xl" />
                <div className="relative rounded-[2.25rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-black/40 backdrop-blur">
                  <div className="rounded-[1.8rem] bg-[#fffaf0] text-navy overflow-hidden">
                    <div className="grid grid-cols-[1.05fr_0.95fr] gap-0">
                      <div className="relative min-h-[520px]">
                        <Image src={activeDishPhoto} alt={activeDish?.name ?? demo.businessName} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                        <div className="absolute left-6 right-6 bottom-6 text-white">
                          <p className="text-gold text-xs font-black uppercase tracking-wider mb-2">Destaque do chef</p>
                          <h3 className="text-3xl font-black leading-tight">{activeDish?.name}</h3>
                          <p className="text-sm text-white/75 mt-2">{activeDish?.description}</p>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col justify-between">
                        <div>
                          <div className="rounded-2xl bg-white p-4 shadow-sm border border-orange-100 mb-4">
                            <p className="text-xs text-gold font-black uppercase tracking-wider">Como o cliente vê</p>
                            <p className="text-2xl font-black mt-1">Menu bonito, sem PDF perdido.</p>
                          </div>
                          <div className="space-y-2">
                            {demo.services.slice(0, 4).map((item, index) => (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => setActiveMenuItem(index)}
                                className={`w-full rounded-2xl p-3 text-left border transition-all ${activeMenuItem === index ? 'bg-navy text-white border-navy' : 'bg-white border-orange-100 hover:border-gold/50'}`}
                              >
                                <p className="font-black text-sm">{item.name}</p>
                                <p className={`text-xs mt-1 line-clamp-1 ${activeMenuItem === index ? 'text-white/60' : 'text-gray-400'}`}>{item.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 rounded-2xl bg-navy text-white p-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gold text-navy flex items-center justify-center"><QrCode className="w-6 h-6" /></div>
                          <div><p className="font-black">QR do menu</p><p className="text-xs text-gray-300">Mesa, flyer, balcão e delivery.</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {isFood && (
        <section id="services" className="py-24 bg-[#fffaf0]">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-orange-100 px-4 py-2 text-gold uppercase tracking-wider text-sm font-black shadow-sm">
                <QrCode className="w-4 h-4" /> Menu interativo + QR Code
              </span>
              <h2 className="text-4xl md:text-6xl font-black mt-4 mb-5 leading-tight">Cardápio bonito para abrir no telemóvel e decidir rápido.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-7">O cliente final clica no menu, vê pratos com foto, escolhe o destaque e chama no WhatsApp. O QR pode ficar na mesa, balcão, flyer ou sacola.</p>
              <div className="grid grid-cols-2 gap-3">
                {['QR de mesa', 'Menu completo', 'Pedido WhatsApp', 'Fotos de pratos'].map((item, index) => (
                  <div key={item} className="rounded-2xl bg-white border border-orange-100 p-4 font-black text-navy shadow-sm hover:-translate-y-1 hover:border-gold/40 transition-all">
                    <span className="text-gold text-xs">0{index + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setShowFullMenu(true)} className="mt-6 inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-black hover:bg-navy/90 transition-colors">
                <Utensils className="w-4 h-4" /> Abrir cardápio completo
              </button>
            </div>
            <div className="rounded-[2.4rem] bg-white border border-orange-100 shadow-2xl shadow-orange-100/70 p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-[0.92fr_1.08fr] gap-4">
                <div className="relative min-h-[420px] rounded-[2rem] overflow-hidden">
                  <Image key={activeDishPhoto} src={activeDishPhoto} alt={activeDish?.name ?? 'Menu highlight'} fill className="object-cover transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute left-4 bottom-4 text-white">
                    <Utensils className="w-7 h-7 text-gold mb-2" />
                    <p className="text-2xl font-black">{activeDish?.name}</p>
                    <p className="text-sm text-white/75 max-w-xs mt-1">{activeDish?.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-gold font-black uppercase tracking-wider">Mais pedidos</p>
                  {demo.services.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      onMouseEnter={() => setActiveMenuItem(index)}
                      onFocus={() => setActiveMenuItem(index)}
                      onClick={() => setActiveMenuItem(index)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${
                        activeMenuItem === index
                          ? 'bg-navy text-white border-navy shadow-lg shadow-navy/10'
                          : 'bg-stone-50 text-navy border-stone-100 hover:border-gold/40 hover:bg-gold/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">{item.name}</p>
                        <span className={`h-2.5 w-2.5 rounded-full ${activeMenuItem === index ? 'bg-gold' : 'bg-stone-300'}`} />
                      </div>
                      <p className={`text-xs mt-1 line-clamp-1 ${activeMenuItem === index ? 'text-white/60' : 'text-gray-400'}`}>{item.description}</p>
                    </button>
                  ))}
                  <div className="rounded-2xl bg-navy text-white p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold text-navy flex items-center justify-center"><QrCode className="w-6 h-6" /></div>
                    <div><p className="font-black">QR pronto para o menu</p><p className="text-xs text-gray-300">Rastreie visitas do QR no dashboard.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
            {demo.services.map((dish) => (
              <article key={dish.name} className="group rounded-[1.75rem] bg-white border border-orange-100 p-3 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-gold/40 transition-all">
                <div className="relative h-44 rounded-[1.35rem] overflow-hidden bg-stone-100">
                  <Image src={dish.photo || demo.photos[1]} alt={dish.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-3">
                  <p className="font-black text-navy text-lg">{dish.name}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{dish.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {isProfessional && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
            <div className="rounded-[2rem] bg-white border border-slate-100 p-7 shadow-2xl shadow-slate-200/70">
              <span className="inline-flex items-center gap-2 text-gold uppercase tracking-wider text-sm font-black">
                <Scale className="w-4 h-4" /> Confiança profissional
              </span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4">Clareza, autoridade e consulta.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-5">Para clínicas e escritórios, a landing precisa ser elegante, explicar o valor rápido e levar a pessoa para uma conversa qualificada.</p>
              <div className="grid grid-cols-2 gap-3 text-sm font-black">
                <span className="rounded-2xl bg-slate-50 border border-slate-100 p-3">Áreas claras</span>
                <span className="rounded-2xl bg-slate-50 border border-slate-100 p-3">Prova social</span>
                <span className="rounded-2xl bg-slate-50 border border-slate-100 p-3">FAQ objetivo</span>
                <span className="rounded-2xl bg-slate-50 border border-slate-100 p-3">CTA consulta</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ['01', 'Entenda o caso', 'Contato qualificado com contexto antes da consulta.'],
                ['02', 'Explique o processo', 'Áreas de atuação e perguntas respondidas sem excesso.'],
                ['03', 'Converta com confiança', 'WhatsApp, mapa e prova social no momento certo.'],
              ].map(([step, title, text]) => (
                <div key={step} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xl shadow-slate-200/60 hover:-translate-y-1 hover:border-gold/40 transition-all">
                  <p className="text-5xl font-black text-gold/30">{step}</p>
                  <h3 className="font-black text-navy text-lg mt-3">{title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isClinic && (
        <section className="py-20 bg-rose-50/70">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-gold uppercase tracking-wider text-sm font-black">
                <HeartPulse className="w-4 h-4" /> Clínicas e serviços especializados
              </span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4">Confiança antes da avaliação.</h2>
              <p className="text-gray-500 text-lg leading-relaxed">A estrutura deixa claro o cuidado, os tratamentos, os próximos passos e o canal de marcação. Ideal para estética, saúde, terapeutas e personal trainers.</p>
            </div>
            <div className="rounded-[2rem] bg-white border border-rose-100 p-5 shadow-2xl shadow-rose-100/70">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  ['Avaliação', 'Explica o primeiro contacto e reduz insegurança.'],
                  ['Tratamento', 'Mostra opções com descrição simples e confiável.'],
                  ['Acompanhamento', 'Reforça cuidado, retorno e relação contínua.'],
                ].map(([title, text], index) => (
                  <div key={title} className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5 hover:-translate-y-1 hover:border-gold/40 transition-all">
                    <span className="inline-flex w-9 h-9 rounded-2xl bg-navy text-gold items-center justify-center font-black text-sm mb-4">{index + 1}</span>
                    <h3 className="font-black text-navy text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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

      {!isFood && (
        <section id="services" className="py-24 bg-navy text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-gold uppercase tracking-wider text-sm font-bold">{serviceLabel}</span>
              <h2 className="text-4xl font-black mt-2">{serviceTitle}</h2>
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
      )}

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

      {isFood && (
        <section className="py-24 bg-[#111827] text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.22),transparent_28%),radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.08),transparent_24%)]" />
          <div className="relative max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <span className="text-gold uppercase tracking-wider text-sm font-black">Experiência no espaço</span>
              <h2 className="text-4xl md:text-6xl font-black mt-3 mb-5 leading-tight">Onde o QR entra na experiência do restaurante.</h2>
              <p className="text-white/65 text-lg leading-relaxed mb-6">A demonstração mostra o caminho completo: cliente senta, lê o QR, vê pratos com fotos, escolhe o menu completo e chama no WhatsApp ou reserva mesa.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  [<QrCode key="qr" className="w-5 h-5" />, 'QR na mesa'],
                  [<Wine key="wine" className="w-5 h-5" />, 'Menu visual'],
                  [<CalendarCheck key="calendar" className="w-5 h-5" />, 'Reserva rápida'],
                ].map(([icon, text]) => (
                  <div key={String(text)} className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <div className="text-gold mb-2">{icon}</div>
                    <p className="font-black">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {demo.photos.slice(0, 4).map((photo, index) => (
                <div key={photo} className={`relative rounded-[2rem] overflow-hidden shadow-2xl ${index === 0 ? 'h-80' : 'h-48'} ${index === 2 ? 'h-64' : ''}`}>
                  <Image src={photo} alt={`${demo.businessName} ambiente ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {showFullMenu && (
        <div className="fixed inset-0 z-[80] bg-navy/80 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto rounded-[2rem] bg-[#fffaf0] text-navy overflow-hidden shadow-2xl border border-gold/20">
            <div className="relative p-6 md:p-8 bg-navy text-white">
              <button type="button" onClick={() => setShowFullMenu(false)} className="absolute right-5 top-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
              <p className="text-gold text-xs font-black uppercase tracking-[0.24em]">Cardápio completo demo</p>
              <h2 className="text-3xl md:text-5xl font-black mt-2">{demo.businessName}</h2>
              <p className="text-white/65 mt-3 max-w-2xl">Exemplo de como o cardápio do cliente pode aparecer: visual, organizado, sem depender de PDF e pronto para QR Code.</p>
            </div>
            <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {demo.services.map((dish) => (
                <article key={dish.name} className="rounded-3xl bg-white border border-orange-100 p-4 grid grid-cols-[110px_1fr] gap-4 items-center">
                  <div className="relative h-28 rounded-2xl overflow-hidden bg-stone-100">
                    <Image src={dish.photo || demo.photos[1]} alt={dish.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-xl">{dish.name}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{dish.description}</p>
                    <p className="text-xs text-gold font-black uppercase tracking-wider mt-3">Sem preço na demo · foco na experiência</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="p-5 md:p-8 pt-0 flex flex-col sm:flex-row gap-3">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-black hover:bg-[#1ebe5d] transition-colors">
                <MessageCircle className="w-5 h-5" /> Pedir pelo WhatsApp
              </a>
              <button type="button" onClick={() => setShowFullMenu(false)} className="inline-flex items-center justify-center bg-navy text-white px-6 py-3 rounded-full font-black hover:bg-navy/90 transition-colors">
                Fechar cardápio
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
