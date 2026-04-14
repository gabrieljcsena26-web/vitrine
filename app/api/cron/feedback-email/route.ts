import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl } from '@/lib/utils'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FEEDBACK_AFTER_DAYS = 4
const FEEDBACK_WINDOW_DAYS = 5

// GET /api/cron/feedback-email — called by Vercel Cron daily
// Sends a feedback email to any business created 4 days ago that hasn't received one yet.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()

  // Find businesses created between FEEDBACK_AFTER_DAYS and FEEDBACK_WINDOW_DAYS ago
  // (24-hour window to avoid re-sending)
  const fourDaysAgo = new Date(Date.now() - FEEDBACK_AFTER_DAYS * ONE_DAY_MS).toISOString()
  const fiveDaysAgo = new Date(Date.now() - FEEDBACK_WINDOW_DAYS * ONE_DAY_MS).toISOString()

  const { data: businesses } = await db
    .from('businesses')
    .select('id, slug, owner_name, owner_email, secret_token, description, phone, photos, services')
    .gte('created_at', fiveDaysAgo)
    .lte('created_at', fourDaysAgo)

  if (!businesses || businesses.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  for (const business of businesses) {
    const { count: views } = await db
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id)

    const { count: leads } = await db
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id)

    const tips = buildTips(business, views ?? 0, leads ?? 0)
    const baseUrl = getBaseUrl()
    const dashboardUrl = `${baseUrl}/dashboard/${business.secret_token}`
    const pageUrl = `${baseUrl}/p/${business.slug}`

    if (resend) {
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: business.owner_email,
        subject: `Your Vitrine page — 4-day check-in 📊`,
        html: buildEmailHtml(business.owner_name, views ?? 0, leads ?? 0, tips, dashboardUrl, pageUrl),
      })
      sent++
    }
  }

  return NextResponse.json({ sent })
}

// ─── helpers ──────────────────────────────────────────────────────────────────

interface BusinessRecord {
  description?: string
  phone?: string
  photos?: unknown
  services?: unknown
}

function buildTips(
  business: BusinessRecord,
  views: number,
  leads: number
): string[] {
  const tips: string[] = []

  if (leads === 0 && views > 0) {
    tips.push('You have 0 leads so far — consider adding a WhatsApp button or a phone number to make it easier for customers to reach you.')
  }
  if (views === 0) {
    tips.push("Your page hasn't received any visits yet. Share the link on Instagram, WhatsApp, or Google to start getting traffic.")
  }
  if (!business.description) {
    tips.push('Your page has no description — adding a short bio increases trust and helps customers understand what you offer.')
  }
  if (!business.phone) {
    tips.push('No phone number found on your page. Adding one makes it easier for customers to contact you directly.')
  }
  const photos = business.photos as unknown[]
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    tips.push('Your page has no photos — pages with photos get 3× more contacts. Upload at least one photo from your work.')
  }

  if (tips.length === 0) {
    tips.push('Your page looks great! Keep sharing it to attract more customers.')
  }

  return tips
}

function buildEmailHtml(
  ownerName: string,
  views: number,
  leads: number,
  tips: string[],
  dashboardUrl: string,
  pageUrl: string
): string {
  const tipsHtml = tips
    .map((t) => `<li style="margin-bottom:8px">${t}</li>`)
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#1a1a2e">Hi ${ownerName}, here's your 4-day report 📊</h2>
      <p>Your Vitrine page has been live for 4 days. Here's how it's doing:</p>

      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr>
          <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#1a1a2e">${views}</div>
            <div style="color:#888;font-size:14px">Total Visits</div>
          </td>
          <td style="width:16px"></td>
          <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#1a1a2e">${leads}</div>
            <div style="color:#888;font-size:14px">Leads Received</div>
          </td>
        </tr>
      </table>

      <h3 style="color:#1a1a2e">💡 Suggestions to improve your page</h3>
      <ul style="padding-left:20px;color:#444;line-height:1.6">
        ${tipsHtml}
      </ul>

      <div style="margin-top:32px">
        <a href="${dashboardUrl}" style="display:inline-block;background:#f5c518;color:#1a1a2e;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none">
          View My Dashboard
        </a>
        &nbsp;&nbsp;
        <a href="${pageUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none">
          View My Page
        </a>
      </div>

      <p style="margin-top:32px;color:#aaa;font-size:12px">
        You're receiving this because you created a page on Vitrine.
      </p>
    </div>
  `
}
