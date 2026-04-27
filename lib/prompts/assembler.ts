import { BASE_PROMPT } from './base'
import { UNIFIED_OVERLAY } from './overlays/unified'

interface RadarScores {
  intuitive: number
  analytical: number
  proactive: number
  reactive: number
  collaborative: number
  directive: number
  cognitive: number
  spiritual_purpose: number
}

interface SessionSummary {
  session_date: string
  context_detected?: string
  framework_explored: string
  core_tension: string
  practical_action: string
  open_questions: string
  shift_observed: string
}

interface BuildSystemPromptArgs {
  previousSummary?: SessionSummary | null
  radarScores?: RadarScores | null
  contextDetected?: string | null
  preDiagnosticContext?: string | null
}

function formatPreviousSummary(summary: SessionSummary): string {
  const contextLine = summary.context_detected
    ? `Context detected: ${summary.context_detected}\n`
    : ''
  return `
PREVIOUS SESSION CONTEXT:
Session date: ${summary.session_date}
${contextLine}Framework explored: ${summary.framework_explored}
Core tension: ${summary.core_tension}
Practical action committed to: ${summary.practical_action}
Open questions: ${summary.open_questions}
Shift observed: ${summary.shift_observed}
`
}

function formatRadarContext(scores: RadarScores & {
  readiness_score?: number
  range_decision_making?: number
  range_behaviour?: number
  range_leadership?: number
  range_awareness?: number
}): string {
  const poles = [
    { name: 'Intuitive', score: scores.intuitive },
    { name: 'Analytical', score: scores.analytical },
    { name: 'Proactive', score: scores.proactive },
    { name: 'Reactive', score: scores.reactive },
    { name: 'Collaborative', score: scores.collaborative },
    { name: 'Directive', score: scores.directive },
    { name: 'Cognitive', score: scores.cognitive },
    { name: 'Purpose', score: scores.spiritual_purpose },
  ]

  const sorted = [...poles].sort((a, b) => b.score - a.score)
  const strongest = sorted.slice(0, 2).map((p) => p.name).join(', ')
  const weakest = sorted.slice(-2).map((p) => p.name).join(', ')

  const readinessLine = scores.readiness_score
    ? `Reinventor's Readiness Score: ${scores.readiness_score}/10`
    : ''

  const rangeLines = scores.range_decision_making !== undefined
    ? `Range scores - Decision Making: ${scores.range_decision_making} | Behaviour: ${scores.range_behaviour} | Leadership: ${scores.range_leadership} | Awareness: ${scores.range_awareness}`
    : ''

  return `
RADAR CONTEXT:
${readinessLine}
${rangeLines}
User's radar scores: ${poles.map((p) => `${p.name}: ${p.score}`).join(' | ')}
Strongest poles: ${strongest}
Weakest poles: ${weakest}
Reference these when recommending frameworks. The strongest poles show where the user is comfortable. The weakest poles show where the growth edge is. The highest range score dimension is the biggest opportunity for growth.
`
}

export function buildSystemPrompt({
  previousSummary,
  radarScores,
  contextDetected,
  preDiagnosticContext,
}: BuildSystemPromptArgs): string {
  const parts: string[] = []

  if (previousSummary) {
    parts.push(formatPreviousSummary(previousSummary))
  }

  // Inject the user's detected journey and pre-diagnostic conversation
  // so the AI starts with full context from the orienting chat
  if (contextDetected || preDiagnosticContext) {
    const contextParts: string[] = ['PRE-DIAGNOSTIC CONTEXT:']
    if (contextDetected) {
      contextParts.push(`Detected journey: ${contextDetected}`)
      contextParts.push(`Use this to frame your conversation. The user has already been oriented to the ${contextDetected} journey - do not re-introduce or re-explain it.`)
    }
    if (preDiagnosticContext) {
      contextParts.push(`\nOrienting conversation before the diagnostic:\n${preDiagnosticContext}`)
      contextParts.push(`\nReference this conversation naturally - do not repeat it back verbatim, but use what was shared as your starting point. The user should feel that the conversation continues, not that it has reset.`)
    }
    parts.push(contextParts.join('\n'))
  }

  parts.push(BASE_PROMPT)
  parts.push(UNIFIED_OVERLAY)

  if (radarScores) {
    parts.push(formatRadarContext(radarScores))
  }

  return parts.join('\n\n')
}

export function buildPreDiagnosticPrompt({
  previousSummary,
}: { previousSummary?: SessionSummary | null }): string {
  const parts: string[] = []

  if (previousSummary) {
    parts.push(formatPreviousSummary(previousSummary))
  }

  parts.push(BASE_PROMPT)
  parts.push(UNIFIED_OVERLAY)
  parts.push(`
PRE-DIAGNOSTIC PHASE INSTRUCTIONS:
You are in the pre-diagnostic Listen phase. The user has just arrived. You have a MAXIMUM of 4 messages before you must hand off to the diagnostic. Use them efficiently.

CRITICAL - DO NOT DO ANY OF THE FOLLOWING IN THIS PHASE:
- Do not ask the 16 diagnostic statements yourself
- Do not ask the user to rate anything from 1 to 5
- Do not present any scoring scale
- Do not run the diagnostic inline in this conversation
- The 16-question diagnostic is handled by a separate UI component - your only job is to hand off to it

Your job (4 messages maximum):
- Message 1: Welcome them and ask one focused open question about what brought them here.
- Message 2: Listen to their answer and ask one follow-up to sharpen your read.
- Message 3: Play back what you heard and classify their journey. Say something like: "What I'm hearing is [summary]. That puts you squarely in the [Founder/Leader/Innovator] journey. Does that feel right?"
- Message 4 (or earlier if they confirm in message 3): Write a short transition sentence then emit the signals below.

Once they confirm your playback (or by message 4 at the latest), write a brief transition sentence then on the very next lines emit these two signals and nothing else after them:
   [CONTEXT:founder] or [CONTEXT:leader] or [CONTEXT:innovator] (choose the closest fit)
   [DIAGNOSTIC_READY]

Journey definitions for classification:
- Founder: building something new - a startup, a product, scaling a business, launching a venture.
- Leader: stepping into a larger leadership role - a promotion, P&L responsibility, a bigger team, executive presence.
- Innovator: driving change or innovation inside an existing system - internal entrepreneur, change agent, person at an inflection point who isn't leaving but reinventing.

These signals trigger the diagnostic UI - they are stripped from the visible response automatically. Never mention them to the user. Never explain what they are. Never ask the diagnostic questions yourself.
`)

  return parts.join('\n\n')
}
