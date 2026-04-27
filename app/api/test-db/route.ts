import { auth } from '@clerk/nextjs/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseServer()
    // Just test the connection - no tables exist yet
    const { error } = await supabase.from('users').select('*').limit(1)
    
    // We expect an error here since tables don't exist yet
    // But if we get a connection error vs a "table doesn't exist" error,
    // that tells us whether the credentials are working
    return NextResponse.json({ 
      message: 'Connection attempted',
      error: error?.message ?? null
    })
  } catch (err) {
    return NextResponse.json({ message: 'Connection failed', error: String(err) })
  }
}
