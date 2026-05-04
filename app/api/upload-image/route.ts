import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'business-photos'
const MAX_IMAGE_BYTES = 2_500_000
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

// POST /api/upload-image — upload one compressed image to Supabase Storage
// Body: multipart/form-data { file }
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'upload-image'), { limit: 25, windowMs: 10 * 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many uploads' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP or GIF images are allowed' }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image is too large. Max 2.5MB after compression.' }, { status: 400 })
    }

    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const path = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const db = createServiceClient()
    const bytes = Buffer.from(await file.arrayBuffer())

    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json(
        { error: `${error.message}. Make sure the '${BUCKET}' storage bucket exists and is public.` },
        { status: 500 }
      )
    }

    const { data } = db.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl, path })
  } catch (err) {
    console.error('POST /api/upload-image error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
