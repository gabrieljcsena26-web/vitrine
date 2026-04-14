import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/businesses — create a new business record and return the secret token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      businessName,
      category,
      description,
      address,
      email,
      phone,
      lang,
      services,
      hours,
      photos,
      slug,
    } = body

    if (!businessName || !slug || !email) {
      return NextResponse.json(
        { error: 'businessName, slug, and email are required' },
        { status: 400 }
      )
    }

    const db = createServiceClient()

    // Upsert: if the slug already exists, update the record and return the existing token
    const { data, error } = await db
      .from('businesses')
      .upsert(
        {
          slug,
          owner_name: businessName,
          owner_email: email,
          category,
          description,
          address,
          phone,
          lang,
          services,
          hours,
          photos,
        },
        { onConflict: 'slug', ignoreDuplicates: false }
      )
      .select('id, slug, secret_token')
      .single()

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, slug: data.slug, token: data.secret_token })
  } catch (err) {
    console.error('POST /api/businesses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
