import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { scoreResponses } from '@/lib/diagnostic'
import { saveRadar, upsertUser } from '@/lib/supabase/queries'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    // Ensure user exists in Supabase (handles local dev where webhooks can't reach localhost,
    // and acts as a safety net in production for any webhook delivery gaps)
    const clerkUser = await currentUser()
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email
      await upsertUser(userId, email, name)
    }

    const body = await req.json()
    const { answers, journey } = body

    // Validate - must be exactly 16 answers, each between 1 and 5
    if (!Array.isArray(answers) || answers.length !== 16) {
      return NextResponse.json(
        { error: 'Must provide exactly 16 answers' },
        { status: 400 }
      )
    }

    for (const answer of answers) {
      if (!Number.isInteger(answer) || answer < 1 || answer > 5) {
        return NextResponse.json(
          { error: 'Each answer must be an integer between 1 and 5' },
          { status: 400 }
        )
      }
    }

    // Score the responses
    const {
      radarScores,
      readinessScore,
      rangeDecisionMaking,
      rangeBehaviour,
      rangeLeadership,
      rangeAwareness,
    } = scoreResponses(answers)

    // Build raw responses array for storage
    const rawResponses = answers.map((answer: number, index: number) => ({
      question_id: index + 1,
      answer,
    }))

    // Save to Supabase
    await saveRadar(
      userId,
      radarScores,
      {
        readinessScore,
        rangeDecisionMaking,
        rangeBehaviour,
        rangeLeadership,
        rangeAwareness,
      },
      rawResponses,
      journey ?? null
    )

    // Return scores immediately so frontend can render radar without re-fetching
    return NextResponse.json({
      success: true,
      scores: radarScores,
      readinessScore,
      rangeDecisionMaking,
      rangeBehaviour,
      rangeLeadership,
      rangeAwareness,
    })
  } catch (error) {
    console.error('Diagnostic route error:', error)
    return NextResponse.json(
      { error: 'Failed to save diagnostic' },
      { status: 500 }
    )
  }
}
