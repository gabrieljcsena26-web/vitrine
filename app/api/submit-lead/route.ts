import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// POST /api/submit-lead — save a lead and notify the owner
// Body: { businessId, visitorName, visitorEmail, message, via? }
export async function POST(req: NextRequest) {
  try {
    const { businessId, visitorName, visitorEmail, message, via, interest } = await req.json()

    if (!businessId || !visitorName || !message) {
      return NextResponse.json(
        { error: 'businessId, visitorName, and message are required' },
        { status: 400 }
      )
    }

    const db = createServiceClient()
    const leadInterest = String(interest || extractInterest(message)).slice(0, 120)
    const temperature = classifyTemperature(`${message} ${leadInterest}`)

    // Save the lead
    let { error: insertError } = await db.from('leads').insert({
      business_id: businessId,
      visitor_name: visitorName,
      visitor_email: visitorEmail || '',
      message,
      via: via || null,
      status: 'new',
      interest: leadInterest,
      temperature,
    })

    if (insertError && (insertError.message?.includes('status') || insertError.message?.includes('interest') || insertError.message?.includes('temperature'))) {
      const fallback = await db.from('leads').insert({
        business_id: businessId,
        visitor_name: visitorName,
        visitor_email: visitorEmail || '',
        message,
        via: via || null,
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
      .eq('id', businessId)
      .single()

    if (business && resend) {
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: business.owner_email,
        subject: `New lead from ${visitorName}`,
        html: `
          <p>Hi ${business.owner_name},</p>
          <p>You have a new lead from your Vitrine page!</p>
          <table style="border-collapse:collapse;width:100%;max-width:500px">
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Name</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(visitorName)}</td></tr>
            ${visitorEmail ? `<tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Email</td><td style="padding:8px;border:1px solid #eee"><a href="mailto:${escapeHtml(visitorEmail)}">${escapeHtml(visitorEmail)}</a></td></tr>` : ''}
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Message</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(message)}</td></tr>
            ${via ? `<tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Source</td><td style="padding:8px;border:1px solid #eee">${escapeHtml(via)}</td></tr>` : ''}
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
