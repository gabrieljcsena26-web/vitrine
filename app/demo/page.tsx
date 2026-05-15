'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  QrCode,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react'
import LocationMap from '@/components/LocationMap'
import { safeBookingHref, whatsAppHref } from '@/lib/utils'

type TemplateId = 'restaurant' | 'precision' | 'beauty'

type CarouselItem = {
  title: string
  subtitle: string
  image: string
  badge: string
  metric: string
}

type ReviewItem = {
  author: string
  text: string
  rating: number
}

type ServiceItem = {
  name: string
  price: string
  description: string
}

type DemoTemplate = {
  id: TemplateId
  label: string
  kicker: string
  title: string
  intro: string
  heroHeadline: string
  heroSubheadline: string
  heroMood: string
  heroImage: string
  accent: string
  accentSoft: string
  shell: string
  panel: string
  category: string
  businessName: string
  bookingUrl: string
  whatsappNumber: string
  whatsappMessage: string
  address: string
  mapUrl: string
  fullCatalogUrl: string
  fullCatalogLabel: string
  catalogImage: string
  rating: number
  reviewCount: string
  reviewSummary: string
  reviews: ReviewItem[]
  services: ServiceItem[]
  highlights: string[]
  stats: { label: string; value: string }[]
  carouselTitle: string
  carouselSubtitle: string
  carouselItems: CarouselItem[]
}

const templates: DemoTemplate[] = [
  {
    id: 'restaurant',
    label: 'Restauração',
    kicker: 'Editorial dining',
    title: 'Fine dining com desejo visual, menu forte e reserva imediata.',
    intro: 'Essa estrutura prioriza atmosfera, prato assinatura, prova social e um funil curto para reservar ou pedir. O carrossel vende experiência, não só foto bonita.',
    heroHeadline: 'Uma landing que abre apetite, posiciona a casa e empurra para reserva.',
    heroSubheadline: 'Hero cinematográfico, barra de ação permanente, destaques do cardápio, QR do menu completo e fluxo pensado para mobile.',
    heroMood: 'Noite, textura, desejo e decisão rápida.',
    heroImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1600&auto=format&fit=crop',
    accent: '#D4A24C',
    accentSoft: 'rgba(212,162,76,0.16)',
    shell: 'bg-[#120f0d] text-white',
    panel: 'border-white/10 bg-white/[0.05]',
    category: 'Restaurante autoral',
    businessName: 'Atelier Fogo & Mar',
    bookingUrl: 'https://calendly.com/vitrine-demo/jantar',
    whatsappNumber: '+351911111111',
    whatsappMessage: 'Olá! Quero reservar uma mesa no Atelier Fogo & Mar.',
    address: 'Rua do Ouro 88, Lisboa',
    mapUrl: 'https://www.google.com/maps?q=Rua+do+Ouro+88,+Lisboa&output=embed',
    fullCatalogUrl: 'https://example.com/menu-atelier-fogo-mar',
    fullCatalogLabel: 'Ver cardápio completo',
    catalogImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviewCount: '324 avaliações',
    reviewSummary: 'Muito forte para operação de restaurante porque combina desejo, prova visual e ação direta de reserva/pedido no mesmo fluxo.',
    reviews: [
      { author: 'Marina Lopes', text: 'A página faz a gente sentir o ambiente antes mesmo de chegar. Reserva em segundos.', rating: 5 },
      { author: 'Diogo Ramos', text: 'O carrossel dos pratos convence rápido e o menu completo está a um toque.', rating: 5 },
      { author: 'Lia Cunha', text: 'Premium sem exagero. Organizado, elegante e muito fácil de reservar.', rating: 5 },
    ],
    services: [
      { name: 'Menu degustação', price: '79€', description: 'Experiência completa em 7 tempos com harmonização opcional.' },
      { name: 'Jantar a dois', price: '58€', description: 'Sequência pensada para casal com pratos assinatura da casa.' },
      { name: 'Menu executivo', price: '24€', description: 'Opção rápida de almoço para decisão simples e ticket médio forte.' },
      { name: 'Cocktail pairing', price: '18€', description: 'Coquetelaria autoral para elevar o momento da reserva.' },
    ],
    highlights: ['Reserva e pedido no topo', 'QR do cardápio completo', 'Galeria emocional com pratos + ambiente'],
    stats: [
      { label: 'Tempo até decidir', value: '< 40s' },
      { label: 'CTA principal', value: 'Reservar mesa' },
      { label: 'Prova visual', value: 'Pratos + ambiente' },
    ],
    carouselTitle: 'Carrossel de experiências gastronómicas',
    carouselSubtitle: 'Cada slide vende um motivo de visita: assinatura, ambiente, ritual ou ocasião.',
    carouselItems: [
      {
        title: 'Chef tasting',
        subtitle: 'Slide com prato hero, preço âncora e sensação de exclusividade.',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop',
        badge: 'Mais premium',
        metric: '7 tempos',
      },
      {
        title: 'Mesa ao entardecer',
        subtitle: 'Mostra o ambiente e puxa reservas para ocasiões especiais.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop',
        badge: 'Ocasião',
        metric: 'Sunset dinner',
      },
      {
        title: 'Menu executivo',
        subtitle: 'Ajuda almoço corporativo e conversão em horários de menor tíquete.',
        image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1200&auto=format&fit=crop',
        badge: 'Ticket médio',
        metric: '24€',
      },
    ],
  },
  {
    id: 'precision',
    label: 'Escritório / Clínica',
    kicker: 'Trust precision',
    title: 'Estrutura de confiança para clínica, consultório, advocacia e serviços premium.',
    intro: 'Aqui a decisão vem de clareza, autoridade e processo. O carrossel não é decorativo: ele organiza especialidades, diferenciais e o próximo passo.',
    heroHeadline: 'Uma landing que transmite rigor, reduz objeção e leva direto para agenda.',
    heroSubheadline: 'Hero claro, blocos de credibilidade, reviews estilo Google, highlights de serviço e CTA sempre visível para WhatsApp ou plataforma de agendamento.',
    heroMood: 'Precisão, confiança e hierarquia limpa.',
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1600&auto=format&fit=crop',
    accent: '#3B82F6',
    accentSoft: 'rgba(59,130,246,0.14)',
    shell: 'bg-[#f4f8fc] text-slate-950',
    panel: 'border-slate-200 bg-white',
    category: 'Clínica / Escritório premium',
    businessName: 'Atlas Prime Care',
    bookingUrl: 'https://calendly.com/vitrine-demo/avaliacao-premium',
    whatsappNumber: '+351922222222',
    whatsappMessage: 'Olá! Quero agendar uma avaliação na Atlas Prime Care.',
    address: 'Avenida da Liberdade 212, Lisboa',
    mapUrl: 'https://www.google.com/maps?q=Avenida+da+Liberdade+212,+Lisboa&output=embed',
    fullCatalogUrl: 'https://example.com/catalogo-atlas-prime',
    fullCatalogLabel: 'Ver todos os serviços e preços',
    catalogImage: 'https://images.unsplash.com/photo-1580281657702-257584239a4a?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviewCount: '196 avaliações',
    reviewSummary: 'Esse modelo funciona melhor quando o cliente precisa confiar antes de agir. Menos show, mais credibilidade e organização.',
    reviews: [
      { author: 'Carla Mendonça', text: 'Achei tudo em menos de um minuto: especialidades, localização e como agendar.', rating: 5 },
      { author: 'Henrique Paiva', text: 'A página parece séria, profissional e muito clara. Passa confiança.', rating: 5 },
      { author: 'Sofia Nunes', text: 'Gostei do bloco com processo e dos reviews com cara de Google.', rating: 4 },
    ],
    services: [
      { name: 'Avaliação premium', price: '95€', description: 'Primeira sessão com diagnóstico, plano e próximos passos definidos.' },
      { name: 'Consulta especializada', price: '140€', description: 'Atendimento avançado com orientação detalhada e foco em decisão segura.' },
      { name: 'Acompanhamento', price: '75€', description: 'Retorno estruturado com histórico, evolução e plano contínuo.' },
      { name: 'Sessão estratégica', price: '180€', description: 'Formato ideal para escritórios, consultores e casos de maior valor.' },
    ],
    highlights: ['Bloco estilo Google Reviews', 'Processo em 3 passos', 'Mapa e canais de contacto sempre próximos do CTA'],
    stats: [
      { label: 'Foco principal', value: 'Confiança' },
      { label: 'CTA principal', value: 'Agendar avaliação' },
      { label: 'Estrutura', value: 'Rigor + clareza' },
    ],
    carouselTitle: 'Carrossel de especialidades e diferenciais',
    carouselSubtitle: 'Os cards funcionam como navegação de decisão: cada um responde uma dúvida e prepara o clique no agendamento.',
    carouselItems: [
      {
        title: 'Atendimento em 3 etapas',
        subtitle: 'Excelente para clínica ou escritório porque simplifica o processo e remove fricção.',
        image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop',
        badge: 'Clareza',
        metric: '1-2-3',
      },
      {
        title: 'Credenciais e prova',
        subtitle: 'Slide com autoridade, tempo de experiência e diferenciais reais do time.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop',
        badge: 'Confiança',
        metric: '+12 anos',
      },
      {
        title: 'Serviço premium',
        subtitle: 'Mostra valor e preço com estética limpa, sem parecer tabela fria.',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop',
        badge: 'Ticket alto',
        metric: '95€ a 180€',
      },
    ],
  },
  {
    id: 'beauty',
    label: 'Salão de beleza',
    kicker: 'Beauty showcase',
    title: 'Visual aspiracional com transformação, agenda fácil e prova social viva.',
    intro: 'Essa landing é para vender resultado, estilo e confiança pessoal. O carrossel trabalha transformação e portfólio, enquanto o CTA fica sempre ao alcance.',
    heroHeadline: 'Uma landing que parece marca premium e converte em agendamento.',
    heroSubheadline: 'Hero editorial, carrossel de transformação, highlights claros, reviews, mapa e botão forte para WhatsApp ou Calendly.',
    heroMood: 'Fashion, brilho controlado e sensação de resultado.',
    heroImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop',
    accent: '#D977A8',
    accentSoft: 'rgba(217,119,168,0.16)',
    shell: 'bg-[#fff7fb] text-slate-950',
    panel: 'border-rose-100 bg-white',
    category: 'Beauty studio premium',
    businessName: 'Maison Aura Studio',
    bookingUrl: 'https://calendly.com/vitrine-demo/maison-aura',
    whatsappNumber: '+351933333333',
    whatsappMessage: 'Olá! Quero marcar um horário na Maison Aura Studio.',
    address: 'Rua Castilho 31, Lisboa',
    mapUrl: 'https://www.google.com/maps?q=Rua+Castilho+31,+Lisboa&output=embed',
    fullCatalogUrl: 'https://example.com/servicos-maison-aura',
    fullCatalogLabel: 'Ver todos os serviços e packs',
    catalogImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviewCount: '417 avaliações',
    reviewSummary: 'Aqui o foco é desejo + prova de transformação. A pessoa precisa imaginar o resultado e achar o agendamento imediatamente.',
    reviews: [
      { author: 'Patrícia Sousa', text: 'O layout passa exatamente a sensação premium do estúdio. Dá vontade de marcar na hora.', rating: 5 },
      { author: 'Bia Santos', text: 'O carrossel de resultados ficou muito mais forte do que galeria tradicional.', rating: 5 },
      { author: 'Raquel Freitas', text: 'Instagram, WhatsApp e agenda bem integrados. Muito organizado.', rating: 5 },
    ],
    services: [
      { name: 'Glow signature', price: '89€', description: 'Serviço-âncora com acabamento premium e alto poder de desejo.' },
      { name: 'Hair contour', price: '120€', description: 'Transformação visível com foco em resultado fotogénico.' },
      { name: 'Brow sculpt', price: '35€', description: 'Entrada perfeita para novos clientes e recorrência.' },
      { name: 'Bridal beauty pack', price: '190€', description: 'Pacote de alto valor com forte apelo visual e agendamento antecipado.' },
    ],
    highlights: ['Carrossel de transformação', 'Ações de agenda e WhatsApp sempre próximas', 'Serviços com preço e desejo bem equilibrados'],
    stats: [
      { label: 'Foco principal', value: 'Resultado visual' },
      { label: 'CTA principal', value: 'Marcar horário' },
      { label: 'Sensação', value: 'Beauty premium' },
    ],
    carouselTitle: 'Carrossel de resultados e looks assinatura',
    carouselSubtitle: 'Serve como portfólio vivo: mostra transformação, estilo e deixa claro o tipo de resultado que o cliente pode esperar.',
    carouselItems: [
      {
        title: 'Glow finish',
        subtitle: 'Perfeito para serviços de maior apelo visual e forte compartilhamento social.',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop',
        badge: 'Resultado',
        metric: 'Antes / depois',
      },
      {
        title: 'Editorial hair',
        subtitle: 'Ajuda a posicionar o salão como aspiracional, não apenas funcional.',
        image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1200&auto=format&fit=crop',
        badge: 'Fashion',
        metric: 'Look signature',
      },
      {
        title: 'Noiva premium',
        subtitle: 'Slide ideal para vender pacotes de ticket alto com estética limpa e emocional.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
        badge: 'High value',
        metric: 'Pack bridal',
      },
    ],
  },
]

function getTemplateIcon(id: TemplateId) {
  if (id === 'restaurant') return UtensilsCrossed
  if (id === 'beauty') return Scissors
  return ShieldCheck
}

function FloatingActionBar({ template }: { template: DemoTemplate }) {
  const bookingHref = safeBookingHref(template.bookingUrl)
  const whatsappHref = whatsAppHref(template.whatsappNumber, template.whatsappMessage)
  const directionsHref = template.mapUrl.startsWith('http')
    ? template.mapUrl.replace('&output=embed', '')
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(template.address)}`

  return (
    <div className="sticky top-4 z-30 mx-auto mb-8 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border px-4 py-4 shadow-2xl backdrop-blur ${template.panel}`}>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>Bloco comum obrigatório</p>
          <h2 className="mt-1 text-lg font-black">WhatsApp + agendamento + mapa + reviews + catálogo com QR</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {bookingHref && (
            <a href={bookingHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold text-white" style={{ backgroundColor: template.accent }}>
              <CalendarDays className="h-4 w-4" />
              Agendar
            </a>
          )}
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-white">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-current px-5 py-3 font-bold">
            <MapPin className="h-4 w-4" />
            Maps
          </a>
        </div>
      </div>
    </div>
  )
}

function TemplateHero({ template }: { template: DemoTemplate }) {
  const bookingHref = safeBookingHref(template.bookingUrl)
  const whatsappHref = whatsAppHref(template.whatsappNumber, template.whatsappMessage)

  if (template.id === 'precision') {
    return (
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:pt-14">
        <div className="self-center">
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>{template.kicker}</p>
          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950 md:text-6xl">{template.heroHeadline}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{template.heroSubheadline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {bookingHref && <a href={bookingHref} target="_blank" rel="noopener noreferrer" className="rounded-full px-6 py-3 font-bold text-white" style={{ backgroundColor: template.accent }}>Agendar avaliação</a>}
            {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-900">Falar no WhatsApp</a>}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {template.stats.map((stat) => (
              <div key={stat.label} className={`rounded-[1.5rem] border p-5 ${template.panel}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[520px] overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.08)]">
          <Image src={template.heroImage} alt={template.businessName} fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/15 to-transparent" />
          <div className="absolute left-6 right-6 top-6 rounded-[1.5rem] border border-white/30 bg-white/85 p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: template.accent }}>Pronto para clínica ou escritório</p>
            <p className="mt-2 text-sm font-medium text-slate-600">Layout limpo, bloco de autoridade, carrossel de especialidades e CTA sem ruído.</p>
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/10 bg-slate-950/85 p-5 text-white backdrop-blur">
            <p className="text-sm text-slate-300">{template.heroMood}</p>
            <p className="mt-3 text-2xl font-black">{template.businessName}</p>
          </div>
        </div>
      </section>
    )
  }

  if (template.id === 'beauty') {
    return (
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:pt-14">
        <div className="self-center">
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>{template.kicker}</p>
          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950 md:text-6xl">{template.heroHeadline}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{template.heroSubheadline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={template.bookingUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-6 py-3 font-bold text-white" style={{ backgroundColor: template.accent }}>Marcar horário</a>
            <a href={whatsAppHref(template.whatsappNumber, template.whatsappMessage) || '#'} target="_blank" rel="noopener noreferrer" className="rounded-full border border-rose-200 bg-white px-6 py-3 font-bold text-slate-900">WhatsApp</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {template.highlights.map((item) => (
              <span key={item} className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">{item}</span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[560px]">
          <div className="absolute left-0 top-10 h-[74%] w-[74%] overflow-hidden rounded-[2.2rem] shadow-[0_30px_100px_rgba(217,119,168,0.22)]">
            <Image src={template.heroImage} alt={template.businessName} fill className="object-cover" unoptimized />
          </div>
          <div className="absolute bottom-0 right-0 h-[58%] w-[52%] overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-2xl">
            <div className="relative h-full overflow-hidden rounded-[1.5rem]">
              <Image src={template.carouselItems[0].image} alt={template.carouselItems[0].title} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#ffd4e8' }}>{template.carouselItems[0].badge}</p>
                <p className="mt-2 text-2xl font-black">{template.carouselItems[0].title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:px-8 lg:pt-14">
      <div className="self-center">
        <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>{template.kicker}</p>
        <h1 className="mt-4 text-5xl font-black leading-tight text-white md:text-6xl">{template.heroHeadline}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{template.heroSubheadline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={template.bookingUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-6 py-3 font-bold text-slate-950" style={{ backgroundColor: template.accent }}>Reservar agora</a>
          <a href={template.fullCatalogUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-6 py-3 font-bold text-white">Ver cardápio</a>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {template.stats.map((stat) => (
            <div key={stat.label} className={`rounded-[1.5rem] border p-5 ${template.panel}`}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative min-h-[560px] overflow-hidden rounded-[2.2rem] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <Image src={template.heroImage} alt={template.businessName} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 rounded-[1.75rem] border border-white/10 bg-black/35 p-5 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: template.accent }}>Hero de desejo</p>
          <p className="mt-2 text-3xl font-black text-white">{template.businessName}</p>
          <p className="mt-2 text-sm text-white/75">{template.heroMood}</p>
        </div>
      </div>
    </section>
  )
}

function InteractiveCarousel({ template }: { template: DemoTemplate }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = template.carouselItems[activeIndex]
  const goPrev = () => setActiveIndex((current) => (current === 0 ? template.carouselItems.length - 1 : current - 1))
  const goNext = () => setActiveIndex((current) => (current === template.carouselItems.length - 1 ? 0 : current + 1))

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className={`rounded-[2rem] border p-6 shadow-xl ${template.panel}`}>
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[1.8rem]">
            <Image src={activeItem.image} alt={activeItem.title} fill className="object-cover transition-transform duration-500" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.24em]" style={{ backgroundColor: template.accentSoft, color: template.accent }}>{activeItem.badge}</span>
                <span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-bold">{activeItem.metric}</span>
              </div>
              <h3 className="mt-4 text-4xl font-black">{activeItem.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/78">{activeItem.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>Carrossel interativo</p>
              <h2 className="mt-3 text-3xl font-black">{template.carouselTitle}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-500">{template.carouselSubtitle}</p>
            </div>
            <div className="space-y-3">
              {template.carouselItems.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-[1.5rem] border p-4 text-left transition-all ${index === activeIndex ? 'scale-[1.02] shadow-lg' : 'opacity-80 hover:opacity-100'} ${template.panel}`}
                  style={index === activeIndex ? { borderColor: template.accent, boxShadow: `0 20px 60px ${template.accentSoft}` } : undefined}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.subtitle}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: template.accentSoft, color: template.accent }}>{item.metric}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={goPrev} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-current/15 bg-transparent">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={goNext} className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ backgroundColor: template.accent }}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesHighlights({ template }: { template: DemoTemplate }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>Highlights services</p>
          <h2 className="mt-3 text-3xl font-black">Serviços principais com preço e contexto</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {template.highlights.map((item) => (
            <span key={item} className="rounded-full border border-current/10 px-4 py-2 text-sm font-bold">{item}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {template.services.map((service) => (
          <article key={service.name} className={`rounded-[1.75rem] border p-5 shadow-sm ${template.panel}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-black">{service.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{service.description}</p>
              </div>
              <div className="rounded-2xl p-3" style={{ backgroundColor: template.accentSoft, color: template.accent }}>
                {template.id === 'restaurant' ? <UtensilsCrossed className="h-5 w-5" /> : template.id === 'beauty' ? <Scissors className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
            </div>
            <p className="mt-6 text-3xl font-black" style={{ color: template.accent }}>{service.price}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function GoogleReviewsBlock({ template }: { template: DemoTemplate }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className={`rounded-[2rem] border p-6 shadow-xl ${template.panel}`}>
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>Google Reviews API</p>
            <h2 className="mt-3 text-3xl font-black">Bloco de reviews com cara de confiança real</h2>
            <div className="mt-6 rounded-[1.5rem] border border-current/10 p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <span className="text-xl font-black text-[#4285F4]">G</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Google rating</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-3xl font-black">{template.rating.toFixed(1)}</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`h-4 w-4 ${index < Math.round(template.rating) ? 'fill-current' : 'text-stone-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{template.reviewCount}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-500">{template.reviewSummary}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {template.reviews.map((review) => (
              <article key={review.author} className="rounded-[1.5rem] border border-current/10 bg-white/70 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{review.author}</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-current' : 'text-stone-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">“{review.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CatalogQrSection({ template }: { template: DemoTemplate }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className={`grid gap-8 rounded-[2rem] border p-6 shadow-xl lg:grid-cols-[0.82fr_1.18fr] ${template.panel}`}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>Catálogo / cardápio completo</p>
          <h2 className="mt-3 text-3xl font-black">Botão forte para ver tudo com QR pronto</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">Aqui entra o link completo do cardápio ou catálogo de serviços com preços. O QR ajuda no físico, na bio e em campanhas offline.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={template.fullCatalogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold text-white" style={{ backgroundColor: template.accent }}>
              <ArrowRight className="h-4 w-4" />
              {template.fullCatalogLabel}
            </a>
            <div className="inline-flex items-center gap-2 rounded-full border border-current/10 px-5 py-3 font-bold">
              <QrCode className="h-4 w-4" />
              QR pronto para usar
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-current/10 p-4">
              <p className="text-sm font-black">Use em:</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">mesa, cartão, vitrine física, bio do Instagram e campanhas locais.</p>
            </div>
            <div className="rounded-[1.5rem] border border-current/10 p-4">
              <p className="text-sm font-black">Objetivo:</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">mostrar todo o portfólio sem poluir a landing principal.</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] border border-current/10 bg-white">
            <Image src={template.catalogImage} alt={template.fullCatalogLabel} fill className="object-cover" unoptimized />
          </div>
          <div className="rounded-[1.75rem] border border-current/10 bg-white p-5">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: template.accentSoft, color: template.accent }}>
                  <QrCode className="h-7 w-7" />
                </div>
                <p className="mt-5 text-lg font-black">Preview do QR</p>
                <div className="mt-4 grid grid-cols-5 gap-1 rounded-2xl bg-slate-950 p-4">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <div key={index} className={`aspect-square rounded-[2px] ${[0, 1, 3, 5, 6, 8, 10, 12, 16, 17, 18, 20, 22, 24].includes(index) ? 'bg-white' : 'bg-slate-700'}`} />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">No teste, ele é ilustrativo. Na versão final, esse bloco pode apontar para o link real do catálogo ou menu.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClosingCta({ template }: { template: DemoTemplate }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 pb-20 sm:px-6 lg:px-8">
      <div className={`rounded-[2rem] border p-8 shadow-xl ${template.panel}`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: template.accent }}>Próximo passo</p>
            <h2 className="mt-3 text-3xl font-black">Se essa direção agradar, a gente transforma em template real do produto.</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">O objetivo desta rota é comparar estrutura, carrossel, hierarquia e sensação premium antes de mexer em todas as páginas.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={template.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold text-white" style={{ backgroundColor: template.accent }}>
              <CalendarDays className="h-4 w-4" />
              Testar CTA de agenda
            </a>
            <a href={whatsAppHref(template.whatsappNumber, template.whatsappMessage) || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-current/10 px-5 py-3 font-bold">
              <MessageCircle className="h-4 w-4" />
              Testar WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function DemoLandingLabPage() {
  const [activeId, setActiveId] = useState<TemplateId>('restaurant')
  const activeTemplate = useMemo(() => templates.find((item) => item.id === activeId) ?? templates[0], [activeId])

  return (
    <main className={`min-h-screen transition-colors duration-300 ${activeTemplate.shell}`}>
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className={`rounded-[2.2rem] border p-6 shadow-2xl ${activeTemplate.panel}`}>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: activeTemplate.accent }}>Rota de teste isolada</p>
              <h1 className="mt-4 text-4xl font-black md:text-5xl">Laboratório de 3 landings premium para comparar antes de aplicar no produto.</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500">Cada exemplo já inclui os pontos comuns que você pediu: botão de WhatsApp, link de agendamento da plataforma do cliente, mapa, bloco estilo Google Reviews, highlights de serviços e catálogo/cardápio com QR.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {templates.map((template) => {
                const Icon = getTemplateIcon(template.id)
                const isActive = template.id === activeId
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setActiveId(template.id)}
                    className={`rounded-[1.5rem] border p-4 text-left transition-all ${isActive ? 'scale-[1.02] shadow-lg' : 'opacity-85 hover:opacity-100'} ${activeTemplate.panel}`}
                    style={isActive ? { borderColor: template.accent, boxShadow: `0 18px 60px ${template.accentSoft}` } : undefined}
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: template.accentSoft, color: template.accent }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-lg font-black">{template.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{template.title}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <FloatingActionBar template={activeTemplate} />
      <TemplateHero template={activeTemplate} />

      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className={`grid gap-4 rounded-[2rem] border p-6 md:grid-cols-3 ${activeTemplate.panel}`}>
          {activeTemplate.stats.map((item) => (
            <div key={item.label} className="rounded-[1.5rem] border border-current/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-black">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <InteractiveCarousel template={activeTemplate} />
      <ServicesHighlights template={activeTemplate} />
      <GoogleReviewsBlock template={activeTemplate} />
      <CatalogQrSection template={activeTemplate} />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`rounded-[2rem] border p-6 shadow-xl ${activeTemplate.panel}`}>
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: activeTemplate.accent }}>O que está em comum</p>
              <h2 className="mt-3 text-3xl font-black">Base repetível do produto, sem ficar tudo igual</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-current/10 px-4 py-2 text-sm font-bold">
              <BadgeCheck className="h-4 w-4" style={{ color: activeTemplate.accent }} />
              Trilha pronta para produto SaaS
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'CTA duplo', text: 'WhatsApp e agendamento sempre próximos do hero e do fechamento.', icon: MessageCircle },
              { title: 'Maps', text: 'Mapa e rota sem exigir esforço do visitante.', icon: MapPin },
              { title: 'Reviews', text: 'Bloco visualmente confiável para integração futura com Google.', icon: Star },
              { title: 'Catálogo completo', text: 'Landing resumida e catálogo/menu completo separado com QR.', icon: QrCode },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-current/10 p-5">
                <item.icon className="h-5 w-5" style={{ color: activeTemplate.accent }} />
                <p className="mt-4 text-lg font-black">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`rounded-[2rem] border p-6 shadow-xl ${activeTemplate.panel}`}>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: activeTemplate.accent }}>Localização e presença física</p>
              <h2 className="mt-3 text-3xl font-black">Mapa pronto para teste dentro da rota demo</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-500">A landing de teste já usa embed de mapa para você validar se o bloco funciona bem com o resto da página e se vale subir para produção depois.</p>
              <div className="mt-6 space-y-3 text-sm text-slate-500">
                <div className="inline-flex items-center gap-2 rounded-full border border-current/10 px-4 py-2"><Clock3 className="h-4 w-4" /> horário e rota próximos da conversão</div>
                <div className="inline-flex items-center gap-2 rounded-full border border-current/10 px-4 py-2"><Sparkles className="h-4 w-4" /> estrutura bonita sem sacrificar velocidade</div>
              </div>
            </div>
            <LocationMap address={activeTemplate.address} mapUrl={activeTemplate.mapUrl} businessName={activeTemplate.businessName} />
          </div>
        </div>
      </section>

      <ClosingCta template={activeTemplate} />
    </main>
  )
}