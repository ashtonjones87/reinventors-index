import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAnthropicClient } from '@/lib/claude'
import { SUMMARY_GENERATION_PROMPT } from '@/lib/prompts/summary'
import { saveSummary, saveActionPlan } from '@/lib/supabase/queries'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { messages, context_detected } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ skipped: true }, { status: 200 })
    }

    const transcript = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`
      )
      .join('\n\n')

    let summaryData = await attemptSummaryGeneration(transcript)

    if (!summaryData) {
      summaryData = await attemptSummaryGeneration(
        transcript,
        'Return ONLY valid JSON. No other text whatsoever. No preamble. No explanation. No markdown.'
      )
    }

    if (!summaryData) {
      summaryData = {
        context_detected: context_detected ?? 'unclear',
        framework_explored: 'Unknown',
        core_tension: 'Summary generation failed. Raw transcript preserved.',
        practical_action: 'No action recorded.',
        open_questions: 'None.',
        shift_observed: 'None observed.',
      }
    }

    await saveSummary(userId, {
      context_detected: context_detected ?? summaryData.context_detected ?? null,
      framework_explored: summaryData.framework_explored,
      core_tension: summaryData.core_tension,
      practical_action: summaryData.practical_action,
      open_questions: summaryData.open_questions,
      shift_observed: summaryData.shift_observed,
    }, transcript)

    // Also persist as an action plan (auto-deletes oldest if user already has 3)
    try {
      await saveActionPlan(userId, {
        context_detected: context_detected ?? summaryData.context_detected ?? null,
        framework_explored: summaryData.framework_explored,
        core_tension: summaryData.core_tension,
        practical_action: summaryData.practical_action,
        open_questions: summaryData.open_questions,
        shift_observed: summaryData.shift_observed,
      })
    } catch (planError) {
      // Non-fatal: session summary was already saved successfully
      console.error('Failed to save action plan:', planError)
    }

    return NextResponse.json({ success: true, summary: summaryData })

  } catch (error) {
    console.error('Session summary route error:', error)
    return NextResponse.json(
      { error: 'Failed to save session summary' },
      { status: 500 }
    )
  }
}

async function attemptSummaryGeneration(
  transcript: string,
  strictPrefix?: string
) {
  try {
    const userMessage = strictPrefix
      ? `${strictPrefix}\n\nTranscript:\n${transcript}`
      : `Please generate a session summary for this conversation:\n\n${transcript}`

    const response = await createAnthropicClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SUMMARY_GENERATION_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const rawText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    const requiredFields = [
      'context_detected',
      'framework_explored',
      'core_tension',
      'practical_action',
      'open_questions',
      'shift_observed',
    ]

    for (const field of requiredFields) {
      if (!parsed[field]) return null
    }

    return parsed
  } catch {
    return null
  }
}
