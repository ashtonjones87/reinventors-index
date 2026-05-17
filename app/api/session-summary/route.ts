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

  const product: 'owner' | 'mindset' = req.headers.get('x-is-owner-index') === '1' ? 'owner' : 'mindset'

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
    }, transcript, product)

    // Also persist as an action plan (auto-deletes oldest if user already has 3)
    // Use the raw action plan block from the chat rather than the AI-summarised version
    try {
      const rawPlanText = extractActionPlanText(messages)
      await saveActionPlan(userId, {
        context_detected: context_detected ?? summaryData.context_detected ?? null,
        framework_explored: summaryData.framework_explored,
        core_tension: summaryData.core_tension,
        practical_action: rawPlanText ?? summaryData.practical_action,
        open_questions: summaryData.open_questions,
        shift_observed: summaryData.shift_observed,
      }, product)
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

// Extracts the raw "Your practical action this week:" block from the last
// assistant message that contains it, stripping the newsletter line.
function extractActionPlanText(messages: { role: string; content: string }[]): string | null {
  const assistantMessages = messages.filter(m => m.role === 'assistant')
  for (let i = assistantMessages.length - 1; i >= 0; i--) {
    const content = assistantMessages[i].content
    const idx = content.search(/your practical action this week/i)
    if (idx !== -1) {
      // Go back 2 chars to include any leading ** bold marker (e.g. **Your practical action...)
      const startIdx = idx >= 2 && content.slice(idx - 2, idx) === '**' ? idx - 2 : idx
      let planText = content.slice(startIdx)
      // Strip the newsletter line
      planText = planText.replace(/\n*\*?Want to go deeper\?[^\n]*/gi, '').trim()
      return planText
    }
  }
  return null
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
