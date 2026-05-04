import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const [businesses, leads, views, settings, recentLeads, recentReports, views30d, leads30d] = await Promise.all([
    db.from('businesses').select('id, slug, owner_name, owner_email, plan, subscription_status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(200),
    db.from('leads').select('id', { count: 'exact', head: true }),
    db.from('page_views').select('id', { count: 'exact', head: true }),
    db.from('dev_settings').select('key, value, updated_at'),
    db.from('leads').select('id, business_id, visitor_name, visitor_email, via, submitted_at').order('submitted_at', { ascending: false }).limit(20),
    db.from('email_reports').select('id, business_id, report_type, period_days, sent_at').order('sent_at', { ascending: false }).limit(20),
    db.from('page_views').select('id', { count: 'exact', head: true }).gte('visited_at', since30d),
    db.from('leads').select('id', { count: 'exact', head: true }).gte('submitted_at', since30d),
  ])

  const businessRows = businesses.data ?? []
  const planBreakdown = businessRows.reduce<Record<string, number>>((acc, business) => {
    const plan = String(business.plan ?? 'starter').toLowerCase()
    acc[plan] = (acc[plan] ?? 0) + 1
    return acc
  }, {})

  const payingOrPro = businessRows.filter((business) => (
    String(business.plan ?? 'starter').toLowerCase() === 'pro' ||
    String(business.subscription_status ?? '').toLowerCase() === 'active'
  )).length

  const businessById = new Map(businessRows.map((business) => [business.id, business]))

  return NextResponse.json({
    stats: {
      businesses: businesses.count ?? businesses.data?.length ?? 0,
      leads: leads.count ?? 0,
      events: views.count ?? 0,
      leads30d: leads30d.count ?? 0,
      events30d: views30d.count ?? 0,
      proOrActive: payingOrPro,
    },
    planBreakdown,
    businesses: businessRows,
    recentLeads: (recentLeads.data ?? []).map((lead) => ({
      ...lead,
      business: businessById.get(lead.business_id) ?? null,
    })),
    recentReports: (recentReports.data ?? []).map((report) => ({
      ...report,
      business: businessById.get(report.business_id) ?? null,
    })),
    settings: settings.data ?? [],
  })
}
