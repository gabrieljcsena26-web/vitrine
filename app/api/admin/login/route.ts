import { NextRequest, NextResponse } from 'next/server'
import { clearAdminCookie, getAdminPassword, setAdminCookie } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = getAdminPassword()

  if (!expected) {
    return NextResponse.json({ error: 'Developer password is not configured.' }, { status: 500 })
  }

  if (String(password ?? '') !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  await setAdminCookie()
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearAdminCookie()
  return NextResponse.json({ ok: true })
}
