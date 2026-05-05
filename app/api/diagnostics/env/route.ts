import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_BASE_URL',
  'VITRINE_CUSTOMER_SESSION_SECRET',
] as const

const launchEnv = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STARTER_PRICE_ID',
  'STRIPE_PRO_PRICE_ID',
  'CRON_SECRET',
] as const

export async function GET() {
  const env = Object.fromEntries(
    requiredEnv.map((name) => [name, Boolean(process.env[name])])
  )
  const launch = Object.fromEntries(
    launchEnv.map((name) => [name, Boolean(process.env[name])])
  )
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  const diagnostics: Record<string, unknown> = {
    ok: true,
    env,
    launch,
    supabaseUrlLooksValid: /^https:\/\/[^/]+\.supabase\.co$/.test(supabaseUrl),
    publicBaseUrlLooksValid: /^https:\/\/[^/]+$/.test(publicBaseUrl),
    supabaseHost: supabaseUrl ? new URL(supabaseUrl).host : null,
  }

  try {
    const db = createServiceClient()
    const { error } = await db.from('owner_accounts').select('email', { count: 'exact', head: true })
    if (error) {
      return NextResponse.json({
        ...diagnostics,
        ok: false,
        supabaseConnection: 'error',
        supabaseError: error.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      ...diagnostics,
      supabaseConnection: 'ok',
    })
  } catch (err) {
    return NextResponse.json({
      ...diagnostics,
      ok: false,
      supabaseConnection: 'failed',
      errorName: err instanceof Error ? err.name : 'UnknownError',
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      errorCause: err instanceof Error && err.cause instanceof Error ? err.cause.message : null,
    }, { status: 500 })
  }
}