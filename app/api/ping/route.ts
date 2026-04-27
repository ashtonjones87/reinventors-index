import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

// Lightweight keep-alive endpoint — called by Vercel Cron every 4 days
// Prevents Supabase free-tier project from pausing due to inactivity

export async function GET(req: Request) {
  // Verify the request is from Vercel Cron (not a random caller)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseServer()
    // Minimal query — just checks the connection is alive
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) throw error

    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Ping failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
