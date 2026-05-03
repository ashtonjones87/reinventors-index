'use client'

import { useEffect } from 'react'

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

interface ScoreModalProps {
  readinessScore: number
  radarScores: RadarScores
  rangeScores: {
    rangeDecisionMaking: number
    rangeBehaviour: number
    rangeLeadership: number
    rangeAwareness: number
  }
  detectedContext: string | null
  prevRadarScores: (RadarScores & { readiness_score?: number }) | null
  onClose: () => void
}

const H = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontWeight: '700',
    color: '#334a69',
    fontSize: '13px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: '6px',
    marginTop: '20px',
  }}>
    {children}
  </p>
)

const Body = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.7', marginBottom: '4px' }}>
    {children}
  </p>
)

function readinessLabel(score: number): string {
  if (score >= 8) return 'Highly adaptive'
  if (score >= 6) return 'Solidly flexible'
  if (score >= 4) return 'Developing flexibility'
  return 'Strongly polarised'
}

function readinessExplanation(score: number): string {
  if (score >= 8) return "You move between poles fluidly across all four dimensions. This is the mark of a reinventor who can shift approach as the situation demands - without losing their footing."
  if (score >= 6) return "You have solid adaptive range. There are one or two dimensions where you're more locked in - that's your growth edge, and the most valuable place to do the work."
  if (score >= 4) return "You have clear preferences across most dimensions. That brings consistency - and also rigidity when the situation calls for something different. The gap between your poles is where the opportunity sits."
  return "Your mindset is highly polarised. You have strong default settings, which can be a superpower in the right context - and a significant constraint when the situation demands flexibility."
}

function journeyLabel(context: string | null): string {
  if (context === 'founder') return 'Founder'
  if (context === 'leader') return 'Leader'
  if (context === 'innovator') return 'Innovator'
  return 'General'
}

function journeyExplanation(context: string | null): string {
  if (context === 'founder') return "As a Founder, your radar is read through the lens of building something new - where decisions happen before full information, and momentum matters more than permission."
  if (context === 'leader') return "As a Leader stepping into a bigger role, your radar reflects how your mindset shapes an entire team's culture - how you decide, how you move, and what sustains you under pressure."
  if (context === 'innovator') return "As an Innovator driving change from inside a system, your radar shows how you navigate political weight alongside strategic weight - when to push and when to hold."
  return "Your radar reflects your natural mindset defaults across four dimensions of entrepreneurial thinking."
}

interface DimDef {
  label: string
  poleA: string
  poleB: string
  scoreA: number
  scoreB: number
  range: number
}

function dimensionExplanation(dim: DimDef): string {
  const lean = dim.scoreA >= dim.scoreB ? dim.poleA : dim.poleB
  const other = dim.scoreA >= dim.scoreB ? dim.poleB : dim.poleA
  const gap = dim.range.toFixed(1)

  const explanations: Record<string, Record<string, string>> = {
    'Decision Making': {
      Intuitive: `You trust your instincts before the data. You move on felt sense, and your reads are often faster than you can articulate. The risk is acting before the evidence is ready.`,
      Analytical: `You commit when the logic holds. Evidence steadies you, and you're uncomfortable moving without it. The risk is analysis paralysis when the situation demands speed.`,
    },
    Behaviour: {
      Proactive: `You create momentum rather than waiting for it. You initiate before circumstances force you. The risk is burning energy on things that didn't need changing yet.`,
      Reactive: `You're at your best responding to what lands in front of you. You're sharp under pressure and excel at problem-solving in the moment. The risk is letting the urgent crowd out the important.`,
    },
    Leadership: {
      Collaborative: `You pull people in before you move. You build buy-in naturally and create ownership in others. The risk is consensus-seeking slowing you when speed matters.`,
      Directive: `You move when you have authority and don't wait for alignment to act. You're decisive and clear. The risk is leaving people behind when the situation needed their input.`,
    },
    Awareness: {
      Cognitive: `You make sense of uncertainty through frameworks and mental models. Structure steadies you when things get unclear. The risk is over-intellectualising what needs to be felt.`,
      Purpose: `You're driven by something beyond the outcome. A deeper why anchors you through uncertainty. The risk is disconnecting from practical realities when the purpose feels distant.`,
    },
  }

  const explanation = explanations[dim.label]?.[lean] ?? ''
  const rangeNote = Number(gap) <= 0.5
    ? `Your scores on both poles are very close (${dim.poleA}: ${dim.scoreA.toFixed(1)}, ${dim.poleB}: ${dim.scoreB.toFixed(1)}) - both poles are equally developed.`
    : `Polarisation: ${gap} - your underdeveloped pole is ${other} (${other === dim.poleA ? dim.scoreA.toFixed(1) : dim.scoreB.toFixed(1)}). This is where your growth work lives.`

  return `${explanation} ${rangeNote}`
}

function shiftExplanation(current: RadarScores & { readiness_score?: number }, previous: RadarScores & { readiness_score?: number }): string {
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

  const moved = poles
    .map(p => ({ name: p.name, diff: (current[p.key] as number) - (previous[p.key] as number) }))
    .filter(p => Math.abs(p.diff) >= 0.5)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

  if (moved.length === 0) return "Your pole scores are largely unchanged from your previous diagnostic. The shift is showing in your overall readiness rather than individual poles."

  const biggest = moved[0]
  const direction = biggest.diff > 0 ? 'stronger' : 'weaker'
  const others = moved.slice(1, 3).map(p => `${p.name} (${p.diff > 0 ? '+' : ''}${p.diff.toFixed(1)})`).join(', ')

  return `Your biggest movement was in ${biggest.name}, which shifted ${direction} by ${Math.abs(biggest.diff).toFixed(1)} points.${others ? ` You also moved on ${others}.` : ''} These shifts reflect the work you've done since your last diagnostic.`
}

export default function ScoreModal({ readinessScore, radarScores, rangeScores, detectedContext, prevRadarScores, onClose }: ScoreModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const dims: DimDef[] = [
    { label: 'Decision Making', poleA: 'Intuitive', poleB: 'Analytical', scoreA: radarScores.intuitive, scoreB: radarScores.analytical, range: rangeScores.rangeDecisionMaking },
    { label: 'Behaviour', poleA: 'Proactive', poleB: 'Reactive', scoreA: radarScores.proactive, scoreB: radarScores.reactive, range: rangeScores.rangeBehaviour },
    { label: 'Leadership', poleA: 'Collaborative', poleB: 'Directive', scoreA: radarScores.collaborative, scoreB: radarScores.directive, range: rangeScores.rangeLeadership },
    { label: 'Awareness', poleA: 'Cognitive', poleB: 'Purpose', scoreA: radarScores.cognitive, scoreB: radarScores.spiritual_purpose, range: rangeScores.rangeAwareness },
  ]

  const maxRange = Math.max(rangeScores.rangeDecisionMaking, rangeScores.rangeBehaviour, rangeScores.rangeLeadership, rangeScores.rangeAwareness)
  const growthEdge = dims.find(d => d.range === maxRange)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(26, 26, 26, 0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 200,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        width: '90%',
        maxWidth: '560px',
        maxHeight: '82vh',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '32px 32px 36px',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '6px' }}>
              Your Mindset Decoded
            </p>
            <h2 style={{ fontFamily: 'var(--font-libre)', fontSize: '26px', fontWeight: '700', color: '#334a69', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              What Your Score Reveals
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9CA3AF', flexShrink: 0, marginLeft: '16px', marginTop: '2px' }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ width: '32px', height: '2px', background: 'linear-gradient(90deg, #334a69, #2A7B7B)', borderRadius: '999px', marginBottom: '20px', opacity: 0.5 }} />

        {/* Readiness Score */}
        <H>Adaptive Range Score - {readinessScore}/10 - {readinessLabel(readinessScore)}</H>
        <Body>{readinessExplanation(readinessScore)}</Body>

        {/* Journey */}
        <H>Your Path - {journeyLabel(detectedContext)}</H>
        <Body>{journeyExplanation(detectedContext)}</Body>

        {/* Dimensions */}
        <H>Your Four Dimensions</H>
        {dims.map(dim => {
          const leansPole = dim.scoreA >= dim.scoreB ? dim.poleA : dim.poleB
          const polarisationLabel = dim.range < 1.0
            ? 'Balanced'
            : dim.range <= 2.0
            ? `Leans ${leansPole}`
            : `Strongly ${leansPole}`
          return (
            <div key={dim.label} style={{ marginBottom: '14px' }}>
              <p style={{ fontWeight: '700', color: '#334a69', fontSize: '13px', marginBottom: '3px' }}>
                {dim.label} - {polarisationLabel}
              </p>
              <Body>{dimensionExplanation(dim)}</Body>
            </div>
          )
        })}

        {/* Growth Edge */}
        {growthEdge && (
          <>
            <H>Your Biggest Growth Edge</H>
            <Body>
              <strong style={{ color: '#334a69' }}>{growthEdge.label}</strong> has your highest polarisation ({growthEdge.range.toFixed(1)}) - that's where one pole has crowded out the other. This is where the most leverage sits - the work you do here will ripple across the others.
            </Body>
          </>
        )}

        {/* Shift (only if retaken) */}
        {prevRadarScores && (
          <>
            <H>What Shifted Since Last Time</H>
            <Body>
              {prevRadarScores.readiness_score !== undefined && (
                <>Your Adaptive Range Score moved from <strong style={{ color: '#334a69' }}>{prevRadarScores.readiness_score}/10</strong> to <strong style={{ color: '#334a69' }}>{readinessScore}/10</strong> ({readinessScore >= prevRadarScores.readiness_score ? '+' : ''}{(readinessScore - prevRadarScores.readiness_score).toFixed(1)}). </>
              )}
              {shiftExplanation(radarScores, prevRadarScores)}
            </Body>
          </>
        )}

        {/* Close button at bottom */}
        <button
          onClick={onClose}
          style={{
            marginTop: '28px',
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-inter)',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Got it
        </button>
      </div>
    </>
  )
}
