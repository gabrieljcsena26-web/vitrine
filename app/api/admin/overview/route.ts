import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const [businesses, leads, views, settings] = await Promise.all([
    db.from('businesses').select('id, slug, owner_name, owner_email, plan, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(50),
    db.from('leads').select('id', { count: 'exact', head: true }),
    db.from('page_views').select('id', { count: 'exact', head: true }),
    db.from('dev_settings').select('key, value, updated_at'),
  ])

  return NextResponse.json({
    stats: {
      businesses: businesses.count ?? businesses.data?.length ?? 0,
      leads: leads.count ?? 0,
      events: views.count ?? 0,
    },
    businesses: businesses.data ?? [],
    settings: settings.data ?? [],
  })
}
