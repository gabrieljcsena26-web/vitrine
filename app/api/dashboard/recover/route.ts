import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl, isEmail } from '@/lib/utils'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// POST /api/dashboard/recover — send dashboard link(s) to the owner's email
// Body: { email: string }
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || email.trim().length > 254 || !isEmail(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const db = createServiceClient()

    const { data: businesses } = await db
      .from('businesses')
      .select('owner_name, slug, secret_token')
      .eq('owner_email', email.trim().toLowerCase())
      .order('created_at', { ascending: false })
      .limit(10)

    // If no businesses found, return ok (avoid enumeration) with empty links
    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ ok: true, links: [] })
    }

    const baseUrl = req.headers.get('origin') || getBaseUrl()

    const linksHtml = businesses
      .map(
        (b) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee">
            <strong style="color:#1a1a2e">${escapeHtml(b.owner_name)}</strong><br/>
            <a href="${baseUrl}/p/${b.slug}" style="font-size:12px;color:#888">${baseUrl}/p/${b.slug}</a>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee">
            <a href="${baseUrl}/dashboard/${b.secret_token}" style="display:inline-block;background:#f5c518;color:#1a1a2e;padding:8px 16px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:13px">
              Open Dashboard
            </a>
          </td>
        </tr>`
      )
      .join('')

    if (resend) {
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: email.trim(),
        subject: 'Your Vitrine dashboard link(s)',
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#1a1a2e">Your dashboard link${businesses.length > 1 ? 's' : ''}</h2>
          <p style="color:#444">Here ${businesses.length > 1 ? 'are' : 'is'} the dashboard link${businesses.length > 1 ? 's' : ''} associated with your email.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:10px 12px;text-align:left;color:#888;font-size:13px">Business</th>
                <th style="padding:10px 12px;text-align:left;color:#888;font-size:13px">Dashboard</th>
              </tr>
            </thead>
            <tbody>${linksHtml}</tbody>
          </table>

          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-top:16px">
            <p style="margin:0;font-size:13px;color:#92400e">🔒 Keep these links safe — they give full access to your leads and statistics.</p>
          </div>

          <p style="margin-top:32px;color:#aaa;font-size:12px">
            You requested this email from the Vitrine dashboard recovery page.
          </p>
        </div>
      `,
      })
    }

    // Always return the links in the response so the UI can show them directly
    // (Resend email is optional — works as a bonus if API key is configured)
    const links = businesses.map((b) => ({
      ownerName: b.owner_name,
      slug: b.slug,
      dashboardUrl: `${baseUrl}/dashboard/${b.secret_token}`,
      pageUrl: `${baseUrl}/p/${b.slug}`,
    }))

    return NextResponse.json({ ok: true, links })
  } catch (err) {
    console.error('POST /api/dashboard/recover error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
