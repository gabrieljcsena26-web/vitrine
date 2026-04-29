import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/dashboard/test-login — creates/opens a demo business for testing.
export async function POST() {
  try {
    const db = createServiceClient()

    const payload = {
      slug: 'vitrine-test-demo',
      owner_name: 'Vitrine Test Studio',
      owner_email: 'test@vitrine.local',
      category: 'Beauty Studio',
      description: 'Demo landing page used to test the dashboard, WhatsApp and booking buttons.',
      address: 'Demo Street 123, Lisbon',
      phone: '+351 910 000 000',
      lang: 'en',
      plan: 'pro',
      services: [
        { name: 'Consultation', price: '25' },
        { name: 'Premium Service', price: '65' },
      ],
      hours: [
        { day: 'Monday', open: true, from: '09:00', to: '18:00' },
        { day: 'Tuesday', open: true, from: '09:00', to: '18:00' },
        { day: 'Wednesday', open: true, from: '09:00', to: '18:00' },
        { day: 'Thursday', open: true, from: '09:00', to: '18:00' },
        { day: 'Friday', open: true, from: '09:00', to: '18:00' },
        { day: 'Saturday', open: true, from: '10:00', to: '16:00' },
        { day: 'Sunday', open: false, from: '09:00', to: '18:00' },
      ],
      photos: [
        'https://picsum.photos/seed/vitrine-test-hero/1920/1080',
        'https://picsum.photos/seed/vitrine-test-about/900/700',
        'https://picsum.photos/seed/vitrine-test-gallery-1/900/700',
        'https://picsum.photos/seed/vitrine-test-gallery-2/900/700',
      ],
      booking_url: 'https://calendly.com/demo',
      whatsapp_number: '+351910000000',
      whatsapp_message: 'Hello! I found your page and would like to book an appointment.',
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

    await seedDemoAnalytics(db, data.id)

    return NextResponse.json({ slug: data.slug, token: data.secret_token })
  } catch (err) {
    console.error('POST /api/dashboard/test-login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      message: 'Hi! I saw your page on Instagram and would like to book a consultation this week.',
      via: 'instagram-bio',
      submitted_at: minutesAgo(6),
    },
    {
      business_id: businessId,
      visitor_name: 'João Pereira',
      visitor_email: 'joao@example.com',
      message: 'I came from Google and want to know available times for Saturday.',
      via: 'google-profile',
      submitted_at: minutesAgo(18),
    },
    {
      business_id: businessId,
      visitor_name: 'Ana Costa',
      visitor_email: 'ana@example.com',
      message: 'Can you send me more information about the premium service?',
      via: 'whatsapp-status',
      submitted_at: minutesAgo(52),
    },
    {
      business_id: businessId,
      visitor_name: 'Beatriz Almeida',
      visitor_email: 'beatriz@example.com',
      message: 'I found you through the QR flyer and want to book for next Friday.',
      via: 'flyer-qr',
      submitted_at: minutesAgo(548),
    },
    {
      business_id: businessId,
      visitor_name: 'Carlos Mendes',
      visitor_email: 'carlos@example.com',
      message: 'Do you have appointments after 6pm? I came from Instagram stories.',
      via: 'instagram-story',
      submitted_at: minutesAgo(320),
    },
  ]

  await db.from('page_views').insert(pageViews)
  await db.from('leads').insert(leads)
}
