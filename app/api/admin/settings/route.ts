import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('dev_settings')
    .select('key, value, updated_at')
    .order('key')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data ?? [] })
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const key = typeof body?.key === 'string' ? body.key.trim() : ''
  const value = body?.value

  if (!key || !/^[a-z0-9_-]{2,60}$/i.test(key)) {
    return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 })
  }

  if (value === undefined || value === null || typeof value !== 'object' || Array.isArray(value)) {
    return NextResponse.json({ error: 'Setting value must be an object' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('dev_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select('key, value, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ setting: data })
}
