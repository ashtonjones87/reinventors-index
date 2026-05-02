import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getActionPlans } from '@/lib/supabase/queries'

export async function GET(_req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const plans = await getActionPlans(userId)
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Action plans GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch action plans' }, { status: 500 })
  }
}
