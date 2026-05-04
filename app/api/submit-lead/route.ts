import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'
import { isEmail } from '@/lib/utils'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const MAX_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 2000
const MAX_SOURCE_LENGTH = 120

// POST /api/submit-lead — save a lead and notify the owner
// Body: { businessId, visitorName, visitorEmail, message, via? }
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(rateLimitKey(req, 'submit-lead'), { limit: 12, windowMs: 60_000 })
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
    }

    const { businessId, visitorName, visitorEmail, message, via, interest } = await req.json()
    const cleanBusinessId = String(businessId ?? '').trim()
    const cleanName = String(visitorName ?? '').trim().slice(0, MAX_NAME_LENGTH)
    const cleanEmail = String(visitorEmail ?? '').trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH)
    const cleanMessage = String(message ?? '').trim().slice(0, MAX_MESSAGE_LENGTH)
    const cleanVia = via ? String(via).trim().slice(0, MAX_SOURCE_LENGTH) : null

    if (!cleanBusinessId || !cleanName || !cleanMessage) {
      return NextResponse.json(
        { error: 'businessId, visitorName, and message are required' },
        { status: 400 }
      )
    }

    if (cleanEmail && !isEmail(cleanEmail)) {
      return NextResponse.json({ error: 'visitorEmail must be a valid email address' }, { status: 400 })
    }

    const db = createServiceClient()
    const leadInterest = String(interest || extractInterest(cleanMessage)).slice(0, 120)
    const temperature = classifyTemperature(`${cleanMessage} ${leadInterest}`)

    // Save the lead
    let { error: insertError } = await db.from('leads').insert({
      business_id: cleanBusinessId,
      visitor_name: cleanName,
      visitor_email: cleanEmail,
      message: cleanMessage,
      via: cleanVia,
      status: 'new',
      interest: leadInterest,
      temperature,
    })

    if (insertError && (insertError.message?.includes('status') || insertError.message?.includes('interest') || insertError.message?.includes('temperature'))) {
      const fallback = await db.from('leads').insert({
        business_id: cleanBusinessId,
        visitor_name: cleanName,
        visitor_email: cleanEmail,
        message: cleanMessage,
        via: cleanVia,
      })
      insertError = fallback.error
    }

    if (insertError) {
      console.error('submit-lead insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Fetch owner email to send notification
    const { data: business } = await db
      .from('businesses')
      .select('owner_name, owner_email, slug')
      .eq('id', cleanBusinessId)
      .single()

    if (business && resend) {
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: business.owner_email,
        subject: `New lead from ${cleanName}`,
        html: `
          <p>Hi ${business.owner_name},</p>
          <p>You have a new lead from your Vitrine page!</p>
          <table style="border-collapse:collapse;width:100%;max-width:500px">
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Name</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(cleanName)}</td></tr>
            ${cleanEmail ? `<tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Email</td><td style="padding:8px;border:1px solid #eee"><a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></td></tr>` : ''}
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Message</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(cleanMessage)}</td></tr>
            ${cleanVia ? `<tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Source</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(cleanVia)}</td></tr>` : ''}
          </table>
          <p style="margin-top:24px;color:#888;font-size:12px">Reply directly to their email to follow up.</p>
        `,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/submit-lead error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function extractInterest(message: string): string {
  return String(message).match(/Interest:\s*([^.]*)/i)?.[1]?.trim() || 'General information'
}

function classifyTemperature(value: string): string {
  const lower = String(value).toLowerCase()
  if (lower.includes('book') || lower.includes('appointment') || lower.includes('availability') || lower.includes('agendar')) return 'hot'
  if (lower.includes('price') || lower.includes('service') || lower.includes('information')) return 'warm'
  return 'new'
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
