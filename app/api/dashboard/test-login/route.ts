import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/dashboard/test-login — creates/opens a demo business for testing.
export async function POST() {
  try {
    const db = createServiceClient()

    const payload = {
      slug: 'vitrine-test-demo',
      owner_name: 'Casa Aurora Bistro',
      owner_email: 'test@vitrine.local',
      category: 'Restaurant',
      description: 'Um bistro acolhedor com pratos de autor, ambiente elegante e reservas rápidas para almoço, jantar e grupos especiais.',
      address: 'Rua das Flores 55, Porto, Portugal',
      phone: '+351 910 000 000',
      lang: 'pt',
      plan: 'pro',
      services: [
        {
          name: 'Brunch de assinatura',
          price: '',
          description: 'Pratos frescos, pães artesanais, ovos cremosos e ingredientes locais para começar o dia com calma.',
          photo: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop',
        },
        {
          name: 'Risotto da estação',
          price: '',
          description: 'Uma sugestão quente da cozinha, preparada com legumes da época e finalização delicada.',
          photo: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1200&auto=format&fit=crop',
        },
        {
          name: 'Mesa para partilhar',
          price: '',
          description: 'Entradas, queijos, saladas e pratos pequenos pensados para grupos e encontros especiais.',
          photo: 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?q=80&w=1200&auto=format&fit=crop',
        },
        {
          name: 'Sobremesa da casa',
          price: '',
          description: 'Uma criação doce, leve e elegante para fechar a experiência sem pressa.',
          photo: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1200&auto=format&fit=crop',
        },
      ],
      hours: [
        { day: 'Segunda', open: false, from: '12:00', to: '22:00' },
        { day: 'Terça', open: true, from: '12:00', to: '22:00' },
        { day: 'Quarta', open: true, from: '12:00', to: '22:00' },
        { day: 'Quinta', open: true, from: '12:00', to: '22:30' },
        { day: 'Sexta', open: true, from: '12:00', to: '23:00' },
        { day: 'Sábado', open: true, from: '10:00', to: '23:00' },
        { day: 'Domingo', open: true, from: '10:00', to: '16:00' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop',
      ],
      benefits: ['Ambiente elegante e acolhedor', 'Reservas rápidas pelo WhatsApp', 'Destaques visuais dos pratos', 'Perfeito para almoço, jantar e grupos'],
      testimonials: [
        { name: 'Mariana S.', text: 'O espaço é lindo, a comida chegou impecável e reservei mesa em poucos segundos.', rating: 5, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
        { name: 'Tiago R.', text: 'A página mostrou o ambiente e os pratos antes da reserva. Muito fácil escolher.', rating: 5, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      ],
      faqs: [
        { question: 'É possível reservar mesa pelo WhatsApp?', answer: 'Sim. O botão abre uma mensagem pronta para confirmar dia, hora e número de pessoas.' },
        { question: 'A página mostra preços?', answer: 'Não. Este modelo valoriza a experiência, os pratos e a reserva, sem lista de preços.' },
        { question: 'Funciona para restaurantes, cafés e bares?', answer: 'Sim. A estrutura pode ser adaptada para menus, brunch, jantar, eventos ou delivery.' },
      ],
      social_links: { contactMethods: ['whatsapp', 'booking'] },
      booking_url: 'https://www.opentable.com/',
      whatsapp_number: '+351910000000',
      whatsapp_message: 'Olá! Vi a página da Casa Aurora Bistro e quero reservar uma mesa.',
    }

    let { data, error } = await db
      .from('businesses')
      .upsert(payload, { onConflict: 'slug', ignoreDuplicates: false })
      .select('id, slug, secret_token')
      .single()

    if (error && (error.message?.includes('whatsapp_message') || error.message?.includes('plan'))) {
      const fallbackPayload: Record<string, unknown> = { ...payload }
      if (error.message?.includes('whatsapp_message')) delete fallbackPayload.whatsapp_message
      if (error.message?.includes('plan')) delete fallbackPayload.plan
      const fallback = await db
        .from('businesses')
        .upsert(fallbackPayload, { onConflict: 'slug', ignoreDuplicates: false })
        .select('id, slug, secret_token')
        .single()

      data = fallback.data
      error = fallback.error
    }

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Could not create test login' }, { status: 500 })
    }

    await upsertProCompanionPages(db)
    await seedDemoAnalytics(db, data.id)

    return NextResponse.json({ slug: data.slug, token: data.secret_token })
  } catch (err) {
    console.error('POST /api/dashboard/test-login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function upsertProCompanionPages(db: ReturnType<typeof createServiceClient>) {
  const pages = [
    {
      slug: 'vitrine-test-brunch',
      owner_name: 'Aurora Brunch Club',
      owner_email: 'test@vitrine.local',
      category: 'Café & Brunch',
      description: 'Uma página extra para brunch, eventos pequenos e reservas de fim de semana.',
      address: 'Rua das Flores 55, Porto, Portugal',
      phone: '+351 910 000 000',
      lang: 'pt',
      plan: 'pro',
      services: [
        { name: 'Brunch de fim de semana', price: '', description: 'Mesa completa com opções doces, salgadas e bebidas especiais.' },
        { name: 'Café de especialidade', price: '', description: 'Seleção da casa para manhãs e encontros leves.' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1200&auto=format&fit=crop',
      ],
      booking_url: 'https://www.opentable.com/',
      whatsapp_number: '+351910000000',
      whatsapp_message: 'Olá! Quero reservar uma mesa para brunch.',
    },
    {
      slug: 'vitrine-test-eventos',
      owner_name: 'Aurora Private Dining',
      owner_email: 'test@vitrine.local',
      category: 'Eventos gastronómicos',
      description: 'Uma página dedicada a jantares privados, aniversários e experiências em grupo.',
      address: 'Rua das Flores 55, Porto, Portugal',
      phone: '+351 910 000 000',
      lang: 'pt',
      plan: 'pro',
      services: [
        { name: 'Jantar privado', price: '', description: 'Experiência personalizada para grupos, equipa ou família.' },
        { name: 'Menu de celebração', price: '', description: 'Sequência especial criada para datas importantes.' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop',
      ],
      booking_url: 'https://www.opentable.com/',
      whatsapp_number: '+351910000000',
      whatsapp_message: 'Olá! Quero informações sobre um jantar privado.',
    },
  ]

  let { error } = await db
    .from('businesses')
    .upsert(pages, { onConflict: 'slug', ignoreDuplicates: false })

  if (error && (error.message?.includes('plan') || error.message?.includes('whatsapp_message'))) {
    const fallbackPages = pages.map((page) => {
      const fallback: Record<string, unknown> = { ...page }
      if (error?.message?.includes('plan')) delete fallback.plan
      if (error?.message?.includes('whatsapp_message')) delete fallback.whatsapp_message
      return fallback
    })
    const fallback = await db
      .from('businesses')
      .upsert(fallbackPages, { onConflict: 'slug', ignoreDuplicates: false })
    error = fallback.error
  }

  if (error) {
    console.warn('Could not seed companion Pro demo pages:', error.message)
  }
}

async function seedDemoAnalytics(db: ReturnType<typeof createServiceClient>, businessId: string) {
  await db.from('page_views').delete().eq('business_id', businessId)
  await db.from('leads').delete().eq('business_id', businessId)

  const now = Date.now()
  const minutesAgo = (minutes: number) => new Date(now - minutes * 60 * 1000).toISOString()

  const pageViews = [
    { business_id: businessId, via: 'instagram-bio', event_type: 'visit', visited_at: minutesAgo(8) },
    { business_id: businessId, via: 'instagram-bio', event_type: 'whatsapp_click', visited_at: minutesAgo(7) },
    { business_id: businessId, via: 'google-profile', event_type: 'visit', visited_at: minutesAgo(22) },
    { business_id: businessId, via: 'google-profile', event_type: 'booking_click', visited_at: minutesAgo(20) },
    { business_id: businessId, via: 'whatsapp-status', event_type: 'visit', visited_at: minutesAgo(38) },
    { business_id: businessId, via: 'whatsapp-status', event_type: 'visit', visited_at: minutesAgo(55) },
    { business_id: businessId, via: 'flyer-qr', event_type: 'visit', visited_at: minutesAgo(76) },
    { business_id: businessId, via: null, event_type: 'visit', visited_at: minutesAgo(95) },
    { business_id: businessId, via: 'instagram-bio', event_type: 'visit', visited_at: minutesAgo(140) },
    { business_id: businessId, via: 'instagram-bio', event_type: 'booking_click', visited_at: minutesAgo(136) },
    { business_id: businessId, via: 'partner-link', event_type: 'visit', visited_at: minutesAgo(210) },
    { business_id: businessId, via: null, event_type: 'visit', visited_at: minutesAgo(260) },
    { business_id: businessId, via: 'instagram-story', event_type: 'visit', visited_at: minutesAgo(330) },
    { business_id: businessId, via: 'instagram-story', event_type: 'booking_click', visited_at: minutesAgo(326) },
    { business_id: businessId, via: 'google-profile', event_type: 'visit', visited_at: minutesAgo(420) },
    { business_id: businessId, via: 'google-profile', event_type: 'visit', visited_at: minutesAgo(480) },
    { business_id: businessId, via: 'google-profile', event_type: 'whatsapp_click', visited_at: minutesAgo(478) },
    { business_id: businessId, via: 'flyer-qr', event_type: 'visit', visited_at: minutesAgo(560) },
    { business_id: businessId, via: 'flyer-qr', event_type: 'booking_click', visited_at: minutesAgo(554) },
    { business_id: businessId, via: 'instagram-bio', event_type: 'visit', visited_at: minutesAgo(760) },
    { business_id: businessId, via: 'instagram-bio', event_type: 'visit', visited_at: minutesAgo(900) },
    { business_id: businessId, via: 'whatsapp-status', event_type: 'visit', visited_at: minutesAgo(1120) },
    { business_id: businessId, via: null, event_type: 'visit', visited_at: minutesAgo(1300) },
    { business_id: businessId, via: 'partner-link', event_type: 'visit', visited_at: minutesAgo(1500) },
  ]

  const leads = [
    {
      business_id: businessId,
      visitor_name: 'Maria Silva',
      visitor_email: 'maria@example.com',
      message: 'Olá! Vi a página no Instagram e quero reservar mesa para este fim de semana.',
      via: 'instagram-bio',
      submitted_at: minutesAgo(6),
    },
    {
      business_id: businessId,
      visitor_name: 'João Pereira',
      visitor_email: 'joao@example.com',
      message: 'Encontrei pelo Google e queria confirmar disponibilidade para sábado à noite.',
      via: 'google-profile',
      submitted_at: minutesAgo(18),
    },
    {
      business_id: businessId,
      visitor_name: 'Ana Costa',
      visitor_email: 'ana@example.com',
      message: 'Gostei do ambiente. Vocês recebem grupos pequenos para jantar?',
      via: 'whatsapp-status',
      submitted_at: minutesAgo(52),
    },
    {
      business_id: businessId,
      visitor_name: 'Beatriz Almeida',
      visitor_email: 'beatriz@example.com',
      message: 'Vi o QR Code e quero reservar para sexta-feira.',
      via: 'flyer-qr',
      submitted_at: minutesAgo(548),
    },
    {
      business_id: businessId,
      visitor_name: 'Carlos Mendes',
      visitor_email: 'carlos@example.com',
      message: 'Vi nos stories. Têm mesa depois das 20h?',
      via: 'instagram-story',
      submitted_at: minutesAgo(320),
    },
  ]

  await db.from('page_views').insert(pageViews)
  await db.from('leads').insert(leads)
}
