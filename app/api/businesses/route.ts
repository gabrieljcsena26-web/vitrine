import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getBaseUrl } from '@/lib/utils'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
      bookingUrl,
      whatsappNumber,
    } = body

    if (!businessName || !slug || !email) {
      return NextResponse.json(
        { error: 'businessName, slug, and email are required' },
        { status: 400 }
      )
    }

    const db = createServiceClient()

    // Detect whether this slug already exists so we can send the welcome
    // email only on the first creation (not on subsequent edits).
    const { data: existing } = await db
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    const isNew = !existing

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
          booking_url: bookingUrl ?? null,
          whatsapp_number: whatsappNumber ?? null,
        },
        { onConflict: 'slug', ignoreDuplicates: false }
      )
      .select('id, slug, secret_token')
      .single()

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fire-and-forget welcome email with the dashboard link (first creation only).
    // Failures here should never break the API response — the token is already
    // returned to the client and also displayed on the success screen.
    if (isNew && resend && email) {
      const baseUrl = getBaseUrl()
      const dashboardLink = `${baseUrl}/dashboard/${data.secret_token}`
      const pageLink = `${baseUrl}/p/${data.slug}`
      resend.emails
        .send({
          from: 'Vitrine <noreply@vitrine.app>',
          to: email,
          subject: `Your Vitrine page is live — save your dashboard link`,
          html: `
            <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0F172A;max-width:520px;margin:0 auto">
              <h1 style="color:#0F172A;font-size:22px;margin:0 0 12px">🎉 Welcome to Vitrine, ${escapeHtml(businessName)}!</h1>
              <p style="color:#475569;line-height:1.6;margin:0 0 18px">Your landing page is live and ready to share with customers.</p>

              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:0 0 14px">
                <p style="margin:0 0 6px;font-size:12px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Your public page</p>
                <a href="${pageLink}" style="color:#0F172A;font-family:ui-monospace,monospace;font-size:14px;word-break:break-all">${pageLink}</a>
              </div>

              <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:16px;margin:0 0 20px">
                <p style="margin:0 0 6px;font-size:12px;color:#92400E;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">🔒 Your private dashboard (keep this safe)</p>
                <a href="${dashboardLink}" style="color:#0F172A;font-family:ui-monospace,monospace;font-size:13px;word-break:break-all">${dashboardLink}</a>
                <p style="margin:10px 0 0;font-size:12px;color:#92400E">This is your only way to access leads and analytics. Bookmark it now.</p>
              </div>

              <a href="${dashboardLink}" style="display:inline-block;background:#D4AF37;color:#0F172A;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">Open my dashboard →</a>

              <p style="margin:24px 0 0;font-size:12px;color:#94A3B8">Need help? Just reply to this email.</p>
            </div>
          `,
        })
        .catch((err) => console.error('Welcome email error:', err))
    }

    return NextResponse.json({ id: data.id, slug: data.slug, token: data.secret_token })
  } catch (err) {
    console.error('POST /api/businesses error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
