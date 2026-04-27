import { NextResponse } from 'next/server'
import { purgeExpiredUsers } from '@/lib/supabase/queries'

// Called daily by Vercel Cron.
// Hard-deletes user accounts whose 30-day grace period has expired.
// ON DELETE CASCADE in the DB removes their session_summaries and diagnostics automatically.

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const count = await purgeExpiredUsers()
    console.log(`Purged ${count} expired account(s)`)
    return NextResponse.json({ ok: true, purged: count, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Purge failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
