import { BASE_PROMPT } from './base'
import { UNIFIED_OVERLAY } from './overlays/unified'
import { OWNER_OPERATOR_OVERLAY } from './overlays/owner-operator'
import { computeOwnerScores, type RadarScores as OwnerRadarScores } from '@/lib/ownerIndex'

interface RadarScores {
  intuitive: number
  analytical: number
  proactive: number
  reactive: number
  collaborative: number
  directive: number
  cognitive: number
  spiritual_purpose: number
  readiness_score?: number
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
  previousRadarScores?: RadarScores | null
  contextDetected?: string | null
  preDiagnosticContext?: string | null
  isOwnerIndex?: boolean
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
    ? `Adaptive Range Score: ${scores.readiness_score}/10`
    : ''

  const rangeLines = scores.range_decision_making !== undefined
    ? `Polarisation scores - Decision Making: ${scores.range_decision_making} | Behaviour: ${scores.range_behaviour} | Leadership: ${scores.range_leadership} | Awareness: ${scores.range_awareness}`
    : ''

  return `
RADAR CONTEXT:
${readinessLine}
${rangeLines}
User's radar scores: ${poles.map((p) => `${p.name}: ${p.score}`).join(' | ')}
Strongest poles: ${strongest}
Weakest poles: ${weakest}
Reference these when recommending frameworks. The strongest poles show where the user is comfortable. The weakest poles show where the growth edge is. The highest polarisation dimension is the biggest opportunity for growth.
`
}

// Single source of truth - delegates to the same scorer the Founder Dependency
// Map display uses, so the chat AI and the on-screen map can never diverge.
function computeOwnerDims(scores: RadarScores) {
  const s = computeOwnerScores(scores as unknown as OwnerRadarScores)
  return {
    process: s.process,
    information: s.information,
    decision: s.decision,
    energy: s.energy,
    taste: s.watermarkStrength,
    fds: s.founderDependencyScore,
  }
}

// Band labels matched to lib/ownerIndex.ts thresholds (Low 0-3.3, Moderate 3.4-6.6, High 6.7-10)
function depLabel(s: number) { return s >= 6.7 ? 'High Dependency' : s >= 3.4 ? 'Moderate Dependency' : 'Low Dependency' }
function wsLabel(s: number)  { return s >= 6.7 ? 'Defined Watermark' : s >= 3.4 ? 'Emerging Watermark' : 'Undefined Watermark' }
function fdsLabel(s: number) { return s >= 6.7 ? 'High dependency - heavily founder-reliant' : s >= 3.4 ? 'Moderate dependency' : 'Highly extractable - business can run without you' }

function formatOwnerIndexContext(scores: RadarScores): string {
  const { process, information, decision, energy, taste, fds } = computeOwnerDims(scores)

  const dims = [
    { label: 'Process Dependency', score: process },
    { label: 'Information Dependency', score: information },
    { label: 'Decision Dependency', score: decision },
    { label: 'Energy Dependency', score: energy },
  ]
  const biggest = dims.reduce((a, b) => a.score > b.score ? a : b)

  return `
OWNER'S INDEX SCORES:
Founder Dependency Score (FDS): ${fds}/10 - ${fdsLabel(fds)}
Watermark Strength: ${taste.toFixed(1)}/10 - ${wsLabel(taste)}

Dimension breakdown:
- Process Dependency: ${process.toFixed(1)}/10 - ${depLabel(process)} (O1 Free Yourself, O2 Make It Repeatable)
- Information Dependency: ${information.toFixed(1)}/10 - ${depLabel(information)} (O3 Write Your Recipe, O4 Make It Visible)
- Decision Dependency: ${decision.toFixed(1)}/10 - ${depLabel(decision)} (O5 Raise The Average, O6 Don't Apologise)
- Energy Dependency: ${energy.toFixed(1)}/10 - ${depLabel(energy)} (O7 Subtract To Scale, O8 No Loose Ends)
- Taste / Watermark Strength: ${taste.toFixed(1)}/10 - ${wsLabel(taste)} (O9 Your Watermark)

Biggest extraction priority: ${biggest.label} at ${biggest.score.toFixed(1)}/10.

Use Owner's Index vocabulary when talking to the user - refer to FDS, dimensions (Process, Information, Decision, Energy, Taste) and Owner's Playbook pillars. Do NOT use raw radar pole names (Intuitive, Analytical, Collaborative, Directive, etc.) in your conversation - those are internal scoring inputs only.
`
}

function formatOwnerIndexShift(
  current: RadarScores,
  previous: RadarScores
): string {
  const c = computeOwnerDims(current)
  const p = computeOwnerDims(previous)

  function diff(a: number, b: number) {
    const d = a - b
    return `${previous ? b.toFixed(1) : '?'} → ${a.toFixed(1)} (${d > 0 ? '+' : ''}${d.toFixed(1)})`
  }

  return `
PREVIOUS OWNER'S INDEX (for shift analysis):
Previous FDS: ${p.fds}/10 | Current FDS: ${c.fds}/10 (${c.fds >= p.fds ? '+' : ''}${(c.fds - p.fds).toFixed(1)})
Previous Watermark: ${p.taste.toFixed(1)}/10 | Current Watermark: ${c.taste.toFixed(1)}/10

Dimension shifts:
- Process Dependency: ${diff(c.process, p.process)}
- Information Dependency: ${diff(c.information, p.information)}
- Decision Dependency: ${diff(c.decision, p.decision)}
- Energy Dependency: ${diff(c.energy, p.energy)}
- Watermark Strength: ${diff(c.taste, p.taste)}

When the user asks what changed, use these numbers. Do not ask the user to provide their scores.
`
}

function formatShiftContext(current: RadarScores, previous: RadarScores): string {
  const poles: Array<{ name: string; key: keyof RadarScores }> = [
    { name: 'Intuitive', key: 'intuitive' },
    { name: 'Analytical', key: 'analytical' },
    { name: 'Proactive', key: 'proactive' },
    { name: 'Reactive', key: 'reactive' },
    { name: 'Collaborative', key: 'collaborative' },
    { name: 'Directive', key: 'directive' },
    { name: 'Cognitive', key: 'cognitive' },
    { name: 'Purpose', key: 'spiritual_purpose' },
  ]

  const shifts = poles.map(p => {
    const diff = (current[p.key] as number) - (previous[p.key] as number)
    const direction = diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? `${diff.toFixed(1)}` : 'no change'
    return `${p.name}: ${previous[p.key]} → ${current[p.key]} (${direction})`
  })

  const readinessShift = current.readiness_score && previous.readiness_score
    ? `\nAdaptive Range Score: ${previous.readiness_score}/10 → ${current.readiness_score}/10 (${current.readiness_score >= previous.readiness_score ? '+' : ''}${(current.readiness_score - previous.readiness_score).toFixed(1)})`
    : ''

  return `
PREVIOUS RADAR (for shift analysis):
${poles.map(p => `${p.name}: ${previous[p.key]}`).join(' | ')}${previous.readiness_score ? `\nPrevious Adaptive Range Score: ${previous.readiness_score}/10` : ''}

SHIFT BETWEEN DIAGNOSTICS:${readinessShift}
${shifts.join('\n')}

When the user asks about their shift, progress, or what changed - use these exact numbers. You have everything you need to explain the movement on each pole and overall readiness. Do not ask the user to provide their scores.
`
}

export function buildSystemPrompt({
  previousSummary,
  radarScores,
  previousRadarScores,
  contextDetected,
  preDiagnosticContext,
  isOwnerIndex,
}: BuildSystemPromptArgs): string {
  const parts: string[] = []

  // This block must come first - it overrides Section 5 of the base prompt
  parts.push(`DIAGNOSTIC STATUS - READ THIS FIRST:
The user has already completed the 16-question diagnostic. The radar scores are provided below.
DO NOT ask the user to complete the diagnostic again.
DO NOT present any of the 16 statements.
DO NOT ask the user to rate anything on a scale of 1 to 5.
DO NOT ask them to type numbers in the chat.
The diagnostic phase is over. You are now in the coaching conversation phase.
Use the radar scores provided to inform your recommendations - do not re-collect them.`)

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
  parts.push(isOwnerIndex ? OWNER_OPERATOR_OVERLAY : UNIFIED_OVERLAY)

  if (radarScores) {
    parts.push(isOwnerIndex ? formatOwnerIndexContext(radarScores) : formatRadarContext(radarScores))
  }

  if (radarScores && previousRadarScores) {
    parts.push(isOwnerIndex
      ? formatOwnerIndexShift(radarScores, previousRadarScores)
      : formatShiftContext(radarScores, previousRadarScores)
    )
  }

  return parts.join('\n\n')
}

export function buildPreDiagnosticPrompt({
  previousSummary,
  isOwnerIndex,
}: { previousSummary?: SessionSummary | null; isOwnerIndex?: boolean }): string {
  const parts: string[] = []

  if (previousSummary) {
    parts.push(formatPreviousSummary(previousSummary))
  }

  parts.push(BASE_PROMPT)
  parts.push(isOwnerIndex ? OWNER_OPERATOR_OVERLAY : UNIFIED_OVERLAY)
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
- Message 3: Play back what you heard and classify their journey. End with: "Does that feel right?" - STOP HERE. Do NOT include any signals. Do NOT transition to the diagnostic. Wait for their reply.
- Message 4: This message fires after they respond to message 3 (or if they haven't replied and this is your 4th message). Write ONE short transition sentence - something like "Good. Let's map where you are." - then on the very next line emit the two signals below and nothing else.

IMPORTANT: The signals go in message 4 ONLY, never in message 3. Message 3 must end with the confirmation question and nothing more. Do not conflate these two steps.

Once you reach message 4, emit these two signals on their own lines immediately after your transition sentence:
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
