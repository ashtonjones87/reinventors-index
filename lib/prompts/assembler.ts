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
}: BuildSystemPromptArgs): string {
  const parts: string[] = []

  if (previousSummary) {
    parts.push(formatPreviousSummary(previousSummary))
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
You are in the pre-diagnostic Listen phase. The user has just arrived. Follow the conversation architecture: Listen → Reflect → Diagnose.

Your job right now:
1. Ask 2-3 open questions about what brought them here and what they're wrestling with.
2. Listen carefully to detect their context (building, leading, or transitioning).
3. After sufficient exchange, play back what you heard: "What I'm hearing is [summary]. Does that feel right?"
4. Wait for their confirmation. If they correct you, listen again.
5. Once they confirm, emit two signals on separate lines at the very end of your response — nothing after them:
   [CONTEXT:building] or [CONTEXT:leading] or [CONTEXT:transitioning] (choose the closest fit; omit if genuinely unclear)
   [DIAGNOSTIC_READY]

These signals are stripped from the visible response automatically — they are interface instructions, not user-facing text. Never mention them to the user.

Only emit [DIAGNOSTIC_READY] after the user has confirmed your playback. Do not emit it before.
`)

  return parts.join('\n\n')
}
