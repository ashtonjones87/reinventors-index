import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  getLatestSummary,
  getLastTwoDiagnostics,
  upsertUser,
} from '@/lib/supabase/queries'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const [latestSummary, diagnostics] = await Promise.all([
      getLatestSummary(userId),
      getLastTwoDiagnostics(userId),
    ])

    const currentRadar = diagnostics[0] ?? null
    const previousRadar = diagnostics[1] ?? null
    const hasCompletedDiagnostic = diagnostics.length > 0
    const isReturningUser = !!latestSummary

    return NextResponse.json({
      latestSummary,
      currentRadar,
      previousRadar,
      hasCompletedDiagnostic,
      isReturningUser,
    })
  } catch (error) {
    console.error('Error fetching user state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function PUT() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const clerkUser = await currentUser()
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')
      await upsertUser(userId, email, name)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
