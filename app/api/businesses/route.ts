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

    // Send welcome email with the dashboard link
    if (resend && email) {
      const baseUrl = getBaseUrl()
      const dashboardUrl = `${baseUrl}/dashboard/${data.secret_token}`
      const pageUrl = `${baseUrl}/p/${data.slug}`
      const safeName = escapeHtml(businessName)
      await resend.emails.send({
        from: 'Vitrine <noreply@vitrine.app>',
        to: email,
        subject: '🎉 Your Vitrine page is live — save your dashboard link',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#1a1a2e">Your page is live, ${safeName}! 🎉</h2>
            <p style="color:#444">Your Vitrine page is now live and ready to share with customers.</p>

            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0">
              <p style="margin:0 0 8px;font-size:14px;color:#888">📄 Your public page:</p>
              <a href="${pageUrl}" style="color:#1a1a2e;font-weight:bold;word-break:break-all">${pageUrl}</a>
            </div>

            <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:20px 0">
              <p style="margin:0 0 8px;font-size:14px;color:#92400e;font-weight:bold">📊 Your private dashboard (save this link!):</p>
              <a href="${dashboardUrl}" style="color:#1a1a2e;font-weight:bold;word-break:break-all">${dashboardUrl}</a>
              <p style="margin:8px 0 0;font-size:12px;color:#92400e">This link gives you access to your leads, stats, and settings. Keep it safe.</p>
            </div>

            <div style="margin-top:24px">
              <a href="${dashboardUrl}" style="display:inline-block;background:#f5c518;color:#1a1a2e;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;margin-right:12px">
                Open My Dashboard
              </a>
              <a href="${pageUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none">
                View My Page
              </a>
            </div>

            <p style="margin-top:32px;color:#aaa;font-size:12px">
              You're receiving this because you created a page on Vitrine.
            </p>
          </div>
        `,
      }).catch((err) => console.error('welcome email failed:', err))
    }

    return NextResponse.json({ id: data.id, slug: data.slug, token: data.secret_token })
  } catch (err) {
    console.error('POST /api/businesses error:', err)
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
